import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json(null);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);

  if (!user) return NextResponse.json(null);

  return NextResponse.json({
    sub: user.id,
    email: user.email,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    postcode: user.postcode ?? undefined,
  });
}
