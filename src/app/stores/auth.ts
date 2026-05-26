import { create } from "zustand";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isStreamer?: boolean;
  isAdmin?: boolean;
  bits?: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  setUser: (user) => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      } catch {}
    }
  },
}));
