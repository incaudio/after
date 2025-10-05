var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertLikedSongSchema: () => insertLikedSongSchema,
  insertPlaylistSchema: () => insertPlaylistSchema,
  insertPlaylistSongSchema: () => insertPlaylistSongSchema,
  insertSavedSongSchema: () => insertSavedSongSchema,
  insertSongSchema: () => insertSongSchema,
  insertUserSchema: () => insertUserSchema,
  likedSongs: () => likedSongs,
  likedSongsRelations: () => likedSongsRelations,
  playlistSongs: () => playlistSongs,
  playlistSongsRelations: () => playlistSongsRelations,
  playlists: () => playlists,
  playlistsRelations: () => playlistsRelations,
  savedSongs: () => savedSongs,
  savedSongsRelations: () => savedSongsRelations,
  selectLikedSongSchema: () => selectLikedSongSchema,
  selectPlaylistSchema: () => selectPlaylistSchema,
  selectPlaylistSongSchema: () => selectPlaylistSongSchema,
  selectSavedSongSchema: () => selectSavedSongSchema,
  selectSongSchema: () => selectSongSchema,
  selectUserSchema: () => selectUserSchema,
  sessions: () => sessions,
  songs: () => songs,
  songsRelations: () => songsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, timestamp, integer, primaryKey, uuid, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var sessions, users, insertUserSchema, selectUserSchema, songs, insertSongSchema, selectSongSchema, playlists, insertPlaylistSchema, selectPlaylistSchema, playlistSongs, insertPlaylistSongSchema, selectPlaylistSongSchema, likedSongs, insertLikedSongSchema, selectLikedSongSchema, savedSongs, insertSavedSongSchema, selectSavedSongSchema, usersRelations, playlistsRelations, songsRelations, playlistSongsRelations, likedSongsRelations, savedSongsRelations;
var init_schema = __esm({
  "server/db/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    songs = pgTable("songs", {
      id: text("id").primaryKey(),
      // platform-specific ID (e.g., YouTube video ID)
      title: text("title").notNull(),
      artist: text("artist").notNull(),
      thumbnail: text("thumbnail").notNull(),
      duration: text("duration"),
      platform: text("platform").notNull(),
      // "youtube" or "soundcloud"
      url: text("url").notNull(),
      embedUrl: text("embed_url"),
      publishedAt: text("published_at"),
      viewCount: integer("view_count"),
      description: text("description"),
      metadata: jsonb("metadata"),
      // Store full SearchResult as JSON
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertSongSchema = createInsertSchema(songs);
    selectSongSchema = createSelectSchema(songs);
    playlists = pgTable("playlists", {
      id: uuid("id").defaultRandom().primaryKey(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      name: text("name").notNull(),
      description: text("description"),
      thumbnail: text("thumbnail"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertPlaylistSchema = createInsertSchema(playlists);
    selectPlaylistSchema = createSelectSchema(playlists);
    playlistSongs = pgTable("playlist_songs", {
      playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
      songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
      position: integer("position").notNull().default(0),
      // For ordering songs in playlist
      addedAt: timestamp("added_at").defaultNow().notNull()
    }, (table) => ({
      pk: primaryKey({ columns: [table.playlistId, table.songId] })
    }));
    insertPlaylistSongSchema = createInsertSchema(playlistSongs);
    selectPlaylistSongSchema = createSelectSchema(playlistSongs);
    likedSongs = pgTable("liked_songs", {
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
      likedAt: timestamp("liked_at").defaultNow().notNull()
    }, (table) => ({
      pk: primaryKey({ columns: [table.userId, table.songId] })
    }));
    insertLikedSongSchema = createInsertSchema(likedSongs);
    selectLikedSongSchema = createSelectSchema(likedSongs);
    savedSongs = pgTable("saved_songs", {
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
      savedAt: timestamp("saved_at").defaultNow().notNull()
    }, (table) => ({
      pk: primaryKey({ columns: [table.userId, table.songId] })
    }));
    insertSavedSongSchema = createInsertSchema(savedSongs);
    selectSavedSongSchema = createSelectSchema(savedSongs);
    usersRelations = relations(users, ({ many }) => ({
      playlists: many(playlists),
      likedSongs: many(likedSongs),
      savedSongs: many(savedSongs)
    }));
    playlistsRelations = relations(playlists, ({ one, many }) => ({
      user: one(users, {
        fields: [playlists.userId],
        references: [users.id]
      }),
      playlistSongs: many(playlistSongs)
    }));
    songsRelations = relations(songs, ({ many }) => ({
      playlistSongs: many(playlistSongs),
      likedBy: many(likedSongs),
      savedBy: many(savedSongs)
    }));
    playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
      playlist: one(playlists, {
        fields: [playlistSongs.playlistId],
        references: [playlists.id]
      }),
      song: one(songs, {
        fields: [playlistSongs.songId],
        references: [songs.id]
      })
    }));
    likedSongsRelations = relations(likedSongs, ({ one }) => ({
      user: one(users, {
        fields: [likedSongs.userId],
        references: [users.id]
      }),
      song: one(songs, {
        fields: [likedSongs.songId],
        references: [songs.id]
      })
    }));
    savedSongsRelations = relations(savedSongs, ({ one }) => ({
      user: one(users, {
        fields: [savedSongs.userId],
        references: [users.id]
      }),
      song: one(songs, {
        fields: [savedSongs.songId],
        references: [songs.id]
      })
    }));
  }
});

