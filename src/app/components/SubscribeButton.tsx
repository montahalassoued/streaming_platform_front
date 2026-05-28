import { useState } from "react";
import { api } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SubscribeButtonProps {
  streamerId: string;
}

export function SubscribeButton({ streamerId }: SubscribeButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const subscribe = async () => {
    if (!streamerId) return;
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      await api.post("/subscriptions", { streamerId });
      const message = "Subscribed!";
      setSuccessMessage(message);
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Subscription failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <Button
        type="button"
        onClick={subscribe}
        disabled={isSubmitting}
        className="h-12 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>

      {successMessage ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-foreground shadow-xl backdrop-blur">
          {successMessage}
        </div>
      ) : null}
    </div>
  );
}
