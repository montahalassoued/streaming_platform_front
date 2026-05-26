import { Link } from "react-router-dom";

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
      <div className="relative aspect-video bg-secondary rounded-md overflow-hidden">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary" />
        )}
        <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded uppercase">
          Live
        </span>
        {stream.viewerCount != null && (
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {stream.viewerCount.toLocaleString()} viewers
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