// server/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client2 = postgres(process.env.DATABASE_URL);
    db = drizzle(client2, { schema: schema_exports });
  }
  return db;
}
var db;
var init_db = __esm({
  "server/db/index.ts"() {
    "use strict";
    init_schema();
    db = null;
  }
});

// server/storage.ts
import { eq as eq2 } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      async getUser(id) {
        const db2 = getDb();
        const [user] = await db2.select().from(users).where(eq2(users.id, id));
        return user;
      }
      async upsertUser(userData) {
        const db2 = getDb();
        const [user] = await db2.insert(users).values(userData).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/replitAuth.ts
var replitAuth_exports = {};
__export(replitAuth_exports, {
  getSession: () => getSession,
  isAuthenticated: () => isAuthenticated,
  setupAuth: () => setupAuth
});
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var getOidcConfig, isAuthenticated;
var init_replitAuth = __esm({
  "server/replitAuth.ts"() {
    "use strict";
    init_storage();
    if (process.env.REPLIT_ENV === "true" && !process.env.REPLIT_DOMAINS) {
      throw new Error("Environment variable REPLIT_DOMAINS not provided");
    }
    getOidcConfig = memoize(
      async () => {
        return await client.discovery(
          new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
          process.env.REPL_ID
        );
      },
      { maxAge: 3600 * 1e3 }
    );
    isAuthenticated = async (req, res, next) => {
      const user = req.user;
      if (!req.isAuthenticated() || !user.expires_at) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const now = Math.floor(Date.now() / 1e3);
      if (now <= user.expires_at) {
        return next();
      }
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
    };
  }
});

// server/lib/jamendo.ts
var jamendo_exports = {};
__export(jamendo_exports, {
  getTrendingTracks: () => getTrendingTracks,
  searchJamendo: () => searchJamendo
});
import axios from "axios";
async function searchJamendo(query, maxResults = 20) {
  try {
    const response = await axios.get("https://api.jamendo.com/v3.0/tracks/", {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: "json",
        namesearch: query,
        limit: maxResults * 2,
        include: "musicinfo",
        audioformat: "mp32",
        imagesize: 300
      }
    });
    const tracks = response.data.results || [];
    const results = tracks.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      thumbnail: track.image || `https://api.jamendo.com/v3.0/albums/artwork/?id=${track.id}&size=300`,
      duration: formatDuration(track.duration),
      url: track.shareurl,
      embedUrl: track.audio,
      publishedAt: track.releasedate,
      viewCount: Math.floor(track.popularity * 1e3),
      description: `${track.album_name || "Single"} by ${track.artist_name}`,
      platform: "jamendo",
      downloadUrl: track.audiodownload,
      aiScore: calculateAIScore(track, query)
    }));
    return results.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)).slice(0, maxResults);
  } catch (error) {
    console.error("Jamendo search error:", error);
    throw new Error("Failed to search Jamendo");
  }
}
function calculateAIScore(track, query) {
  let score = track.popularity || 0;
  const queryLower = query.toLowerCase();
  const titleLower = track.name.toLowerCase();
  const artistLower = track.artist_name.toLowerCase();
  if (titleLower.includes(queryLower)) score += 50;
  if (artistLower.includes(queryLower)) score += 30;
  if (titleLower === queryLower) score += 100;
  if (artistLower === queryLower) score += 80;
  const titleWords = titleLower.split(" ");
  const queryWords = queryLower.split(" ");
  const matchingWords = queryWords.filter((word) => titleWords.includes(word)).length;
  score += matchingWords * 10;
  return score;
}
async function getTrendingTracks(limit = 20) {
  try {
    const response = await axios.get("https://api.jamendo.com/v3.0/tracks/", {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: "json",
        order: "popularity_total",
        limit,
        include: "musicinfo",
        audioformat: "mp32",
        imagesize: 300
      }
    });
    const tracks = response.data.results || [];
    return tracks.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      thumbnail: track.image,
      duration: formatDuration(track.duration),
      url: track.shareurl,
      embedUrl: track.audio,
      publishedAt: track.releasedate,
      viewCount: Math.floor(track.popularity * 1e3),
      description: `${track.album_name || "Single"} by ${track.artist_name}`,
      platform: "jamendo",
      downloadUrl: track.audiodownload
    }));
  } catch (error) {
    console.error("Jamendo trending error:", error);
    return [];
  }
}
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
var JAMENDO_CLIENT_ID;
var init_jamendo = __esm({
  "server/lib/jamendo.ts"() {
    "use strict";
    JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "ecc95144";
  }
});

