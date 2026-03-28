import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  // Get images from first 100 vehicles
  const source = await sql.query(
    `SELECT img_1, img_2, img_3 FROM vehicles ORDER BY id LIMIT 100`
  ) as any[];

  const img1Pool = source.map((r: any) => r.img_1).filter(Boolean);
  const img2Pool = source.map((r: any) => r.img_2).filter(Boolean);
  const img3Pool = source.map((r: any) => r.img_3).filter(Boolean);

  console.log(`Image pools — img1: ${img1Pool.length}, img2: ${img2Pool.length}, img3: ${img3Pool.length}`);

  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Get count of vehicles needing images
  const [{ count }] = await sql.query(
    `SELECT COUNT(*) as count FROM vehicles WHERE img_1 IS NULL OR img_2 IS NULL OR img_3 IS NULL`
  ) as any[];
  console.log(`Vehicles with null images: ${count}`);

  const batchSize = 500;
  let offset = 0;
  let updated = 0;

  while (true) {
    const rows = await sql.query(
      `SELECT id, img_1, img_2, img_3 FROM vehicles WHERE img_1 IS NULL OR img_2 IS NULL OR img_3 IS NULL LIMIT ${batchSize}`
    ) as any[];

    if (rows.length === 0) break;

    const cases1: string[] = [];
    const cases2: string[] = [];
    const cases3: string[] = [];
    const ids: number[] = [];

    for (const row of rows) {
      ids.push(row.id);
      if (!row.img_1 && img1Pool.length) cases1.push(`WHEN ${row.id} THEN '${rand(img1Pool)}'`);
      if (!row.img_2 && img2Pool.length) cases2.push(`WHEN ${row.id} THEN '${rand(img2Pool)}'`);
      if (!row.img_3 && img3Pool.length) cases3.push(`WHEN ${row.id} THEN '${rand(img3Pool)}'`);
    }

    const setParts: string[] = [];
    if (cases1.length) setParts.push(`img_1 = CASE id ${cases1.join(' ')} ELSE img_1 END`);
    if (cases2.length) setParts.push(`img_2 = CASE id ${cases2.join(' ')} ELSE img_2 END`);
    if (cases3.length) setParts.push(`img_3 = CASE id ${cases3.join(' ')} ELSE img_3 END`);

    if (setParts.length) {
      await sql.query(
        `UPDATE vehicles SET ${setParts.join(', ')} WHERE id IN (${ids.join(',')})`
      );
    }

    updated += rows.length;
    console.log(`Updated ${updated}/${count}`);
    offset += batchSize;
  }

  console.log('Done!');
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
