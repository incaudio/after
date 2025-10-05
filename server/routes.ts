// ...existing code...
import type { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer, type Server } from "http";
import { searchJamendo, getTrendingTracks } from "./lib/jamendo";
// import { analyzeVibeFromAudio, recognizeAudio } from "./lib/openai-service";
import { searchQuerySchema, vibeMatchRequestSchema, audioRecognitionRequestSchema } from "@shared/schema";
import { registerLibraryRoutes } from "./routes/library";
let setupAuth: any = async () => {};
let isAuthenticated: any = (_req: any, _res: any, next: any) => next();
try {
  const replitAuth = require("./replitAuth");
  if (process.env.REPLIT_ENV === "true" || (process.env.ISSUER_URL && process.env.REPL_ID && process.env.REPLIT_DOMAINS && process.env.CLIENT_ID)) {
    setupAuth = replitAuth.setupAuth;
    isAuthenticated = replitAuth.isAuthenticated;
  }
} catch (e) {
  // Auth not available, fallback to no-op
}
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Universal music search endpoint with AI filtering
  app.get('/api/search', async (req, res) => {
    // Debug: log raw results before filtering (see below)
    try {
      const query = req.query.q as string;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Missing or invalid query' });
      }

      // Aggregate results from all sources
      const [jamendo, rapidapi, soundcloud, youtube, itunes] = await Promise.all([
        (await import('./lib/jamendo')).searchJamendo(query, 10).catch(() => []),
        (await import('./lib/rapidapi-music')).searchRapidApiMusic(query, 10).catch(() => []),
        (await import('./lib/soundcloud')).searchSoundCloud(query, 10).catch(() => []),
        (await import('./lib/youtube')).searchYouTube(query, 10).catch(() => []),
        (await import('./lib/itunes')).searchItunes(query, 10).catch(() => []),
      ]);
      let results = [
        ...jamendo,
        ...rapidapi,
        ...soundcloud,
        ...youtube,
        ...itunes,
      ].map(r => {
        const rec: any = r;
        return {
          ...r,
          platform: rec.platform || rec.source || 'unknown',
          description: rec.description || '',
        };
      });

      // Debug: log raw results before filtering
      // eslint-disable-next-line
      console.log('[SEARCH] Raw results:', (results as any[]).map((r: any) => ({id: r.id, title: r.title, url: r.url, platform: r.platform, description: r.description})));

      // AI filter: only tracks, albums, playlists, artists, and only if url allows listening without login
      let filtered = results.filter((r: any) => {
        const url = (r.url || '').toLowerCase();
        const isMusicSite = url.includes('jamendo.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('soundcloud.com') || url.includes('deezer.com');
        const isPublic = isMusicSite && !url.includes('login') && !url.includes('signin');
        const type = (r.platform || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const isMusicType = [
          'track', 'song', 'music', 'album', 'playlist', 'artist',
        ].some(word => type.includes(word) || desc.includes(word));
        return isPublic && isMusicType;
      });

  // Debug: log filtered results after filtering
  // eslint-disable-next-line
  console.log('[SEARCH] Filtered results:', (filtered as any[]).map((r: any) => ({id: r.id, title: r.title, url: r.url, platform: r.platform, description: r.description})));

      // OpenAI-based filtering removed. All filtering is now handled locally or by FreeGPT endpoints.

      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: 'Search failed' });
    }
  });
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  registerLibraryRoutes(app);
  // AI music card suggestions after first search
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { userHistory } = req.body;
      const { getMusicSuggestions } = await import("./lib/ai-suggestions");
      const suggestions = await getMusicSuggestions(userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI suggestion error" });
    }
  });

  // AI search bar suggestions
  app.post("/api/ai/search-suggestions", async (req, res) => {
    try {
      const { currentInput, userHistory } = req.body;
      const { getSearchSuggestions } = await import("./lib/ai-suggestions");
      const suggestions = await getSearchSuggestions(currentInput || "", userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI search suggestion error" });
    }
  });
  // AI Assistant command handler
  app.post("/api/ai/command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ error: "Missing command" });
      }
      // Use FreeGPT for music Q&A
      const { freegptChat } = await import("./lib/freegpt");
      const prompt = `You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including:\n\n- Artist news, biographies, and life stories (past and present)\n- Music history, genres, and movements (from the 19th century to today)\n- Songs, albums, and their stories\n- Record labels, producers, and the business of music\n- Lyrics, songwriting, and composition\n- Music technology, instruments, and production\n- Music awards, charts, and records\n- Anything factual, creative, or newsworthy about music\n\nIf the user asks about anything outside the music world, politely refuse and say you only answer music-related questions. If the user asks for music, search, play, or playlist actions, suggest an action in JSON: { action: '...' }.\n\nUser: ${command}`;
      const reply = await freegptChat({
        messages: [
          { role: "system", content: "You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including artist news, biographies, music history, genres, songs, albums, record labels, lyrics, and more. If the user asks about anything outside the music world, politely refuse and say you only answer music-related questions." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      });
      res.json({ reply });
    } catch (e) {
      res.status(500).json({ error: "AI error" });
    }
  });
// ...existing code...

  // Vibe Match endpoint - text-based, uses FreeGPT
  app.post("/api/vibe-match", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Missing or invalid query' });
      }
      const { freegptChat } = await import("./lib/freegpt");
      const prompt = `You are a music vibe and trend expert. Given the user's search query, suggest:\n- 3-5 musical vibes that match the query\n- 5 trending or similar songs (title and artist)\n\nReply in JSON:\n{\n  "vibes": ["vibe1", "vibe2", ...],\n  "trendingSongs": [{"title": "...", "artist": "..."}, ...]\n}\n\nQuery: ${query}`;
      const text = await freegptChat({
        messages: [
          { role: "system", content: "You are a music vibe and trend expert. Suggest vibes and trending songs for a search query." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      });
      let result = { vibes: [], trendingSongs: [] };
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('Vibe match JSON parse error:', err, text);
      }
      res.json(result);
    } catch (error) {
      console.error("Vibe match error:", error);
      res.status(500).json({ error: "Vibe matching failed" });
    }
  });

  // Audio Recognition endpoint - Shazam-like functionality
  app.post("/api/recognize", async (req, res) => {
    try {
      const { audioData } = audioRecognitionRequestSchema.parse(req.body);

      const result = await recognizeAudio(audioData);

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Audio recognition error:", error);
        res.status(500).json({ error: "Audio recognition failed" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
