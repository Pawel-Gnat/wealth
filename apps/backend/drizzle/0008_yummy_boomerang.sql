CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_hash" text NOT NULL,
	"refresh_hash" text NOT NULL,
	"session_expires_at" timestamp NOT NULL,
	"refresh_expires_at" timestamp NOT NULL,
	"previous_refresh_hash" text,
	"previous_refresh_valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_hash_unique" UNIQUE("session_hash"),
	CONSTRAINT "sessions_refresh_hash_unique" UNIQUE("refresh_hash"),
	CONSTRAINT "sessions_previous_refresh_hash_unique" UNIQUE("previous_refresh_hash")
);
--> statement-breakpoint
DROP TABLE "refresh_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");