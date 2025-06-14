import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "@/lib/auth/schema";



export const chats = pgTable("chats", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull().default("Untitled Chat"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
export type Chat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
	repliesId: text("replies_id"),
	role: text("role").notNull(),
	content: jsonb("content").notNull().default([]),  // Does not need the .array() syntax
	metadata: jsonb("metadata").notNull().default({}),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
export type Message = typeof messages.$inferSelect;

export const toolResults = pgTable("tool_results", {
	id: text("id").primaryKey(),
	chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
export type ToolResult = typeof toolResults.$inferSelect;