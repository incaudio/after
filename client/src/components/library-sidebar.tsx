import { useState, useEffect, useRef } from "react";
import { X, Plus, Heart, Bookmark, ListMusic, ChevronRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchResult } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onPlayTrack: (track: SearchResult) => void;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function LibrarySidebar({ isOpen, onClose, onOpen, onPlayTrack }: LibrarySidebarProps) {
  const [activeSection, setActiveSection] = useState<"playlists" | "liked" | "saved">("playlists");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const queryClient = useQueryClient();

  // Fetch playlists
  const { data: playlists = [], isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: activeSection === "playlists",
  });

  // Fetch liked songs
  const { data: likedSongs = [], isLoading: likedLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/liked-songs"],
    enabled: activeSection === "liked",
  });

  // Fetch saved songs
  const { data: savedSongs = [], isLoading: savedLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/saved-songs"],
    enabled: activeSection === "saved",
  });

  // Fetch playlist songs
  const { data: playlistSongs = [], isLoading: playlistSongsLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/playlists/${selectedPlaylist}/songs`],
    enabled: !!selectedPlaylist,
  });

  // Create playlist mutation
  const createPlaylist = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create playlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setIsCreateDialogOpen(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
    },
  });

  // Delete playlist mutation
  const deletePlaylist = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete playlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setSelectedPlaylist(null);
    },
  });

  // Remove from playlist mutation
  const removeFromPlaylist = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      const res = await fetch(`/api/playlists/${playlistId}/songs/${songId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove song");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${selectedPlaylist}/songs`] });
    },
  });

  // Unlike song mutation
  const unlikeSong = useMutation({
    mutationFn: async (songId: string) => {
      const res = await fetch(`/api/liked-songs/${songId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unlike song");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liked-songs"] });
    },
  });

  // Unsave song mutation
  const unsaveSong = useMutation({
    mutationFn: async (songId: string) => {
      const res = await fetch(`/api/saved-songs/${songId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unsave song");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-songs"] });
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist.mutate({
      name: newPlaylistName,
      description: newPlaylistDescription || undefined,
    });
  };

  const handleDownloadSong = (song: SearchResult) => {
    // Open the song URL in a new tab
    window.open(song.url, "_blank", "noopener,noreferrer");
  };

  // Mobile swipe gesture handling
  useEffect(() => {
    if (!sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      if (isOpen && diff < 0) {
        // Swiping left to close
        setDragOffset(Math.max(diff, -320));
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentX - startX;
      
      if (isOpen && diff < -80) {
        onClose();
      }
      
      setDragOffset(0);
    };

    sidebar.addEventListener("touchstart", handleTouchStart);
    sidebar.addEventListener("touchmove", handleTouchMove);
    sidebar.addEventListener("touchend", handleTouchEnd);
    sidebar.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      sidebar.removeEventListener("touchstart", handleTouchStart);
      sidebar.removeEventListener("touchmove", handleTouchMove);
      sidebar.removeEventListener("touchend", handleTouchEnd);
      sidebar.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isOpen, onClose]);

  // Global swipe from edge to open
  useEffect(() => {
    if (isOpen) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX < 20) {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      if (diff > 0) {
        setDragOffset(Math.min(diff, 320));
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentX - startX;
      
      if (diff > 80 && onOpen) {
        // Open sidebar
        onOpen();
      }
      
      setDragOffset(0);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen]);

  const renderSongList = (songs: SearchResult[], showRemove: boolean = false, onRemove?: (songId: string) => void) => {
    if (songs.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>No songs yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => onPlayTrack(song)}
          >
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSong(song);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              {showRemove && onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(song.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 glass-elevated border-r border-white/20 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          transform: dragOffset !== 0 
            ? `translateX(${isOpen ? dragOffset : -320 + dragOffset}px)` 
            : undefined,
          transition: dragOffset !== 0 ? "none" : undefined,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold">My Library</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-white/20">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "playlists"
                  ? "text-violet-400 border-b-2 border-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveSection("playlists");
                setSelectedPlaylist(null);
              }}
            >
              <ListMusic className="w-4 h-4 inline mr-2" />
              Playlists
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "liked"
                  ? "text-violet-400 border-b-2 border-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveSection("liked");
                setSelectedPlaylist(null);
              }}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Liked
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === "saved"
                  ? "text-violet-400 border-b-2 border-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveSection("saved");
                setSelectedPlaylist(null);
              }}
            >
              <Bookmark className="w-4 h-4 inline mr-2" />
              Saved
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {activeSection === "playlists" && !selectedPlaylist && (
              <div className="space-y-4">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-elevated border-white/20">
                    <DialogHeader>
                      <DialogTitle>Create New Playlist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Input
                          placeholder="Playlist name"
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          className="glass border-white/20"
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Description (optional)"
                          value={newPlaylistDescription}
                          onChange={(e) => setNewPlaylistDescription(e.target.value)}
                          className="glass border-white/20 resize-none"
                          rows={3}
                        />
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                        onClick={handleCreatePlaylist}
                        disabled={!newPlaylistName.trim() || createPlaylist.isPending}
                      >
                        {createPlaylist.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator className="bg-white/20" />

                {playlistsLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading...</div>
                ) : playlists.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No playlists yet</p>
                    <p className="text-xs">Create your first playlist to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => setSelectedPlaylist(playlist.id)}
                      >
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <ListMusic className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{playlist.name}</p>
                          {playlist.description && (
                            <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "playlists" && selectedPlaylist && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlaylist(null)}
                  >
                    ← Back
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this playlist?")) {
                        deletePlaylist.mutate(selectedPlaylist);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Separator className="bg-white/20" />
                {playlistSongsLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading...</div>
                ) : (
                  renderSongList(playlistSongs, true, (songId) => {
                    removeFromPlaylist.mutate({ playlistId: selectedPlaylist, songId });
                  })
                )}
              </div>
            )}

            {activeSection === "liked" && (
              <div>
                {likedLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading...</div>
                ) : (
                  renderSongList(likedSongs, true, (songId) => {
                    unlikeSong.mutate(songId);
                  })
                )}
              </div>
            )}

            {activeSection === "saved" && (
              <div>
                {savedLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading...</div>
                ) : (
                  renderSongList(savedSongs, true, (songId) => {
                    unsaveSong.mutate(songId);
                  })
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
