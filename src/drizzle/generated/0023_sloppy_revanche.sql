CREATE INDEX "holidays_company_date_idx" ON "holidays" USING btree ("company_id","date");--> statement-breakpoint
CREATE INDEX "attendance_records_company_clock_in_idx" ON "attendance_records" USING btree ("company_id","clock_in");--> statement-breakpoint
CREATE INDEX "employee_shifts_company_shift_date_idx" ON "employee_shifts" USING btree ("company_id","shift_date");