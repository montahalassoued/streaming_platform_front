import { api } from "../api";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (data: { username: string; email: string; password: string; displayName: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
};

export const streamsApi = {
  getLive: (page = 1, limit = 20) =>
    api.get("/streams", { params: { page, limit } }).then((r) => r.data),
  getById: (id: string) => api.get(`/streams/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/streams/${id}`, data).then((r) => r.data),
  getMyKey: () => api.get("/streams/my/key").then((r) => r.data),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`).then((r) => r.data),
  getBits: () => api.get("/users/me/bits").then((r) => r.data),
  rechargeBits: (amount: number) =>
    api.post("/users/me/bits/recharge", { amount }).then((r) => r.data),
};

export const followsApi = {
  follow: (streamerId: string) => api.post(`/follows/${streamerId}`).then((r) => r.data),
  unfollow: (streamerId: string) => api.delete(`/follows/${streamerId}`).then((r) => r.data),
  isFollowing: (streamerId: string) =>
    api.get(`/follows/${streamerId}/status`).then((r) => r.data),
  myFollowed: () => api.get("/follows/me").then((r) => r.data),
};

export const subsApi = {
  subscribe: (streamerId: string, tier: number) =>
    api.post(`/subscriptions/${streamerId}`, { tier }).then((r) => r.data),
  isSubscribed: (streamerId: string) =>
    api.get(`/subscriptions/${streamerId}/status`).then((r) => r.data),
};

export const donationsApi = {
  send: (data: { streamerId: string; amount: number; message?: string }) =>
    api.post("/donations", data).then((r) => r.data),
};

export const vodsApi = {
  getByUser: (userId: string) => api.get(`/users/${userId}/vods`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/vods/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/vods/${id}`).then((r) => r.data),
};

export const chatApi = {
  getMessages: (streamId: string) =>
    api.get(`/chat/${streamId}/messages`).then((r) => r.data),
};
