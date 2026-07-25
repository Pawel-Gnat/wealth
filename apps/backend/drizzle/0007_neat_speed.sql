DELETE FROM "refresh_tokens";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "session_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_session_id_idx" ON "refresh_tokens" USING btree ("user_id","session_id");