// server/lib/rapidapi-music.ts
var rapidapi_music_exports = {};
__export(rapidapi_music_exports, {
  searchRapidApiMusic: () => searchRapidApiMusic
});
import axios2 from "axios";
async function searchRapidApiMusic(query, maxResults = 20) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY not set");
  const url = "https://deezerdevs-deezer.p.rapidapi.com/search";
  const headers = {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com"
  };
  const response = await axios2.get(url, {
    params: { q: query },
    headers
  });
  return (response.data.data || []).slice(0, maxResults).map((track) => ({
    id: track.id.toString(),
    title: track.title,
    artist: track.artist.name,
    album: track.album?.title,
    thumbnail: track.album?.cover_medium || "",
    duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`,
    url: track.link,
    streamUrl: track.preview,
    // 30s preview
    downloadUrl: track.link,
    // Deezer does not provide direct download, but you can use the link
    publishedAt: void 0,
    viewCount: void 0,
    description: track.album?.title,
    platform: "deezer"
  }));
}
var init_rapidapi_music = __esm({
  "server/lib/rapidapi-music.ts"() {
    "use strict";
  }
});

// server/lib/soundcloud.ts
var soundcloud_exports = {};
__export(soundcloud_exports, {
  formatDuration: () => formatDuration2,
  searchSoundCloud: () => searchSoundCloud
});
async function searchSoundCloud(query, maxResults = 20) {
  try {
    console.log(`SoundCloud search for: ${query} (not implemented - requires API credentials)`);
    return [];
  } catch (error) {
    console.error("SoundCloud search error:", error);
    return [];
  }
}
function formatDuration2(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
var init_soundcloud = __esm({
  "server/lib/soundcloud.ts"() {
    "use strict";
  }
});

// server/lib/youtube.ts
var youtube_exports = {};
__export(youtube_exports, {
  getUncachableYouTubeClient: () => getUncachableYouTubeClient,
  searchYouTube: () => searchYouTube
});
import { google } from "googleapis";
async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("YouTube connection not available - X_REPLIT_TOKEN not found");
  }
  if (!hostname) {
    throw new Error("YouTube connection not available - REPLIT_CONNECTORS_HOSTNAME not found");
  }
  try {
    const response = await fetch(
      "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=youtube",
      {
        headers: {
          "Accept": "application/json",
          "X_REPLIT_TOKEN": xReplitToken
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube connection: ${response.status}`);
    }
    const data = await response.json();
    connectionSettings = data.items?.[0];
    if (!connectionSettings) {
      throw new Error("YouTube connection not configured. Please set up the YouTube connector in Replit.");
    }
    const accessToken = connectionSettings.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
    if (!accessToken) {
      throw new Error("YouTube access token not available. Please reconnect the YouTube connector.");
    }
    return accessToken;
  } catch (error) {
    console.error("YouTube connection error:", error);
    throw error;
  }
}
async function getUncachableYouTubeClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.youtube({
    version: "v3",
    auth: oauth2Client
  });
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
var connectionSettings;
var init_youtube = __esm({
  "server/lib/youtube.ts"() {
    "use strict";
  }
});

