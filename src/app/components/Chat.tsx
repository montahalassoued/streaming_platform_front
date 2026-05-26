import { useEffect, useRef, useState } from "react";
import { getChatSocket } from "@/app/lib/socket";
import { useAuthStore } from "@/app/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  type?: "message" | "system" | "donation" | "subscription";
  username?: string;
  avatarUrl?: string;
  content?: string;
  amount?: number;
  tier?: number;
}

export function Chat({ streamId, onViewerCount }: { streamId: string; onViewerCount?: (n: number) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const socket = getChatSocket();
    socket.emit("joinStream", { streamId });

    const onMessage = (m: ChatMessage) =>
      setMessages((prev) => [...prev, { ...m, id: m.id ?? crypto.randomUUID(), type: m.type ?? "message" }]);
    const onDonation = (d: any) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "donation", username: d.username, content: d.message, amount: d.amount },
      ]);
      toast.success(`${d.username} donated ${d.amount} bits!`, { description: d.message });
    };
    const onSub = (s: any) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "subscription", username: s.username, tier: s.tier },
      ]);
      toast.success(`${s.username} subscribed (Tier ${s.tier})!`);
    };
    const onViewer = ({ count }: { count: number }) => onViewerCount?.(count);

    socket.on("newMessage", onMessage);
    socket.on("donationAlert", onDonation);
    socket.on("subscriptionAlert", onSub);
    socket.on("viewerCount", onViewer);

    return () => {
      socket.emit("leaveStream", { streamId });
      socket.off("newMessage", onMessage);
      socket.off("donationAlert", onDonation);
      socket.off("subscriptionAlert", onSub);
      socket.off("viewerCount", onViewer);
    };
  }, [streamId, onViewerCount]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isAuthenticated) return;
    getChatSocket().emit("sendMessage", { streamId, content: input.trim() });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border font-semibold text-sm">Stream Chat</div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No messages yet</p>
        )}
        {messages.map((m) => {
          if (m.type === "system")
            return <p key={m.id} className="text-xs text-muted-foreground italic">{m.content}</p>;
          if (m.type === "donation")
            return (
              <div key={m.id} className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2 text-sm">
                <p className="font-semibold text-yellow-400">
                  💰 {m.username} donated {m.amount} bits
                </p>
                {m.content && <p className="text-sm">{m.content}</p>}
              </div>
            );
          if (m.type === "subscription")
            return (
              <div key={m.id} className="bg-primary/20 border border-primary/50 rounded p-2 text-sm">
                <p className="font-semibold text-primary">⭐ {m.username} subscribed (Tier {m.tier})</p>
              </div>
            );
          return (
            <div key={m.id} className="text-sm break-words">
              <span className="font-semibold text-primary">{m.username}: </span>
              <span>{m.content}</span>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="p-2 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAuthenticated ? "Send a message..." : "Log in to chat"}
          disabled={!isAuthenticated}
          className="bg-secondary border-none"
        />
        <Button type="submit" size="icon" disabled={!isAuthenticated}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
