import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/app/lib/services";
import { useAuthStore } from "@/app/stores/auth";
import { connectNotificationSSE } from "@/app/lib/sse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tv } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data: any) => {
      const token = data.access_token ?? data.token;
      const user = data.user ?? data;
      login(token, user);
      connectNotificationSSE();
      toast.success("Welcome back!");
      navigate("/");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Login failed"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Tv className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">StreamX</span>
        </div>
        <h1 className="text-xl font-semibold mb-6 text-center">Log in</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={mut.isPending}>
            {mut.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          No account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
