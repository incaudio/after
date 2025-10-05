import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Mic, Music, Moon, Sun, Info, Mail, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VibeMatchModal } from "@/components/vibe-match-modal";
import { SearchResult } from "@shared/schema";


export default function HomePage() {

  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiMode, setAiMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiMode') === 'true';
    }
    return false;
  });
  // Sync aiMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiMode', aiMode ? 'true' : 'false');
    }
  }, [aiMode]);
  const [showVibeMatch, setShowVibeMatch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
  const { theme, setTheme } = useTheme();
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const userHistory = useRef<any[]>([]);
  const lastSuggestionQueries = useRef<Set<string>>(new Set());

  // Helper to fetch new AI suggestions
  const fetchAiSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHistory: userHistory.current }),
      });
      const data = await res.json();
      // Filter out suggestions that are the same as last time
      const newSuggestions = (data.suggestions || []).filter((s: any) => !lastSuggestionQueries.current.has(s.query));
      // If all are new, update; else, just use the new ones
      setAiSuggestions(newSuggestions.length > 0 ? newSuggestions.slice(0, 3) : (data.suggestions || []).slice(0, 3));
      lastSuggestionQueries.current = new Set((data.suggestions || []).map((s: any) => s.query));
    } catch {}
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      userHistory.current.push({ type: "search", query: searchQuery.trim(), ts: Date.now() });
      setShowSuggestions(true);
      await fetchAiSuggestions();
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrackSelect = async (track: SearchResult) => {
    setCurrentTrack(track);
    userHistory.current.push({ type: "play", trackId: track.id, ts: Date.now() });
    if (showSuggestions) await fetchAiSuggestions();
  };

  return (
    <>


      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Sidebar toggle button (top left) - always visible */}


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
        </div>

        {/* AI suggestion cards after first search */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiSuggestions.slice(0, 3).map((s, i) => (
              <div key={i} className="glass-elevated rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground mb-4">{s.description}</p>
                <Button onClick={() => setSearchQuery(s.query)} size="sm" className="mt-auto">Try: {s.query}</Button>
              </div>
            ))}
          </div>
        )}

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
                {/* AI toggle button */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`backdrop-blur-md bg-white/10 border border-white/10 px-4 py-1 rounded-full font-bold text-base select-none focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200 shadow-md ${aiMode ? "text-white animate-glow bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg" : "text-violet-400"}`}
                  style={{
                    boxShadow: aiMode ? "0 0 12px 2px var(--theme-accent, #8b5cf6)" : undefined,
                    filter: "blur(0px)",
                    color: theme === 'light' && !aiMode ? '#4c1d95' : undefined // dark violet for light mode
                  }}
                  onClick={() => setAiMode((v) => !v)}
                  title={aiMode ? "AI mode on" : "Enable AI mode"}
                  tabIndex={0}
                >
                  AI
                </Button>
                {searchQuery.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    className={`glass bg-gradient-to-r from-violet-500/80 to-blue-500/80 hover:from-violet-600/90 hover:to-blue-600/90 animate-fade-in backdrop-blur-lg`}
                    style={{ color: theme === 'light' ? '#4c1d95' : undefined }}
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
