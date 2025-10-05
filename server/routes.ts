import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchJamendo, getTrendingTracks } from "./lib/jamendo";
import { analyzeVibeFromAudio, recognizeAudio } from "./lib/openai-service";
import { searchQuerySchema, vibeMatchRequestSchema, audioRecognitionRequestSchema } from "@shared/schema";
import { registerLibraryRoutes } from "./routes/library";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.get("/api/search", async (req, res) => {
    try {
      const params = searchQuerySchema.parse({
        query: req.query.q,
        sortBy: req.query.sortBy || "relevance",
        platform: req.query.platform || "all",
      });

      let results: any[] = [];

      if (!params.query || params.query.trim() === '') {
        results = await getTrendingTracks(20);
      } else {
        results = await searchJamendo(params.query);
      }

      switch (params.sortBy) {
        case "newest":
          results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          break;
        case "popularity":
          results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case "publicDomain":
          break;
        case "relevance":
        default:
          break;
      }

      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid search parameters", details: error.errors });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
      }
    }
  });

  // Vibe Match endpoint - AI-powered vibe matching
  app.post("/api/vibe-match", async (req, res) => {
    try {
      const { audioData } = vibeMatchRequestSchema.parse(req.body);

      const result = await analyzeVibeFromAudio(audioData);

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Vibe match error:", error);
        res.status(500).json({ error: "Vibe matching failed" });
      }
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
