import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "@/app/stores/auth";

export function ProtectedRoute({
  children,
  requireStreamer,
}: {
  children: ReactNode;
  requireStreamer?: boolean;
}) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireStreamer && !user?.isStreamer) return <Navigate to="/" replace />;
  return <>{children}</>;
}
