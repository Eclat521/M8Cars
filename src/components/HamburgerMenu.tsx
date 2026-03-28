"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const linkClass =
  'block px-4 py-3 text-sm font-medium hover:bg-gray-50 border-b border-gray-100 last:border-0';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Link href="/data-list" className={linkClass}>Used Cars</Link>
          {user && (
            <Link href="/new-vehicle" className={linkClass}>Sell Your Car</Link>
          )}
          <a href="#" className={linkClass}>Get a value for your car</a>
          <a href="#" className={linkClass}>See a car&apos;s history</a>
        </div>
      )}
    </div>
  );
}
