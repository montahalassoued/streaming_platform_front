import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import SpaApp from "@/app/App";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <SpaApp />
    </ClientOnly>
  );
}
