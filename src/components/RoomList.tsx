"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Room {
  id: string;
  name: string;
  description: string;
}

interface PagedResponse {
  data: Room[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface RoomListProps {
  initialData: PagedResponse;
}

const LIMIT = 20;

export default function RoomList({ initialData }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(initialData.data);
  const [page, setPage] = useState(initialData.page);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading]);

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await fetch(
        `http://localhost:3001/data?page=${nextPage}&limit=${LIMIT}`
      );
      const json: PagedResponse = await res.json();
      setRooms((prev) => [...prev, ...json.data]);
      setPage(json.page);
      setHasMore(json.hasMore);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <Card key={room.id}>
          <CardHeader>
            <CardTitle className="text-base">{room.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </CardContent>
        </Card>
      ))}

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Loading…
        </p>
      )}

      {!hasMore && rooms.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          All {rooms.length} rooms loaded.
        </p>
      )}
    </div>
  );
}
