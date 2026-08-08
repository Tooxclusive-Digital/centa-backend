CREATE TABLE "platform_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"admin_id" uuid NOT NULL,
	"admin_email" varchar(255) NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"details" text,
	"changes" jsonb,
	"ip_address" varchar(45)
);
--> statement-breakpoint
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_admin_id_platform_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."platform_admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_platform_audit_admin" ON "platform_audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_entity" ON "platform_audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_timestamp" ON "platform_audit_logs" USING btree ("timestamp");