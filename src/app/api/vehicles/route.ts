import { NextRequest, NextResponse } from 'next/server';
import { getVehiclesPaged, createVehicle, SortOption } from '@/db/vehicles';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = parseInt(params.get('page') ?? '1', 10);
  const makesParam = params.get('makes');
  const makes = makesParam ? makesParam.split(',').filter(Boolean) : undefined;
  const model = params.get('model') ?? undefined;
  const bodyType = params.get('bodyType') ?? undefined;
  const fuelType = params.get('fuelType') ?? undefined;
  const gearbox = params.get('gearbox') ?? undefined;
  const sort = (params.get('sort') ?? undefined) as SortOption | undefined;
  const distanceParam = params.get('distance');
  const distance = distanceParam ? parseFloat(distanceParam) : undefined;
  const postcode = params.get('postcode') ?? undefined;

  console.log('[vehicles GET]', { page, makes, model, bodyType, fuelType, gearbox, sort, distance, postcode });
  try {
    const result = await getVehiclesPaged({ page, makes, model, bodyType, fuelType, gearbox, sort, distance, postcode });
    console.log('[vehicles GET] success, total:', result.total);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[vehicles GET] error:', err);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vehicle = await createVehicle(body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
