import { Router } from "express";
import { db, habitsTable, goalsTable, tasksTable, journalEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { protect, type AuthRequest } from "../middlewares/auth";
import { calculateBCI } from "../lib/bciCalculator";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

function getAIClient(): Anthropic | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

// GET /api/ai/status
router.get("/ai/status", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const configured = !!process.env.AI_API_KEY;
  res.json({
    configured,
    provider: "anthropic",
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
    userAIEnabled: authReq.user.aiEnabled,
  });
});

// POST /api/ai/quick-bci
router.post("/ai/quick-bci", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const habits = await db.select().from(habitsTable).where(eq(habitsTable.userId, authReq.user.id));
  const formatted = habits.map(h => ({
    id: h.id,
    frequency: h.frequency,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    completionHistory: (h.completionHistory as Array<{ date: string; completed: boolean }>) || [],
  }));
  const bci = calculateBCI(formatted);
  res.json(bci);
});

// POST /api/ai/analyze-behavior
router.post("/ai/analyze-behavior", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { useAI, goalId } = req.body;
  const habits = await db.select().from(habitsTable).where(eq(habitsTable.userId, authReq.user.id));
  const formatted = habits.map(h => ({
    id: h.id,
    frequency: h.frequency,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    completionHistory: (h.completionHistory as Array<{ date: string; completed: boolean }>) || [],
  }));

  let goalData = null;
  if (goalId) {
    const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, goalId));
    if (goal) goalData = { linkedHabitIds: (goal.linkedHabitIds as number[]) || [] };
  }

  const bci = calculateBCI(formatted, goalData);

  // Try AI if requested and available
  const aiClient = useAI && authReq.user.aiEnabled ? getAIClient() : null;
  let aiInsights = null;

  if (aiClient && habits.length > 0) {
    try {
      const prompt = `Analyze this user's behavioral data and return JSON with keys: patterns (array of strings), recommendations (array of strings), focusArea (string), motivationalMessage (string).
BCI Score: ${bci.score}/100 (Grade: ${bci.grade})
Breakdown: Streak=${bci.breakdown.streakConsistency}, Completion=${bci.breakdown.completionRate}, Time=${bci.breakdown.timeConsistency}, Goal=${bci.breakdown.goalAlignment}
Active habits: ${habits.length}, Total check-ins: ${habits.reduce((s, h) => s + ((h.completionHistory as unknown[]) || []).length, 0)}
Return ONLY valid JSON.`;

      const message = await aiClient.messages.create({
        model: process.env.AI_MODEL || "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
      aiInsights = parsed;
    } catch {
      aiInsights = null;
    }
  }

  res.json({ bci, aiInsights });
});

