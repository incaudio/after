import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Heart, Download } from "lucide-react";
import { SiYoutube, SiSoundcloud } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SearchResult } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface MusicPlayerProps {
  track: SearchResult;
  onClose: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  // Handle direct audio playback for streamUrl
  useEffect(() => {
    if (track.streamUrl && audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
    // eslint-disable-next-line
  }, [track.streamUrl, isPlaying, volume]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(70);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
    const audioRef = useRef<HTMLAudioElement>(null);

  const { data: likeStatus } = useQuery<{ isLiked: boolean }>({
    queryKey: [`/api/songs/${track.id}/is-liked`],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.isLiked) {
        const res = await fetch(`/api/liked-songs/${track.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to unlike");
        return res.json();
      } else {
        const res = await fetch("/api/liked-songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(track),
        });
        if (!res.ok) throw new Error("Failed to like");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/songs/${track.id}/is-liked`] });
      queryClient.invalidateQueries({ queryKey: ["/api/liked-songs"] });
    },
  });

  const handleDownload = () => {
    if (track.platform.toLowerCase() === "youtube") {
      window.open(`https://ytmp3.as/AOPR/${track.id}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(track.url, "_blank", "noopener,noreferrer");
    }
  };

  // YouTube player setup
  useEffect(() => {
    if (track.platform.toLowerCase() === "youtube") {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        if (window.YT && window.YT.Player && playerContainerRef.current) {
          playerRef.current = new window.YT.Player('youtube-player', {
            videoId: track.id,
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              iv_load_policy: 3,
              disablekb: 1,
              fs: 0,
            },
            events: {
              onReady: (event: any) => {
                setIsPlayerReady(true);
                event.target.setVolume(volume);
                event.target.playVideo();
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
            },
          });
        }
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }

      return () => {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      };
    }
  }, [track.id, track.platform]);

  // YouTube volume
  useEffect(() => {
    if (track.platform.toLowerCase() === "youtube") {
      if (playerRef.current && isPlayerReady && playerRef.current.setVolume) {
        playerRef.current.setVolume(volume);
      }
    }
  }, [volume, isPlayerReady, track.platform]);

  // Direct audio playback for streamUrl
  useEffect(() => {
    if (track.streamUrl && audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [track.streamUrl, isPlaying, volume]);

  const togglePlay = () => {
    if (track.platform.toLowerCase() === "youtube") {
      if (playerRef.current && isPlayerReady) {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      }
    } else if (track.streamUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleOpenSource = () => {
    window.open(track.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-elevated border-t border-white/20 animate-in slide-in-from-bottom duration-300">
      {track.platform.toLowerCase() === "youtube" && (
        <div className="absolute w-0 h-0 overflow-hidden opacity-0">
          <div ref={playerContainerRef} id="youtube-player" />
        </div>
      )}
      {track.streamUrl && (
        <audio
          ref={audioRef}
          src={track.streamUrl}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={track.thumbnail}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate" data-testid="text-player-title">
                {track.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid="text-player-artist">
                {track.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="text-muted-foreground"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              className="w-12 h-12 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg shadow-violet-500/50"
              data-testid="button-play-pause"
              disabled={!isPlayerReady && track.platform.toLowerCase() === "youtube"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="text-muted-foreground"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => setVolume(value)}
                className="w-24"
                data-testid="slider-volume"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => likeMutation.mutate()}
              className={likeStatus?.isLiked ? "text-red-400 hover:text-red-300" : "text-muted-foreground hover:text-red-400"}
              data-testid="button-like"
              disabled={likeMutation.isPending}
            >
              <Heart className={`w-5 h-5 ${likeStatus?.isLiked ? "fill-current" : ""}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="glass backdrop-blur-xl text-muted-foreground hover:text-foreground"
              data-testid="button-download"
            >
              <Download className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSource}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-open-source"
            >
              {track.platform.toLowerCase() === "youtube" ? (
                <SiYoutube className="w-5 h-5" />
              ) : (
                <SiSoundcloud className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-player"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
