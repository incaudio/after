import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Mic, Music, Moon, Sun, Info, Mail, Menu, LogIn, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VibeMatchModal } from "@/components/vibe-match-modal";
import { LibrarySidebar } from "@/components/library-sidebar";
import { SearchResult } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showVibeMatch, setShowVibeMatch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrackSelect = (track: SearchResult) => {
    setCurrentTrack(track);
  };

  return (
    <>
      <LibrarySidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onOpen={() => setShowSidebar(true)}
        onPlayTrack={handleTrackSelect}
      />

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Sidebar toggle button (top left) - always visible */}
        {!showSidebar && (
          <div className="fixed top-6 left-6 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="glass text-violet-400 hover:text-violet-300"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/about")}
            className="text-violet-400 hover:text-violet-300 glass"
          >
            <Info className="w-4 h-4 mr-2" />
            About
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/contact")}
            className="text-violet-400 hover:text-violet-300 glass"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-violet-400 glass"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          {!isLoading && (
            isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-violet-400 hover:text-violet-300 glass"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/login"}
                className="text-violet-400 hover:text-violet-300 glass"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-background to-blue-600/20 animate-gradient" />
        
        {/* Floating music notes animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-violet-500/20 animate-float">
            <Music className="w-16 h-16" />
          </div>
          <div className="absolute top-1/3 right-1/4 text-blue-500/20 animate-float" style={{ animationDelay: "1s" }}>
            <Music className="w-12 h-12" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 text-violet-500/20 animate-float" style={{ animationDelay: "2s" }}>
            <Music className="w-20 h-20" />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-4xl px-6 space-y-8">
          {/* Logo/Brand */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-7xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              Mate.
            </h1>
            <p className="text-xl text-muted-foreground">
              Search, discover, and vibe with music
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="glass-elevated rounded-full p-1 animate-pulse-glow">
              <div className="flex items-center gap-2 px-6 h-14">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for songs, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground"
                  data-testid="input-search"
                />
                {searchQuery.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    className="glass bg-gradient-to-r from-violet-500/80 to-blue-500/80 hover:from-violet-600/90 hover:to-blue-600/90 text-white animate-fade-in backdrop-blur-lg"
                  >
                    Search
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowVibeMatch(true)}
                  className="text-violet-400 hover:text-violet-300"
                  data-testid="button-vibe-match"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
        </div>
      </div>

      <VibeMatchModal 
        open={showVibeMatch} 
        onOpenChange={setShowVibeMatch}
      />
    </>
  );
}
