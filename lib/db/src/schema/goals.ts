import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("other"),
  targetDate: timestamp("target_date"),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("active"),
  linkedHabitIds: jsonb("linked_habit_ids").notNull().default([]),
  milestones: jsonb("milestones").notNull().default([]),
  aiDecomposed: text("ai_decomposed").notNull().default("false"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
