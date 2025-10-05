// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/lib/youtube.ts
import { google } from "googleapis";
var connectionSettings;
async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=youtube",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error("YouTube not connected");
  }
  return accessToken;
}
async function getUncachableYouTubeClient() {
  const accessToken = await getAccessToken();
  return new google.youtube({ version: "v3", auth: accessToken });
}
async function searchYouTube(query, maxResults = 20) {
  try {
    const youtube = await getUncachableYouTubeClient();
    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      videoCategoryId: "10",
      // Music category
      maxResults,
      order: "relevance"
    });
    if (!searchResponse.data.items) {
      return [];
    }
    const videoIds = searchResponse.data.items.map((item) => item.id?.videoId).filter(Boolean);
    if (videoIds.length === 0) {
      return [];
    }
    const videosResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails", "statistics"],
      id: videoIds
    });
    const results = [];
    for (const video of videosResponse.data.items || []) {
      if (!video.id) continue;
      const duration = parseDuration(video.contentDetails?.duration || "PT0S");
      const snippet = video.snippet;
      results.push({
        id: video.id,
        title: snippet?.title || "Unknown",
        artist: snippet?.channelTitle || "Unknown Artist",
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || "",
        duration,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        publishedAt: snippet?.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        description: snippet?.description || ""
      });
    }
    return results;
  } catch (error) {
    console.error("YouTube search error:", error);
    throw new Error("Failed to search YouTube");
  }
}
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// server/lib/soundcloud.ts
async function searchSoundCloud(query, maxResults = 20) {
  try {
    console.log(`SoundCloud search for: ${query} (not implemented - requires API credentials)`);
    return [];
  } catch (error) {
    console.error("SoundCloud search error:", error);
    return [];
  }
}

