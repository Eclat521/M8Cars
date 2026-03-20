import { Suspense } from "react";
import { getVehiclesPaged, SortOption } from "@/db/vehicles";
import VehicleList from "@/components/VehicleList";
import VehicleListSkeleton from "@/components/VehicleListSkeleton";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function VehicleListLoader({ searchParams }: Props) {
  const sp = await searchParams;
  const makes = typeof sp.makes === "string" && sp.makes ? sp.makes.split(",") : undefined;
  const initialData = await getVehiclesPaged({
    page: 1,
    makes,
    model: typeof sp.model === "string" ? sp.model : undefined,
    bodyType: typeof sp.bodyType === "string" ? sp.bodyType : undefined,
    fuelType: typeof sp.fuelType === "string" ? sp.fuelType : undefined,
    gearbox: typeof sp.gearbox === "string" ? sp.gearbox : undefined,
    sort: typeof sp.sort === "string" ? (sp.sort as SortOption) : undefined,
  });
  return <VehicleList initialData={initialData} />;
}

export default function DataListPage({ searchParams }: Props) {
  return (
    <main className="w-full">

      <Suspense fallback={<VehicleListSkeleton />}>
        <VehicleListLoader searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
