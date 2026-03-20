import db from './index';
import { exercises } from './schema';
import { Exercise } from '../models/Exercise';

export async function getAllExercises(): Promise<Exercise[]> {
  const rows = await db.select().from(exercises);
  return rows.map((row) => new Exercise(row));
}
