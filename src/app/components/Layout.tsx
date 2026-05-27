import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout({ withSidebar = false }: { withSidebar?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        showSidebarToggle={withSidebar}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 items-stretch">
        {withSidebar && <Sidebar collapsed={!sidebarOpen} />}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