// POST /api/ai/elaborate-goal — turn a vague idea into a full structured goal
router.post("/ai/elaborate-goal", protect, async (req, res): Promise<void> => {
  const { vague } = req.body;
  if (!vague || typeof vague !== "string") {
    res.status(400).json({ message: "vague description is required" }); return;
  }

  const { randomUUID } = await import("crypto");

  const aiClient = getAIClient();
  if (!aiClient) {
    // Fallback: smart heuristics — detect category from keywords
    const lower = vague.toLowerCase();
    let category = "other";
    if (/fit|gym|health|run|weight|sleep|diet|exercise|sport/.test(lower)) category = "health";
    else if (/career|job|work|promot|skill|earn|salary|business/.test(lower)) category = "career";
    else if (/learn|study|course|read|book|degree|certif/.test(lower)) category = "learning";
    else if (/money|save|invest|debt|budget|finance|rich/.test(lower)) category = "finance";
    else if (/friend|family|relation|social|connect|network/.test(lower)) category = "relationships";
    else if (/build|launch|ship|app|project|product|website/.test(lower)) category = "project";

    const templates: Record<string, { title: string; description: string; milestones: string[] }> = {
      health: {
        title: "Improve my health and fitness",
        description: "Build consistent healthy habits to reach my physical wellness goals.",
        milestones: ["Establish baseline (weight, measurements, fitness level)", "Build a weekly workout routine", "Track nutrition for 30 days", "Reach midpoint target", "Hit the final goal"],
      },
      career: {
        title: "Advance my career",
        description: "Take deliberate steps to grow professionally and reach my next career milestone.",
        milestones: ["Define the target role and success criteria", "Identify skill gaps and create a plan", "Complete key learning or credentials", "Apply or take action toward the goal", "Achieve and reflect"],
      },
      learning: {
        title: "Master a new skill",
        description: "Dedicate focused time to learning and applying a new capability.",
        milestones: ["Gather resources and set a learning schedule", "Complete foundational content", "Build a practice project or exercise", "Reach intermediate proficiency", "Apply or teach what you learned"],
      },
      finance: {
        title: "Reach a financial milestone",
        description: "Take control of finances and hit a meaningful money goal.",
        milestones: ["Audit current income, expenses, and savings", "Set a specific savings or investment target", "Automate contributions", "Review and adjust at 90 days", "Hit the target"],
      },
      relationships: {
        title: "Strengthen key relationships",
        description: "Invest in the people who matter most.",
        milestones: ["Identify 3-5 people to prioritize", "Schedule regular check-ins or meetups", "Deepen connection through shared experiences", "Follow through on commitments", "Reflect and expand the circle"],
      },
      project: {
        title: "Ship a project",
        description: "Take a project from idea to completion.",
        milestones: ["Define scope and success criteria", "Build the MVP or first version", "Get feedback from real users or stakeholders", "Iterate based on feedback", "Launch or deliver the final version"],
      },
      other: {
        title: vague.length > 60 ? vague.slice(0, 60) + "..." : vague,
        description: "A meaningful goal worth pursuing with clear milestones.",
        milestones: ["Define what success looks like", "Research and plan", "Take the first concrete step", "Build momentum and track progress", "Complete and celebrate"],
      },
    };

    const t = templates[category];
    const milestones = t.milestones.map(title => ({ id: randomUUID(), title, done: false, dueDate: null }));
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3);

    res.json({
      title: t.title,
      description: t.description,
      category,
      targetDate: targetDate.toISOString().split("T")[0],
      milestones,
      reasoning: "AI not configured — used keyword detection and category templates.",
    });
    return;
  }

  try {
    const prompt = `A user wants to set a goal but described it vaguely: "${vague}"

Turn this into a well-structured, specific, and actionable goal. Return ONLY valid JSON with these keys:
{
  "title": "concise, specific goal title (max 60 chars)",
  "description": "1-2 sentences explaining the goal and why it matters",
  "category": one of "career" | "health" | "learning" | "finance" | "relationships" | "project" | "other",
  "targetDate": "ISO date string YYYY-MM-DD roughly 3 months from today (${new Date().toISOString().split("T")[0]}), adjust if the goal is larger or smaller",
  "milestones": [
    { "title": "specific actionable milestone", "dueDate": null }
  ],
  "reasoning": "brief explanation of how you interpreted the vague input"
}

Rules:
- 4-6 milestones, ordered logically from start to finish
- Each milestone should be a concrete action, not vague
- Make the goal SMART: Specific, Measurable, Achievable, Relevant, Time-bound
- Return ONLY the JSON object, no markdown`;

    const message = await aiClient.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");

    const milestones = (parsed.milestones || []).map((m: { title: string; dueDate?: string | null }) => ({
      id: randomUUID(), title: m.title, done: false, dueDate: m.dueDate || null,
    }));

    res.json({
      title: parsed.title || vague,
      description: parsed.description || "",
      category: parsed.category || "other",
      targetDate: parsed.targetDate || "",
      milestones,
      reasoning: parsed.reasoning || "",
    });
  } catch {
    res.status(500).json({ message: "AI elaboration failed" });
  }
});

// POST /api/ai/decompose-goal
router.post("/ai/decompose-goal", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { goalId } = req.body;
  if (!goalId) { res.status(400).json({ message: "goalId is required" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, goalId));
  if (!goal || goal.userId !== authReq.user.id) { res.status(404).json({ message: "Goal not found" }); return; }

  const aiClient = getAIClient();
  if (!aiClient) {
    // Fallback: generic milestones
    const { randomUUID } = await import("crypto");
    const templates: Record<string, string[]> = {
      career: ["Define your target role/outcome", "Research required skills", "Build portfolio or credentials", "Apply and iterate"],
      health: ["Establish baseline measurements", "Create weekly routine", "Reach 30-day consistency", "Hit the target"],
      learning: ["Gather resources and set schedule", "Complete foundational content", "Build a practice project", "Teach or apply what you learned"],
      finance: ["Audit current finances", "Set savings/investment targets", "Automate contributions", "Review and adjust quarterly"],
      relationships: ["Identify key people to connect with", "Schedule regular interactions", "Deepen through shared experiences", "Maintain and nurture"],
      project: ["Define scope and deliverables", "Break into weekly sprints", "Complete MVP", "Iterate and ship"],
      other: ["Research and plan", "Start with small steps", "Build momentum", "Complete and review"],
    };
    const steps = templates[goal.category] || templates.other;
    const milestones = steps.map(title => ({ id: randomUUID(), title, done: false, dueDate: null }));
    res.json({ milestones, reasoning: "AI not configured — using category-based template milestones." });
    return;
  }

  try {
    const { randomUUID } = await import("crypto");
    const prompt = `Break down this goal into 4-6 actionable milestones. Return JSON with keys: milestones (array of {title: string, dueDate: null}), reasoning (string).
Goal: "${goal.title}"
Category: ${goal.category}
Description: ${goal.description || "none"}
Target date: ${goal.targetDate || "none"}
Return ONLY valid JSON.`;

    const message = await aiClient.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    const milestones = (parsed.milestones || []).map((m: { title: string; dueDate?: string | null }) => ({
      id: randomUUID(), title: m.title, done: false, dueDate: m.dueDate || null,
    }));

    // Save to goal
    await db.update(goalsTable).set({ milestones, aiDecomposed: "true" }).where(eq(goalsTable.id, goalId));
    res.json({ milestones, reasoning: parsed.reasoning || "" });
  } catch {
    res.status(500).json({ message: "AI decomposition failed" });
  }
});

