ALTER TABLE "expense_documents" DROP CONSTRAINT "expense_documents_slug_unique";--> statement-breakpoint
ALTER TABLE "expense_documents" DROP CONSTRAINT "expense_documents_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "expense_line_items" DROP CONSTRAINT "expense_line_items_expense_document_id_expense_documents_id_fk";--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "expense_documents" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "expense_line_items" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "expense_documents" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "expense_documents" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;--> statement-breakpoint
ALTER TABLE "expense_line_items" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "expense_line_items" ALTER COLUMN "expense_document_id" SET DATA TYPE text USING "expense_document_id"::text;--> statement-breakpoint

ALTER TABLE "expense_documents" DROP COLUMN "slug";--> statement-breakpoint

ALTER TABLE "expense_documents" ADD CONSTRAINT "expense_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_line_items" ADD CONSTRAINT "expense_line_items_expense_document_id_expense_documents_id_fk" FOREIGN KEY ("expense_document_id") REFERENCES "public"."expense_documents"("id") ON DELETE cascade ON UPDATE no action;