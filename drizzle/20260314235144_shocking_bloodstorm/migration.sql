CREATE TABLE "accounts" (
	"access_token" text,
	"expires_at" timestamp with time zone,
	"id" char(26) PRIMARY KEY,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"user_id" char(26) NOT NULL,
	CONSTRAINT "accounts_provider_provider_account_id_unique" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"expires_at" timestamp with time zone NOT NULL,
	"id" char(26) PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"user_id" char(26) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now(),
	"email" text UNIQUE,
	"email_verified" boolean DEFAULT false,
	"id" char(26) PRIMARY KEY,
	"image" text,
	"name" text,
	"password_hash" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;