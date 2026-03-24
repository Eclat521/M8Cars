import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/db';
import { users } from '@/db/schema';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName, postcode } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({ email: email.toLowerCase().trim(), passwordHash, firstName, lastName, postcode: postcode?.toUpperCase().trim() || null })
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName });

    if (!user) throw new Error('Insert returned no rows');

    const token = await signToken({ sub: user.id, email: user.email, firstName: user.firstName ?? undefined, lastName: user.lastName ?? undefined });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ error: 'This Email is already in use' }, { status: 409 });
  }
}
