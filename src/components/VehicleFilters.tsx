"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SortOption } from "@/db/vehicles";

export interface FilterState {
  make: string[];
  model: string;
  bodyType: string;
  fuelType: string;
  gearbox: string;
  sort: SortOption | "";
  distance: string;
}

interface VehicleFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  total: number;
}

export default function VehicleFilters({ filters, onChange, total }: VehicleFiltersProps) {
  const { user } = useAuth();
  const userPostcode = user?.postcode;
  const [makeOpen, setMakeOpen] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const makeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/vehicles/makes")
      .then((r) => r.json())
      .then(setMakes);
  }, []);

  useEffect(() => {
    const q = filters.make.length > 0 ? `?makes=${filters.make.join(",")}` : "";
    fetch(`/api/vehicles/models${q}`)
      .then((r) => r.json())
      .then(setModels);
  }, [filters.make]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) {
        setMakeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const bodyTypes = ['Hatchback', 'Saloon', 'SUV', 'Estate', 'Coupe'];
  const fuelTypes = ['Diesel', 'Electric', 'Hybrid', 'Petrol'];
  const gearboxes = ['Manual', 'Automatic'];

  function set(key: keyof Omit<FilterState, "make">, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function toggleMake(make: string) {
    const next = filters.make.includes(make)
      ? filters.make.filter((m) => m !== make)
      : [...filters.make, make];
    onChange({ ...filters, make: next, model: "" });
  }

  const selectClass =
    "border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400";

  return (
    <div className="sticky top-0 z-10 bg-white border-b py-4 px-6">
      <div className="bg-card rounded-xl border border-border shadow-md px-5 py-4">
        <h1 className="text-2xl font-semibold mb-3"><span className="bg-gray-600 text-white rounded-md px-2 py-0.5">Find your perfect car...</span></h1>
        <div className="flex flex-wrap items-start gap-3">

          <div ref={makeRef} className="relative">
            <button
              type="button"
              onClick={() => setMakeOpen((o) => !o)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
            >
              {filters.make.length === 0 ? "All Makes" : `${filters.make.length} make${filters.make.length > 1 ? "s" : ""} selected`}
              <span className="text-gray-400">▾</span>
            </button>
            {makeOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-300 rounded-md shadow-md py-1 min-w-40 max-h-60 overflow-y-auto">
                {makes.map((m) => (
                  <label key={m} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filters.make.includes(m)}
                      onChange={() => toggleMake(m)}
                      className="accent-gray-700"
                    />
                    {m}
                  </label>
                ))}
              </div>
            )}
          </div>

          <select
            className={selectClass}
            value={filters.model}
            onChange={(e) => set("model", e.target.value)}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={filters.bodyType}
            onChange={(e) => set("bodyType", e.target.value)}
          >
            <option value="">All Body Types</option>
            {bodyTypes.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={filters.fuelType}
            onChange={(e) => set("fuelType", e.target.value)}
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={filters.gearbox}
            onChange={(e) => set("gearbox", e.target.value)}
          >
            <option value="">All Gearboxes</option>
            {gearboxes.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <div title={!userPostcode ? "Set your postcode in Profile to use distance filter" : undefined}>
            <select
              className={selectClass}
              value={filters.distance}
              onChange={(e) => set("distance", e.target.value)}
              disabled={!userPostcode}
            >
              <option value="">No distance limit</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
              <option value="200">Within 200 miles</option>
              <option value="300">Within 300 miles</option>
              <option value="400">Within 400 miles</option>
              <option value="500">Within 500 miles</option>
              <option value="750">Within 750 miles</option>
            </select>
          </div>

          <select
            className={`${selectClass} ml-3`}
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_asc">Year: Oldest First</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="mileage_asc">Mileage: Low to High</option>
            <option value="mileage_desc">Mileage: High to Low</option>
            <option value="distance_asc" disabled={!userPostcode}>Distance: Nearest First{!userPostcode && " (set postcode in Profile)"}</option>
          </select>

          {(filters.make.length > 0 || filters.model || filters.bodyType || filters.fuelType || filters.gearbox || filters.sort || filters.distance) && (
            <button
              type="button"
              onClick={() => onChange({ make: [], model: "", bodyType: "", fuelType: "", gearbox: "", sort: "", distance: "" })}
              className="rounded-md px-3 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Clear all filters ({total.toLocaleString()})
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