// server/lib/openai-service.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
var MUSICAL_VIBES = [
  "energetic",
  "calm",
  "melancholic",
  "upbeat",
  "dreamy",
  "intense",
  "romantic",
  "mysterious",
  "joyful",
  "nostalgic",
  "powerful",
  "gentle",
  "dark",
  "bright",
  "ethereal",
  "groovy",
  "chill",
  "aggressive",
  "soothing",
  "euphoric",
  "ambient",
  "dramatic",
  "playful",
  "epic",
  "funky",
  "moody",
  "triumphant",
  "haunting",
  "sensual",
  "rebellious",
  "peaceful",
  "cinematic",
  "bluesy",
  "jazzy",
  "electronic",
  "acoustic",
  "orchestral",
  "minimalist",
  "maximalist",
  "experimental",
  "retro",
  "futuristic",
  "organic",
  "synthetic",
  "rhythmic",
  "melodic",
  "harmonic",
  "dissonant",
  "uplifting",
  "depressing",
  "hopeful",
  "anxious",
  "confident",
  "vulnerable",
  "angry",
  "loving",
  "spiritual",
  "secular",
  "meditative",
  "chaotic",
  "structured",
  "flowing",
  "staccato",
  "legato",
  "major",
  "minor",
  "chromatic",
  "pentatonic",
  "modal",
  "atonal",
  "tonal",
  "polytonal",
  "fast",
  "slow",
  "moderate",
  "accelerating",
  "decelerating",
  "rubato",
  "steady",
  "syncopated",
  "loud",
  "soft",
  "dynamic",
  "static",
  "crescendo",
  "diminuendo",
  "forte",
  "piano",
  "bright",
  "warm",
  "cold",
  "raw",
  "polished",
  "lo-fi",
  "hi-fi",
  "vintage",
  "danceable",
  "contemplative",
  "hypnotic",
  "catchy",
  "complex",
  "simple",
  "layered",
  "sparse",
  "vocal-heavy",
  "instrumental",
  "a cappella",
  "symphonic",
  "chamber",
  "solo",
  "ensemble",
  "choir",
  "traditional",
  "modern",
  "fusion",
  "crossover",
  "genre-bending",
  "pure",
  "hybrid",
  "eclectic",
  "repetitive",
  "varied",
  "progressive",
  "regressive",
  "circular",
  "linear",
  "cyclical",
  "evolving",
  "tribal",
  "urban",
  "rural",
  "cosmic",
  "earthly",
  "celestial",
  "infernal",
  "neutral",
  "masculine",
  "feminine",
  "androgynous",
  "youthful",
  "mature",
  "timeless",
  "dated",
  "contemporary",
  "commercial",
  "underground",
  "mainstream",
  "niche",
  "accessible",
  "challenging",
  "familiar",
  "novel",
  "emotional",
  "intellectual",
  "physical",
  "spiritual",
  "mental",
  "visceral",
  "cerebral",
  "primal",
  "sociable",
  "solitary",
  "communal",
  "individual",
  "collective",
  "personal",
  "universal",
  "specific",
  "celebratory",
  "mourning",
  "reflective",
  "reactive",
  "proactive",
  "passive",
  "active",
  "interactive",
  "narrative",
  "abstract",
  "literal",
  "metaphorical",
  "symbolic",
  "direct",
  "indirect",
  "implicit",
  "improvised",
  "composed",
  "arranged",
  "produced",
  "raw",
  "refined",
  "rough",
  "smooth",
  "textured",
  "clean",
  "distorted",
  "pure",
  "mixed",
  "blended",
  "separated",
  "unified",
  "organic",
  "mechanical",
  "natural",
  "artificial",
  "analog",
  "digital",
  "hybrid",
  "authentic",
  "imitative",
  "original",
  "derivative",
  "innovative",
  "conventional",
  "unconventional",
  "traditional",
  "revolutionary"
];
async function analyzeVibeFromAudio(audioBase64) {
  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const fs2 = await import("fs");
    const path3 = await import("path");
    const os = await import("os");
    const tempFilePath = path3.join(os.tmpdir(), `vibe-${Date.now()}.webm`);
    fs2.writeFileSync(tempFilePath, audioBuffer);
    let transcription = "";
    try {
      const audioReadStream = fs2.createReadStream(tempFilePath);
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: "whisper-1"
      });
      transcription = transcriptionResponse.text;
    } catch (error) {
      console.log("Transcription failed, using AI analysis only");
    }
    fs2.unlinkSync(tempFilePath);
    const analysisPrompt = `You are a music vibe analyzer. Analyze the following hummed/sung melody or audio description and identify the musical vibes, mood, and suggest search terms for finding similar songs.

${transcription ? `Transcribed audio: ${transcription}` : "Audio was hummed or instrumental"}

Identify:
1. Top 5 musical vibes from this list: ${MUSICAL_VIBES.join(", ")}
2. Overall mood and tempo
3. 4-6 specific search terms that would help find similar songs
4. Genre suggestions

Respond in JSON format:
{
  "vibes": [{"name": "vibe_name", "confidence": 0.0-1.0, "description": "brief explanation"}],
  "mood": "overall mood description",
  "tempo": "fast/moderate/slow",
  "genre": "genre suggestion",
  "suggestedSearchTerms": ["search term 1", "search term 2", ...]
}`;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert music analyst specializing in identifying musical vibes and emotions. Always respond with valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      vibes: result.vibes || [],
      suggestedSearchTerms: result.suggestedSearchTerms || [],
      mood: result.mood,
      genre: result.genre,
      tempo: result.tempo
    };
  } catch (error) {
    console.error("Vibe analysis error:", error);
    throw new Error("Failed to analyze vibe");
  }
}
async function recognizeAudio(audioBase64) {
  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const fs2 = await import("fs");
    const path3 = await import("path");
    const os = await import("os");
    const tempFilePath = path3.join(os.tmpdir(), `recognize-${Date.now()}.webm`);
    fs2.writeFileSync(tempFilePath, audioBuffer);
    const audioReadStream = fs2.createReadStream(tempFilePath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1"
    });
    fs2.unlinkSync(tempFilePath);
    if (transcription.text && transcription.text.length > 10) {
      const identificationPrompt = `Identify the song from these lyrics: "${transcription.text}"

If you can identify the song, respond with JSON:
{
  "recognized": true,
  "title": "song title",
  "artist": "artist name",
  "album": "album name (if known)",
  "confidence": 0.0-1.0
}

If you cannot identify it, respond with:
{
  "recognized": false
}`;
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a music identification expert. Identify songs from lyrics accurately. Always respond with valid JSON."
          },
          {
            role: "user",
            content: identificationPrompt
          }
        ],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    }
    return { recognized: false };
  } catch (error) {
    console.error("Audio recognition error:", error);
    return { recognized: false };
  }
}

