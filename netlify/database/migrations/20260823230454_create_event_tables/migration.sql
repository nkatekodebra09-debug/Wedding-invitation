CREATE TABLE "guests" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"attending" boolean NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "views" (
	"id" serial PRIMARY KEY,
	"ip" text,
	"page" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
