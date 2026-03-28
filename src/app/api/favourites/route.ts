import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import db from '@/db';
import { favourites } from '@/db/schema';
import { getSessionUser } from '@/lib/auth';

// GET /api/favourites — returns vehicle IDs the user has favourited
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const rows = await db
    .select({ vehicleId: favourites.vehicleId })
    .from(favourites)
    .where(and(eq(favourites.userId, session.sub), eq(favourites.deleted, false)));

  return NextResponse.json({ favourites: rows.map((r) => r.vehicleId) });
}

// POST /api/favourites — toggle favourite for a vehicle
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });

  // Check for existing row (including soft-deleted)
  const [existing] = await db
    .select()
    .from(favourites)
    .where(and(eq(favourites.userId, session.sub), eq(favourites.vehicleId, vehicleId)))
    .limit(1);

  if (!existing) {
    // New favourite
    await db.insert(favourites).values({ userId: session.sub, vehicleId });
    return NextResponse.json({ favourited: true });
  }

  if (existing.deleted) {
    // Re-favourite
    await db
      .update(favourites)
      .set({ deleted: false, deletedDate: null, dateSaved: new Date() })
      .where(eq(favourites.id, existing.id));
    return NextResponse.json({ favourited: true });
  }

  // Unfavourite (soft delete)
  await db
    .update(favourites)
    .set({ deleted: true, deletedDate: new Date() })
    .where(eq(favourites.id, existing.id));
  return NextResponse.json({ favourited: false });
}
