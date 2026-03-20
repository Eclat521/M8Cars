import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.HOSTPRESTO_SMTP_SERVER;
  const port = process.env.HOSTPRESTO_SMTP_PORT;
  const user = process.env.HOSTPRESTO_SENDER;
  const pass = process.env.HOSTPRESTO_SMTP_PWD;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: port ? parseInt(port) : 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = createTransport();

  if (!transport) {
    console.warn('[mail] HostPresto not configured — logging reset URL instead');
    console.log(`[Password Reset] ${to} → ${resetUrl}`);
    return;
  }

  console.log(`[mail] Sending password reset to ${to} via ${process.env.HOSTPRESTO_SMTP_SERVER}`);

  await transport.sendMail({
    from: `"M8 Cars" <${process.env.HOSTPRESTO_SENDER}>`,
    to,
    subject: 'Reset your password',
    text: `You requested a password reset.\n\nClick the link below to set a new password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:12px 0">Reset password</a></p>
      <p style="color:#666;font-size:13px">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `.trim(),
  });

  console.log(`[mail] Password reset email sent to ${to}`);
}
