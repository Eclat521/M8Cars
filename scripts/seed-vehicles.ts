import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const makes = [
  { make: 'Ford', models: ['Fiesta', 'Focus', 'Mondeo', 'Puma', 'Kuga', 'Explorer'] },
  { make: 'Vauxhall', models: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland'] },
  { make: 'Volkswagen', models: ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Up'] },
  { make: 'BMW', models: ['1 Series', '3 Series', '5 Series', 'X1', 'X3', 'X5'] },
  { make: 'Mercedes', models: ['A Class', 'C Class', 'E Class', 'GLA', 'GLC', 'CLA'] },
  { make: 'Audi', models: ['A1', 'A3', 'A4', 'Q3', 'Q5', 'TT'] },
  { make: 'Toyota', models: ['Yaris', 'Corolla', 'Camry', 'RAV4', 'C-HR', 'Aygo'] },
  { make: 'Honda', models: ['Jazz', 'Civic', 'CR-V', 'HR-V', 'e'] },
  { make: 'Nissan', models: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'] },
  { make: 'Hyundai', models: ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe'] },
  { make: 'Kia', models: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Niro'] },
  { make: 'Renault', models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Zoe'] },
  { make: 'Peugeot', models: ['208', '308', '508', '2008', '3008', '5008'] },
  { make: 'Fiat', models: ['500', 'Panda', 'Tipo', '500X', '500L'] },
  { make: 'Skoda', models: ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'] },
];

const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const gearboxes = ['Manual', 'Automatic', 'Semi-Automatic'];
const bodyTypes = ['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV'];
const colours = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Orange', 'Yellow', 'Brown'];
const postcodes = [
  'SW1A 1AA', 'E1 6AN', 'M1 1AE', 'B1 1BB', 'LS1 1BA',
  'G1 1DX', 'BS1 1AA', 'NE1 1AB', 'S1 1AB', 'L1 1AA',
  'W1A 1AA', 'EC1A 1BB', 'N1 1AA', 'SE1 1AA', 'WC1A 1AA',
  'OX1 1AA', 'CB1 1AA', 'CF10 1AA', 'EH1 1AA', 'BT1 1AA',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBool(): boolean {
  return Math.random() > 0.5;
}

function genReg(): string {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXY';
  const l = (n: number) => Array.from({ length: n }, () => letters[randInt(0, letters.length - 1)]).join('');
  const d = (n: number) => Array.from({ length: n }, () => randInt(0, 9)).join('');
  return `${l(2)}${d(2)} ${l(3)}`;
}

async function seed() {
  // Get current count
  const [{ count }] = await sql.query('SELECT COUNT(*) as count FROM vehicles') as any[];
  const current = parseInt(count);
  const toAdd = 100000 - current;

  if (toAdd <= 0) {
    console.log(`Already have ${current} vehicles, nothing to add.`);
    return;
  }

  console.log(`Currently ${current} vehicles. Adding ${toAdd} more...`);

  const batchSize = 50;
  let added = 0;

  for (let i = 0; i < toAdd; i += batchSize) {
    const batch = Math.min(batchSize, toAdd - i);
    const values: string[] = [];

    for (let j = 0; j < batch; j++) {
      const { make, models } = rand(makes);
      const model = rand(models);
      const fuelType = rand(fuelTypes);
      const gearbox = rand(gearboxes);
      const bodyType = rand(bodyTypes);
      const colour = rand(colours);
      const postcode = rand(postcodes);
      const year = randInt(2005, 2024);
      const engineSize = rand([1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500, 3000]);
      const doors = rand([3, 5]);
      const mileage = randInt(1000, 120000);
      const price = (randInt(3000, 45000)).toFixed(2);
      const reg = genReg();
      const title = `${year} ${make} ${model} ${engineSize / 1000}L ${fuelType}`;
      const description = `${colour} ${year} ${make} ${model} with ${mileage.toLocaleString()} miles. ${gearbox} gearbox, ${fuelType} engine.`;

      const alloy = randBool();
      const ac = randBool();
      const radio = randBool();
      const leather = randBool();
      const pw = randBool();
      const nav = randBool();

      values.push(
        `('${make}', '${model}', '${reg}', '${bodyType}', '${fuelType}', ${engineSize}, ${year}, '${colour}', ${doors}, '${gearbox}', ${alloy}, ${ac}, ${radio}, ${leather}, ${pw}, ${nav}, '${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', ${price}, '${postcode}', ${mileage})`
      );
    }

    await sql.query(
      `INSERT INTO vehicles (make, model, registration, body_type, fuel_type, engine_size, year_of_manufacture, colour, doors, gearbox, alloy_wheels, air_conditioning, radio_cd_speakers, leather_seats, power_windows, navigation_system, title, description, price, postcode, mileage) VALUES ${values.join(',')}`
    );

    added += batch;
    console.log(`Added ${added}/${toAdd}`);
  }

  console.log('Done!');
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
