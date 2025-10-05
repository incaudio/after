import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onPlayTrack?: (track: SearchResult) => void;
}



  // Only sidebar open/close logic remains
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);





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
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <span>Library features are disabled.</span>
                  </div>
                </div>
              </div>
            </>
          );
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
// ...existing code...
                  renderSongList(likedSongs, true, (songId) => {

                    unlikeSong.mutate(songId);
