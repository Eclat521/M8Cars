import {
  pgTable,
  uuid,
  text,
  integer,
  serial,
  smallint,
  numeric,
  timestamp,
  varchar,
  boolean,
  doublePrecision,
  customType,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  postcode: varchar('postcode', { length: 10 }),
  resetToken: text('reset_token'),
  resetTokenExpires: timestamp('reset_token_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

const geographyPoint = customType<{ data: string }>({
  dataType() {
    return 'geography(Point, 4326)';
  },
});


export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sets = pgTable('sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutExerciseId: uuid('workout_exercise_id')
    .notNull()
    .references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weight: numeric('weight', { precision: 6, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  note: varchar('note', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 250 }).notNull(),
  variant: varchar('variant', { length: 250 }),
  registration: varchar('registration', { length: 25 }).notNull(),
  bodyType: varchar('body_type', { length: 50 }),
  fuelType: varchar('fuel_type', { length: 50 }).notNull(),
  engineSize: smallint('engine_size').notNull(),
  yearOfManufacture: smallint('year_of_manufacture').notNull(),
  colour: varchar('colour', { length: 50 }).notNull(),
  doors: smallint('doors'),
  gearbox: varchar('gearbox', { length: 50 }),
  alloyWheels: boolean('alloy_wheels').notNull(),
  airConditioning: boolean('air_conditioning').notNull(),
  radioCdSpeakers: boolean('radio_cd_speakers').notNull(),
  leatherSeats: boolean('leather_seats'),
  powerWindows: boolean('power_windows').notNull(),
  navigationSystem: boolean('navigation_system').notNull(),
  title: varchar('title', { length: 250 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  postcode: varchar('postcode', { length: 10 }).notNull(),
  mileage: integer('mileage'),
  img1: varchar('img_1', { length: 250 }),
  img2: varchar('img_2', { length: 250 }),
  img3: varchar('img_3', { length: 250 }),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

export const postcodes = pgTable('postcodes', {
  postcode: varchar('postcode', { length: 10 }).primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  location: geographyPoint('location'),
});

export type Postcode = typeof postcodes.$inferSelect;
