import { Play, Pause } from "lucide-react";
import { SiYoutube, SiSoundcloud } from "react-icons/si";
import { SearchResult } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchResultCardProps {
  result: SearchResult;
  onPlay: (result: SearchResult) => void;
  isPlaying?: boolean;
}

export function SearchResultCard({ result, onPlay, isPlaying }: SearchResultCardProps) {
  return (
    <div 
      className="glass rounded-xl overflow-hidden hover-elevate transition-all group"
      data-testid={`card-result-${result.id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={result.thumbnail}
          alt={result.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Duration overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
          {result.duration}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="icon"
            onClick={() => onPlay(result)}
            className="w-16 h-16 rounded-full bg-violet-500 hover:bg-violet-600 text-white"
            data-testid={`button-play-${result.id}`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 
            className="font-medium text-lg line-clamp-2 leading-snug"
            data-testid={`text-title-${result.id}`}
          >
            {result.title}
          </h3>
          <p 
            className="text-sm text-muted-foreground"
            data-testid={`text-artist-${result.id}`}
          >
            {result.artist}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={`${
              result.platform === "youtube" 
                ? "bg-red-500/20 text-red-400 border-red-500/30" 
                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
            }`}
            data-testid={`badge-platform-${result.id}`}
          >
            {result.platform === "youtube" ? (
              <SiYoutube className="w-3 h-3 mr-1" />
            ) : (
              <SiSoundcloud className="w-3 h-3 mr-1" />
            )}
            {result.platform === "youtube" ? "YouTube" : "SoundCloud"}
          </Badge>

          {result.viewCount && (
            <span className="text-xs text-muted-foreground">
              {result.viewCount.toLocaleString()} views
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
