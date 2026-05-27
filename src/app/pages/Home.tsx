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

  const featuredStream = filteredStreams[0];
  const featuredTitle = featuredStream?.title ?? "ARC Raiders Trolling";
  const featuredCategory =
    featuredStream?.category?.name ??
    featuredStream?.category?.slug ??
    featuredStream?.category ??
    "ARC Raiders";
  const featuredLanguage = featuredStream?.language ?? "English";
  const featuredViewerCount = featuredStream?.viewerCount ?? featuredStream?.views ?? 1100;
  const featuredStreamer =
    featuredStream?.user?.username ??
    featuredStream?.streamer?.username ??
    featuredStream?.username ??
    "DrChubzDPT";
  const featuredAvatar =
    featuredStream?.user?.avatarUrl ??
    featuredStream?.streamer?.avatarUrl ??
    featuredStream?.avatarUrl ??
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAH3oirzlrfFdj3pcbdqBZ5iLT1vjfv6r1ZAqRKfgKKB4K9BOgP0Nudi6yvIIZ8TY9HXqXTAr_JrxQzr7FVDAv7UynArVkZq_hKKjDG7H_qyP1OGEHk1qDkOm9jhr0kmzen-M9M2tHcLMX-xHrMFmuppRmhavl0F3CnVZ7uygkmYLZs736lsd97n2KvocknMb525m1t8ANzpuQeQoqhdw2X-iIQKvNuu6gHQWA42I9rzTQNX2yCv4fRrxcyoetxCNG07lEIn-1WqsD6";
  const featuredThumbnail =
    featuredStream?.thumbnailUrl ??
    "https://placehold.co/1200x675/12151b/5a5f6b?text=Stream+Preview";

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] space-y-10">
      <section className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow bg-black rounded-xl overflow-hidden shadow-2xl min-h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${featuredThumbnail})` }}
          />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-white uppercase">
              {typeof featuredViewerCount === "number"
                ? `${featuredViewerCount.toLocaleString()}`
                : "Live"}
            </span>
          </div>
          <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  alt={featuredStreamer}
                  className="w-16 h-16 rounded-lg border-2 border-primary shadow-lg"
                  src={featuredAvatar}
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{featuredStreamer}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium text-gray-200 uppercase tracking-wide">
                      {featuredTitle}
                    </span>
                    <span className="bg-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {featuredCategory}
                    </span>
                    <span className="bg-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {featuredLanguage}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button className="bg-primary text-black font-bold px-6 py-2.5 rounded hover:scale-105 transition-transform">
                  Watch now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-80 bg-[#1a1c1e] rounded-xl flex flex-col border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-sm tracking-wide">Chat</span>
          </div>
          <div className="flex-1 p-4 space-y-4 text-xs">
            <div className="flex flex-col space-y-1">
              <span className="text-orange-400 font-bold">MajorHomer</span>
              <p className="text-gray-300">
                has redeemed <span className="font-bold">2X 500$ giveaway!</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-blue-400 font-bold">ThePatriot789:</span>
              <span className="text-gray-300">im watching from the toilet</span>
            </div>
            <div className="flex flex-col space-y-1 border-l-2 border-primary pl-2 bg-black/20 py-1">
              <span className="text-orange-400 font-bold">Richter22</span>
              <p className="text-gray-300">
                has redeemed <span className="font-bold text-white">2X 500$ giveaway!</span>
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-pink-500 font-bold">Dandy_Randy84:</span>
              <p className="text-gray-300">
                went all in on the other!!!! Hope I do not lose all 10 points lol!!!!!
              </p>
            </div>
          </div>
          <div className="p-3 bg-[#080808]">
            <div className="w-full bg-[#1a1c1e] rounded p-2 text-gray-500 text-xs">
              Send a message
            </div>
          </div>
        </div>
      </section>
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
              className={`rounded-lg overflow-hidden border bg-card transition-colors ${
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
