CREATE TABLE "budget_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_id" text NOT NULL,
	"actor_user_id" text,
	"event" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_audits" ADD CONSTRAINT "budget_audits_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_audits" ADD CONSTRAINT "budget_audits_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_audits" ADD CONSTRAINT "user_audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budget_audits_budget_id_created_at_id_idx" ON "budget_audits" USING btree ("budget_id","created_at","id");--> statement-breakpoint
CREATE INDEX "user_audits_user_id_created_at_id_idx" ON "user_audits" USING btree ("user_id","created_at","id");