import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, SlidersHorizontal, Music, Moon, Sun, Menu, LogIn, LogOut, Play, Download } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@shared/schema";
import { FilterPanel } from "@/components/filter-panel";
import { MusicPlayer } from "@/components/music-player";
import { VibeMatchModal } from "@/components/vibe-match-modal";
import { LibrarySidebar } from "@/components/library-sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showVibeMatch, setShowVibeMatch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "popularity" | "publicDomain">("relevance");
  const [platform, setPlatform] = useState<"all" | "jamendo">("all");
  const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(activeQuery)}&sortBy=${sortBy}&platform=${platform}`],
    enabled: !!activeQuery,
  });

  useEffect(() => {
    setSearchQuery(initialQuery);
    setActiveQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePlayTrack = (result: SearchResult) => {
    setCurrentTrack(result);
  };

  return (
    <>
      <LibrarySidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onOpen={() => setShowSidebar(true)}
        onPlayTrack={handlePlayTrack}
      />

      <div className="min-h-screen flex flex-col">
        {/* Menu button - hides beneath sidebar when open */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(true)}
          className={`fixed top-4 left-4 z-30 text-violet-400 hover:text-violet-300 transition-opacity duration-300 ${showSidebar ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search bar at top */}
        <div className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="glass backdrop-blur-xl rounded-full px-6 py-2 flex items-center gap-2">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs..."
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
                  data-testid="input-search-page"
                />
                {searchQuery.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    className="glass backdrop-blur-xl bg-gradient-to-r from-violet-500/80 to-blue-500/80 hover:from-violet-600/80 hover:to-blue-600/80 text-white animate-fade-in"
                  >
                    Search
                  </Button>
                )}
              </div>
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="text-violet-400"
              data-testid="button-filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVibeMatch(true)}
              className="text-violet-400"
              data-testid="button-vibe-match-search"
            >
              <Music className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-violet-400"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {!authLoading && (
              isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-violet-400 hover:text-violet-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="text-violet-400 hover:text-violet-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )
            )}
          </div>
        </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-32">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Found {results.length} results for "{activeQuery}"
              </p>
              <p className="text-sm text-muted-foreground">
                Sorted by: <span className="text-foreground capitalize">{sortBy}</span>
              </p>
            </div>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="glass rounded-lg p-4 hover:bg-white/5 transition-all group"
                  data-testid={`list-result-${result.id}`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate" data-testid={`text-title-${result.id}`}>
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-artist-${result.id}`}>
                        {result.artist}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{result.duration}</span>
                        <span className="text-xs text-violet-400 capitalize">{result.platform}</span>
                        {result.viewCount && (
                          <span className="text-xs text-muted-foreground">
                            {result.viewCount.toLocaleString()} views
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePlayTrack(result)}
                        className="text-violet-400 hover:text-violet-300"
                        data-testid={`button-play-${result.id}`}
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                      {result.downloadUrl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => window.open(result.downloadUrl, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`button-download-${result.id}`}
                        >
                          <Download className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeQuery ? (
          <div className="text-center py-20 space-y-4">
            <Music className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-display">No results found</h3>
            <p className="text-muted-foreground">
              Try different keywords or use Vibe Match to find similar songs
            </p>
          </div>
        ) : null}
      </main>

      {/* Filter panel */}
      <FilterPanel
        open={showFilters}
        onOpenChange={setShowFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        platform={platform}
        setPlatform={setPlatform}
      />

      {/* Music player */}
      {currentTrack && (
        <MusicPlayer
          track={currentTrack}
          onClose={() => setCurrentTrack(null)}
        />
      )}

      {/* Vibe match modal */}
      <VibeMatchModal
        open={showVibeMatch}
        onOpenChange={setShowVibeMatch}
      />
      </div>
    </>
  );
}
