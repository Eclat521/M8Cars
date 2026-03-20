import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getVehicleById, getDistanceMiles } from "@/db/vehicles";
import VehicleImageGallery from "@/components/VehicleImageGallery";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

interface Props {
  params: Promise<{ id: string }>;
}

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

  const images = [vehicle.img1, vehicle.img2, vehicle.img3].filter(Boolean) as string[];

  const features = [
    { label: "Alloy Wheels", value: vehicle.alloyWheels },
    { label: "Air Conditioning", value: vehicle.airConditioning },
    { label: "Radio/CD/Speakers", value: vehicle.radioCdSpeakers },
    { label: "Leather Seats", value: vehicle.leatherSeats },
    { label: "Power Windows", value: vehicle.powerWindows },
    { label: "Navigation System", value: vehicle.navigationSystem },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <BackButton fallbackHref="/data-list" label="← Back to listings" />

      <Card className="shadow-lg mt-4">
        <CardContent className="pt-3 space-y-6">
          <h1 className="text-2xl font-bold pb-2">
            {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
          </h1>

          {images.length > 0 && (
            <VehicleImageGallery
              images={images}
              alt={`${vehicle.make} ${vehicle.model}`}
            />
          )}

          <p className="text-3xl font-bold"><span className="bg-gray-600 text-white rounded-md px-2 py-0.5">£{Number(vehicle.price).toLocaleString()}</span></p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <div><span className="font-semibold">Body Type:</span> {vehicle.bodyType}</div>
            <div><span className="font-semibold">Fuel:</span> {vehicle.fuelType}</div>
            <div><span className="font-semibold">Gearbox:</span> {vehicle.gearbox}</div>
            <div><span className="font-semibold">Colour:</span> {vehicle.colour}</div>
            <div><span className="font-semibold">Doors:</span> {vehicle.doors}</div>
            <div><span className="font-semibold">Engine Size:</span> {vehicle.engineSize}cc</div>
            <div><span className="font-semibold">Mileage:</span> {vehicle.mileage?.toLocaleString()} miles</div>
            <div>
              <span className="font-semibold">Postcode:</span> {vehicle.postcode}
              {distanceMiles !== null && (
                <span className="ml-2 sm:inline block text-muted-foreground">({Math.round(distanceMiles)} miles away)</span>
              )}
            </div>
            <div><span className="font-semibold">Registration:</span> {vehicle.registration}</div>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-2">Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {features.map(({ label, value }) => (
                <div key={label} className={value ? "" : "text-muted-foreground"}>
                  {value ? <span className="text-green-600">✔</span> : "❌"} {label}
                </div>
              ))}
            </div>
          </div>

          {vehicle.description && (
            <div>
              <h2 className="text-base font-semibold mb-1">Description</h2>
              <p className="text-sm text-muted-foreground">{vehicle.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
