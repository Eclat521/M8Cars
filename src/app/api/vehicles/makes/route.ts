import { NextResponse } from 'next/server';
import { getDistinctMakes } from '@/db/vehicles';

export async function GET() {
  const makes = await getDistinctMakes();
  return NextResponse.json(makes);
}
