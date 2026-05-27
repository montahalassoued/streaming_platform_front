import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streamsApi, vodsApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { API_BASE } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showKey, setShowKey] = useState(false);
  const [stats, setStats] = useState<{
    viewerCount?: number;
    peakViewers?: number;
    totalDonations?: number;
  }>({});
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const { data: keyData } = useQuery({
    queryKey: ["my-stream-key"],
    queryFn: () => streamsApi.getMyKey(),
    retry: false,
  });

  const streamId = keyData?.streamId ?? keyData?.id;
  const streamKey = keyData?.streamKey ?? keyData?.key;

  useEffect(() => {
    if (keyData?.title) setTitle(keyData.title);
    if (keyData?.category) {
      const categoryValue =
        typeof keyData.category === "string" ? keyData.category : (keyData.category?.name ?? "");
      setCategory(categoryValue);
    }
    if (keyData?.viewerCount != null) setStats((s) => ({ ...s, viewerCount: keyData.viewerCount }));
  }, [keyData]);

  useEffect(() => {
    if (!streamId) return;
    const token = localStorage.getItem("access_token");
    const url = `${API_BASE}/streams/${streamId}/dashboard${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    let es: EventSource | null = null;
    try {
      es = new EventSource(url);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setStats((s) => ({ ...s, ...data }));
        } catch {}
      };
    } catch {}
    return () => {
      es?.close();
    };
  }, [streamId]);

  const updateMut = useMutation({
    mutationFn: (patch: any) => streamsApi.update(streamId!, patch),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["my-stream-key"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Update failed"),
  });

  const { data: vods } = useQuery({
    queryKey: ["my-vods", user?.id],
    queryFn: () => vodsApi.getByUser(user!.id),
    enabled: !!user?.id,
    retry: false,
  });

  const updateVodMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => vodsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-vods", user?.id] }),
  });

  const deleteVodMut = useMutation({
    mutationFn: (id: string) => vodsApi.delete(id),
    onSuccess: () => {
      toast.success("VOD deleted");
      qc.invalidateQueries({ queryKey: ["my-vods", user?.id] });
    },
  });

  const isLive = !!keyData?.isLive;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Streamer Dashboard</h1>

      <section className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Stream Key</h2>
        <div className="flex gap-2">
          <Input
            readOnly
            type={showKey ? "text" : "password"}
            value={streamKey ?? ""}
            className="font-mono"
          />
          <Button variant="secondary" size="icon" onClick={() => setShowKey((v) => !v)}>
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              if (streamKey) {
                navigator.clipboard.writeText(streamKey);
                toast.success("Copied");
              }
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`font-semibold ${isLive ? "text-accent" : "text-muted-foreground"}`}>
              {isLive ? "🔴 LIVE" : "OFFLINE"}
            </p>
          </div>
          <Button
            variant={isLive ? "destructive" : "default"}
            onClick={() => updateMut.mutate({ isLive: !isLive })}
            disabled={!streamId || updateMut.isPending}
          >
            {isLive ? "End Stream" : "Go Live"}
          </Button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Stream Settings</h2>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <Button onClick={() => updateMut.mutate({ title, category })} disabled={!streamId}>
          Save
        </Button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Current Viewers" value={stats.viewerCount ?? 0} />
        <StatCard label="Peak Viewers" value={stats.peakViewers ?? 0} />
        <StatCard label="Total Donations (bits)" value={stats.totalDonations ?? 0} />
      </section>

      <section className="bg-card border border-border rounded-lg p-4">
        <h2 className="font-semibold mb-3">My VODs</h2>
        {!vods || vods.length === 0 ? (
          <p className="text-muted-foreground text-sm">No VODs yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2">Title</th>
                <th>Views</th>
                <th>Date</th>
                <th>Public</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vods.map((v: any) => (
                <tr key={v.id} className="border-b border-border">
                  <td className="py-2">{v.title}</td>
                  <td>{v.viewCount ?? 0}</td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Switch
                      checked={!!v.isPublic}
                      onCheckedChange={(checked) =>
                        updateVodMut.mutate({ id: v.id, patch: { isPublic: checked } })
                      }
                    />
                  </td>
                  <td>
                    <Button variant="ghost" size="icon" onClick={() => deleteVodMut.mutate(v.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
