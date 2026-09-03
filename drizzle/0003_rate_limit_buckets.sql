CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
