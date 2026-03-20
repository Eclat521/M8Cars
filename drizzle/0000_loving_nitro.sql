CREATE TYPE "public"."body_type" AS ENUM('Hatchback', 'Saloon', 'SUV', 'Estate', 'Coupe');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('Diesel', 'Electric', 'Hybrid', 'Petrol');--> statement-breakpoint
CREATE TYPE "public"."gearbox_type" AS ENUM('Manual', 'Automatic');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"note" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postcodes" (
	"postcode" varchar(10) PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"location" "geography(Point, 4326)"
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight" numeric(6, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" integer PRIMARY KEY NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(250) NOT NULL,
	"registration" varchar(25) NOT NULL,
	"body_type" varchar(50) NOT NULL,
	"fuel_type" varchar(50) NOT NULL,
	"engine_size" smallint NOT NULL,
	"year_of_manufacture" smallint NOT NULL,
	"colour" varchar(50) NOT NULL,
	"doors" smallint NOT NULL,
	"gearbox" varchar(50) NOT NULL,
	"alloy_wheels" boolean NOT NULL,
	"air_conditioning" boolean NOT NULL,
	"radio_cd_speakers" boolean NOT NULL,
	"leather_seats" boolean,
	"power_windows" boolean NOT NULL,
	"navigation_system" boolean NOT NULL,
	"title" varchar(250) NOT NULL,
	"description" varchar(500) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"postcode" varchar(10) NOT NULL,
	"mileage" integer,
	"img_1" varchar(250),
	"img_2" varchar(250),
	"img_3" varchar(250)
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;