'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="max-w-sm mx-auto mt-16 px-6">
        <h2 className="text-2xl font-bold mb-4">Check your email</h2>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <Link href="/login" className="text-sm underline">Back to sign in</Link>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto mt-16 px-6">
      <h2 className="text-2xl font-bold mb-2">Forgot password</h2>
      <p className="text-sm text-muted-foreground mb-6">Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        <Link href="/login" className="underline text-muted-foreground">Back to sign in</Link>
      </p>
    </main>
  );
}
