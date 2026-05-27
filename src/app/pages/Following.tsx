import { useAuthStore } from "@/app/stores/auth";

export default function FollowingPage() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="p-6 min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-2">Following</h1>
        <p className="text-muted-foreground">
          Log in to see the channels you follow.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-2">Following</h1>
      <p className="text-muted-foreground">You are not following any channels yet.</p>
    </div>
  );
}
