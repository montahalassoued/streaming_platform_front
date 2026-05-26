import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Tv, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/app/stores/auth";
import { useNotificationStore } from "@/app/stores/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { disconnectChatSocket } from "@/app/lib/socket";
import { disconnectNotificationSSE } from "@/app/lib/sse";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/profile/${q.trim()}`);
  };

  const handleLogout = () => {
    disconnectChatSocket();
    disconnectNotificationSSE();
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-card flex items-center px-4 gap-4">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <Tv className="w-6 h-6 text-primary" />
        <span className="text-primary">StreamX</span>
      </Link>
      <form onSubmit={onSearch} className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search streamers..."
            className="pl-9 bg-secondary border-none"
          />
        </div>
      </form>
      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Popover onOpenChange={(o) => o && markAllRead()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b border-border font-semibold">Notifications</div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.streamerId ? `/stream/${n.streamerId}` : "#"}
                        className="flex gap-3 p-3 hover:bg-secondary border-b border-border"
                      >
                        {n.thumbnailUrl && (
                          <img src={n.thumbnailUrl} alt="" className="w-16 h-10 rounded object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                {user?.isStreamer && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </>
        )}
      </div>
    </header>
  );
}
