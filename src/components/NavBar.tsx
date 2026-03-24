'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import UserNav from './UserNav';

export default function NavBar() {
  const { user, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-3 ml-auto">
        <Link href="/login" className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors">
          Sign In
        </Link>
        <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
          Sign Up
        </Link>
      </div>
    );
  }

  return <UserNav />;
}
