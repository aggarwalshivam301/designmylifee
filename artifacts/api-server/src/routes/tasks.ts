import { Router } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { protect, type AuthRequest } from "../middlewares/auth";

const router = Router();

function formatTask(t: typeof tasksTable.$inferSelect) {
  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    goalId: t.goalId,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    estimatedMinutes: t.estimatedMinutes,
    createdAt: t.createdAt.toISOString(),
  };
}

// GET /api/tasks
router.get("/tasks", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, authReq.user.id));
  res.json(tasks.map(formatTask));
});

// POST /api/tasks
router.post("/tasks", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { title, description, priority, dueDate, goalId, estimatedMinutes } = req.body;
  if (!title) { res.status(400).json({ message: "Title is required" }); return; }
  const [task] = await db.insert(tasksTable).values({
    userId: authReq.user.id,
    title,
    description,
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : null,
    goalId: goalId || null,
    estimatedMinutes: estimatedMinutes || 30,
  }).returning();
  res.status(201).json(formatTask(task));
});

// PUT /api/tasks/:id
router.put("/tasks/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, description, priority, status, dueDate, goalId, estimatedMinutes } = req.body;
  const updates: Partial<typeof tasksTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority !== undefined) updates.priority = priority;
  if (status !== undefined) {
    updates.status = status;
    updates.completedAt = status === "completed" ? new Date() : null;
  }
  if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
  if (goalId !== undefined) updates.goalId = goalId || null;
  if (estimatedMinutes !== undefined) updates.estimatedMinutes = estimatedMinutes;
  const [task] = await db.update(tasksTable).set(updates)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, authReq.user.id)))
    .returning();
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }
  res.json(formatTask(task));
});

// DELETE /api/tasks/:id
router.delete("/tasks/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(tasksTable).where(and(eq(tasksTable.id, id), eq(tasksTable.userId, authReq.user.id)));
  res.sendStatus(204);
});

export default router;
