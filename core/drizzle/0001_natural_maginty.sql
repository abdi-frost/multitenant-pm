ALTER TABLE "users" ADD COLUMN "tenant_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'EMPLOYEE' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");