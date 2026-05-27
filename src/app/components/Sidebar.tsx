import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { followsApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { Compass, Heart, Home } from "lucide-react";

const RECOMMENDED = [
  {
    id: "drchubzdpt",
    name: "DrChubzDPT",
    category: "ARC Raiders",
    viewerCount: 1200,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaWDtgmRzju7ciC6SejqffGe9G7-mLoW5Bc6ohTaRuq07YVS7g07_of7fx0E1lw0Cwyk8WcVK6Ff4zad2R7Hl23EpMY2Oiu0vQeomsfg8UeRRLa25P5xZIHsU5gtfurjTLCjVsyE8-t-2NAcvoaY3uQk7-uMTdt6mv97q1B4mRyB8psxlePrLIhFvthDqkX5-upiogBP0wurfeoBtDHlDs5QyppIM1g0NrjaFklv7MM6i8qWrjlNS8Ke_Bk0FW39uffR4KlDJjfXtz",
  },
  {
    id: "abz",
    name: "ABZ",
    category: "IRL",
    viewerCount: 2500,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCczD8IBrVhKSMy03vnGQGZxtb0H1MnU6AR2tr96Z3mCeYxtnyEqotJe-YRDbV1XVedjO9XIWPtyxTul9QOGc2k2JeHT8Am7wGKPtvUvtnDzCjwzRNjbAvm4BVw6VZUqD5nlaGPQxSw2qoepJHaaCaFGRMFM7qBru7RDF5T0bRm-s9lYbDUFu-liJ6U1KjRTmUcMZ0isDEYeRp9CqIqilaU39X4MedK1-poSz0IUqmL8An_xPZ8JdIcMUaOyLRKIwtrm9PndL3j66Hq",
  },
  {
    id: "starladder",
    name: "starladder",
    category: "Counter-Strike 2",
    viewerCount: 6600,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpCYrOXZbGSVwdQoGiyXwFrjkVr2_gKJg2-BInpyBAeF1iEF6crT8GLFkj9U8QRLl6BQstjJWyKrMeijVhWzVrja92u8_i2Wg5nD-2MyFnKy6FxECujHxCUWbomVeQYXwogEXabkwwalIgAy_FtSRCkiENik8X_-UN8-WtwyibEDCGJGFELwot1E4JQfmuaUwwSdndM_sMG1F_yUOKsdlzYva1oVwlULUu1heWjby9SSXCMYkaOKX3fq2BPXlK9N3RoS3B-QhBIlSX",
  },
  {
    id: "motivation",
    name: "Motivation",
    category: "Slots & Casino",
    viewerCount: 356,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAh3vwi3jWLeDWcFfHEp-g9f2h9Zf0JF2rv380HJFmdpb5pRg-ZT-zf-rzeXDhC24ftO15r4DisKWX_jCFhV42yszUxK-ErwoEv4r09bJ_ucahYjHBJ02oCkX8syqLq_FfISUDLQeS8DSEXNM3XQ0o9pcmK9SLmoLh2yjONKQoRFId9qdfgcdR7KTvY1eKGSyhDafZeZBLF2cQMVi5lGYh9ILfrHCs32jrMGTtL6u7rpHtfwTVuDu-Pd3-wUEjRGN1GLeykwFOAN13Z",
  },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: followed } = useQuery({
    queryKey: ["followed"],
    queryFn: () => followsApi.myFollowed(),
    enabled: isAuthenticated,
    retry: false,
  });
  const recommended =
    isAuthenticated && Array.isArray(followed) && followed.length > 0
      ? followed.map((s: any) => ({
          id: s.id,
          name: s.username,
          category:
            typeof s.category === "string"
              ? s.category
              : (s.category?.name ?? s.category?.slug ?? "Live"),
          viewerCount: s.viewerCount ?? 0,
          avatarUrl: s.avatarUrl,
          isLive: s.isLive,
        }))
      : RECOMMENDED;
  const isHome = location.pathname === "/";
  const isBrowse = location.pathname.startsWith("/browse");
  const isFollowing = location.pathname.startsWith("/following");

  return (
    <aside
      className={`hidden lg:flex shrink-0 bg-sidebar border-r border-sidebar-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto flex-col transition-all duration-200 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <nav className={collapsed ? "px-2 pt-5 pb-4" : "px-4 pt-5 pb-4"}>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              className={`w-full flex items-center rounded-md text-white ${
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
              } ${isHome ? "bg-gray-700" : "hover:bg-gray-800"}`}
              onClick={() => navigate("/")}
            >
              <Home className="w-5 h-5" />
              {!collapsed && <span className="text-base font-semibold">Home</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`w-full flex items-center rounded-md text-white ${
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
              } ${isBrowse ? "bg-gray-700" : "hover:bg-gray-800"}`}
              onClick={() => navigate("/browse")}
            >
              <Compass className="w-5 h-5" />
              {!collapsed && <span className="text-base font-semibold">Browse</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`w-full flex items-center rounded-md text-white ${
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
              } ${isFollowing ? "bg-gray-700" : "hover:bg-gray-800"}`}
              onClick={() => navigate("/following")}
            >
              <Heart className="w-5 h-5" />
              {!collapsed && <span className="text-base font-semibold">Following</span>}
            </button>
          </li>
        </ul>
      </nav>
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <h3 className="text-sm font-semibold text-white mb-3">Recommended</h3>
          <ul className="space-y-4">
            {recommended.map((s: any) => (
              <li key={s.id}>
                <Link
                  to={s.id ? `/stream/${s.id}` : "#"}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {s.avatarUrl ? (
                      <img
                        src={s.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-800" />
                    )}
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{s.name}</div>
                      <div className="text-xs text-gray-400 truncate">{s.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-semibold">
                      {Number.isFinite(s.viewerCount)
                        ? `${Math.round(s.viewerCount / 100) / 10}K`.replace(".0K", "K")
                        : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-5 text-xs font-bold text-gray-500 uppercase">
            <button className="hover:text-white">Show More</button>
            <button className="hover:text-white">Show Less</button>
          </div>
        </div>
      )}
    </aside>
  );
}
