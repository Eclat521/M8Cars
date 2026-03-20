'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, isLoaded, refresh } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!isLoaded) return null;
  if (!user) return <p className="p-6">You must be signed in to view this page.</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || user!.firstName || undefined,
          lastName: lastName.trim() || user!.lastName || undefined,
          postcode: postcode.trim() || user!.postcode || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      await refresh();
      setSaved(true);
      setFirstName('');
      setLastName('');
      setPostcode('');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-md mx-auto mt-12 px-6">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-2">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg font-medium mt-1">
            {(user.firstName || user.lastName)
              ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
              : <span className="text-gray-400 italic">Not set</span>}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium mt-1">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Postcode</p>
          <p className="text-lg font-medium mt-1">{user.postcode || <span className="text-gray-400 italic">Not set</span>}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">First name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder={user.firstName ?? 'First name'}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder={user.lastName ?? 'Last name'}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium mb-1">Postcode</label>
          <input
            id="postcode"
            type="text"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            placeholder={user.postcode || 'e.g. EH47 8RX'}
            maxLength={10}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <p className="text-sm text-green-600">Details saved.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
