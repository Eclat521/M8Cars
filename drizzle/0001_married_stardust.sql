CREATE TABLE "favourites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vehicle_id" integer NOT NULL,
	"date_saved" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"postcode" varchar(10),
	"reset_token" text,
	"reset_token_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "body_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "doors" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "gearbox" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "variant" varchar(250);--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."body_type";--> statement-breakpoint
DROP TYPE "public"."fuel_type";--> statement-breakpoint
DROP TYPE "public"."gearbox_type";