// server/lib/itunes.ts
var itunes_exports = {};
__export(itunes_exports, {
  searchItunes: () => searchItunes
});
import axios3 from "axios";
async function searchItunes(query, maxResults = 20) {
  const url = "https://itunes.apple.com/search";
  const response = await axios3.get(url, {
    params: {
      term: query,
      media: "music",
      limit: maxResults
    }
  });
  return (response.data.results || []).map((item) => ({
    id: item.trackId ? String(item.trackId) : item.collectionId ? String(item.collectionId) : item.artistId ? String(item.artistId) : item.trackName,
    title: item.trackName || item.collectionName || item.artistName,
    artist: item.artistName,
    thumbnail: item.artworkUrl100 || "",
    duration: item.trackTimeMillis ? `${Math.floor(item.trackTimeMillis / 6e4)}:${(item.trackTimeMillis % 6e4 / 1e3).toFixed(0).padStart(2, "0")}` : "",
    url: item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl || "",
    platform: "itunes",
    description: item.collectionName || "",
    publishedAt: item.releaseDate || "",
    viewCount: void 0,
    embedUrl: void 0,
    streamUrl: void 0,
    downloadUrl: void 0,
    aiScore: void 0
  }));
}
var init_itunes = __esm({
  "server/lib/itunes.ts"() {
    "use strict";
  }
});

