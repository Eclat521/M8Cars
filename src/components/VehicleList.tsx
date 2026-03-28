"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Vehicle } from "@/db/schema";
import { Car, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import VehicleFilters, { FilterState } from "@/components/VehicleFilters";
import FavouriteButton from "@/components/FavouriteButton";
import AuthPromptModal from "@/components/AuthPromptModal";

function filtersFromSearchParams(sp: URLSearchParams): FilterState {
  return {
    make: sp.get("makes") ? sp.get("makes")!.split(",") : [],
    model: sp.get("model") ?? "",
    bodyType: sp.get("bodyType") ?? "",
    fuelType: sp.get("fuelType") ?? "",
    gearbox: sp.get("gearbox") ?? "",
    sort: (sp.get("sort") as FilterState["sort"]) ?? "",
    distance: sp.get("distance") ?? "",
    mileageMax: sp.get("mileageMax") ? parseInt(sp.get("mileageMax")!) : 150000,
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
  if (filters.mileageMax < 150000) params.set("mileageMax", String(filters.mileageMax));
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
  const [filters, setFiltersState] = useState<FilterState>(() => {
    const fromUrl = filtersFromSearchParams(searchParams);
    const hasUrlFilters = searchParams.toString().length > 0;
    if (!hasUrlFilters && typeof window !== "undefined") {
      const saved = sessionStorage.getItem("vehicleFilters");
      if (saved) {
        const restored = filtersFromSearchParams(new URLSearchParams(saved));
        return restored;
      }
    }
    return fromUrl;
  });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const userPostcodeRef = useRef(userPostcode);
  userPostcodeRef.current = userPostcode;
  const isFirstRender = useRef(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favouritedIds, setFavouritedIds] = useState<Set<number>>(new Set());
  const [authPromptVehicleId, setAuthPromptVehicleId] = useState<number | null>(null);

  // Load user's favourites once auth is ready
  useEffect(() => {
    if (!user) return;
    fetch("/api/favourites")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.favourites)) {
          setFavouritedIds(new Set(json.favourites));
        }
      })
      .catch(() => {});
  }, [user]);

  async function toggleFavourite(vehicleId: number) {
    if (!user) {
      setAuthPromptVehicleId(vehicleId);
      return;
    }
    // Optimistic update
    setFavouritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setFavouritedIds((prev) => {
        const next = new Set(prev);
        if (next.has(vehicleId)) next.delete(vehicleId);
        else next.add(vehicleId);
        return next;
      });
    }
  }

  async function onAuthSuccess() {
    if (authPromptVehicleId === null) return;
    const vehicleId = authPromptVehicleId;
    setAuthPromptVehicleId(null);
    // Now save the favourite that triggered the prompt
    setFavouritedIds((prev) => new Set([...prev, vehicleId]));
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setFavouritedIds((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
    }
  }

  // Sync URL with restored sessionStorage filters on first render
  useEffect(() => {
    if (searchParams.toString().length === 0) {
      const params = filtersToSearchParams(filters);
      if (params.toString().length > 0) {
        startTransition(() => {
          router.replace(`?${params.toString()}`, { scroll: false });
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setFilters(next: FilterState) {
    setFiltersState(next);
    const params = filtersToSearchParams(next);
    if (userPostcode && (next.distance || next.sort === "distance_asc")) params.set("postcode", userPostcode);
    sessionStorage.setItem("vehicleFilters", params.toString());
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  // Reset and re-fetch from page 1 when filters change (skip on mount — preserve SSR HTML)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    setFiltering(true);
    const url = buildUrl(1, filters, userPostcode);
    console.log('[VehicleList] fetching:', url);
    fetch(url, { signal: controller.signal })
      .then((r) => {
        console.log('[VehicleList] response status:', r.status);
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then((json: PagedResponse) => {
        console.log('[VehicleList] json:', json);
        if (cancelled) return;
        setVehicles(json.data ?? []);
        setTotal(json.total ?? 0);
        setPage(1);
        setHasMore(json.hasMore ?? false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error('[VehicleList] fetch error:', err);
        if (!cancelled) {
          setVehicles([]);
          setTotal(0);
          setHasMore(false);
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        console.log('[VehicleList] finally, cancelled:', cancelled);
        if (!cancelled) setFiltering(false);
      });
    return () => { cancelled = true; controller.abort(); };
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
      {authPromptVehicleId !== null && (
        <AuthPromptModal
          onClose={() => setAuthPromptVehicleId(null)}
          onSuccess={onAuthSuccess}
        />
      )}

      {/* Mobile filter drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-semibold text-sm text-gray-900">Filters</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <VehicleFilters filters={filters} onChange={setFilters} total={total} />
        </div>
      </div>

    <div className="flex gap-6 px-6 py-6 items-start">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[89px] self-start">
        <VehicleFilters filters={filters} onChange={setFilters} total={total} />
      </aside>
      <div className="flex-1 min-w-0">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(filters.make.length > 0 || filters.model || filters.bodyType || filters.fuelType || filters.gearbox || filters.sort || filters.distance) && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-xs">
                {[...filters.make, filters.model, filters.bodyType, filters.fuelType, filters.gearbox, filters.sort, filters.distance].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      <div className={`transition-opacity duration-200 ${filtering ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((vehicle, i) => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`} className="block">
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden rounded-xl border border-gray-200 p-0">
                {/* Image flush to top */}
                <div className="relative h-52 w-full bg-gray-100">
                  <div className="absolute top-2 right-2 z-10">
                    <FavouriteButton
                      vehicleId={vehicle.id}
                      isFavourited={favouritedIds.has(vehicle.id)}
                      onToggle={toggleFavourite}
                    />
                  </div>
                  {vehicle.img1 ? (
                    <Image
                      src={vehicle.img1}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                <CardContent className="px-4 pt-3 pb-4 space-y-2">
                  {/* Title + mileage */}
                  <div>
                    <p className="font-bold text-gray-900 text-lg leading-snug">
                      {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {vehicle.mileage?.toLocaleString()} miles
                    </p>
                  </div>

                  {/* Price */}
                  <p className="text-xl font-bold text-gray-900">
                    £{Number(vehicle.price).toLocaleString()}
                  </p>

                  {/* Location */}
                  {vehicle.postcode && (
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vehicle.postcode}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}

      <div ref={sentinelRef} className="h-4 col-span-full" />

      {loading && Array.from({ length: 3 }).map((_, i) => (
        <Card key={`skeleton-${i}`} className="overflow-hidden rounded-xl border border-gray-200 animate-pulse">
          <div className="w-full h-52 bg-gray-200" />
          <CardContent className="px-4 pt-3 pb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </CardContent>
        </Card>
      ))}

      {!hasMore && vehicles.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4 col-span-full">
          All {total.toLocaleString()} vehicles loaded.
        </p>
      )}
        </div>
      </div>
      </div>
    </div>
    </>
  );
}
