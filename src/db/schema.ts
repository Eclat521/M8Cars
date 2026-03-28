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



export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 250 }).notNull(),
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
  img4: varchar('img_4', { length: 250 }),
  img5: varchar('img_5', { length: 250 }),
  img6: varchar('img_6', { length: 250 }),
  img7: varchar('img_7', { length: 250 }),
  img8: varchar('img_8', { length: 250 }),
  img9: varchar('img_9', { length: 250 }),
  img10: varchar('img_10', { length: 250 }),
  img11: varchar('img_11', { length: 250 }),
  img12: varchar('img_12', { length: 250 }),
  img13: varchar('img_13', { length: 250 }),
  img14: varchar('img_14', { length: 250 }),
  img15: varchar('img_15', { length: 250 }),
  img16: varchar('img_16', { length: 250 }),
  img17: varchar('img_17', { length: 250 }),
  img18: varchar('img_18', { length: 250 }),
  img19: varchar('img_19', { length: 250 }),
  img20: varchar('img_20', { length: 250 }),
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

export const favourites = pgTable('favourites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  dateSaved: timestamp('date_saved').defaultNow().notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  deletedDate: timestamp('deleted_date'),
});

export type Favourite = typeof favourites.$inferSelect;
export type NewFavourite = typeof favourites.$inferInsert;
