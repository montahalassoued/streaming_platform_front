import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { followsApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { Gamepad2, Music, Palette, MessageSquare, Trophy } from "lucide-react";

const CATEGORIES = [
  { name: "Gaming", icon: Gamepad2 },
  { name: "Music", icon: Music },
  { name: "Art", icon: Palette },
  { name: "Just Chatting", icon: MessageSquare },
  { name: "Esports", icon: Trophy },
];

export function Sidebar() {
  const { isAuthenticated } = useAuthStore();
  const { data: followed } = useQuery({
    queryKey: ["followed"],
    queryFn: () => followsApi.myFollowed(),
    enabled: isAuthenticated,
    retry: false,
  });

  return (
    <aside className="hidden lg:block w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Categories</h3>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.name}>
              <button className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent text-sm">
                <c.icon className="w-4 h-4" /> {c.name}
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
