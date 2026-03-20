'use server';

import { redirect } from 'next/navigation';
import db from '@/db/index';
import { exercises } from '@/db/schema';

export async function createExercise(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string | null;

  if (!name?.trim()) {
    throw new Error('Exercise name is required');
  }

  await db.insert(exercises).values({
    name: name.trim(),
    category: category?.trim() || null,
  });

  redirect('/exercise_new?success=1');
}