// server/lib/freegpt.ts
var freegpt_exports = {};
__export(freegpt_exports, {
  freegptChat: () => freegptChat
});
import fetch2 from "node-fetch";
async function freegptChat({ messages, model = "gpt-3.5-turbo", max_tokens = 400, temperature = 0.7 }) {
  const res = await fetch2(FREEGPT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature
    })
  });
  if (!res.ok) {
    const text2 = await res.text();
    throw new Error(`FreeGPT error: ${res.status} ${text2}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
var FREEGPT_API_URL;
var init_freegpt = __esm({
  "server/lib/freegpt.ts"() {
    "use strict";
    FREEGPT_API_URL = "https://api.chatanywhere.com.cn/v1/chat/completions";
  }
});

// server/lib/ai-suggestions.ts
var ai_suggestions_exports = {};
__export(ai_suggestions_exports, {
  getMusicSuggestions: () => getMusicSuggestions,
  getSearchSuggestions: () => getSearchSuggestions
});
async function getMusicSuggestions(userHistory) {
  try {
    const prompt = `You are a music recommendation AI. Based on the following user actions (searches, plays, likes), suggest 3 music cards (title, description, query) that would be relevant and interesting.
User history: ${JSON.stringify(userHistory)}
Reply as a JSON array.`;
    const text2 = await freegptChat({
      messages: [
        { role: "system", content: "You are a music recommendation AI. Suggest 3 music cards based on user history." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    try {
      const arr = JSON.parse(text2);
      if (Array.isArray(arr)) return arr;
    } catch (err) {
      console.error("AI suggestion JSON parse error:", err, text2);
    }
    return [];
  } catch (err) {
    console.error("AI suggestion error:", err);
    return [];
  }
}
async function getSearchSuggestions(currentInput, userHistory) {
  try {
    const prompt = `You are a smart search suggestion AI for a music app. Given the user's current input and history, suggest 3 full-sentence search queries they might want to try.
Current input: "${currentInput}"
User history: ${JSON.stringify(userHistory)}
Reply as a JSON array of strings.`;
    const text2 = await freegptChat({
      messages: [
        { role: "system", content: "You are a search suggestion AI for a music app." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    try {
      const arr = JSON.parse(text2);
      if (Array.isArray(arr)) return arr;
    } catch (err) {
      console.error("AI search suggestion JSON parse error:", err, text2);
    }
    return [];
  } catch (err) {
    console.error("AI search suggestion error:", err);
    return [];
  }
}
var init_ai_suggestions = __esm({
  "server/lib/ai-suggestions.ts"() {
    "use strict";
    init_freegpt();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import dotenv from "dotenv";
import { createServer } from "http";

// shared/schema.ts
import { z } from "zod";
var searchResultSchema = z.object({
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
  aiScore: z.number().optional()
});
var searchQuerySchema = z.object({
  query: z.string(),
  sortBy: z.enum(["relevance", "newest", "popularity", "publicDomain"]).default("relevance"),
  platform: z.enum(["all", "jamendo"]).default("all")
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
  platform: z.string(),
  url: z.string(),
  embedUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  aiScore: z.number().optional()
});

// server/routes/library.ts
init_db();
import { eq, and, desc } from "drizzle-orm";
import { z as z2 } from "zod";
var DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";
function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL;
}
function requireDatabase() {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not configured. Please set up a PostgreSQL database in Replit.");
  }
}
function registerLibraryRoutes(app2) {
  app2.get("/api/playlists", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const playlists2 = await db2.query.playlists.findMany({
        where: eq(schema_exports.playlists.userId, DEFAULT_USER_ID),
        orderBy: [desc(schema_exports.playlists.updatedAt)]
      });
      res.json(playlists2);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: error.message || "Failed to fetch playlists" });
    }
  });
  app2.post("/api/playlists", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { name, description } = z2.object({
        name: z2.string().min(1).max(100),
        description: z2.string().max(500).optional()
      }).parse(req.body);
      const [playlist] = await db2.insert(schema_exports.playlists).values({
        userId: DEFAULT_USER_ID,
        name,
        description
      }).returning();
      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid playlist data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to create playlist" });
      }
    }
  });
  app2.patch("/api/playlists/:id", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { id } = req.params;
      const { name, description } = z2.object({
        name: z2.string().min(1).max(100).optional(),
        description: z2.string().max(500).optional()
      }).parse(req.body);
      const [playlist] = await db2.update(schema_exports.playlists).set({ name, description, updatedAt: /* @__PURE__ */ new Date() }).where(and(
        eq(schema_exports.playlists.id, id),
        eq(schema_exports.playlists.userId, DEFAULT_USER_ID)
      )).returning();
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
        return;
      }
      res.json(playlist);
    } catch (error) {
      console.error("Error updating playlist:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: "Invalid playlist data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to update playlist" });
      }
    }
  });
  app2.delete("/api/playlists/:id", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { id } = req.params;
      await db2.delete(schema_exports.playlists).where(and(
        eq(schema_exports.playlists.id, id),
        eq(schema_exports.playlists.userId, DEFAULT_USER_ID)
      ));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: error.message || "Failed to delete playlist" });
    }
  });
  app2.get("/api/playlists/:id/songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { id } = req.params;
      const playlistSongs2 = await db2.query.playlistSongs.findMany({
        where: eq(schema_exports.playlistSongs.playlistId, id),
        with: {
          song: true
        },
        orderBy: [schema_exports.playlistSongs.position]
      });
      const songs2 = playlistSongs2.map((ps) => ps.song);
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch playlist songs" });
    }
  });
  app2.post("/api/playlists/:id/songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { id } = req.params;
      const songData = req.body;
      const existingSong = await db2.query.songs.findFirst({
        where: eq(schema_exports.songs.id, songData.id)
      });
      if (!existingSong) {
        await db2.insert(schema_exports.songs).values({
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
          metadata: songData
        }).onConflictDoNothing();
      }
      const existingPlaylistSongs = await db2.query.playlistSongs.findMany({
        where: eq(schema_exports.playlistSongs.playlistId, id),
        orderBy: [desc(schema_exports.playlistSongs.position)],
        limit: 1
      });
      const nextPosition = existingPlaylistSongs.length > 0 ? existingPlaylistSongs[0].position + 1 : 0;
      await db2.insert(schema_exports.playlistSongs).values({
        playlistId: id,
        songId: songData.id,
        position: nextPosition
      }).onConflictDoNothing();
      await db2.update(schema_exports.playlists).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(schema_exports.playlists.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: error.message || "Failed to add song to playlist" });
    }
  });
  app2.delete("/api/playlists/:playlistId/songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { playlistId, songId } = req.params;
      await db2.delete(schema_exports.playlistSongs).where(and(
        eq(schema_exports.playlistSongs.playlistId, playlistId),
        eq(schema_exports.playlistSongs.songId, songId)
      ));
      await db2.update(schema_exports.playlists).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(schema_exports.playlists.id, playlistId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      res.status(500).json({ error: error.message || "Failed to remove song from playlist" });
    }
  });
  app2.get("/api/liked-songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const likedSongs2 = await db2.query.likedSongs.findMany({
        where: eq(schema_exports.likedSongs.userId, DEFAULT_USER_ID),
        with: {
          song: true
        },
        orderBy: [desc(schema_exports.likedSongs.likedAt)]
      });
      const songs2 = likedSongs2.map((ls) => ls.song);
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch liked songs" });
    }
  });
  app2.post("/api/liked-songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const songData = req.body;
      const existingSong = await db2.query.songs.findFirst({
        where: eq(schema_exports.songs.id, songData.id)
      });
      if (!existingSong) {
        await db2.insert(schema_exports.songs).values({
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
          metadata: songData
        }).onConflictDoNothing();
      }
      await db2.insert(schema_exports.likedSongs).values({
        userId: DEFAULT_USER_ID,
        songId: songData.id
      }).onConflictDoNothing();
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking song:", error);
      res.status(500).json({ error: error.message || "Failed to like song" });
    }
  });
  app2.delete("/api/liked-songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { songId } = req.params;
      await db2.delete(schema_exports.likedSongs).where(and(
        eq(schema_exports.likedSongs.userId, DEFAULT_USER_ID),
        eq(schema_exports.likedSongs.songId, songId)
      ));
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking song:", error);
      res.status(500).json({ error: error.message || "Failed to unlike song" });
    }
  });
  app2.get("/api/saved-songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const savedSongs2 = await db2.query.savedSongs.findMany({
        where: eq(schema_exports.savedSongs.userId, DEFAULT_USER_ID),
        with: {
          song: true
        },
        orderBy: [desc(schema_exports.savedSongs.savedAt)]
      });
      const songs2 = savedSongs2.map((ss) => ss.song);
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching saved songs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch saved songs" });
    }
  });
  app2.post("/api/saved-songs", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const songData = req.body;
      const existingSong = await db2.query.songs.findFirst({
        where: eq(schema_exports.songs.id, songData.id)
      });
      if (!existingSong) {
        await db2.insert(schema_exports.songs).values({
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
          metadata: songData
        }).onConflictDoNothing();
      }
      await db2.insert(schema_exports.savedSongs).values({
        userId: DEFAULT_USER_ID,
        songId: songData.id
      }).onConflictDoNothing();
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving song:", error);
      res.status(500).json({ error: error.message || "Failed to save song" });
    }
  });
  app2.delete("/api/saved-songs/:songId", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { songId } = req.params;
      await db2.delete(schema_exports.savedSongs).where(and(
        eq(schema_exports.savedSongs.userId, DEFAULT_USER_ID),
        eq(schema_exports.savedSongs.songId, songId)
      ));
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving song:", error);
      res.status(500).json({ error: error.message || "Failed to unsave song" });
    }
  });
  app2.get("/api/songs/:songId/is-liked", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { songId } = req.params;
      const liked = await db2.query.likedSongs.findFirst({
        where: and(
          eq(schema_exports.likedSongs.userId, DEFAULT_USER_ID),
          eq(schema_exports.likedSongs.songId, songId)
        )
      });
      res.json({ isLiked: !!liked });
    } catch (error) {
      console.error("Error checking if song is liked:", error);
      res.status(500).json({ error: error.message || "Failed to check like status" });
    }
  });
  app2.get("/api/songs/:songId/is-saved", async (req, res) => {
    try {
      requireDatabase();
      const db2 = getDb();
      const { songId } = req.params;
      const saved = await db2.query.savedSongs.findFirst({
        where: and(
          eq(schema_exports.savedSongs.userId, DEFAULT_USER_ID),
          eq(schema_exports.savedSongs.songId, songId)
        )
      });
      res.json({ isSaved: !!saved });
    } catch (error) {
      console.error("Error checking if song is saved:", error);
      res.status(500).json({ error: error.message || "Failed to check save status" });
    }
  });
  app2.get("/api/songs/:songId/download", async (req, res) => {
    try {
      const { songId } = req.params;
      const { platform } = req.query;
      if (platform === "youtube") {
        res.json({
          url: `https://www.youtube.com/watch?v=${songId}`,
          platform: "youtube",
          instructions: "Click to open in YouTube. You can download using YouTube Premium or third-party tools."
        });
      } else if (platform === "soundcloud") {
        res.json({
          url: `https://soundcloud.com/${songId}`,
          platform: "soundcloud",
          instructions: "Click to open in SoundCloud. Download availability depends on the artist's settings."
        });
      } else {
        res.status(400).json({ error: "Invalid platform" });
      }
    } catch (error) {
      console.error("Error getting download info:", error);
      res.status(500).json({ error: error.message || "Failed to get download info" });
    }
  });
}

