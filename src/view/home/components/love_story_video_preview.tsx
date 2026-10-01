"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

interface LoveStoryVideoPreviewProps {
  index: number;
  previews: { id: string; caption: string }[];
}

export default function LoveStoryVideoPreview({
  index,
  previews,
}: LoveStoryVideoPreviewProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const visibleIndexRef = useRef(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  const failed = failedIndex === index;
  const pending = visibleIndex !== index && !failed;

  useEffect(() => {
    const current = videoRefs.current[index];
    if (!current) return;
    let cancelled = false;
    let frame: number | undefined;
    let animation: number | undefined;
    let transitionTimer: number | undefined;
    const transitionStartedAt = performance.now();
    const transitionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 300;
    setMuted(true);
    setPlaying(false);
    videoRefs.current.forEach((video, position) => {
      if (video && position !== index) {
        // Let the outgoing video keep moving until the replacement is ready.
        if (position !== visibleIndexRef.current) video.pause();
        video.muted = true;
      }
    });
    current.muted = true;
    let revealed = false;
    const reveal = () => {
      if (cancelled || revealed) return;
      revealed = true;
      const commitFrame = () => {
        if (cancelled) return;
        visibleIndexRef.current = index;
        setVisibleIndex(index);
        videoRefs.current.forEach((video, position) => {
          if (position !== index) video?.pause();
        });
      };
      // Finish dimming before swapping frames, then fade the overlay away.
      const remaining = visibleIndexRef.current === index
        ? 0
        : Math.max(0, transitionDuration - (performance.now() - transitionStartedAt));
      if (remaining > 0) {
        transitionTimer = window.setTimeout(commitFrame, remaining);
      } else {
        commitFrame();
      }
    };
    const ready = () => {
      if (cancelled || revealed) return;
      // Register once: repeated media events must not postpone the first frame.
      if ("requestVideoFrameCallback" in current && !current.paused) {
        if (frame === undefined) {
          frame = current.requestVideoFrameCallback(reveal);
        }
      } else if (current.readyState >= 2 && animation === undefined) {
        animation = requestAnimationFrame(reveal);
      }
    };
    current.addEventListener("playing", ready);
    current.addEventListener("loadeddata", ready);
    void current
      .play()
      .then(ready)
      .catch(() => {
        if (!cancelled) {
          setPlaying(false);
          ready(); // Autoplay may be blocked; reveal the still frame and Play control.
        }
      });
    return () => {
      cancelled = true;
      current.removeEventListener("playing", ready);
      current.removeEventListener("loadeddata", ready);
      if (frame !== undefined) current.cancelVideoFrameCallback(frame);
      if (animation !== undefined) cancelAnimationFrame(animation);
      if (transitionTimer !== undefined) window.clearTimeout(transitionTimer);
    };
  }, [index]);

  useEffect(() => {
    const videos = videoRefs.current;
    return () => {
      videos.forEach((video) => video?.pause());
    };
  }, []);

  const handleTogglePlayback = async () => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else video.pause();
  };

  return (
    <div
      aria-busy={pending}
      className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/60 bg-black"
    >
      {previews.map((preview, position) => (
        <video
          key={preview.id}
          ref={(element) => {
            videoRefs.current[position] = element;
          }}
          src={`https://aistudio.picify.net/images/${preview.id}/thumb_450x800/${preview.id}.mp4`}
          aria-hidden={position !== visibleIndex}
          className={`absolute inset-0 h-full w-full object-cover ${position === visibleIndex ? "opacity-100" : "opacity-0"}`}
          muted={position === index ? muted : true}
          loop
          playsInline
          preload={position <= index + 1 ? "auto" : "metadata"}
          onPlay={() => {
            if (position === index) setPlaying(true);
          }}
          onPause={() => {
            if (position === index) setPlaying(false);
          }}
          onError={() => setFailedIndex(position)}
        />
      ))}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-[180ms] ease-in-out motion-reduce:transition-none ${pending ? "opacity-60" : "opacity-0"}`}
      />
      <button
        type="button"
        onClick={handleTogglePlayback}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute inset-0 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-4"
      >
        {!playing && !failed && !pending && (
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-black/30">
            <Play className="ml-1 h-12 w-12 fill-white text-white" />
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        onClick={() => setMuted(!muted)}
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <img
          src={muted ? "/icons/sound_mute.webp" : "/icons/sound_play.webp"}
          alt=""
          className="h-8 w-8 object-contain"
        />
      </button>
      {failed && (
        <p
          role="status"
          className="absolute inset-x-4 top-1/2 rounded-xl bg-black/70 p-3 text-center text-sm"
        >
          Video unavailable. You can still continue.
        </p>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-2 pb-6 pt-20">
        <h1 className="max-w-[340px] text-[clamp(18px,2.6dvh,24px)] font-semibold leading-tight tracking-wide">
          {previews[visibleIndex].caption}
        </h1>
      </div>
    </div>
  );
}
