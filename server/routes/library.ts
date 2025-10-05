import type { Express } from "express";
import { eq, and, desc } from "drizzle-orm";
import { getDb, schema } from "../db";
import { z } from "zod";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"; // Temporary single-user ID

// Helper to check if database is available
function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL;
}

function requireDatabase() {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not configured. Please set up a PostgreSQL database in Replit.");
  }
}

// Playlist endpoints
export function registerLibraryRoutes(app: Express) {
  // Get all playlists
  app.get("/api/playlists", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const playlists = await db.query.playlists.findMany({
        where: eq(schema.playlists.userId, DEFAULT_USER_ID),
        orderBy: [desc(schema.playlists.updatedAt)],
      });

      res.json(playlists);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: error.message || "Failed to fetch playlists" });
    }
  });

  // Create playlist
  app.post("/api/playlists", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { name, description } = z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }).parse(req.body);

      const [playlist] = await db.insert(schema.playlists).values({
        userId: DEFAULT_USER_ID,
        name,
        description,
      }).returning();

      res.json(playlist);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid playlist data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to create playlist" });
      }
    }
  });

  // Update playlist
  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { id } = req.params;
      const { name, description } = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
      }).parse(req.body);

      const [playlist] = await db.update(schema.playlists)
        .set({ name, description, updatedAt: new Date() })
        .where(and(
          eq(schema.playlists.id, id),
          eq(schema.playlists.userId, DEFAULT_USER_ID)
        ))
        .returning();

      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
        return;
      }

      res.json(playlist);
    } catch (error: any) {
      console.error("Error updating playlist:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid playlist data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to update playlist" });
      }
    }
  });

  // Delete playlist
  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { id } = req.params;

      await db.delete(schema.playlists)
        .where(and(
          eq(schema.playlists.id, id),
          eq(schema.playlists.userId, DEFAULT_USER_ID)
        ));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: error.message || "Failed to delete playlist" });
    }
  });

  // Get playlist songs
  app.get("/api/playlists/:id/songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { id } = req.params;

      const playlistSongs = await db.query.playlistSongs.findMany({
        where: eq(schema.playlistSongs.playlistId, id),
        with: {
          song: true,
        },
        orderBy: [schema.playlistSongs.position],
      });

      const songs = playlistSongs.map(ps => ps.song);
      res.json(songs);
    } catch (error: any) {
      console.error("Error fetching playlist songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch playlist songs" });
    }
  });

  // Add song to playlist
  app.post("/api/playlists/:id/songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { id } = req.params;
      const songData = req.body;

      // First, ensure the song exists in songs table
      const existingSong = await db.query.songs.findFirst({
        where: eq(schema.songs.id, songData.id),
      });

      if (!existingSong) {
        // Insert the song
        await db.insert(schema.songs).values({
          id: songData.id,
          title: songData.title,
          artist: songData.artist,
          thumbnail: songData.thumbnail,
          duration: songData.duration,
          platform: songData.platform,
          url: songData.url,
          embedUrl: songData.embedUrl,
          publishedAt: songData.publishedAt,
          viewCount: songData.viewCount,
          description: songData.description,
          metadata: songData,
        }).onConflictDoNothing();
      }

      // Get current max position
      const existingPlaylistSongs = await db.query.playlistSongs.findMany({
        where: eq(schema.playlistSongs.playlistId, id),
        orderBy: [desc(schema.playlistSongs.position)],
        limit: 1,
      });

      const nextPosition = existingPlaylistSongs.length > 0 
        ? existingPlaylistSongs[0].position + 1 
        : 0;

      // Add song to playlist
      await db.insert(schema.playlistSongs).values({
        playlistId: id,
        songId: songData.id,
        position: nextPosition,
      }).onConflictDoNothing();

      // Update playlist timestamp
      await db.update(schema.playlists)
        .set({ updatedAt: new Date() })
        .where(eq(schema.playlists.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: error.message || "Failed to add song to playlist" });
    }
  });

  // Remove song from playlist
  app.delete("/api/playlists/:playlistId/songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { playlistId, songId } = req.params;

      await db.delete(schema.playlistSongs)
        .where(and(
          eq(schema.playlistSongs.playlistId, playlistId),
          eq(schema.playlistSongs.songId, songId)
        ));

      // Update playlist timestamp
      await db.update(schema.playlists)
        .set({ updatedAt: new Date() })
        .where(eq(schema.playlists.id, playlistId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing song from playlist:", error);
      res.status(500).json({ error: error.message || "Failed to remove song from playlist" });
    }
  });

  // Get liked songs
  app.get("/api/liked-songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const likedSongs = await db.query.likedSongs.findMany({
        where: eq(schema.likedSongs.userId, DEFAULT_USER_ID),
        with: {
          song: true,
        },
        orderBy: [desc(schema.likedSongs.likedAt)],
      });

      const songs = likedSongs.map(ls => ls.song);
      res.json(songs);
    } catch (error: any) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch liked songs" });
    }
  });

  // Like a song
  app.post("/api/liked-songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const songData = req.body;

      // Ensure song exists
      const existingSong = await db.query.songs.findFirst({
        where: eq(schema.songs.id, songData.id),
      });

      if (!existingSong) {
        await db.insert(schema.songs).values({
          id: songData.id,
          title: songData.title,
          artist: songData.artist,
          thumbnail: songData.thumbnail,
          duration: songData.duration,
          platform: songData.platform,
          url: songData.url,
          embedUrl: songData.embedUrl,
          publishedAt: songData.publishedAt,
          viewCount: songData.viewCount,
          description: songData.description,
          metadata: songData,
        }).onConflictDoNothing();
      }

      // Like the song
      await db.insert(schema.likedSongs).values({
        userId: DEFAULT_USER_ID,
        songId: songData.id,
      }).onConflictDoNothing();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error liking song:", error);
      res.status(500).json({ error: error.message || "Failed to like song" });
    }
  });

  // Unlike a song
  app.delete("/api/liked-songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { songId } = req.params;

      await db.delete(schema.likedSongs)
        .where(and(
          eq(schema.likedSongs.userId, DEFAULT_USER_ID),
          eq(schema.likedSongs.songId, songId)
        ));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error unliking song:", error);
      res.status(500).json({ error: error.message || "Failed to unlike song" });
    }
  });

  // Get saved songs
  app.get("/api/saved-songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const savedSongs = await db.query.savedSongs.findMany({
        where: eq(schema.savedSongs.userId, DEFAULT_USER_ID),
        with: {
          song: true,
        },
        orderBy: [desc(schema.savedSongs.savedAt)],
      });

      const songs = savedSongs.map(ss => ss.song);
      res.json(songs);
    } catch (error: any) {
      console.error("Error fetching saved songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch saved songs" });
    }
  });

  // Save a song
  app.post("/api/saved-songs", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const songData = req.body;

      // Ensure song exists
      const existingSong = await db.query.songs.findFirst({
        where: eq(schema.songs.id, songData.id),
      });

      if (!existingSong) {
        await db.insert(schema.songs).values({
          id: songData.id,
          title: songData.title,
          artist: songData.artist,
          thumbnail: songData.thumbnail,
          duration: songData.duration,
          platform: songData.platform,
          url: songData.url,
          embedUrl: songData.embedUrl,
          publishedAt: songData.publishedAt,
          viewCount: songData.viewCount,
          description: songData.description,
          metadata: songData,
        }).onConflictDoNothing();
      }

      // Save the song
      await db.insert(schema.savedSongs).values({
        userId: DEFAULT_USER_ID,
        songId: songData.id,
      }).onConflictDoNothing();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving song:", error);
      res.status(500).json({ error: error.message || "Failed to save song" });
    }
  });

  // Unsave a song
  app.delete("/api/saved-songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { songId } = req.params;

      await db.delete(schema.savedSongs)
        .where(and(
          eq(schema.savedSongs.userId, DEFAULT_USER_ID),
          eq(schema.savedSongs.songId, songId)
        ));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error unsaving song:", error);
      res.status(500).json({ error: error.message || "Failed to unsave song" });
    }
  });

  // Check if song is liked
  app.get("/api/songs/:songId/is-liked", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { songId } = req.params;

      const liked = await db.query.likedSongs.findFirst({
        where: and(
          eq(schema.likedSongs.userId, DEFAULT_USER_ID),
          eq(schema.likedSongs.songId, songId)
        ),
      });

      res.json({ isLiked: !!liked });
    } catch (error: any) {
      console.error("Error checking if song is liked:", error);
      res.status(500).json({ error: error.message || "Failed to check like status" });
    }
  });

  // Check if song is saved
  app.get("/api/songs/:songId/is-saved", async (req, res) => {
    try {
      requireDatabase();
      const db = getDb();
      
      const { songId } = req.params;

      const saved = await db.query.savedSongs.findFirst({
        where: and(
          eq(schema.savedSongs.userId, DEFAULT_USER_ID),
          eq(schema.savedSongs.songId, songId)
        ),
      });

      res.json({ isSaved: !!saved });
    } catch (error: any) {
      console.error("Error checking if song is saved:", error);
      res.status(500).json({ error: error.message || "Failed to check save status" });
    }
  });

  // Get download info for a song
  app.get("/api/songs/:songId/download", async (req, res) => {
    try {
      const { songId } = req.params;
      const { platform } = req.query;

      // For YouTube, provide the video URL and download instructions
      if (platform === "youtube") {
        res.json({
          url: `https://www.youtube.com/watch?v=${songId}`,
          platform: "youtube",
          instructions: "Click to open in YouTube. You can download using YouTube Premium or third-party tools.",
        });
      } else if (platform === "soundcloud") {
        res.json({
          url: `https://soundcloud.com/${songId}`,
          platform: "soundcloud",
          instructions: "Click to open in SoundCloud. Download availability depends on the artist's settings.",
        });
      } else {
        res.status(400).json({ error: "Invalid platform" });
      }
    } catch (error: any) {
      console.error("Error getting download info:", error);
      res.status(500).json({ error: error.message || "Failed to get download info" });
    }
  });
}
