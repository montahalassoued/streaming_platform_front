import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { categoriesApi, streamsApi } from "@/app/lib/services";
import { StreamCard } from "@/app/components/StreamCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Music, Palette, MessageSquare, Trophy } from "lucide-react";

const CATEGORIES = [
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "music", name: "Music", icon: Music },
  { id: "art", name: "Art", icon: Palette },
  { id: "just-chatting", name: "Just Chatting", icon: MessageSquare },
  { id: "esports", name: "Esports", icon: Trophy },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCategoryId = searchParams.get("categoryId") ?? undefined;
  const categoryId =
    rawCategoryId && rawCategoryId !== "undefined" && rawCategoryId !== "null"
      ? rawCategoryId
      : undefined;

  const { data: categories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const data = await categoriesApi.list();
      const items = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      const valid = items.filter((item: any) => item && (item.id || item.slug || item.name));
      return valid.length > 0 ? valid : CATEGORIES;
    },
    retry: false,
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["live-streams"],
    queryFn: () => streamsApi.getLive(1, 20),
    retry: false,
  });

  const streams = Array.isArray(data) ? data : (data?.streams ?? data?.data ?? []);
  const activeCategory = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.find(
            (category: any) => `${category.id ?? category.slug ?? category.name}` === categoryId,
          )
        : null,
    [categories, categoryId],
  );
  const filteredStreams = useMemo(() => {
    if (!categoryId) return streams;
    const needle = categoryId.toLowerCase();
    return streams.filter((stream: any) => {
      const streamCategory = stream?.category;
      const streamCategoryName =
        typeof streamCategory === "string"
          ? streamCategory
          : (streamCategory?.name ?? streamCategory?.slug ?? "");
      const streamCategoryId =
        typeof streamCategory === "object" && streamCategory ? `${streamCategory.id ?? ""}` : "";
      return [streamCategoryName, streamCategoryId].some((value) =>
        String(value).toLowerCase().includes(needle),
      );
    });
  }, [streams, categoryId]);

  return (
    <div className="p-6 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Live Channels</h1>
          {activeCategory ? (
            <p className="text-sm text-muted-foreground mt-1">Filtered by {activeCategory.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Browse all categories</p>
          )}
        </div>
      </div>
      {Array.isArray(categories) && categories.length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {categories.slice(0, 5).map((category: any, index: number) => (
            <button
              key={category.id ?? category.slug ?? category.name ?? index}
              type="button"
              className={`rounded-xl overflow-hidden border bg-card transition-colors ${
                `${category.id ?? category.slug ?? category.name}` === categoryId
                  ? "border-primary"
                  : "border-border"
              } text-left cursor-pointer`}
              onClick={() =>
                navigate(
                  `/?categoryId=${encodeURIComponent(category.id ?? category.slug ?? category.name)}`,
                )
              }
            >
              <div className="aspect-video bg-secondary relative overflow-hidden">
                {category.thumbnailUrl ? (
                  <img
                    src={category.thumbnailUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <CategoryIcon name={category.name} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold truncate">{category.name}</p>
                {category.slug && <p className="text-xs text-muted-foreground">{category.slug}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
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
        <p className="text-muted-foreground">
          Could not load streams. Is the backend running on http://localhost:3000?
        </p>
      )}
      {!isLoading && !isError && filteredStreams.length === 0 && (
        <p className="text-muted-foreground">No streams are live right now.</p>
      )}
      {filteredStreams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStreams.map((s: any) => (
            <StreamCard key={s.id} stream={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryIcon({ name }: { name: string }) {
  if (name === "Music") return <Music className="w-8 h-8 text-primary" />;
  if (name === "Art") return <Palette className="w-8 h-8 text-primary" />;
  if (name === "Just Chatting") return <MessageSquare className="w-8 h-8 text-primary" />;
  if (name === "Esports") return <Trophy className="w-8 h-8 text-primary" />;
  return <Gamepad2 className="w-8 h-8 text-primary" />;
}
