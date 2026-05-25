import { Router } from "express";
import { db, goalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { protect, type AuthRequest } from "../middlewares/auth";
import { randomUUID } from "crypto";

const router = Router();

interface Milestone { id: string; title: string; done: boolean; dueDate?: string | null }

function formatGoal(g: typeof goalsTable.$inferSelect) {
  return {
    id: g.id,
    userId: g.userId,
    title: g.title,
    description: g.description,
    category: g.category,
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    progress: g.progress,
    status: g.status,
    linkedHabitIds: (g.linkedHabitIds as number[]) || [],
    milestones: (g.milestones as Milestone[]) || [],
    aiDecomposed: g.aiDecomposed === "true",
    createdAt: g.createdAt.toISOString(),
  };
}

// GET /api/goals
router.get("/goals", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const goals = await db.select().from(goalsTable).where(eq(goalsTable.userId, authReq.user.id));
  res.json(goals.map(formatGoal));
});

// POST /api/goals
router.post("/goals", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { title, description, category, targetDate } = req.body;
  if (!title) { res.status(400).json({ message: "Title is required" }); return; }
  const [goal] = await db.insert(goalsTable).values({
    userId: authReq.user.id,
    title,
    description,
    category: category || "other",
    targetDate: targetDate ? new Date(targetDate) : null,
    milestones: [],
    linkedHabitIds: [],
  }).returning();
  res.status(201).json(formatGoal(goal));
});

// PUT /api/goals/:id
router.put("/goals/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, description, category, targetDate, progress, status } = req.body;
  const updates: Partial<typeof goalsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (targetDate !== undefined) updates.targetDate = targetDate ? new Date(targetDate) : null;
  if (progress !== undefined) updates.progress = progress;
  if (status !== undefined) updates.status = status;
  const [goal] = await db.update(goalsTable).set(updates)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, authReq.user.id)))
    .returning();
  if (!goal) { res.status(404).json({ message: "Goal not found" }); return; }
  res.json(formatGoal(goal));
});

// DELETE /api/goals/:id
router.delete("/goals/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(goalsTable).where(and(eq(goalsTable.id, id), eq(goalsTable.userId, authReq.user.id)));
  res.sendStatus(204);
});

// PUT /api/goals/:id/milestones
router.put("/goals/:id/milestones", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { milestones } = req.body;
  if (!Array.isArray(milestones)) { res.status(400).json({ message: "milestones must be an array" }); return; }
  const safe: Milestone[] = milestones.map((m: Partial<Milestone>) => ({
    id: m.id || randomUUID(),
    title: m.title || "",
    done: !!m.done,
    dueDate: m.dueDate || null,
  }));
  // Auto-update progress based on milestones
  const donePct = safe.length > 0 ? Math.round((safe.filter(m => m.done).length / safe.length) * 100) : 0;
  const [goal] = await db.update(goalsTable).set({ milestones: safe, progress: donePct })
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, authReq.user.id)))
    .returning();
  if (!goal) { res.status(404).json({ message: "Goal not found" }); return; }
  res.json(formatGoal(goal));
});

export default router;
