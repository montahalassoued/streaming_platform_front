import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/stores/auth";

export default function StreamerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: streamsData, isLoading: loadingStreams } = useQuery({
    queryKey: ["dashboard-streams"],
    queryFn: async () => {
      const r = await api.get("/streams/mine");
      return Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.data ?? []);
    },
    retry: false,
  });

  const { data: vodsData, isLoading: loadingVods } = useQuery({
    queryKey: ["dashboard-vods"],
    queryFn: async () => {
      const r = await api.get("/vods/mine");
      return Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.data ?? []);
    },
    retry: false,
  });

  const { data: donationsData } = useQuery({
    queryKey: ["dashboard-donations"],
    queryFn: async () => {
      const r = await api.get("/donations/mine");
      return Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.data ?? []);
    },
    retry: false,
  });

  const streams = Array.isArray(streamsData) ? streamsData : [];
  const vods = Array.isArray(vodsData) ? vodsData : [];
  const donations = Array.isArray(donationsData) ? donationsData : [];

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Streamer Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="text-foreground font-medium">{user?.username ?? "streamer"}</span>
            {user?.isStreamer ? " · streamer account" : ""}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/profile/${user?.username ?? "bob"}`)}
            className="border border-border px-3 py-2 rounded"
          >
            View Profile
          </button>
          <button
            onClick={() => navigate("/stream/create")}
            className="bg-primary text-black px-4 py-2 rounded font-bold"
          >
            Create Stream
          </button>
          <button
            onClick={() => navigate("/dashboard/streamer/live")}
            className="border border-border px-3 py-2 rounded"
          >
            Go Live
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="font-semibold mb-2">Streamer Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
            {(user?.username ?? "S").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.displayName ?? user?.username ?? "Streamer"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "No email available"}</p>
            <p className="text-sm text-muted-foreground">
              Use the Go Live button to open camera preview, activate the stream, and join chat.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4">
          <h3 className="font-semibold">Stats</h3>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span>Active Streams</span>
              <strong>{streams.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>VODs</span>
              <strong>{vods.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Donations</span>
              <strong>{donations.length}</strong>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-card rounded-lg p-4">
          <h3 className="font-semibold mb-3">Your Streams</h3>
          {loadingStreams ? (
            <p>Loading streams...</p>
          ) : streams.length === 0 ? (
            <p className="text-muted-foreground">You have no streams yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {streams.map((s: any) => (
                <div key={s.id} className="p-3 border border-border rounded hover:shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{s.title ?? s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.viewerCount ?? s.views ?? 0} viewers
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/stream/${s.id}`)}
                        className="px-3 py-1 rounded border border-border"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/streams/${s.id}/edit`)}
                        className="px-3 py-1 rounded border border-border"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Recent VODs</h4>
            {loadingVods ? (
              <p>Loading VODs...</p>
            ) : vods.length === 0 ? (
              <p className="text-muted-foreground">No VODs yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vods.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/vod/${v.id}`)}
                    className="text-left rounded overflow-hidden border border-border bg-[#0b0b0b]"
                  >
                    <div className="aspect-video bg-secondary">
                      <img
                        src={v.thumbnailUrl ?? v.preview}
                        className="w-full h-full object-cover"
                        alt={v.title}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold truncate">{v.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