// POST /api/ai/analyze-reflection
router.post("/ai/analyze-reflection", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { entryId } = req.body;
  if (!entryId) { res.status(400).json({ message: "entryId is required" }); return; }

  const [entry] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.id, entryId));
  if (!entry || entry.userId !== authReq.user.id) { res.status(404).json({ message: "Entry not found" }); return; }

  const aiClient = getAIClient();
  if (!aiClient) {
    res.json({
      analysis: {
        themes: ["reflection", "personal growth"],
        insights: ["Keep journaling consistently for deeper insights"],
        suggestions: ["Add an AI API key to unlock AI-powered analysis"],
        sentiment: "neutral",
        analyzedAt: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const prompt = `Analyze this journal entry and return JSON with keys: themes (array of strings), insights (array of strings), suggestions (array of strings), sentiment (string: positive/neutral/negative).
Mood: ${entry.mood}
Entry: "${entry.content.slice(0, 2000)}"
Return ONLY valid JSON.`;

    const message = await aiClient.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    const analysis = { ...parsed, analyzedAt: new Date().toISOString() };

    // Save analysis to entry
    await db.update(journalEntriesTable).set({ aiAnalysis: analysis }).where(eq(journalEntriesTable.id, entryId));
    res.json({ analysis });
  } catch {
    res.status(500).json({ message: "AI analysis failed" });
  }
});

// POST /api/ai/optimize-tasks
router.post("/ai/optimize-tasks", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const tasks = await db.select().from(tasksTable)
    .where(eq(tasksTable.userId, authReq.user.id));

  const pending = tasks.filter(t => t.status !== "completed");

  // Simple math-based prioritization (no AI needed)
  const priorityScore: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...pending].sort((a, b) => {
    const pa = priorityScore[a.priority] || 2;
    const pb = priorityScore[b.priority] || 2;
    if (pa !== pb) return pb - pa;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const formatted = sorted.map(t => ({
    id: t.id, userId: t.userId, title: t.title, description: t.description,
    priority: t.priority, status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    goalId: t.goalId, completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    estimatedMinutes: t.estimatedMinutes, createdAt: t.createdAt.toISOString(),
  }));

  res.json({ tasks: formatted, reasoning: "Tasks sorted by priority (urgent first) then due date." });
});

// GET /api/dashboard/summary
router.get("/dashboard/summary", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const uid = authReq.user.id;

  const [habits, goals, tasks, journal] = await Promise.all([
    db.select().from(habitsTable).where(eq(habitsTable.userId, uid)),
    db.select().from(goalsTable).where(eq(goalsTable.userId, uid)),
    db.select().from(tasksTable).where(eq(tasksTable.userId, uid)),
    db.select().from(journalEntriesTable).where(eq(journalEntriesTable.userId, uid)),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = habits.filter(h =>
    ((h.completionHistory as Array<{ date: string; completed: boolean }>) || [])
      .some(c => c.date.startsWith(today) && c.completed)
  ).length;
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + h.currentStreak, 0) / habits.length * 10) / 10
    : 0;

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const journalThisWeek = journal.filter(e => new Date(e.createdAt) >= weekAgo).length;
  const avgWordCount = journal.length > 0
    ? Math.round(journal.reduce((s, e) => s + e.wordCount, 0) / journal.length)
    : 0;

  const habitForBCI = habits.map(h => ({
    id: h.id, frequency: h.frequency, currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    completionHistory: (h.completionHistory as Array<{ date: string; completed: boolean }>) || [],
  }));
  const bci = calculateBCI(habitForBCI);

  res.json({
    habits: {
      total: habits.length,
      activeToday: habits.filter(h => h.isActive).length,
      completedToday,
      avgStreak,
    },
    goals: {
      total: goals.length,
      active: goals.filter(g => g.status === "active").length,
      completed: goals.filter(g => g.status === "completed").length,
      avgProgress: goals.length > 0
        ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
        : 0,
    },
    tasks: {
      total: tasks.length,
      todo: tasks.filter(t => t.status === "todo").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
      urgent: tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length,
    },
    journal: { totalEntries: journal.length, thisWeek: journalThisWeek, avgWordCount },
    bci,
  });
});

export default router;
