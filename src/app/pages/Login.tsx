import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Tv } from "lucide-react";
import { authApi } from "@/app/lib/services";
import { api } from "@/app/lib/api";
import { useAuthStore } from "@/app/stores/auth";
import { connectNotificationSSE } from "@/app/lib/sse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STREAMER_DEMOS = [
  { label: "Streamer Bob", email: "bob@example.com", password: "bobpass", username: "bob" },
  {
    label: "Streamer Alice",
    email: "alice@example.com",
    password: "alicepass",
    username: "alice",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: async (data: any) => {
      const accessToken = data?.access_token ?? data?.token ?? data?.accessToken ?? "";
      const refreshToken = data?.refresh_token ?? data?.refreshToken ?? "";
      const user = data?.user ?? data;
      let resolvedUser = user;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      if (accessToken) {
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        try {
          const streamer = await api.get("/streamer/me");
          resolvedUser = { ...user, isStreamer: true, streamer: streamer.data };
        } catch {
          try {
            const profile = await api.get(`/users/${user.username}`);
            resolvedUser = {
              ...user,
              isStreamer: Boolean(profile.data?.isStreamer),
              displayName: profile.data?.displayName ?? profile.data?.name ?? user.displayName,
              avatarUrl: profile.data?.avatarUrl ?? user.avatarUrl,
            };
          } catch {
            resolvedUser = user;
          }
        }
      }

      login(accessToken, resolvedUser);
      connectNotificationSSE();
      toast.success("Welcome back");
      navigate("/");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message ?? "Login failed"),
  });

  const quickFill = (e: string) => {
    const demo = STREAMER_DEMOS.find((item) => item.username === e);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      mut.mutate();
      return;
    }
    if (e === "alice") {
      setEmail("alice@example.com");
      setPassword("alicepass");
      mut.mutate();
    }
    if (e === "bob") {
      setEmail("bob@example.com");
      setPassword("bobpass");
      mut.mutate();
    }
    if (e === "charlie") {
      setEmail("charlie@example.com");
      setPassword("charliepass");
      mut.mutate();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Tv className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">StreamX</span>
        </div>
        <h1 className="text-xl font-semibold mb-6 text-center">Sign in</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={mut.isPending}>
            {mut.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
