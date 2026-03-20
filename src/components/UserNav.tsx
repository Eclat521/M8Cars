'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/');
    setOpen(false);
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b truncate">{user?.email}</div>
          <Link href="/profile" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
            👤 Profile
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
