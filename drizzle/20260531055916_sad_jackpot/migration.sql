ALTER TABLE "campaigns" ADD COLUMN "invite_id" uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_invite_id_key" UNIQUE("invite_id");