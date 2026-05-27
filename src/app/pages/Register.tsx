import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/app/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tv } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: ""});
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: () => {
      toast.success("Account created! Please log in.");
      navigate("/login");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Registration failed"),
  });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Tv className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">StreamX</span>
        </div>
        <h1 className="text-xl font-semibold mb-6 text-center">Create account</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={form.username} onChange={upd("username")} required />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={upd("email")} required />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={upd("password")} required />
          </div>
          <Button type="submit" className="w-full" disabled={mut.isPending}>
            {mut.isPending ? "Creating..." : "Register"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
