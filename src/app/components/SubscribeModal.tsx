import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { subsApi } from "@/app/lib/services";
import { toast } from "sonner";

const TIERS = [
  { tier: 1, cost: 500, benefits: ["Sub badge", "Custom emotes"] },
  { tier: 2, cost: 1000, benefits: ["Everything in T1", "Exclusive emotes"] },
  { tier: 3, cost: 2000, benefits: ["Everything in T2", "Special chat color", "Priority support"] },
];

export function SubscribeModal({
  streamerId,
  open,
  onOpenChange,
}: {
  streamerId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [tier, setTier] = useState(1);

  const mut = useMutation({
    mutationFn: () => subsApi.subscribe(streamerId, tier),
    onSuccess: () => {
      toast.success(`Subscribed at Tier ${tier}!`);
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Subscription failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a subscription</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {TIERS.map((t) => (
            <button
              key={t.tier}
              onClick={() => setTier(t.tier)}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                tier === t.tier ? "border-primary bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold">Tier {t.tier}</h4>
                <span className="text-primary font-bold">{t.cost} bits</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {t.benefits.map((b) => <li key={b}>• {b}</li>)}
              </ul>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Subscribing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
