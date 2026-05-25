import { Router } from "express";
import { db, habitsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { protect, type AuthRequest } from "../middlewares/auth";

const router = Router();

function formatHabit(h: typeof habitsTable.$inferSelect) {
  return {
    id: h.id,
    userId: h.userId,
    name: h.name,
    description: h.description,
    frequency: h.frequency,
    goalId: h.goalId,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    completionHistory: (h.completionHistory as Array<{ date: string; completed: boolean }>) || [],
    isActive: h.isActive,
    createdAt: h.createdAt.toISOString(),
  };
}

// GET /api/habits
router.get("/habits", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const habits = await db.select().from(habitsTable).where(eq(habitsTable.userId, authReq.user.id));
  res.json(habits.map(formatHabit));
});

// POST /api/habits
router.post("/habits", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { name, description, frequency, goalId } = req.body;
  if (!name) { res.status(400).json({ message: "Name is required" }); return; }
  const [habit] = await db.insert(habitsTable).values({
    userId: authReq.user.id,
    name,
    description,
    frequency: frequency || "daily",
    goalId: goalId || null,
    completionHistory: [],
  }).returning();
  res.status(201).json(formatHabit(habit));
});

// PUT /api/habits/:id
router.put("/habits/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, description, frequency, goalId, isActive } = req.body;
  const updates: Partial<typeof habitsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (frequency !== undefined) updates.frequency = frequency;
  if (goalId !== undefined) updates.goalId = goalId;
  if (isActive !== undefined) updates.isActive = isActive;
  const [habit] = await db.update(habitsTable).set(updates)
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, authReq.user.id)))
    .returning();
  if (!habit) { res.status(404).json({ message: "Habit not found" }); return; }
  res.json(formatHabit(habit));
});

// DELETE /api/habits/:id
router.delete("/habits/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(habitsTable).where(and(eq(habitsTable.id, id), eq(habitsTable.userId, authReq.user.id)));
  res.sendStatus(204);
});

// POST /api/habits/:id/checkin
router.post("/habits/:id/checkin", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [habit] = await db.select().from(habitsTable)
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, authReq.user.id)));
  if (!habit) { res.status(404).json({ message: "Habit not found" }); return; }

  const history = (habit.completionHistory as Array<{ date: string; completed: boolean }>) || [];
  const today = new Date().toISOString().split("T")[0];
  const alreadyDone = history.some(c => c.date.startsWith(today) && c.completed);
  if (alreadyDone) { res.json(formatHabit(habit)); return; }

  const newEntry = { date: new Date().toISOString(), completed: true };
  const updated = [...history, newEntry];

  // Recalculate streak
  const sorted = [...updated].filter(c => c.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  const nowDate = new Date(); nowDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i].date); d.setHours(0, 0, 0, 0);
    const expected = new Date(nowDate); expected.setDate(nowDate.getDate() - i);
    if (d.getTime() === expected.getTime()) streak++;
    else break;
  }
  const longestStreak = Math.max(streak, habit.longestStreak);

  const [updated_habit] = await db.update(habitsTable).set({
    completionHistory: updated,
    currentStreak: streak,
    longestStreak,
  }).where(eq(habitsTable.id, id)).returning();
  res.json(formatHabit(updated_habit));
});

export default router;
