import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, SlidersHorizontal, Music, Moon, Sun, Menu, Play, Download } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@shared/schema";
import { FilterPanel } from "@/components/filter-panel";
import { VibeMatchModal } from "@/components/vibe-match-modal";


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
  // Removed music player state
  const { theme, setTheme } = useTheme();
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
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(activeQuery)}&sortBy=${sortBy}&platform=${platform}`],
    enabled: !!activeQuery,
  });

  useEffect(() => {
    setSearchQuery(initialQuery);
    setActiveQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (aiMode) {
        setAiLoading(true);
        setAiAnswer(null);
        try {
          const res = await fetch("/api/ai/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: searchQuery.trim() }),
          });
          const data = await res.json();
          setAiAnswer(data.reply || "");
        } catch {
          setAiAnswer("Sorry, AI could not answer your question.");
        }
        setAiLoading(false);
      } else {
        setAiAnswer(null);
      }
    }
  };

  // Removed handlePlayTrack

  return (

  <>


    {/* Menu button - hides beneath sidebar when open */}


    {/* Responsive container for logo and search bar */}
    <div className="max-w-3xl w-full mx-auto px-4 pt-8 pb-4 flex flex-col items-center">
      {/* Logo/Brand just above search bar */}
      <div className="w-full flex flex-col items-center mb-2 sm:mb-4">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent cursor-pointer select-none hover:scale-105 transition-transform duration-200"
          onClick={() => setLocation('/')}
        >
          Mate.
        </h1>
      </div>
      {/* Search bar and controls */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl">
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
            {/* AI toggle icon */}
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
                className={`glass backdrop-blur-xl bg-gradient-to-r from-violet-500/80 to-blue-500/80 hover:from-violet-600/80 hover:to-blue-600/80 animate-fade-in`}
                style={{ color: theme === 'light' ? '#4c1d95' : undefined }}
              >
                Search
              </Button>
            )}
          </div>
        </form>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
        </div>
      </div>
    </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-32">
        {/* AI answer area */}
        {aiMode && activeQuery && (
          <div className="mb-8 p-6 rounded-xl glass-elevated border border-violet-400/30 bg-gradient-to-br from-violet-100/40 to-blue-100/30 text-base text-violet-900 dark:text-violet-100 shadow-lg">
            {aiLoading ? (
              <span>AI is thinking...</span>
            ) : aiAnswer ? (
              <span>{aiAnswer}</span>
            ) : (
              <span className="text-muted-foreground">Ask anything about music, artists, or genres!</span>
            )}
          </div>
        )}
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
                <a
                  key={result.id}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-lg p-4 hover:bg-white/5 transition-all group block"
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
                      <h3 className="font-medium text-sm truncate" data-testid={`text-title-${result.id}`}>{result.title}</h3>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-artist-${result.id}`}>{result.artist}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{result.duration}</span>
                        <span className="text-xs text-violet-400 capitalize">{result.platform}</span>
                        {result.viewCount && (
                          <span className="text-xs text-muted-foreground">{result.viewCount.toLocaleString()} views</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
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

      {/* Music player removed */}

      {/* Vibe match modal */}
      <VibeMatchModal
        open={showVibeMatch}
        onOpenChange={setShowVibeMatch}
      />
    </>
  );
}
