import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Radio, Users } from "lucide-react";
import { streamsApi, streamerApi } from "@/app/lib/services";

interface StreamerStatsPanelProps {
  streamId: string;
  className?: string;
}

type StreamStats = {
  viewerCount: number;
  subscriberCount: number;
  donationTotal: number;
  isLive: boolean;
};

const formatNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

const emptyStats: StreamStats = {
  viewerCount: 0,
  subscriberCount: 0,
  donationTotal: 0,
  isLive: false,
};

function toArray(value: any) {
  if (Array.isArray(value)) return value;
  return value?.items ?? value?.data ?? value?.rows ?? [];
}

export function StreamerStatsPanel({ streamId, className = "" }: StreamerStatsPanelProps) {
  const [stats, setStats] = useState<StreamStats>(emptyStats);

  useEffect(() => {
    if (!streamId) return;

    let active = true;

    const loadStats = async () => {
      const [streamResult, donationsResult, subscribersResult] = await Promise.allSettled([
        streamsApi.getById(streamId),
        streamerApi.donations(1, 100),
        streamerApi.subscribers(),
      ]);

      if (!active) return;

      const stream = streamResult.status === "fulfilled" ? streamResult.value : null;
      const donations =
        donationsResult.status === "fulfilled" ? toArray(donationsResult.value) : [];
      const subscribers =
        subscribersResult.status === "fulfilled" ? toArray(subscribersResult.value) : [];

      const viewerCount = Number(
        stream?.viewerCount ?? stream?.stream?.viewerCount ?? stream?.streamer?.viewerCount ?? 0,
      );
      const isLive = Boolean(stream?.isLive ?? stream?.live ?? stream?.status === "live");
      const subscriberCount = subscribers.length;
      const donationTotal = donations.reduce((sum: number, item: any) => {
        const amount = Number(item?.amount ?? item?.amountCents ?? item?.value ?? 0);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0);

      setStats({
        viewerCount: Number.isFinite(viewerCount) ? viewerCount : 0,
        subscriberCount,
        donationTotal,
        isLive,
      });
    };

    void loadStats();
    const interval = window.setInterval(() => {
      void loadStats();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [streamId]);

  const cards = useMemo(
    () => [
      {
        label: "Live viewers",
        value: formatNumber.format(stats.viewerCount),
        icon: Radio,
      },
      {
        label: "Subscribers",
        value: formatNumber.format(stats.subscriberCount),
        icon: Users,
      },
      {
        label: "Support total",
        value: formatNumber.format(stats.donationTotal),
        icon: BadgeDollarSign,
      },
    ],
    [stats],
  );

  return (
    <section
      className={`rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-tight">Stream stats</p>
          <p className="text-xs text-muted-foreground">Updated every 10 seconds</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            stats.isLive
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border border-border bg-secondary/50 text-muted-foreground"
          }`}
        >
          {stats.isLive ? "Live" : "Offline"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
