import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth";
import { useChatSocket } from "@/app/hooks/useChatSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ChatOverlayProps {
  streamId: string;
  className?: string;
}

export function ChatOverlay({ streamId, className = "" }: ChatOverlayProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const { messages, sendMessage } = useChatSocket(streamId);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur ${className}`}
    >
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-tight">Live Chat</p>
            <p className="text-xs text-muted-foreground">Messages from viewers and the streamer</p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Live
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-4 text-center text-sm text-muted-foreground">
              No messages yet. Be the first to say hello.
            </div>
          ) : (
            messages.map((message, index) => {
              const displayName = message.username?.trim() || message.user?.username?.trim() || "Anonymous";

              if (message.type === "system") {
                return (
                  <div
                    key={`${message.username}-${message.content}-${index}`}
                    className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm italic text-muted-foreground"
                  >
                    {message.content}
                  </div>
                );
              }

              return (
                <div
                  key={`${message.username}-${message.content}-${index}`}
                  className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm shadow-sm"
                >
                  <span className="mr-2 font-semibold text-primary">{displayName}:</span>
                  <span className="break-words text-foreground">{message.content}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-border bg-background/70 p-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Send a message"
              className="h-11 flex-1 border-border bg-card"
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm text-muted-foreground">
            Log in to chat with the stream.
          </div>
        )}
      </form>
    </aside>
  );
}
