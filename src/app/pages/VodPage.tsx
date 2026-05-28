import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import VideoPlayer from "@/app/components/VideoPlayer";
import SubscribeButton from "@/app/components/SubscribeButton";

export default function VodPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: vod,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vod", id],
    queryFn: async () => {
      const r = await api.get(`/vods/${id}`);
      return r.data?.data ?? r.data ?? r.data?.item ?? r.data?.vod ?? r.data;
    },
    enabled: !!id,
  });

  const v = vod as any;

  if (isLoading) return <div className="p-6">Loading VOD...</div>;
  if (isError || !v) return <div className="p-6 text-muted-foreground">VOD not found.</div>;

  const src = v.playbackUrl ?? v.hlsUrl ?? `/hls/vod/${v.id}/index.m3u8`;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-black rounded-lg overflow-hidden">
          <VideoPlayer src={src} poster={v.thumbnailUrl} />
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{v.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {v.streamer?.username ?? v.uploader?.username}
            </p>
            {v.description && <p className="mt-3 text-sm text-muted-foreground">{v.description}</p>}
          </div>
          <div className="flex items-center space-x-3">
            <SubscribeButton stream={v} />
          </div>
        </div>

        <div className="bg-card rounded p-4">
          <h3 className="font-semibold mb-2">More from this streamer</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(v.relatedVods ?? []).map((rv: any) => (
              <button
                key={rv.id}
                onClick={() => navigate(`/vod/${rv.id}`)}
                className="text-left rounded overflow-hidden border border-border bg-[#0b0b0b]"
              >
                <div className="aspect-video bg-secondary">
                  <img
                    src={rv.thumbnailUrl ?? rv.preview}
                    className="w-full h-full object-cover"
                    alt={rv.title}
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold truncate">{rv.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