// shared/schema.ts
import { z } from "zod";
var searchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  platform: z.enum(["youtube", "soundcloud"]),
  url: z.string(),
  embedUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  viewCount: z.number().optional(),
  description: z.string().optional()
});
var searchQuerySchema = z.object({
  query: z.string().min(1),
  sortBy: z.enum(["relevance", "newest", "popularity", "publicDomain"]).default("relevance"),
  platform: z.enum(["all", "youtube", "soundcloud"]).default("all")
});
var vibeMatchRequestSchema = z.object({
  audioData: z.string(),
  // base64 encoded audio
  duration: z.number().optional()
});
var vibeMatchResultSchema = z.object({
  vibes: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    description: z.string().optional()
  })),
  suggestedSearchTerms: z.array(z.string()),
  mood: z.string().optional(),
  genre: z.string().optional(),
  tempo: z.string().optional()
});
var audioRecognitionRequestSchema = z.object({
  audioData: z.string(),
  // base64 encoded audio
  duration: z.number()
});
var audioRecognitionResultSchema = z.object({
  recognized: z.boolean(),
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  releaseDate: z.string().optional(),
  confidence: z.number().optional()
});
var currentTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  thumbnail: z.string(),
  platform: z.enum(["youtube", "soundcloud"]),
  url: z.string(),
  embedUrl: z.string().optional()
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/search", async (req, res) => {
    try {
      const params = searchQuerySchema.parse({
        query: req.query.q,
        sortBy: req.query.sortBy || "relevance",
        platform: req.query.platform || "all"
      });
      let results = [];
      if (params.platform === "all" || params.platform === "youtube") {
        try {
          const youtubeResults = await searchYouTube(params.query);
          results = [...results, ...youtubeResults.map((r) => ({ ...r, platform: "youtube" }))];
        } catch (error) {
          console.error("YouTube search failed:", error);
        }
      }
      if (params.platform === "all" || params.platform === "soundcloud") {
        try {
          const soundcloudResults = await searchSoundCloud(params.query);
          results = [...results, ...soundcloudResults.map((r) => ({ ...r, platform: "soundcloud" }))];
        } catch (error) {
          console.error("SoundCloud search failed:", error);
        }
      }
      switch (params.sortBy) {
        case "newest":
          results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          break;
        case "popularity":
          results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case "publicDomain":
          results = results.filter(
            (r) => r.description?.toLowerCase().includes("creative commons") || r.description?.toLowerCase().includes("public domain")
          );
          break;
        case "relevance":
        default:
          break;
      }
      res.json(results);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid search parameters", details: error.errors });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
      }
    }
  });
  app2.post("/api/vibe-match", async (req, res) => {
    try {
      const { audioData } = vibeMatchRequestSchema.parse(req.body);
      const result = await analyzeVibeFromAudio(audioData);
      res.json(result);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Vibe match error:", error);
        res.status(500).json({ error: "Vibe matching failed" });
      }
    }
  });
  app2.post("/api/recognize", async (req, res) => {
    try {
      const { audioData } = audioRecognitionRequestSchema.parse(req.body);
      const result = await recognizeAudio(audioData);
      res.json(result);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Audio recognition error:", error);
        res.status(500).json({ error: "Audio recognition failed" });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
