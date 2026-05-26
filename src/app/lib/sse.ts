import { API_BASE } from "./api";
import { useNotificationStore } from "@/app/stores/notifications";
import { toast } from "sonner";

let es: EventSource | null = null;

export function connectNotificationSSE() {
  if (typeof window === "undefined") return;
  if (es) return;
  const token = localStorage.getItem("access_token");
  if (!token) return;
  // EventSource doesn't support custom headers in browsers; pass token via query
  const url = `${API_BASE}/notifications/sse?token=${encodeURIComponent(token)}`;
  try {
    es = new EventSource(url);
    es.addEventListener("stream_went_live", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        useNotificationStore.getState().addNotification({
          type: "stream_went_live",
          title: `${data.username ?? "Someone"} is now live!`,
          body: data.title,
          streamerId: data.streamerId,
          thumbnailUrl: data.thumbnailUrl,
        });
        toast(`${data.username ?? "Someone"} is live!`, { description: data.title });
      } catch {}
    });
    es.onerror = () => {
      // silent; will retry automatically
    };
  } catch {
    // ignore
  }
}

export function disconnectNotificationSSE() {
  if (es) {
    es.close();
    es = null;
  }
}
