import { useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streamsApi, followsApi } from "@/app/lib/services";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { Chat } from "@/app/components/Chat";
import { DonateModal } from "@/app/components/DonateModal";
import { SubscribeModal } from "@/app/components/SubscribeModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, Star, DollarSign } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth";
import { toast } from "sonner";

export default function StreamPage() {
  const { streamerId = "" } = useParams();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [liveViewers, setLiveViewers] = useState<number | null>(null);
  const [donateOpen, setDonateOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", streamerId],
    queryFn: () => streamsApi.getById(streamerId),
    retry: false,
  });

  const { data: followStatus } = useQuery({
    queryKey: ["follow-status", streamerId],
    queryFn: () => followsApi.isFollowing(streamerId),
    enabled: isAuthenticated && !!streamerId,
    retry: false,
  });

  const isFollowing = !!followStatus?.following;

  const followMut = useMutation({
    mutationFn: () =>
      isFollowing ? followsApi.unfollow(streamerId) : followsApi.follow(streamerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-status", streamerId] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Action failed"),
  });

  const onViewerCount = useCallback((n: number) => setLiveViewers(n), []);

  const streamId = stream?.id ?? streamerId;
  const viewers = liveViewers ?? stream?.viewerCount ?? 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <Skeleton className="aspect-video w-full" />
        ) : (
          <VideoPlayer src={stream?.hlsUrl} />
        )}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </>
          ) : stream ? (
            <>
              <h1 className="text-xl font-bold">{stream.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {stream.category && <span>{stream.category}</span>}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {viewers.toLocaleString()} viewers
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                {stream.streamer?.avatarUrl ? (
                  <img src={stream.streamer.avatarUrl} className="w-12 h-12 rounded-full" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {stream.streamer?.displayName ?? stream.streamer?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stream.streamer?.followerCount ?? 0} followers
                  </p>
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Button
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={() => followMut.mutate()}
                      disabled={followMut.isPending}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button variant="secondary" onClick={() => setSubOpen(true)}>
                      <Star className="w-4 h-4 mr-2" /> Subscribe
                    </Button>
                    <Button variant="secondary" onClick={() => setDonateOpen(true)}>
                      <DollarSign className="w-4 h-4 mr-2" /> Donate
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Stream not found.</p>
          )}
        </div>
      </div>
      <div className="w-full lg:w-80 xl:w-96 h-[60vh] lg:h-[calc(100vh-3.5rem)] shrink-0">
        {streamId && <Chat streamId={streamId} onViewerCount={onViewerCount} />}
      </div>
      {streamId && (
        <>
          <DonateModal streamerId={streamerId} open={donateOpen} onOpenChange={setDonateOpen} />
          <SubscribeModal streamerId={streamerId} open={subOpen} onOpenChange={setSubOpen} />
        </>
      )}
    </div>
  );
}
