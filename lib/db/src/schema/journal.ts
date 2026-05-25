import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const journalEntriesTable = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood").notNull().default("okay"),
  tags: jsonb("tags").notNull().default([]),
  wordCount: integer("word_count").notNull().default(0),
  aiAnalysis: jsonb("ai_analysis"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;
