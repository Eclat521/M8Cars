"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Vehicle } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import VehicleFilters, { FilterState } from "@/components/VehicleFilters";

function filtersFromSearchParams(sp: URLSearchParams): FilterState {
  return {
    make: sp.get("makes") ? sp.get("makes")!.split(",") : [],
    model: sp.get("model") ?? "",
    bodyType: sp.get("bodyType") ?? "",
    fuelType: sp.get("fuelType") ?? "",
    gearbox: sp.get("gearbox") ?? "",
    sort: (sp.get("sort") as FilterState["sort"]) ?? "",
    distance: sp.get("distance") ?? "",
  };
}

function filtersToSearchParams(filters: FilterState, userPostcode?: string): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.make.length > 0) params.set("makes", filters.make.join(","));
  if (filters.model) params.set("model", filters.model);
  if (filters.bodyType) params.set("bodyType", filters.bodyType);
  if (filters.fuelType) params.set("fuelType", filters.fuelType);
  if (filters.gearbox) params.set("gearbox", filters.gearbox);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.distance) params.set("distance", filters.distance);
  return params;
}

function buildApiParams(filters: FilterState, userPostcode?: string): URLSearchParams {
  const params = filtersToSearchParams(filters);
  if (userPostcode && (filters.distance || filters.sort === "distance_asc")) params.set("postcode", userPostcode);
  return params;
}

interface PagedResponse {
  data: Vehicle[];
  total: number;
  hasMore: boolean;
}

interface VehicleListProps {
  initialData: PagedResponse;
}

function buildUrl(page: number, filters: FilterState, userPostcode?: string): string {
  const params = buildApiParams(filters, userPostcode);
  params.set("page", String(page));
  return `/api/vehicles?${params.toString()}`;
}

export default function VehicleList({ initialData }: VehicleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const userPostcode = user?.postcode;

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialData.data);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [filters, setFiltersState] = useState<FilterState>(() => filtersFromSearchParams(searchParams));
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const userPostcodeRef = useRef(userPostcode);
  userPostcodeRef.current = userPostcode;
  const isFirstRender = useRef(true);

  function setFilters(next: FilterState) {
    setFiltersState(next);
    const params = filtersToSearchParams(next);
    if (userPostcode && (next.distance || next.sort === "distance_asc")) params.set("postcode", userPostcode);
    sessionStorage.setItem("vehicleFilters", params.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  // Reset and re-fetch from page 1 when filters change (skip on mount — preserve SSR HTML)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let cancelled = false;
    setFiltering(true);
    fetch(buildUrl(1, filters, userPostcode))
      .then((r) => r.json())
      .then((json: PagedResponse) => {
        if (cancelled) return;
        setVehicles(json.data);
        setTotal(json.total);
        setPage(1);
        setHasMore(json.hasMore);
      })
      .finally(() => {
        if (!cancelled) setFiltering(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {

      const res = await fetch(buildUrl(nextPage, filtersRef.current, userPostcodeRef.current));
      const json: PagedResponse = await res.json();
      setVehicles((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        return [...prev, ...json.data.filter((v) => !existingIds.has(v.id))];
      });
      setTotal(json.total);
      setPage(nextPage);
      setHasMore(json.hasMore);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <>
    <VehicleFilters filters={filters} onChange={setFilters} total={total} />
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-6 py-6 transition-opacity duration-200 ${filtering ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
      {vehicles.map((vehicle, i) => (
        <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`} className="block">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
            <CardContent className="space-y-2 pt-4">
              {vehicle.img1 && (
                <div className="relative h-48 w-full">
                  <Image
                    src={vehicle.img1}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover rounded"
                    priority={i === 0}
                  />
                </div>
              )}
              <div>
                <p className="text-lg font-semibold">{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</p>
                <p className="text-sm text-muted-foreground"><span className="bg-gray-600 text-white rounded-md px-2 py-0.5">{vehicle.mileage?.toLocaleString()} miles</span></p>
              </div>
              <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                <span><strong>Price:</strong> £{Number(vehicle.price).toLocaleString()}</span>
                <span><strong>Body:</strong> {vehicle.bodyType}</span>
                <span><strong>Fuel:</strong> {vehicle.fuelType}</span>
                <span><strong>Gearbox:</strong> {vehicle.gearbox}</span>
                <span><strong>Colour:</strong> {vehicle.colour}</span>
                <span><strong>Doors:</strong> {vehicle.doors}</span>
                <span><strong>Engine:</strong> {vehicle.engineSize}cc</span>
                <span><strong>Postcode:</strong> {vehicle.postcode}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      <div ref={sentinelRef} className="h-4 col-span-full" />

      {loading && Array.from({ length: 5 }).map((_, i) => (
        <Card key={`skeleton-${i}`} className="col-span-1">
          <CardContent className="space-y-2 pt-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {!hasMore && vehicles.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4 col-span-full">
          All {total.toLocaleString()} vehicles loaded.
        </p>
      )}
    </div>
    </>
  );
}
