import { Card, CardContent } from "@/components/ui/card";

export default function VehicleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-6 py-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <Card key={i}>
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
    </div>
  );
}
