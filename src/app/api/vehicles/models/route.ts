import { NextRequest, NextResponse } from 'next/server';
import { getModelsByMakes } from '@/db/vehicles';

export async function GET(req: NextRequest) {
  const makesParam = req.nextUrl.searchParams.get('makes');
  const makes = makesParam ? makesParam.split(',').filter(Boolean) : [];
  const models = await getModelsByMakes(makes);
  return NextResponse.json(models);
}
