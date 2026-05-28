import { useEffect, useMemo, useState } from "react";
import { getChatSocket, disconnectChatSocket } from "@/app/lib/socket";

export interface ChatMessage {
  id?: string;
  streamId: string;
  userId?: string | null;
  content: string;
  createdAt?: string;
  user?: { id?: string | null; username?: string | null } | null;
}

export function useChatSocket(streamId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socket = useMemo(() => getChatSocket(), []);

  useEffect(() => {
    if (!streamId) return;

    const handleJoinedStream = (payload: { messages?: ChatMessage[] }) => {
      if (Array.isArray(payload?.messages)) {
        setMessages(payload.messages);
      }
    };

    const handleNewMessage = (payload: { message?: ChatMessage }) => {
      if (!payload?.message?.content) return;
      setMessages((current) => {
        const nextMessage = payload.message as ChatMessage;
        return [
          ...current,
          {
            ...nextMessage,
            user: nextMessage.user ?? null,
          },
        ];
      });
    };

    const handleConnect = () => {
      socket.emit("joinStream", { streamId });
    };

    socket.on("connect", handleConnect);
    socket.on("joinedStream", handleJoinedStream);
    socket.on("newMessage", handleNewMessage);

    if (socket.connected) {
      socket.emit("joinStream", { streamId });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("joinedStream", handleJoinedStream);
      socket.off("newMessage", handleNewMessage);
      socket.emit("leaveStream", { streamId });
    };
  }, [socket, streamId]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !streamId) return;
    socket.emit("sendMessage", { streamId, content: trimmed });
  };

  return {
    messages,
    sendMessage,
  };
}

export function clearChatSocket() {
  disconnectChatSocket();
}
