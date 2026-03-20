import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  // Always return success to avoid email enumeration
  if (user) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpires: expires })
      .where(eq(users.id, user.id));

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error('[forgot-password] Failed to send email:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
