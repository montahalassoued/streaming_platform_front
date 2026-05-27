import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";
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

export function Navbar({
  onToggleSidebar,
  showSidebarToggle = false,
}: {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}) {
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
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background flex items-center px-4 gap-4">
      {showSidebarToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-gray-800"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
      <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tighter uppercase italic">
        <span className="bg-primary text-black px-2 py-0.5 rounded-sm">StreamX</span>
        <span className="text-[10px] align-top ml-0.5 font-bold">BETA</span>
      </Link>
      <form onSubmit={onSearch} className="flex-1 max-w-2xl mx-auto hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="pl-9 h-10 bg-[#1a1c1e] border-none focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>
      </form>
      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Popover onOpenChange={(o) => o && markAllRead()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-800">
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
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800">
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
            <Button
              variant="ghost"
              className="h-9 text-sm font-semibold hover:text-primary"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
            <Button
              className="h-9 bg-primary text-black text-sm font-bold hover:opacity-90"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
