ALTER TABLE "product_license_plans" ADD COLUMN "price_idr" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_license_plans" ADD COLUMN "billing_interval" varchar(20) DEFAULT 'one_time' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_license_plans" ADD COLUMN "features" text DEFAULT '{}' NOT NULL;