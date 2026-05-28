import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { streamsApi } from "@/app/lib/services";
import VideoPlayer from "@/app/components/VideoPlayer";
import ChatOverlay from "@/app/components/ChatOverlay";
import DonationPopup from "@/app/components/DonationPopup";
import SubscribeButton from "@/app/components/SubscribeButton";
import StreamerStatsPanel from "@/app/components/StreamerStatsPanel";
import StreamerNotifications from "@/app/components/StreamerNotifications";
import { connectNotificationSSE } from "@/app/lib/sse";

export default function LiveStreamPage() {
  const { id } = useParams();

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", id],
    queryFn: () => streamsApi.getById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    connectNotificationSSE();
  }, []);

  const s = stream as any;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              src={s?.playbackUrl ?? s?.hlsUrl ?? `/hls/${s?.id}/index.m3u8`}
              poster={s?.thumbnailUrl}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{s?.title ?? "Live Stream"}</h2>
              <p className="text-sm text-muted-foreground">
                {s?.user?.username ?? s?.streamer?.username}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SubscribeButton stream={s} />
            </div>
          </div>

          <div>
            <DonationPopup />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-[#0b0b0b] rounded-lg p-3 border border-border">
            <StreamerStatsPanel streamId={id} />
          </div>

          <div className="bg-[#0b0b0b] rounded-lg p-3 border border-border">
            <StreamerNotifications />
          </div>

          <div className="bg-[#0b0b0b] rounded-lg p-3 border border-border">
            <ChatOverlay streamId={id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
