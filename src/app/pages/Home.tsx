import { useQuery } from "@tanstack/react-query";
import { streamsApi } from "@/app/lib/services";
import { StreamCard } from "@/app/components/StreamCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["live-streams"],
    queryFn: () => streamsApi.getLive(1, 20),
    retry: false,
  });

  const streams = Array.isArray(data) ? data : data?.streams ?? data?.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Live Channels</h1>
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <Skeleton className="h-3 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      )}
      {isError && (
        <p className="text-muted-foreground">Could not load streams. Is the backend running on http://localhost:3000?</p>
      )}
      {!isLoading && !isError && streams.length === 0 && (
        <p className="text-muted-foreground">No streams are live right now.</p>
      )}
      {streams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.map((s: any) => (
            <StreamCard key={s.id} stream={s} />
          ))}
        </div>
      )}
    </div>
  );
}
