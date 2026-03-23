import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile, readFile as rf } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

// Load .env and .env.local
for (const name of ['.env', '.env.local']) {
  try {
    const envFile = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
    for (const line of envFile.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && key.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim();
    }
  } catch {}
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BUCKET = 'm8carsimages-591446362427-eu-north-1-an';
const REGION = 'eu-north-1';
const BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

const s3 = new S3Client({ region: REGION });
const sql = neon(process.env.DATABASE_URL);

async function uploadToS3(localPath, filename) {
  const buffer = await readFile(localPath);
  const ext = path.extname(filename).toLowerCase();
  const key = `vehicles/${filename}`;
  const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `${BASE_URL}/${key}`;
}

async function main() {
  const vehicles = await sql`
    SELECT id, img_1, img_2, img_3 FROM vehicles
    WHERE img_1 LIKE '/uploads/%'
       OR img_2 LIKE '/uploads/%'
       OR img_3 LIKE '/uploads/%'
  `;

  console.log(`Found ${vehicles.length} vehicles with local images`);

  for (const vehicle of vehicles) {
    let newImg1 = vehicle.img_1;
    let newImg2 = vehicle.img_2;
    let newImg3 = vehicle.img_3;
    let changed = false;

    for (const [col, val, setter] of [
      ['img_1', vehicle.img_1, (v) => { newImg1 = v; }],
      ['img_2', vehicle.img_2, (v) => { newImg2 = v; }],
      ['img_3', vehicle.img_3, (v) => { newImg3 = v; }],
    ]) {
      if (!val || !val.startsWith('/uploads/')) continue;

      const filename = path.basename(val);
      const localPath = path.join(ROOT, 'public', 'uploads', filename);

      if (!existsSync(localPath)) {
        console.warn(`  [SKIP] vehicle ${vehicle.id} ${col}: file not found`);
        continue;
      }

      console.log(`  Uploading ${filename}...`);
      const s3Url = await uploadToS3(localPath, filename);
      setter(s3Url);
      changed = true;
      console.log(`  -> ${s3Url}`);
    }

    if (changed) {
      await sql`
        UPDATE vehicles SET img_1 = ${newImg1}, img_2 = ${newImg2}, img_3 = ${newImg3}
        WHERE id = ${vehicle.id}
      `;
      console.log(`  Updated vehicle ${vehicle.id}`);
    }
  }

  console.log('Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
