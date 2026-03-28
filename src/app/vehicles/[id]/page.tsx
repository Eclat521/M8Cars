import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getVehicleById, getDistanceMiles } from "@/db/vehicles";
import VehicleImageGallery from "@/components/VehicleImageGallery";
import BackButton from "@/components/BackButton";
import DetailFavouriteButton from "@/components/DetailFavouriteButton";
import {
  Gauge,
  Droplets,
  Settings2,
  CircleDot,
  Wind,
  Radio,
  Armchair,
  AppWindow,
  Navigation,
  MapPin,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const featureDefs = [
  { key: "mileage", label: "Mileage", Icon: Gauge, valueKey: "mileage" as const, format: (v: unknown) => v != null ? `${Number(v).toLocaleString()} mi` : null },
  { key: "colour", label: "Exterior colour", Icon: Droplets, valueKey: "colour" as const, format: (v: unknown) => v as string | null },
  { key: "gearbox", label: "Gearbox", Icon: Settings2, valueKey: "gearbox" as const, format: (v: unknown) => v as string | null },
  { key: "alloyWheels", label: "Alloy wheels", Icon: CircleDot, valueKey: "alloyWheels" as const, format: (v: unknown) => v ? "Yes" : null },
  { key: "airConditioning", label: "Air conditioning", Icon: Wind, valueKey: "airConditioning" as const, format: (v: unknown) => v ? "Yes" : null },
  { key: "radioCdSpeakers", label: "Radio / Speakers", Icon: Radio, valueKey: "radioCdSpeakers" as const, format: (v: unknown) => v ? "Yes" : null },
  { key: "leatherSeats", label: "Leather seats", Icon: Armchair, valueKey: "leatherSeats" as const, format: (v: unknown) => v ? "Yes" : null },
  { key: "powerWindows", label: "Power windows", Icon: AppWindow, valueKey: "powerWindows" as const, format: (v: unknown) => v ? "Yes" : null },
  { key: "navigationSystem", label: "Navigation", Icon: Navigation, valueKey: "navigationSystem" as const, format: (v: unknown) => v ? "Yes" : null },
];

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (isNaN(vehicleId)) notFound();

  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) notFound();

  const user = await getSessionUser();
  const userPostcode = user?.postcode;
  const distanceMiles =
    userPostcode && vehicle.postcode
      ? await getDistanceMiles(userPostcode, vehicle.postcode)
      : null;

  const images = [
    vehicle.img1, vehicle.img2, vehicle.img3, vehicle.img4, vehicle.img5,
    vehicle.img6, vehicle.img7, vehicle.img8, vehicle.img9, vehicle.img10,
    vehicle.img11, vehicle.img12, vehicle.img13, vehicle.img14, vehicle.img15,
    vehicle.img16, vehicle.img17, vehicle.img18, vehicle.img19, vehicle.img20,
  ].filter(Boolean) as string[];

  const activeFeatures = featureDefs
    .map((f) => ({ ...f, displayValue: f.format(vehicle[f.valueKey]) }))
    .filter((f) => f.displayValue !== null);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <BackButton fallbackHref="/data-list" label="← All results" />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">

        {/* Left — gallery */}
        <div>
          {images.length > 0 ? (
            <VehicleImageGallery
              images={images}
              alt={`${vehicle.make} ${vehicle.model}`}
            />
          ) : (
            <div className="rounded-lg bg-gray-100 flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "4/3" }}>
              No images
            </div>
          )}
        </div>

        {/* Right — info + contact */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold leading-tight">
                {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
              </h1>
              <DetailFavouriteButton vehicleId={vehicle.id} isLoggedIn={!!user} />
            </div>


            {(vehicle.postcode || distanceMiles !== null) && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {vehicle.postcode}
                {distanceMiles !== null && (
                  <span>({Math.round(distanceMiles)} mi away)</span>
                )}
              </p>
            )}
          </div>

          <p className="text-3xl font-bold">
            £{Number(vehicle.price).toLocaleString()}
          </p>

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base border rounded-lg p-3 bg-gray-50">
            {vehicle.bodyType && (
              <>
                <span className="font-medium text-muted-foreground">Body</span>
                <span>{vehicle.bodyType}</span>
              </>
            )}
            {vehicle.fuelType && (
              <>
                <span className="font-medium text-muted-foreground">Fuel</span>
                <span>{vehicle.fuelType}</span>
              </>
            )}
            {vehicle.engineSize && (
              <>
                <span className="font-medium text-muted-foreground">Engine</span>
                <span>{vehicle.engineSize}cc</span>
              </>
            )}
            {vehicle.doors && (
              <>
                <span className="font-medium text-muted-foreground">Doors</span>
                <span>{vehicle.doors}</span>
              </>
            )}
            {vehicle.registration && (
              <>
                <span className="font-medium text-muted-foreground">Reg</span>
                <span>{vehicle.registration}</span>
              </>
            )}
          </div>

          {/* Request information form */}
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold text-lg">Request information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">First name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Last name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Email address</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Postcode</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-base">
              <span className="text-muted-foreground">I prefer:</span>
              {["Call", "Text", "Email"].map((opt) => (
                <label key={opt} className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  {opt}
                </label>
              ))}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-base font-medium transition-colors">
              Send Enquiry
            </button>
          </div>
        </div>
      </div>

      {(vehicle.description || activeFeatures.length > 0) && (
        <div className="border rounded-lg p-6 space-y-6">
          {/* Description */}
          {vehicle.description && (
            <div>
              <h2 className="text-lg font-bold mb-2">Description</h2>
              <p className="text-base text-muted-foreground">{vehicle.description}</p>
            </div>
          )}

          {/* Features */}
          {activeFeatures.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activeFeatures.map(({ key, label, Icon, displayValue }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                      <p className="text-sm font-semibold leading-tight">{displayValue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
