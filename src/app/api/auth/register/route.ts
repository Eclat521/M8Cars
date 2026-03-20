import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/db';
import { users } from '@/db/schema';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({ email: email.toLowerCase().trim(), passwordHash, firstName, lastName })
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName });

    const token = await signToken({ sub: user.id, email: user.email, firstName: user.firstName ?? undefined, lastName: user.lastName ?? undefined });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }
}
