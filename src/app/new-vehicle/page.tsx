"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { FileText, ShieldPlus, ClipboardList } from "lucide-react";

const bodyTypes = ["Hatchback", "Saloon", "SUV", "Estate", "Coupe"];
const fuelTypes = ["Diesel", "Electric", "Hybrid", "Petrol"];
const gearboxTypes = ["Manual", "Automatic"];

interface ImageSlot {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
}

const emptySlot = (): ImageSlot => ({
  file: null,
  preview: null,
  uploading: false,
  url: null,
  error: null,
});

export default function NewVehiclePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [images, setImages] = useState<
    [ImageSlot, ImageSlot, ImageSlot, ImageSlot]
  >([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);

  const [form, setForm] = useState({
    make: "",
    model: "",
    registration: "",
    bodyType: "",
    fuelType: "",
    engineSize: "",
    yearOfManufacture: "",
    colour: "",
    doors: "",
    gearbox: "",
    price: "",
    mileage: "",
    postcode: "",
    title: "",
    description: "",
    alloyWheels: false,
    airConditioning: false,
    radioCdSpeakers: false,
    leatherSeats: false,
    powerWindows: false,
    navigationSystem: false,
  });

  function setField(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(index: number, file: File | null) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev] as typeof prev;
      next[index] = { file, preview, uploading: true, url: null, error: null };
      return next;
    });

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/vehicles/images", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      const uploadError = !res.ok || !json.url ? (json.error ?? "Upload failed") : null;
      setImages((prev) => {
        const next = [...prev] as typeof prev;
        next[index] = { file, preview, uploading: false, url: json.url ?? null, error: uploadError };
        return next;
      });
    } catch (err) {
      setImages((prev) => {
        const next = [...prev] as typeof prev;
        next[index] = { file, preview, uploading: false, url: null, error: "Upload failed" };
        return next;
      });
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = [...prev] as typeof prev;
      next[index] = emptySlot();
      return next;
    });
  }

  async function handleLookup() {
    if (!form.registration) return;
    setLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch(
        `/api/vehicles/lookup?vrm=${encodeURIComponent(form.registration)}`,
      );
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();

      const str = (v: unknown) => (v != null ? String(v) : null);
      setForm((prev) => ({
        ...prev,
        make: str(data.make) ?? prev.make,
        model: str(data.model) ?? prev.model,
        title:
          data.make && data.model
            ? `${data.make} ${data.model} For Sale`
            : prev.title,
        colour: str(data.colour) ?? prev.colour,
        yearOfManufacture:
          str(data.yearOfManufacture) ?? prev.yearOfManufacture,
        fuelType: str(data.fuelType) ?? prev.fuelType,
        engineSize: str(data.engineCapacity) ?? prev.engineSize,
        doors: str(data.doors) ?? prev.doors,
        bodyType: str(data.bodyType) ?? prev.bodyType,
        gearbox: str(data.gearbox) ?? prev.gearbox,
      }));
    } catch {
      setLookupError(
        "Could not retrieve vehicle details. Check the registration and try again.",
      );
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (images.some((img) => img.uploading)) {
      setError("Please wait for images to finish uploading.");
      return;
    }
    if (images.some((img) => img.error)) {
      setError("One or more photos failed to upload. Please remove them and try again.");
      return;
    }

    const [img1, img2, img3, img4] = images.map((img) => img.url);

    setSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          registration: form.registration,
          bodyType: form.bodyType,
          fuelType: form.fuelType,
          engineSize: parseInt(form.engineSize),
          yearOfManufacture: parseInt(form.yearOfManufacture),
          colour: form.colour,
          doors: parseInt(form.doors),
          gearbox: form.gearbox,
          price: form.price,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          postcode: form.postcode,
          title: form.title,
          description: form.description,
          alloyWheels: form.alloyWheels,
          airConditioning: form.airConditioning,
          radioCdSpeakers: form.radioCdSpeakers,
          leatherSeats: form.leatherSeats,
          powerWindows: form.powerWindows,
          navigationSystem: form.navigationSystem,
          img1: img1 ?? null,
          img2: img2 ?? null,
          img3: img3 ?? null,
          img4: img4 ?? null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save vehicle");
      }

      const vehicle = await res.json();
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const selectClass = inputClass;
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3 pb-6">
        <ShieldPlus className="w-8 h-8" /> Add New Advert
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration */}
        <div className="pt-6">
          <div className="flex items-center gap-3">
            <label className="text-xl font-semibold whitespace-nowrap">Registration Number *</label>
            <input
              required
              className="border-2 border-black rounded-xl px-4 py-2 text-2xl font-bold tracking-widest uppercase bg-yellow-300 text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-48 text-center font-['Charles_Wright','Arial_Narrow',sans-serif]"
              value={form.registration}
              onChange={(e) =>
                setField("registration", e.target.value.toUpperCase())
              }
              placeholder="AB12 CDE"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookingUp || !form.registration}
              className="px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
            >
              {lookingUp ? "Looking up…" : "Look Up"}
            </button>
          </div>
          {lookupError && (
            <p className="text-xs text-red-600 mt-1">{lookupError}</p>
          )}
        </div>

        {/* Images */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Camera className="w-7 h-7" /> Add some photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((slot, i) => (
                <ImageUploadSlot
                  key={i}
                  slot={slot}
                  label={`Photo ${i + 1}`}
                  onChange={(file) => handleImageChange(i, file)}
                  onRemove={() => removeImage(i)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Core details */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-7 h-7" /> Vehicle Details
            </h2>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Ford Focus 1.6 Zetec"
                />
              </div>
              <div>
                <label className={labelClass}>Make *</label>
                <input
                  required
                  className={inputClass}
                  value={form.make}
                  onChange={(e) => setField("make", e.target.value)}
                  placeholder="e.g. Ford"
                />
              </div>
              <div>
                <label className={labelClass}>Model *</label>
                <input
                  required
                  className={inputClass}
                  value={form.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder="e.g. Focus"
                />
              </div>
              <div>
                <label className={labelClass}>Year *</label>
                <input
                  required
                  type="number"
                  className={inputClass}
                  value={form.yearOfManufacture}
                  onChange={(e) =>
                    setField("yearOfManufacture", e.target.value)
                  }
                  placeholder="e.g. 2019"
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className={labelClass}>Colour *</label>
                <input
                  required
                  className={inputClass}
                  value={form.colour}
                  onChange={(e) => setField("colour", e.target.value)}
                  placeholder="e.g. Silver"
                />
              </div>
              <div>
                <label className={labelClass}>Body Type *</label>
                <select
                  required
                  className={selectClass}
                  value={form.bodyType}
                  onChange={(e) => setField("bodyType", e.target.value)}
                >
                  <option value="">Select…</option>
                  {bodyTypes.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fuel Type *</label>
                <select
                  required
                  className={selectClass}
                  value={form.fuelType}
                  onChange={(e) => setField("fuelType", e.target.value)}
                >
                  <option value="">Select…</option>
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Gearbox *</label>
                <select
                  required
                  className={selectClass}
                  value={form.gearbox}
                  onChange={(e) => setField("gearbox", e.target.value)}
                >
                  <option value="">Select…</option>
                  {gearboxTypes.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Doors *</label>
                <input
                  required
                  type="number"
                  className={inputClass}
                  value={form.doors}
                  onChange={(e) => setField("doors", e.target.value)}
                  placeholder="e.g. 5"
                  min={2}
                  max={7}
                />
              </div>
              <div>
                <label className={labelClass}>Engine Size (cc) *</label>
                <input
                  required
                  type="number"
                  className={inputClass}
                  value={form.engineSize}
                  onChange={(e) => setField("engineSize", e.target.value)}
                  placeholder="e.g. 1600"
                  min={0}
                />
              </div>
              <div>
                <label className={labelClass}>Mileage</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.mileage}
                  onChange={(e) => setField("mileage", e.target.value)}
                  placeholder="e.g. 45000"
                  min={0}
                />
              </div>
              <div>
                <label className={labelClass}>Price (£) *</label>
                <input
                  required
                  type="number"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="e.g. 8995"
                  min={0}
                  step="0.01"
                />
              </div>
              <div>
                <label className={labelClass}>Postcode *</label>
                <input
                  required
                  className={inputClass}
                  value={form.postcode}
                  onChange={(e) => setField("postcode", e.target.value)}
                  placeholder="e.g. SW1A 1AA"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                required
                className={`${inputClass} h-24 resize-none`}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the vehicle…"
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="shadow-lg mb-6">
          <CardContent className="pt-3 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 pb-2">
              <ClipboardList className="w-7 h-7" /> Features
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  ["alloyWheels", "Alloy Wheels"],
                  ["airConditioning", "Air Conditioning"],
                  ["radioCdSpeakers", "Radio/CD/Speakers"],
                  ["leatherSeats", "Leather Seats"],
                  ["powerWindows", "Power Windows"],
                  ["navigationSystem", "Navigation System"],
                ] as [keyof typeof form, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={(e) => setField(key, e.target.checked)}
                    className="accent-gray-700 w-4 h-4"
                  />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Vehicle"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

function ImageUploadSlot({
  slot,
  label,
  onChange,
  onRemove,
}: {
  slot: ImageSlot;
  label: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div
        className="relative h-36 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => !slot.preview && inputRef.current?.click()}
      >
        {slot.preview ? (
          <>
            <Image
              src={slot.preview}
              alt={label}
              fill
              unoptimized
              sizes="25vw"
              className="object-cover"
            />
            {slot.uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs">Uploading…</span>
              </div>
            )}
            {!slot.uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm leading-none"
                aria-label="Remove image"
              >
                ×
              </button>
            )}
          </>
        ) : slot.error ? (
          <span className="text-red-500 text-xs text-center px-2">{slot.error}</span>
        ) : (
          <span className="text-gray-400 text-sm">Click to upload</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
    </div>
  );
}
