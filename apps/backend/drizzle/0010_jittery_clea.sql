CREATE TABLE "storage" (
	"id" text PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_image_storage_id_fk" FOREIGN KEY ("image") REFERENCES "public"."storage"("id") ON DELETE set null ON UPDATE no action;