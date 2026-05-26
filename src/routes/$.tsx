import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SpaApp = lazy(() => import("@/app/App"));

export const Route = createFileRoute("/$")({
  component: () => (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <SpaApp />
      </Suspense>
    </ClientOnly>
  ),
});