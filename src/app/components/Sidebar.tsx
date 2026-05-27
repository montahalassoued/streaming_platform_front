import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, followsApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { Gamepad2, Music, Palette, MessageSquare, Trophy } from "lucide-react";

const CATEGORIES = [
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "music", name: "Music", icon: Music },
  { id: "art", name: "Art", icon: Palette },
  { id: "just-chatting", name: "Just Chatting", icon: MessageSquare },
  { id: "esports", name: "Esports", icon: Trophy },
];

export function Sidebar() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await categoriesApi.list();
      const items = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      const valid = items.filter((item: any) => item && (item.id || item.slug || item.name));
      return valid.length > 0 ? valid : CATEGORIES;
    },
    retry: false,
  });
  const { data: followed } = useQuery({
    queryKey: ["followed"],
    queryFn: () => followsApi.myFollowed(),
    enabled: isAuthenticated,
    retry: false,
  });

  const categoryItems =
    Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES;

  return (
    <aside className="hidden lg:block w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Categories</h3>
        <ul className="space-y-1">
          {categoryItems.map((c: any, index: number) => (
            <li key={c.id ?? c.slug ?? c.name ?? index}>
              <button
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent text-sm"
                onClick={() =>
                  navigate(`/?categoryId=${encodeURIComponent(c.id ?? c.slug ?? c.name)}`)
                }
                type="button"
              >
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt="" className="w-4 h-4 rounded object-cover" />
                ) : (
                  <CategoryIcon name={c.name} />
                )}
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {isAuthenticated && Array.isArray(followed) && followed.length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Following</h3>
          <ul className="space-y-1">
            {followed.map((s: any) => (
              <li key={s.id}>
                <Link
                  to={`/stream/${s.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent text-sm"
                >
                  <div className="relative">
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary" />
                    )}
                    {s.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent border border-sidebar" />
                    )}
                  </div>
                  <span className="truncate flex-1">{s.username}</span>
                  {s.viewerCount != null && s.isLive && (
                    <span className="text-xs text-muted-foreground">{s.viewerCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function CategoryIcon({ name }: { name: string }) {
  if (name === "Music") return <Music className="w-4 h-4" />;
  if (name === "Art") return <Palette className="w-4 h-4" />;
  if (name === "Just Chatting") return <MessageSquare className="w-4 h-4" />;
  if (name === "Esports") return <Trophy className="w-4 h-4" />;
  return <Gamepad2 className="w-4 h-4" />;
}
