import db from './index';
import { vehicles, postcodes } from './schema';
import { Vehicle, NewVehicle } from './schema';
import { asc, desc, count, and, inArray, eq, SQL, sql as rawSql } from 'drizzle-orm';

const LIMIT = 20;

/** Normalises a postcode to the format used in the postcodes table: uppercase with a space before the last 3 chars (e.g. "EH47 8RX"). */
function normalisePostcode(pc: string): string {
  const s = pc.toUpperCase().replace(/\s+/g, "");
  return s.slice(0, -3) + " " + s.slice(-3);
}

/** Returns true if the postcode string is long enough to be a valid UK postcode (min 5 chars: e.g. "W1 1AA"). */
function isValidPostcode(pc: string): boolean {
  const s = pc.replace(/\s+/g, "");
  return s.length >= 5 && s.length <= 8;
}


export type SortOption = 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'mileage_asc' | 'mileage_desc' | 'distance_asc';

export interface VehicleQuery {
  page: number;
  makes?: string[];
  model?: string;
  bodyType?: string;
  fuelType?: string;
  gearbox?: string;
  sort?: SortOption;
  distance?: number;
  postcode?: string;
}

export async function getVehiclesPaged(query: VehicleQuery): Promise<{ data: Vehicle[]; total: number; hasMore: boolean }> {
  const { page, makes, model, bodyType, fuelType, gearbox, sort, distance, postcode } = query;
  const offset = (page - 1) * LIMIT;

  const conditions: SQL[] = [];
  if (makes && makes.length > 0) conditions.push(inArray(vehicles.make, makes));
  if (model) conditions.push(eq(vehicles.model, model));
  if (bodyType) conditions.push(eq(vehicles.bodyType, bodyType));
  if (fuelType) conditions.push(eq(vehicles.fuelType, fuelType));
  if (gearbox) conditions.push(eq(vehicles.gearbox, gearbox));
  if (postcode && isValidPostcode(postcode) && distance) {
    const metres = distance * 1609.344;
    conditions.push(rawSql`${vehicles.postcode} IN (
      SELECT p2.postcode FROM postcodes p1, postcodes p2
      WHERE p1.postcode = ${normalisePostcode(postcode)}
        AND ST_DWithin(p1.location, p2.location, ${metres})
    )`);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy = (() => {
    switch (sort) {
      case 'price_asc': return asc(vehicles.price);
      case 'price_desc': return desc(vehicles.price);
      case 'year_asc': return asc(vehicles.yearOfManufacture);
      case 'year_desc': return desc(vehicles.yearOfManufacture);
      case 'mileage_asc': return asc(vehicles.mileage);
      case 'mileage_desc': return desc(vehicles.mileage);
      case 'distance_asc':
        if (postcode && isValidPostcode(postcode)) {
          return rawSql`(
            SELECT ST_Distance(p1.location, p2.location)
            FROM postcodes p1, postcodes p2
            WHERE p1.postcode = ${normalisePostcode(postcode)}
              AND p2.postcode = ${vehicles.postcode}
            LIMIT 1
          ) ASC NULLS LAST`;
        }
        return asc(vehicles.id);
      default: return asc(vehicles.id);
    }
  })();

  const [data, [{ value: total }]] = await Promise.all([
    db.select().from(vehicles).where(where).orderBy(orderBy).limit(LIMIT).offset(offset),
    db.select({ value: count() }).from(vehicles).where(where),
  ]);

  return { data, total, hasMore: offset + data.length < total };
}

export async function createVehicle(data: Omit<NewVehicle, 'id'>): Promise<Vehicle> {
  const postcode = normalisePostcode(data.postcode);
  const [vehicle] = await db.insert(vehicles).values({ ...data, postcode }).returning();
  return vehicle;
}

export async function getVehicleById(id: number): Promise<Vehicle | undefined> {
  const rows = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return rows[0];
}

export async function getDistanceMiles(fromPostcode: string, toPostcode: string): Promise<number | null> {
  const rows = await db.execute(rawSql`
    SELECT ST_Distance(p1.location, p2.location) / 1609.344 AS miles
    FROM postcodes p1, postcodes p2
    WHERE p1.postcode = ${normalisePostcode(fromPostcode)}
      AND p2.postcode = ${normalisePostcode(toPostcode)}
    LIMIT 1
  `);
  const row = rows.rows?.[0] as { miles: number } | undefined;
  return row?.miles ?? null;
}

export async function getDistinctMakes(): Promise<string[]> {
  const rows = await db.selectDistinct({ make: vehicles.make }).from(vehicles).orderBy(asc(vehicles.make));
  return rows.map((r) => r.make);
}

export async function getModelsByMakes(makes: string[]): Promise<string[]> {
  const rows = await db
    .selectDistinct({ model: vehicles.model })
    .from(vehicles)
    .where(makes.length > 0 ? inArray(vehicles.make, makes) : undefined)
    .orderBy(asc(vehicles.model));
  return rows.map((r) => r.model);
}

export async function postcodeExists(pc: string): Promise<boolean> {
  const rows = await db
    .select({ postcode: postcodes.postcode })
    .from(postcodes)
    .where(eq(postcodes.postcode, normalisePostcode(pc)))
    .limit(1);
  return rows.length > 0;
}
