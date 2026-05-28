import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { DollarSign, Eye, Heart } from "lucide-react";
import { streamsApi, followsApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { ChatOverlay } from "@/app/components/ChatOverlay";
import { DonationPopup } from "@/app/components/DonationPopup";
import { DonationModal } from "@/app/components/DonationModal";
import { SubscribeButton } from "@/app/components/SubscribeButton";
import { StreamerNotifications } from "@/app/components/StreamerNotifications";
import { StreamerStatsPanel } from "@/app/components/StreamerStatsPanel";
import { toast } from "sonner";

export default function StreamPage() {
  const { streamerId = "" } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [donateOpen, setDonateOpen] = useState(false);

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
  const isOwner = useMemo(
    () => Boolean(user?.id && stream?.streamer?.id && user.id === stream.streamer.id),
    [stream?.streamer?.id, user?.id],
  );

  const followMut = useMutation({
    mutationFn: () =>
      isFollowing ? followsApi.unfollow(streamerId) : followsApi.follow(streamerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-status", streamerId] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Action failed"),
  });

  const streamId = stream?.id ?? streamerId;
  const viewers = Number(stream?.viewerCount ?? 0);
  const categoryLabel =
    typeof stream?.category === "string" ? stream.category : (stream?.category?.name ?? "");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {streamId && stream?.streamer?.id && isOwner && (
        <StreamerNotifications streamerId={stream.streamer.id} />
      )}

      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-4">
          {isLoading ? (
            <Skeleton className="aspect-video w-full rounded-2xl" />
          ) : (
            <VideoPlayer src={stream?.hlsUrl} />
          )}

          <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/3" />
              </>
            ) : stream ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">{stream.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {categoryLabel && <span>{categoryLabel}</span>}
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" /> {viewers.toLocaleString()} viewers
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isAuthenticated && !isOwner && (
                      <Button
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={() => followMut.mutate()}
                        disabled={followMut.isPending}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                    {!isOwner && isAuthenticated && <SubscribeButton streamerId={streamId} />}
                    {!isOwner && isAuthenticated && (
                      <Button variant="secondary" onClick={() => setDonateOpen(true)}>
                        <DollarSign className="mr-2 h-4 w-4" /> Donate
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <p className="text-sm text-muted-foreground">
                        Log in to follow, subscribe, or donate.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  {stream.streamer?.avatarUrl ? (
                    <img
                      src={stream.streamer.avatarUrl}
                      className="h-12 w-12 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {stream.streamer?.displayName ?? stream.streamer?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stream.streamer?.followerCount ?? 0} followers
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Stream not found.</p>
            )}
          </div>

          {streamId && stream?.streamer?.id && isOwner && (
            <StreamerStatsPanel streamId={streamId} />
          )}
        </div>

        <div className="min-h-[32rem] lg:h-[calc(100vh-5.5rem)]">
          {streamId ? (
            <ChatOverlay streamId={streamId} className="h-full" />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card/70 p-6 text-center text-sm text-muted-foreground">
              Chat is unavailable until a stream loads.
            </div>
          )}
        </div>
      </div>

      {streamId && stream?.streamer?.id && <DonationPopup streamerId={stream.streamer.id} />}

      {streamId && stream?.streamer?.id && (
        <DonationModal streamerId={stream.streamer.id} open={donateOpen} onOpenChange={setDonateOpen} />
      )}
    </div>
  );
}
