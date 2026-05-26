import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, followsApi, vodsApi } from "@/app/lib/services";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/app/stores/auth";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { username = "" } = useParams();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => usersApi.getProfile(username),
    retry: false,
  });

  const userId = profile?.id;

  const { data: vods } = useQuery({
    queryKey: ["vods", userId],
    queryFn: () => vodsApi.getByUser(userId),
    enabled: !!userId,
    retry: false,
  });

  const { data: followStatus } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: () => followsApi.isFollowing(userId!),
    enabled: !!userId && isAuthenticated,
    retry: false,
  });

  const isFollowing = !!followStatus?.following;

  const followMut = useMutation({
    mutationFn: () =>
      isFollowing ? followsApi.unfollow(userId!) : followsApi.follow(userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-status", userId] });
      qc.invalidateQueries({ queryKey: ["profile", username] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Action failed"),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }
  if (!profile) return <p className="p-6 text-muted-foreground">User not found.</p>;

  return (
    <div>
      <div className="bg-card p-6 flex flex-col sm:flex-row items-start gap-4 border-b border-border">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="w-24 h-24 rounded-full" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.displayName ?? profile.username}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-2 max-w-xl">{profile.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span><b className="text-foreground">{profile.followerCount ?? 0}</b> followers</span>
            <span><b className="text-foreground">{profile.followingCount ?? 0}</b> following</span>
          </div>
        </div>
        {isAuthenticated && (
          <Button onClick={() => followMut.mutate()} variant={isFollowing ? "secondary" : "default"}>
            <Heart className="w-4 h-4 mr-2" />
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
      <div className="p-6">
        <Tabs defaultValue="vods">
          <TabsList>
            <TabsTrigger value="vods">VODs</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="vods" className="mt-4">
            {(!vods || vods.length === 0) ? (
              <p className="text-muted-foreground">No VODs yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vods.map((v: any) => (
                  <div key={v.id} className="bg-card rounded-md overflow-hidden border border-border">
                    <div className="aspect-video bg-secondary relative">
                      {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                      {v.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-semibold truncate">{v.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.viewCount ?? 0} views · {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="about" className="mt-4 space-y-2 text-sm">
            <p>{profile.bio ?? "No bio yet."}</p>
            {profile.createdAt && (
              <p className="text-muted-foreground">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
