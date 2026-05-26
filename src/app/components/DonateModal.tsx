import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { donationsApi, usersApi } from "@/app/lib/services";
import { toast } from "sonner";

const PRESETS = [100, 500, 1000];

export function DonateModal({
  streamerId,
  open,
  onOpenChange,
}: {
  streamerId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const qc = useQueryClient();

  const { data: bits } = useQuery({
    queryKey: ["my-bits"],
    queryFn: () => usersApi.getBits(),
    enabled: open,
    retry: false,
  });

  const mut = useMutation({
    mutationFn: () => donationsApi.send({ streamerId, amount, message: message || undefined }),
    onSuccess: () => {
      toast.success(`Donated ${amount} bits!`);
      qc.invalidateQueries({ queryKey: ["my-bits"] });
      onOpenChange(false);
      setMessage("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Donation failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a donation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Balance: <span className="font-semibold text-foreground">{bits?.balance ?? 0} bits</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p}
                type="button"
                variant={amount === p ? "default" : "secondary"}
                onClick={() => setAmount(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Custom amount"
          />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (optional)"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || amount < 1}>
            {mut.isPending ? "Sending..." : `Donate ${amount} bits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
