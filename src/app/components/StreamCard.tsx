import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

export interface StreamCardData {
  id: string;
  streamerId: string;
  title: string;
  thumbnailUrl?: string;
  viewerCount?: number;
  category?: string;
  streamer?: { username: string; avatarUrl?: string; displayName?: string };
}

export function StreamCard({ stream }: { stream: StreamCardData }) {
  const id = stream.streamerId || stream.id;
  return (
    <Link to={`/stream/${id}`} className="block group">
      <div className="relative aspect-video bg-card rounded overflow-hidden border-2 border-transparent group-hover:border-primary group-hover:-translate-y-0.5 transition-all duration-150">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card" />
        )}
        <span className="absolute top-2 left-2 bg-destructive text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
          Live
        </span>
        {stream.viewerCount != null && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            <Eye className="w-3 h-3" /> {stream.viewerCount.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {stream.streamer?.avatarUrl ? (
          <img src={stream.streamer.avatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate group-hover:text-primary">{stream.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {stream.streamer?.displayName ?? stream.streamer?.username}
          </p>
          {stream.category && <p className="text-xs text-muted-foreground">{stream.category}</p>}
        </div>
      </div>
    </Link>
  );
}
