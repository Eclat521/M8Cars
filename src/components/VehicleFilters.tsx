"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
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
  mileageMax: number;
}

interface VehicleFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  total: number;
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
  activeCount,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount ? (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-xs">
              {activeCount}
            </span>
          ) : null}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-3 space-y-1">{children}</div>}
    </div>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1 text-sm cursor-pointer hover:text-gray-900 text-gray-700 group">
      <span
        className={`w-4 h-4 flex-shrink-0 rounded border transition-colors ${
          checked ? "bg-gray-800 border-gray-800" : "border-gray-300 bg-white group-hover:border-gray-500"
        } flex items-center justify-center`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

const sortLabels: Record<string, string> = {
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  year_desc: "Year: Newest First",
  year_asc: "Year: Oldest First",
  mileage_asc: "Mileage: Low to High",
  mileage_desc: "Mileage: High to Low",
  distance_asc: "Distance: Nearest First",
};

const distanceLabels: Record<string, string> = {
  "5": "Within 5 miles",
  "10": "Within 10 miles",
  "25": "Within 25 miles",
  "50": "Within 50 miles",
  "100": "Within 100 miles",
  "200": "Within 200 miles",
  "": "Nationwide",
};

const MILEAGE_MAX = 150000;

function MileageSlider({
  max,
  onChange,
}: {
  max: number;
  onChange: (max: number) => void;
}) {
  const percent = (max / MILEAGE_MAX) * 100;

  return (
    <div className="px-1 pt-1 pb-2 space-y-3">
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1 rounded bg-gray-200" />
        <div className="absolute h-1 rounded bg-gray-800" style={{ left: 0, right: `${100 - percent}%` }} />
        <input
          type="range"
          min={0}
          max={MILEAGE_MAX}
          step={1000}
          value={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
        />
      </div>
    </div>
  );
}

function ActiveFilterRow({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-emerald-50 text-emerald-800 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-700 text-emerald-700 hover:bg-emerald-100 transition-colors flex-shrink-0 ml-2"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function VehicleFilters({ filters, onChange, total }: VehicleFiltersProps) {
  const { user } = useAuth();
  const userPostcode = user?.postcode;
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

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

  const bodyTypes = ["Hatchback", "Saloon", "SUV", "Estate", "Coupe"];
  const fuelTypes = ["Diesel", "Electric", "Hybrid", "Petrol"];
  const gearboxes = ["Manual", "Automatic"];
  const distanceOptions = [
    { value: "5", label: "Within 5 miles" },
    { value: "10", label: "Within 10 miles" },
    { value: "25", label: "Within 25 miles" },
    { value: "50", label: "Within 50 miles" },
    { value: "100", label: "Within 100 miles" },
    { value: "200", label: "Within 200 miles" },
    { value: "", label: "Nationwide" },
  ];
  const sortOptions: { value: SortOption | ""; label: string }[] = [
    { value: "", label: "Default" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "year_desc", label: "Year: Newest First" },
    { value: "year_asc", label: "Year: Oldest First" },
    { value: "mileage_asc", label: "Mileage: Low to High" },
    { value: "mileage_desc", label: "Mileage: High to Low" },
  ];
  if (userPostcode) {
    sortOptions.push({ value: "distance_asc", label: "Distance: Nearest First" });
  }

  function set(key: keyof Omit<FilterState, "make">, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function toggleMake(make: string) {
    const next = filters.make.includes(make)
      ? filters.make.filter((m) => m !== make)
      : [...filters.make, make];
    onChange({ ...filters, make: next, model: "" });
  }

  const mileageActive = filters.mileageMax < MILEAGE_MAX;

  const hasFilters =
    filters.make.length > 0 ||
    !!filters.model ||
    !!filters.bodyType ||
    !!filters.fuelType ||
    !!filters.gearbox ||
    !!filters.sort ||
    !!filters.distance ||
    mileageActive;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Filter by</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ make: [], model: "", bodyType: "", fuelType: "", gearbox: "", sort: "", distance: "", mileageMax: MILEAGE_MAX })}
            className="text-sm text-gray-500 underline hover:text-gray-900 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {hasFilters && (
        <div className="px-4 py-3 border-b border-gray-200 space-y-2">
          {filters.make.map((m) => (
            <ActiveFilterRow
              key={m}
              label={m}
              onRemove={() => onChange({ ...filters, make: filters.make.filter((x) => x !== m), model: "" })}
            />
          ))}
          {filters.model && (
            <ActiveFilterRow label={filters.model} onRemove={() => onChange({ ...filters, model: "" })} />
          )}
          {filters.bodyType && (
            <ActiveFilterRow label={filters.bodyType} onRemove={() => onChange({ ...filters, bodyType: "" })} />
          )}
          {filters.fuelType && (
            <ActiveFilterRow label={filters.fuelType} onRemove={() => onChange({ ...filters, fuelType: "" })} />
          )}
          {filters.gearbox && (
            <ActiveFilterRow label={filters.gearbox} onRemove={() => onChange({ ...filters, gearbox: "" })} />
          )}
          {filters.distance && (
            <ActiveFilterRow
              label={distanceLabels[filters.distance] ?? `Within ${filters.distance} miles`}
              onRemove={() => onChange({ ...filters, distance: "" })}
            />
          )}
          {filters.sort && (
            <ActiveFilterRow
              label={sortLabels[filters.sort] ?? filters.sort}
              onRemove={() => onChange({ ...filters, sort: "" })}
            />
          )}
          {mileageActive && (
            <ActiveFilterRow
              label={`Up to ${filters.mileageMax.toLocaleString()} miles`}
              onRemove={() => onChange({ ...filters, mileageMax: MILEAGE_MAX })}
            />
          )}
        </div>
      )}

      <div className="px-4 divide-y divide-gray-200">
        <FilterSection title="Sort by">
          {sortOptions.map((opt) => (
            <CheckboxOption
              key={opt.value}
              label={opt.label}
              checked={filters.sort === opt.value}
              onChange={() => set("sort", filters.sort === opt.value ? "" : opt.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Make">
          {makes.map((m) => (
            <CheckboxOption
              key={m}
              label={m}
              checked={filters.make.includes(m)}
              onChange={() => toggleMake(m)}
            />
          ))}
        </FilterSection>

        {models.length > 0 && (
          <FilterSection title="Model" defaultOpen={!!filters.model}>
            {models.map((m) => (
              <CheckboxOption
                key={m}
                label={m}
                checked={filters.model === m}
                onChange={() => set("model", filters.model === m ? "" : m)}
              />
            ))}
          </FilterSection>
        )}

        <FilterSection title="Body Type">
          {bodyTypes.map((b) => (
            <CheckboxOption
              key={b}
              label={b}
              checked={filters.bodyType === b}
              onChange={() => set("bodyType", filters.bodyType === b ? "" : b)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Fuel Type">
          {fuelTypes.map((f) => (
            <CheckboxOption
              key={f}
              label={f}
              checked={filters.fuelType === f}
              onChange={() => set("fuelType", filters.fuelType === f ? "" : f)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Gearbox">
          {gearboxes.map((g) => (
            <CheckboxOption
              key={g}
              label={g}
              checked={filters.gearbox === g}
              onChange={() => set("gearbox", filters.gearbox === g ? "" : g)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Max Mileage" defaultOpen={mileageActive} activeCount={undefined}>
          <MileageSlider
            max={filters.mileageMax}
            onChange={(max) => onChange({ ...filters, mileageMax: max })}
          />
        </FilterSection>

        <FilterSection
          title="Distance"
          defaultOpen={!!filters.distance}
        >
          {!userPostcode ? (
            <p className="text-xs text-gray-400 py-1">Set your postcode in Profile to use this filter.</p>
          ) : (
            distanceOptions.map((opt) => (
              <CheckboxOption
                key={opt.value}
                label={opt.label}
                checked={filters.distance === opt.value}
                onChange={() => set("distance", filters.distance === opt.value ? "" : opt.value)}
              />
            ))
          )}
        </FilterSection>
      </div>
    </div>
  );
}
