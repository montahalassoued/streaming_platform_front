import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/app/stores/auth";
import { connectNotificationSSE, disconnectNotificationSSE } from "@/app/lib/sse";
import { Layout } from "@/app/components/Layout";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import HomePage from "@/app/pages/Home";
import BrowsePage from "@/app/pages/Browse";
import FollowingPage from "@/app/pages/Following";
import LoginPage from "@/app/pages/Login";
import RegisterPage from "@/app/pages/Register";
import StreamPage from "@/app/pages/Stream";
import LiveStreamPage from "@/app/pages/LiveStreamPage";
import VodPage from "@/app/pages/VodPage";
import ProfilePage from "@/app/pages/Profile";
import DashboardPage from "@/app/pages/Dashboard";
import StreamerDashboard from "@/app/pages/StreamerDashboard";
import GoLivePage from "@/app/pages/GoLivePage";

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
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/following" element={<FollowingPage />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/stream/:streamerId" element={<StreamPage />} />
          <Route path="/live/:id" element={<LiveStreamPage />} />
          <Route path="/vod/:id" element={<VodPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireStreamer>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/streamer"
            element={
              <ProtectedRoute requireStreamer>
                <StreamerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/streamer/live"
            element={
              <ProtectedRoute requireStreamer>
                <GoLivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stream/live"
            element={
              <ProtectedRoute requireStreamer>
                <GoLivePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="p-6 text-muted-foreground">Page not found.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
