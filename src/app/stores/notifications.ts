import { create } from "zustand";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  streamerId?: string;
  thumbnailUrl?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt"> & Partial<Pick<AppNotification, "id" | "createdAt">>) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((s) => {
      const notif: AppNotification = {
        id: n.id ?? crypto.randomUUID(),
        type: n.type,
        title: n.title,
        body: n.body,
        streamerId: n.streamerId,
        thumbnailUrl: n.thumbnailUrl,
        read: false,
        createdAt: n.createdAt ?? new Date().toISOString(),
      };
      return {
        notifications: [notif, ...s.notifications].slice(0, 50),
        unreadCount: s.unreadCount + 1,
      };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
