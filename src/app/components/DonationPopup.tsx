import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DonationItem {
  username: string;
  amount: number;
}

interface DonationPopupProps {
  donations: DonationItem[];
  className?: string;
}

export function DonationPopup({ donations, className }: DonationPopupProps) {
  const [queue, setQueue] = useState<DonationItem[]>([]);
  const [active, setActive] = useState<DonationItem | null>(null);
  const lastHandledCount = useRef(0);

  useEffect(() => {
    if (donations.length > lastHandledCount.current) {
      const nextItems = donations.slice(lastHandledCount.current);
      lastHandledCount.current = donations.length;
      setQueue((current) => [...current, ...nextItems]);
    }
  }, [donations]);

  useEffect(() => {
    if (active || queue.length === 0) return;
    const next = queue[0];
    setActive(next);
    setQueue((current) => current.slice(1));

    const timeout = window.setTimeout(() => {
      setActive(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [active, queue]);

  if (!active) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 top-4 z-50 w-[min(92vw,42rem)] -translate-x-1/2 rounded-2xl border border-yellow-300/40 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-3 text-black shadow-[0_18px_70px_rgba(250,204,21,0.35)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/70">
            Donation received
          </p>
          <p className="text-lg font-bold tracking-tight">
            {active.username} donated ${active.amount}
          </p>
        </div>
        <div className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70">
          Live
        </div>
      </div>
    </div>
  );
}
