import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const vrm = req.nextUrl.searchParams.get('vrm');
  if (!vrm) return NextResponse.json({ error: 'VRM is required' }, { status: 400 });

  const apiKey = process.env.CHECKCARDETAILS_API_KEY;
  const baseUrl = process.env.CHECKCARDETAILS_API_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'CHECKCARDETAILS not configured' }, { status: 500 });
  }

  const url = new URL(baseUrl);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('vrm', vrm.replace(/\s+/g, '').toUpperCase());

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: res.status });
  }

  const data = await res.json();
  console.log('[checkcardetails] response:', JSON.stringify(data, null, 2));

  // Normalise nested checkcardetails response into a flat structure for the frontend
  const normalized = {
    make: data.ModelData?.Make ?? null,
    model: data.ModelData?.Range ?? null,
    colour: data.ColourDetails?.CurrentColour
      ? data.ColourDetails.CurrentColour.charAt(0).toUpperCase() + data.ColourDetails.CurrentColour.slice(1).toLowerCase()
      : null,
    yearOfManufacture: data.VehicleIdentification?.YearOfManufacture ?? null,
    fuelType: data.ModelData?.FuelType ?? null,
    engineCapacity: data.DvlaTechnicalDetails?.EngineCapacityCc ?? null,
    doors: data.BodyDetails?.NumberOfDoors ?? null,
    bodyType: data.BodyDetails?.BodyStyle ?? null,
    gearbox: data.Transmission?.TransmissionType ?? null,
  };

  return NextResponse.json(normalized);
}
