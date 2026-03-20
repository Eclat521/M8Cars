import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npx tsx scripts/seed-postcodes.ts <path-to-ONSPD-csv>');
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const BATCH_SIZE = 5000;

async function insertBatch(rows: { postcode: string; lat: number; lng: number }[]) {
  if (rows.length === 0) return;

  const values = rows
    .map(
      (_, i) =>
        `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, ST_SetSRID(ST_MakePoint($${i * 5 + 4}, $${i * 5 + 5}), 4326)::geography)`
    )
    .join(', ');

  const params = rows.flatMap((r) => [r.postcode, r.lat, r.lng, r.lng, r.lat]);

  await sql.query(
    `INSERT INTO postcodes (postcode, latitude, longitude, location)
     VALUES ${values}
     ON CONFLICT (postcode) DO NOTHING`,
    params
  );
}

async function main() {
  console.log(`Reading CSV from: ${csvPath}`);

  const parser = fs.createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  let batch: { postcode: string; lat: number; lng: number }[] = [];
  let total = 0;
  let skipped = 0;

  for await (const record of parser) {
    const postcode: string = (record['pcds'] || record['pcd'] || '').trim();
    const lat = parseFloat(record['lat']);
    const lng = parseFloat(record['long']);

    if (!postcode || isNaN(lat) || isNaN(lng) || lat === 99.999999) {
      skipped++;
      continue;
    }

    batch.push({ postcode, lat, lng });

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      total += batch.length;
      console.log(`Inserted ${total} rows...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
    total += batch.length;
  }

  console.log(`Done. Inserted ${total} postcodes, skipped ${skipped} invalid rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