// server/routes.ts
init_storage();
import { z as z3 } from "zod";
dotenv.config();
var setupAuth2 = async () => {
};
var isAuthenticated2 = (_req, _res, next) => next();
try {
  const replitAuth = (init_replitAuth(), __toCommonJS(replitAuth_exports));
  if (process.env.REPLIT_ENV === "true" || process.env.ISSUER_URL && process.env.REPL_ID && process.env.REPLIT_DOMAINS && process.env.CLIENT_ID) {
    setupAuth2 = replitAuth.setupAuth;
    isAuthenticated2 = replitAuth.isAuthenticated;
  }
} catch (e) {
}
async function registerRoutes(app2) {
  app2.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "Missing or invalid query" });
      }
      const [jamendo, rapidapi, soundcloud, youtube, itunes] = await Promise.all([
        (await Promise.resolve().then(() => (init_jamendo(), jamendo_exports))).searchJamendo(query, 10).catch(() => []),
        (await Promise.resolve().then(() => (init_rapidapi_music(), rapidapi_music_exports))).searchRapidApiMusic(query, 10).catch(() => []),
        (await Promise.resolve().then(() => (init_soundcloud(), soundcloud_exports))).searchSoundCloud(query, 10).catch(() => []),
        (await Promise.resolve().then(() => (init_youtube(), youtube_exports))).searchYouTube(query, 10).catch(() => []),
        (await Promise.resolve().then(() => (init_itunes(), itunes_exports))).searchItunes(query, 10).catch(() => [])
      ]);
      let results = [
        ...jamendo,
        ...rapidapi,
        ...soundcloud,
        ...youtube,
        ...itunes
      ].map((r) => {
        const rec = r;
        return {
          ...r,
          platform: rec.platform || rec.source || "unknown",
          description: rec.description || ""
        };
      });
      console.log("[SEARCH] Raw results:", results.map((r) => ({ id: r.id, title: r.title, url: r.url, platform: r.platform, description: r.description })));
      let filtered = results.filter((r) => {
        const url = (r.url || "").toLowerCase();
        const isMusicSite = url.includes("jamendo.com") || url.includes("youtube.com") || url.includes("youtu.be") || url.includes("soundcloud.com") || url.includes("deezer.com");
        const isPublic = isMusicSite && !url.includes("login") && !url.includes("signin");
        const type = (r.platform || "").toLowerCase();
        const desc2 = (r.description || "").toLowerCase();
        const isMusicType = [
          "track",
          "song",
          "music",
          "album",
          "playlist",
          "artist"
        ].some((word) => type.includes(word) || desc2.includes(word));
        return isPublic && isMusicType;
      });
      console.log("[SEARCH] Filtered results:", filtered.map((r) => ({ id: r.id, title: r.title, url: r.url, platform: r.platform, description: r.description })));
      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: "Search failed" });
    }
  });
  await setupAuth2(app2);
  app2.get("/api/auth/user", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  registerLibraryRoutes(app2);
  app2.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { userHistory } = req.body;
      const { getMusicSuggestions: getMusicSuggestions2 } = await Promise.resolve().then(() => (init_ai_suggestions(), ai_suggestions_exports));
      const suggestions = await getMusicSuggestions2(userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI suggestion error" });
    }
  });
  app2.post("/api/ai/search-suggestions", async (req, res) => {
    try {
      const { currentInput, userHistory } = req.body;
      const { getSearchSuggestions: getSearchSuggestions2 } = await Promise.resolve().then(() => (init_ai_suggestions(), ai_suggestions_exports));
      const suggestions = await getSearchSuggestions2(currentInput || "", userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI search suggestion error" });
    }
  });
  app2.post("/api/ai/command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ error: "Missing command" });
      }
      const { freegptChat: freegptChat2 } = await Promise.resolve().then(() => (init_freegpt(), freegpt_exports));
      const prompt = `You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including:

- Artist news, biographies, and life stories (past and present)
- Music history, genres, and movements (from the 19th century to today)
- Songs, albums, and their stories
- Record labels, producers, and the business of music
- Lyrics, songwriting, and composition
- Music technology, instruments, and production
- Music awards, charts, and records
- Anything factual, creative, or newsworthy about music

If the user asks about anything outside the music world, politely refuse and say you only answer music-related questions. If the user asks for music, search, play, or playlist actions, suggest an action in JSON: { action: '...' }.

User: ${command}`;
      const reply = await freegptChat2({
        messages: [
          { role: "system", content: "You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including artist news, biographies, music history, genres, songs, albums, record labels, lyrics, and more. If the user asks about anything outside the music world, politely refuse and say you only answer music-related questions." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400
      });
      res.json({ reply });
    } catch (e) {
      res.status(500).json({ error: "AI error" });
    }
  });
  app2.post("/api/vibe-match", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "Missing or invalid query" });
      }
      const { freegptChat: freegptChat2 } = await Promise.resolve().then(() => (init_freegpt(), freegpt_exports));
      const prompt = `You are a music vibe and trend expert. Given the user's search query, suggest:
- 3-5 musical vibes that match the query
- 5 trending or similar songs (title and artist)

Reply in JSON:
{
  "vibes": ["vibe1", "vibe2", ...],
  "trendingSongs": [{"title": "...", "artist": "..."}, ...]
}

Query: ${query}`;
      const text2 = await freegptChat2({
        messages: [
          { role: "system", content: "You are a music vibe and trend expert. Suggest vibes and trending songs for a search query." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400
      });
      let result = { vibes: [], trendingSongs: [] };
      try {
        result = JSON.parse(text2);
      } catch (err) {
        console.error("Vibe match JSON parse error:", err, text2);
      }
      res.json(result);
    } catch (error) {
      console.error("Vibe match error:", error);
      res.status(500).json({ error: "Vibe matching failed" });
    }
  });
  app2.post("/api/recognize", async (req, res) => {
    try {
      const { audioData } = audioRecognitionRequestSchema.parse(req.body);
      const result = await recognizeAudio(audioData);
      res.json(result);
    } catch (error) {
      if (error instanceof z3.ZodError) {
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
    host: "0.0.0.0",
    port: 5e3,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: "wss"
    },
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
