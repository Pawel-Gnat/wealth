ALTER TABLE "expense_documents" ALTER COLUMN "expense_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "expense_documents" ALTER COLUMN "expense_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "income_documents" ALTER COLUMN "income_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "income_documents" ALTER COLUMN "income_date" DROP DEFAULT;