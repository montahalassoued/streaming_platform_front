import { useState } from "react";
import { api } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DonationModalProps {
  streamId: string;
}

export function DonationModal({ streamId }: DonationModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async () => {
    if (!streamId || amount <= 0) return;
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      await api.post("/donations", { streamId, amount });
      const message = `Donation of $${amount} sent successfully`;
      setSuccessMessage(message);
      toast.success(message);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Donation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
      >
        Donate
      </Button>

      {successMessage ? (
        <div className="max-w-xs rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-foreground shadow-xl backdrop-blur">
          {successMessage}
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send a donation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="donation-amount" className="text-sm font-medium text-foreground">
                Amount
              </label>
              <Input
                id="donation-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="h-11"
                placeholder="Enter amount"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Donations are sent instantly with your logged-in account.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={isSubmitting || amount < 1}>
              {isSubmitting ? "Sending..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
