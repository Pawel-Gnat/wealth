CREATE TABLE "expense_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" integer NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expense_documents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "expense_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_document_id" integer NOT NULL,
	"title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"single_amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense_documents" ADD CONSTRAINT "expense_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_line_items" ADD CONSTRAINT "expense_line_items_expense_document_id_expense_documents_id_fk" FOREIGN KEY ("expense_document_id") REFERENCES "public"."expense_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_documents_user_id_idx" ON "expense_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expense_line_items_expense_document_id_idx" ON "expense_line_items" USING btree ("expense_document_id");