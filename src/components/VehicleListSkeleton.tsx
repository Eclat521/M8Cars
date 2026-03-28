import { Card, CardContent } from "@/components/ui/card";

export default function VehicleListSkeleton() {
  return (
    <div className="flex gap-6 px-6 py-6 items-start">
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="px-4 py-4 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-100 rounded w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-xl border border-gray-200 animate-pulse">
              <div className="w-full h-52 bg-gray-200" />
              <CardContent className="px-4 pt-3 pb-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
