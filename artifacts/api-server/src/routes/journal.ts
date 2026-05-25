import { Router } from "express";
import { db, journalEntriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { protect, type AuthRequest } from "../middlewares/auth";

const router = Router();

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatEntry(e: typeof journalEntriesTable.$inferSelect) {
  return {
    id: e.id,
    userId: e.userId,
    title: e.title,
    content: e.content,
    mood: e.mood,
    tags: (e.tags as string[]) || [],
    wordCount: e.wordCount,
    aiAnalysis: e.aiAnalysis || null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

// GET /api/journal
router.get("/journal", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const entries = await db.select().from(journalEntriesTable)
    .where(eq(journalEntriesTable.userId, authReq.user.id));
  res.json(entries.map(formatEntry));
});

// POST /api/journal
router.post("/journal", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { title, content, mood, tags } = req.body;
  if (content == null) { res.status(400).json({ message: "Content is required" }); return; }
  const wc = wordCount(content);
  const [entry] = await db.insert(journalEntriesTable).values({
    userId: authReq.user.id,
    title: title || null,
    content,
    mood: mood || "okay",
    tags: tags || [],
    wordCount: wc,
  }).returning();
  res.status(201).json(formatEntry(entry));
});

// PUT /api/journal/:id
router.put("/journal/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, content, mood, tags } = req.body;
  const updates: Partial<typeof journalEntriesTable.$inferInsert> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) { updates.content = content; updates.wordCount = wordCount(content); }
  if (mood !== undefined) updates.mood = mood;
  if (tags !== undefined) updates.tags = tags;
  const [entry] = await db.update(journalEntriesTable).set(updates)
    .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, authReq.user.id)))
    .returning();
  if (!entry) { res.status(404).json({ message: "Entry not found" }); return; }
  res.json(formatEntry(entry));
});

// DELETE /api/journal/:id
router.delete("/journal/:id", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(journalEntriesTable)
    .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, authReq.user.id)));
  res.sendStatus(204);
});

export default router;
