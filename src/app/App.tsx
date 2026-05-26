import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/app/stores/auth";
import { connectNotificationSSE, disconnectNotificationSSE } from "@/app/lib/sse";
import { Layout } from "@/app/components/Layout";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import HomePage from "@/app/pages/Home";
import LoginPage from "@/app/pages/Login";
import RegisterPage from "@/app/pages/Register";
import StreamPage from "@/app/pages/Stream";
import ProfilePage from "@/app/pages/Profile";
import DashboardPage from "@/app/pages/Dashboard";

export default function App() {
  const { hydrate, isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) connectNotificationSSE();
    else disconnectNotificationSSE();
    return () => disconnectNotificationSSE();
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout withSidebar />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/stream/:streamerId" element={<StreamPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireStreamer>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="p-6 text-muted-foreground">Page not found.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
