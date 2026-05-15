CREATE TABLE "income_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"income_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"income_document_id" text NOT NULL,
	"title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"single_amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income_documents" ADD CONSTRAINT "income_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_line_items" ADD CONSTRAINT "income_line_items_income_document_id_income_documents_id_fk" FOREIGN KEY ("income_document_id") REFERENCES "public"."income_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "income_documents_user_id_idx" ON "income_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "income_line_items_income_document_id_idx" ON "income_line_items" USING btree ("income_document_id");