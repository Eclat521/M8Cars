'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AddVehicleLink() {
  const { user, isLoaded } = useAuth();
  if (!isLoaded || !user) return null;
  return (
    <Link href="/new-vehicle" className="font-medium hover:underline" style={{ fontFamily: 'ATVFabriga, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px' }}>
      Sell Your Car
    </Link>
  );
}
