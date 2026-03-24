"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const FILTER_KEYS = ["makes", "model", "bodyType", "fuelType", "gearbox", "sort", "distance"];

export default function SearchVehiclesLink({ className, style }: { className: string; style?: React.CSSProperties }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [savedFilters, setSavedFilters] = useState<string | null>(null);

  useEffect(() => {
    setSavedFilters(sessionStorage.getItem("vehicleFilters"));
  }, [pathname]);

  // On the data-list page, use URL params directly
  if (pathname === "/data-list") {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return <Link href={qs ? `/data-list?${qs}` : "/data-list"} className={className} style={style}>Used Cars</Link>;
  }

  const href = savedFilters ? `/data-list?${savedFilters}` : "/data-list";

  return (
    <Link href={href} className={className} style={style}>
      Used Cars
    </Link>
  );
}
