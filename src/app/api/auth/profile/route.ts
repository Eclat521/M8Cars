import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, signToken, COOKIE_NAME } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firstName, lastName, postcode } = await req.json();

  const [updated] = await db
    .update(users)
    .set({
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName !== undefined ? { lastName } : {}),
      ...(postcode !== undefined ? { postcode: postcode.toUpperCase().trim() } : {}),
    })
    .where(eq(users.id, session.sub))
    .returning();

  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const token = await signToken({
    sub: updated.id,
    email: updated.email,
    firstName: updated.firstName ?? undefined,
    lastName: updated.lastName ?? undefined,
    postcode: updated.postcode ?? undefined,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
