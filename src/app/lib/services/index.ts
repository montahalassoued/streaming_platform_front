import { api } from "../api";

const canFallback = (error: any) => {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

const withFallback = async <T>(calls: Array<() => Promise<T>>): Promise<T> => {
  let lastError: any;
  for (const call of calls) {
    try {
      return await call();
    } catch (error) {
      lastError = error;
      if (!canFallback(error)) throw error;
    }
  }
  throw lastError;
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (data: { username: string; email: string; password: string; name?: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  getMe: () =>
    withFallback([
      () => api.get("/users/me").then((r) => r.data),
      () => api.get("/auth/me").then((r) => r.data),
    ]),
};

export const streamsApi = {
  getLive: (page = 1, limit = 20, categoryId?: string) =>
    api
      .get("/streams", { params: { page, limit, ...(categoryId ? { categoryId } : {}) } })
      .then((r) => r.data),
  getById: (id: string) => api.get(`/streams/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/streams/${id}`, data).then((r) => r.data),
  getMyKey: () => api.get("/streams/my/key").then((r) => r.data),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`).then((r) => r.data),
  getBits: () =>
    withFallback([
      () => api.get("/users/me/bits").then((r) => r.data),
      () => api.get("/users/me").then((r) => ({ balance: r.data?.bits ?? 0 })),
    ]),
  rechargeBits: (amount: number) =>
    withFallback([
      () => api.post("/users/me/bits/recharge", { amount }).then((r) => r.data),
      () => Promise.reject(new Error("Recharge endpoint is not available on this backend")),
    ]),
};

export const followsApi = {
  follow: (streamerId: string) =>
    withFallback([
      () => api.post(`/follows/${streamerId}`).then((r) => r.data),
      () => api.post("/subscriptions", { streamerId, tier: 1 }).then((r) => r.data),
    ]),
  unfollow: (streamerId: string) =>
    withFallback([
      () => api.delete(`/follows/${streamerId}`).then((r) => r.data),
      () => Promise.resolve({ following: false }),
    ]),
  isFollowing: async (streamerId: string) => {
    return withFallback([
      () => api.get(`/follows/${streamerId}/status`).then((r) => r.data),
      async () => {
        const list = await api.get("/subscriptions").then((r) => r.data);
        const rows = Array.isArray(list) ? list : (list?.items ?? list?.data ?? []);
        const following = rows.some((s: any) => {
          const sid = s?.streamerId ?? s?.streamer?.id ?? s?.channel?.id;
          return sid === streamerId;
        });
        return { following };
      },
    ]);
  },
  myFollowed: async () => {
    return withFallback([
      () => api.get("/follows/me").then((r) => r.data),
      async () => {
        const list = await api.get("/subscriptions").then((r) => r.data);
        const rows = Array.isArray(list) ? list : (list?.items ?? list?.data ?? []);
        return rows.map((s: any) => ({
          id: s?.streamerId ?? s?.streamer?.id ?? s?.channel?.id ?? s?.id,
          username: s?.streamer?.username ?? s?.channel?.username ?? s?.username ?? "streamer",
          avatarUrl: s?.streamer?.avatarUrl ?? s?.channel?.avatarUrl,
          isLive: s?.streamer?.isLive ?? s?.channel?.isLive ?? false,
          viewerCount: s?.streamer?.viewerCount ?? s?.channel?.viewerCount,
        }));
      },
    ]);
  },
};

export const subsApi = {
  subscribe: (streamerId: string, tier: number) =>
    withFallback([
      () => api.post(`/subscriptions/${streamerId}`, { tier }).then((r) => r.data),
      () => api.post("/subscriptions", { streamerId, tier }).then((r) => r.data),
    ]),
  isSubscribed: async (streamerId: string) => {
    return withFallback([
      () => api.get(`/subscriptions/${streamerId}/status`).then((r) => r.data),
      async () => {
        const list = await api.get("/subscriptions").then((r) => r.data);
        const rows = Array.isArray(list) ? list : (list?.items ?? list?.data ?? []);
        const subscribed = rows.some((s: any) => {
          const sid = s?.streamerId ?? s?.streamer?.id ?? s?.channel?.id;
          return sid === streamerId;
        });
        return { subscribed };
      },
    ]);
  },
};

export const donationsApi = {
  send: (data: { streamerId: string; amount: number; message?: string }) =>
    withFallback([
      () => api.post("/donations", data).then((r) => r.data),
      () =>
        api
          .post("/donations", {
            streamId: data.streamerId,
            amountCents: data.amount,
            message: data.message,
            currency: "BITS",
          })
          .then((r) => r.data),
    ]),
};

export const vodsApi = {
  getByUser: (userId: string) =>
    withFallback([
      () => api.get(`/users/${userId}/vods`).then((r) => r.data),
      () => api.get("/vods", { params: { userId } }).then((r) => r.data),
    ]),
  update: (id: string, data: any) => api.patch(`/vods/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/vods/${id}`).then((r) => r.data),
};

export const chatApi = {
  getMessages: (streamId: string) =>
    withFallback([
      () => api.get(`/chat/${streamId}/messages`).then((r) => r.data),
      () => api.get("/chat", { params: { streamId } }).then((r) => r.data),
    ]),
};

export const categoriesApi = {
  list: () => api.get("/categories").then((r) => r.data),
  create: (data: any) => api.post("/categories", data).then((r) => r.data),
  getById: (id: string) => api.get(`/categories/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const streamerApi = {
  me: () => api.get("/streamer/me").then((r) => r.data),
  donations: (page = 1, limit = 20) =>
    api.get("/streamer/me/donations", { params: { page, limit } }).then((r) => r.data),
  subscribers: () => api.get("/streamer/me/subscribers").then((r) => r.data),
  updateSettings: (data: any) => api.patch("/streamer/me/settings", data).then((r) => r.data),
  deleteChatMessage: (id: string) =>
    api.delete(`/streamer/me/chat/message/${id}`).then((r) => r.data),
};

export const adminApi = {
  users: () => api.get("/admin/users").then((r) => r.data),
  promote: (id: string) => api.post(`/admin/users/${id}/promote`).then((r) => r.data),
  demote: (id: string) => api.post(`/admin/users/${id}/demote`).then((r) => r.data),
};

export const notificationsApi = {
  sseUrl: (token?: string) =>
    token ? `/notifications/sse?token=${encodeURIComponent(token)}` : "/notifications/sse",
};
