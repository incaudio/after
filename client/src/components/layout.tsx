import { useState, ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibrarySidebar } from "@/components/library-sidebar";
import { MusicPlayer } from "@/components/music-player";
import { SearchResult } from "@shared/schema";

interface LayoutProps {
  children: ReactNode;
  showSidebarButton?: boolean;
}

let currentTrack: SearchResult | null = null;
let setCurrentTrackGlobal: ((track: SearchResult | null) => void) | null = null;

export function Layout({ children, showSidebarButton = true }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<SearchResult | null>(currentTrack);

  // Store the setter globally so other components can use it
  if (!setCurrentTrackGlobal) {
    setCurrentTrackGlobal = setPlayingTrack;
  }

  const handlePlayTrack = (track: SearchResult) => {
    setPlayingTrack(track);
    currentTrack = track;
  };

  return (
    <div className="relative min-h-screen">
      {/* Sidebar toggle button */}
      {showSidebarButton && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="glass text-violet-400 hover:text-violet-300"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <LibrarySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onPlayTrack={handlePlayTrack}
      />

      {/* Main content */}
      {children}

      {/* Music player */}
      {playingTrack && (
        <MusicPlayer
          track={playingTrack}
          onClose={() => {
            setPlayingTrack(null);
            currentTrack = null;
          }}
        />
      )}
    </div>
  );
}

// Export function to play track from anywhere
export function playTrack(track: SearchResult) {
  if (setCurrentTrackGlobal) {
    setCurrentTrackGlobal(track);
    currentTrack = track;
  }
}
