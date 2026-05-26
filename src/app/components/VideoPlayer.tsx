import { useEffect, useRef } from "react";
import Hls from "hls.js";

export function VideoPlayer({ src }: { src?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  if (!src) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-muted-foreground">
        Stream is offline
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black">
      <video ref={ref} controls autoPlay playsInline className="w-full h-full" />
    </div>
  );
}
