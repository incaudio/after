import { z } from "zod";

// Search result from Jamendo or other platforms
export const searchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  platform: z.string(),
  url: z.string(),
  embedUrl: z.string().optional(),
  streamUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  viewCount: z.number().optional(),
  description: z.string().optional(),
  downloadUrl: z.string().optional(),
  aiScore: z.number().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// Search query parameters
export const searchQuerySchema = z.object({
  query: z.string(),
  sortBy: z.enum(["relevance", "newest", "popularity", "publicDomain"]).default("relevance"),
  platform: z.enum(["all", "jamendo"]).default("all"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Vibe matching request
export const vibeMatchRequestSchema = z.object({
  audioData: z.string(), // base64 encoded audio
  duration: z.number().optional(),
});

export type VibeMatchRequest = z.infer<typeof vibeMatchRequestSchema>;

// Vibe matching response
export const vibeMatchResultSchema = z.object({
  vibes: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    description: z.string().optional(),
  })),
  suggestedSearchTerms: z.array(z.string()),
  mood: z.string().optional(),
  genre: z.string().optional(),
  tempo: z.string().optional(),
});

export type VibeMatchResult = z.infer<typeof vibeMatchResultSchema>;

// Audio recognition request (Shazam-like)
export const audioRecognitionRequestSchema = z.object({
  audioData: z.string(), // base64 encoded audio
  duration: z.number(),
});

export type AudioRecognitionRequest = z.infer<typeof audioRecognitionRequestSchema>;

// Audio recognition response
export const audioRecognitionResultSchema = z.object({
  recognized: z.boolean(),
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  releaseDate: z.string().optional(),
  confidence: z.number().optional(),
});

export type AudioRecognitionResult = z.infer<typeof audioRecognitionResultSchema>;

// Currently playing track
export const currentTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  thumbnail: z.string(),
  platform: z.string(),
  url: z.string(),
  embedUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  aiScore: z.number().optional(),
});

export type CurrentTrack = z.infer<typeof currentTrackSchema>;
