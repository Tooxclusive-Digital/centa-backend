CREATE TABLE "exception_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(40) NOT NULL,
	"company_id" uuid NOT NULL,
	"subject" varchar(120) DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"author_id" uuid NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exception_notes" ADD CONSTRAINT "exception_notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_notes" ADD CONSTRAINT "exception_notes_author_id_platform_admins_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."platform_admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_exception_notes_key" ON "exception_notes" USING btree ("kind","company_id","subject");--> statement-breakpoint
CREATE INDEX "idx_exception_notes_created" ON "exception_notes" USING btree ("created_at");