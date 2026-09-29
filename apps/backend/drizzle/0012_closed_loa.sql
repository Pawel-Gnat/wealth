CREATE TYPE "public"."document_kind" AS ENUM('expense', 'income');--> statement-breakpoint
CREATE TABLE "document_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"single_amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_line_items_title_not_blank" CHECK (char_length(btrim("document_line_items"."title")) > 0),
	CONSTRAINT "document_line_items_quantity_min" CHECK ("document_line_items"."quantity" >= 1),
	CONSTRAINT "document_line_items_single_amount_min" CHECK ("document_line_items"."single_amount" >= 0.01)
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"budget_id" text,
	"kind" "document_kind" NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"document_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_total_amount_non_negative" CHECK ("documents"."total_amount" >= 0)
);
--> statement-breakpoint
INSERT INTO "documents" ("id", "user_id", "budget_id", "kind", "total_amount", "document_date", "created_at", "updated_at")
SELECT "id", "user_id", NULL, 'expense', "total_amount", "expense_date", "created_at", "updated_at"
FROM "expense_documents";--> statement-breakpoint
INSERT INTO "documents" ("id", "user_id", "budget_id", "kind", "total_amount", "document_date", "created_at", "updated_at")
SELECT "id", "user_id", NULL, 'income', "total_amount", "income_date", "created_at", "updated_at"
FROM "income_documents";--> statement-breakpoint
INSERT INTO "document_line_items" ("id", "document_id", "title", "quantity", "single_amount", "created_at", "updated_at")
SELECT "id", "expense_document_id", "title", "quantity", "single_amount", "created_at", "updated_at"
FROM "expense_line_items";--> statement-breakpoint
INSERT INTO "document_line_items" ("id", "document_id", "title", "quantity", "single_amount", "created_at", "updated_at")
SELECT "id", "income_document_id", "title", "quantity", "single_amount", "created_at", "updated_at"
FROM "income_line_items";--> statement-breakpoint
DROP TABLE "expense_documents" CASCADE;--> statement-breakpoint
DROP TABLE "expense_line_items" CASCADE;--> statement-breakpoint
DROP TABLE "income_documents" CASCADE;--> statement-breakpoint
DROP TABLE "income_line_items" CASCADE;--> statement-breakpoint
ALTER TABLE "document_line_items" ADD CONSTRAINT "document_line_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_line_items_document_id_idx" ON "document_line_items" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_budget_id_idx" ON "documents" USING btree ("budget_id");