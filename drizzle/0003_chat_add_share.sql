ALTER TABLE "chats" ALTER COLUMN "title" SET DEFAULT 'Untitled Chat';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "short_id" text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_short_id_unique" UNIQUE("short_id");