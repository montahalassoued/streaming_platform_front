import { useEffect } from "react";
import { useAuthStore } from "@/app/stores/auth";
import { notificationsApi } from "@/app/lib/services";
import { toast } from "sonner";

interface StreamerNotificationsProps {
  streamerId: string;
}

export function StreamerNotifications({ streamerId }: StreamerNotificationsProps) {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!streamerId || !token) return;

    const source = new EventSource(notificationsApi.sseUrl(token));

    const handleSubscriptionCreated = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { username?: string };
        const username = payload.username ?? "Someone";
        toast.success(`${username} just subscribed!`, {
          duration: 4000,
          position: "bottom-right",
        });
      } catch {
        toast.success("Someone just subscribed!", {
          duration: 4000,
          position: "bottom-right",
        });
      }
    };

    source.addEventListener("subscription.created", handleSubscriptionCreated);

    source.onerror = () => {
      // EventSource will reconnect automatically.
    };

    return () => {
      source.removeEventListener("subscription.created", handleSubscriptionCreated);
      source.close();
    };
  }, [streamerId, token]);

  return null;
}
