import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const firstNames = ['James', 'Oliver', 'Harry', 'Jack', 'George', 'Noah', 'Charlie', 'Jacob',
  'Alfie', 'Freddie', 'Amelia', 'Olivia', 'Isla', 'Ava', 'Emily', 'Poppy', 'Isabella', 'Sophie',
  'Mia', 'Grace', 'Liam', 'Ethan', 'Lucas', 'Mason', 'Logan', 'Emma', 'Charlotte', 'Lily', 'Ella', 'Chloe'];

const lastNames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson',
  'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White',
  'Watson', 'Jackson', 'Wright', 'Green', 'Harris', 'Cooper', 'King', 'Lee', 'Martin', 'Clarke',
  'Hall', 'Turner', 'Hill'];

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  // Hash once and reuse — bcrypt with 12 rounds is slow, no need to hash per user
  console.log('Hashing password...');
  const passwordHash = await bcrypt.hash('Tester', 12);

  // Get 100 random postcodes
  const postcodeRows = await sql.query(
    `SELECT postcode FROM postcodes ORDER BY RANDOM() LIMIT 100`
  ) as any[];
  const postcodes = postcodeRows.map((r: any) => r.postcode);

  if (postcodes.length === 0) {
    console.error('No postcodes found in postcodes table');
    process.exit(1);
  }

  const TARGET = 50;
  const [{ count }] = await sql.query(`SELECT COUNT(*) as count FROM users`) as any[];
  const current = parseInt(count);
  const toAdd = TARGET - current;

  if (toAdd <= 0) {
    console.log(`Already have ${current} users, nothing to add.`);
    return;
  }

  console.log(`Currently ${current} users. Adding ${toAdd}...`);

  const values: string[] = [];
  for (let i = 0; i < toAdd; i++) {
    const firstName = rand(firstNames);
    const lastName = rand(lastNames);
    const postcode = rand(postcodes).replace(/'/g, "''");
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    values.push(`('${email}', '${passwordHash.replace(/'/g, "''")}', '${firstName}', '${lastName}', '${postcode}')`);
  }

  await sql.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, postcode) VALUES ${values.join(',')}`
  );

  console.log(`Done! Added ${toAdd} test users. Login with any email above and password: Tester`);
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
