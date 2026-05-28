import { useEffect, useRef, useState } from "react";
import { api } from "@/app/lib/api";
import { useChatSocket, type ChatMessage } from "@/app/hooks/useChatSocket";
import { useLocation } from "react-router-dom";

type StreamItem = {
  id: string;
  streamer?: { userId?: string | null } | null;
};

function getChatDisplayName(message: ChatMessage) {
  const username = message.user?.username?.trim();
  if (username) return username;
  return "Anonymous";
}

export default function GoLivePage() {
  const location = useLocation() as { state?: { autoStart?: boolean } };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const msgRef = useRef<HTMLTextAreaElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [autoStarted, setAutoStarted] = useState(false);

  const { messages, sendMessage } = useChatSocket(streamId);

  useEffect(() => {
    setMsgs(messages);
  }, [messages]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (location.state?.autoStart && !autoStarted) {
      setAutoStarted(true);
      void startCamera();
    }
  }, [autoStarted, location.state]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert("Camera error: " + message);
    }
  }

  async function ensureStreamKey(): Promise<string> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Not authenticated");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await api.get("/streams/my/key", { headers });
      return response.data.streamKey;
    } catch (error: unknown) {
      if (typeof error === "object" && error && "response" in error) {
        const response = error as { response?: { status?: number } };
        if (response.response?.status === 404) {
          await api.post("/users/me/become-streamer", {}, { headers });
          const nextResponse = await api.get("/streams/my/key", { headers });
          return nextResponse.data.streamKey;
        }
      }
      throw error;
    }
  }

  async function goLive() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Login first");

      const key = await ensureStreamKey();
      await api.post(`/streams/verify-key/${encodeURIComponent(key)}`);

      const me = (await api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }))
        .data as { id: string };
      const list = (await api.get("/streams")).data;
      const streams = Array.isArray(list) ? list : (list?.items ?? list?.data ?? []);
      const mine = (streams as StreamItem[]).find((stream) => stream.streamer?.userId === me.id);

      if (!mine) {
        alert("Stream created but not found yet; refresh in a moment");
        return;
      }

      setStreamId(mine.id);
      setStreaming(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      alert("Go live failed: " + message);
    }
  }

  async function endLive() {
    try {
      if (!streamId) return;
      const token = localStorage.getItem("access_token");
      await api.patch(
        `/streams/${streamId}`,
        { isLive: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStreamId(null);
      setStreaming(false);
    } catch (error) {
      console.error(error);
    }
  }

  function handleSend() {
    const text = msgRef.current?.value?.trim();
    if (!text || !streamId) return;
    sendMessage(text);
    if (msgRef.current) msgRef.current.value = "";
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
        <section className="rounded-2xl border border-border bg-card/70 p-4 shadow-lg shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Go Live</h1>
              <p className="text-sm text-muted-foreground">
                Start your camera preview, activate your stream, and open the live chat.
              </p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {streaming ? "Live" : "Offline"}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={startCamera}
            >
              Start Camera
            </button>
            <button
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              onClick={goLive}
              disabled={streaming}
            >
              Go Live
            </button>
            <button
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              onClick={endLive}
              disabled={!streaming}
            >
              End Live
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p>
              Browser camera is for preview/control only. The actual stream should be published with OBS to your RTMP server.
            </p>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card/70 p-4 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat</h2>
            <span className="text-xs text-muted-foreground">{msgs.length} messages</span>
          </div>

          <div className="flex h-[60vh] flex-col rounded-xl border border-border bg-background">
            <div className="flex-1 space-y-2 overflow-auto p-3">
              {msgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                msgs.map((message, index) => (
                  <div
                    key={message.id ?? index}
                    className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span className="mr-2 font-semibold text-foreground">
                      {getChatDisplayName(message)}
                    </span>
                    <span className="text-foreground/90">{message.content}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-3">
              <textarea
                ref={msgRef}
                className="min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none"
                rows={3}
                placeholder="Write a message..."
                aria-label="Chat message"
              />
              <div className="mt-3 flex justify-end">
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
