import { pgTable, text, timestamp, integer, primaryKey, uuid, jsonb, varchar, index, sql } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Songs table - stores song metadata
export const songs = pgTable("songs", {
  id: text("id").primaryKey(), // platform-specific ID (e.g., YouTube video ID)
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: text("duration"),
  platform: text("platform").notNull(), // "youtube" or "soundcloud"
  url: text("url").notNull(),
  embedUrl: text("embed_url"),
  publishedAt: text("published_at"),
  viewCount: integer("view_count"),
  description: text("description"),
  metadata: jsonb("metadata"), // Store full SearchResult as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSongSchema = createInsertSchema(songs);
export const selectSongSchema = createSelectSchema(songs);

// Playlists table
export const playlists = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlaylistSchema = createInsertSchema(playlists);
export const selectPlaylistSchema = createSelectSchema(playlists);

// Playlist songs - many-to-many relationship
export const playlistSongs = pgTable("playlist_songs", {
  playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  position: integer("position").notNull().default(0), // For ordering songs in playlist
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.playlistId, table.songId] }),
}));

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs);
export const selectPlaylistSongSchema = createSelectSchema(playlistSongs);

// Liked songs table
export const likedSongs = pgTable("liked_songs", {
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  likedAt: timestamp("liked_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.songId] }),
}));

export const insertLikedSongSchema = createInsertSchema(likedSongs);
export const selectLikedSongSchema = createSelectSchema(likedSongs);

// Saved songs table (for "Save for Later")
export const savedSongs = pgTable("saved_songs", {
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").references(() => songs.id, { onDelete: "cascade" }).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.songId] }),
}));

export const insertSavedSongSchema = createInsertSchema(savedSongs);
export const selectSavedSongSchema = createSelectSchema(savedSongs);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type InsertSong = typeof songs.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertPlaylistSong = typeof playlistSongs.$inferInsert;
export type LikedSong = typeof likedSongs.$inferSelect;
export type InsertLikedSong = typeof likedSongs.$inferInsert;
export type SavedSong = typeof savedSongs.$inferSelect;
export type InsertSavedSong = typeof savedSongs.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  playlists: many(playlists),
  likedSongs: many(likedSongs),
  savedSongs: many(savedSongs),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistSongs: many(playlistSongs),
}));

export const songsRelations = relations(songs, ({ many }) => ({
  playlistSongs: many(playlistSongs),
  likedBy: many(likedSongs),
  savedBy: many(savedSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const likedSongsRelations = relations(likedSongs, ({ one }) => ({
  user: one(users, {
    fields: [likedSongs.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [likedSongs.songId],
    references: [songs.id],
  }),
}));

export const savedSongsRelations = relations(savedSongs, ({ one }) => ({
  user: one(users, {
    fields: [savedSongs.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [savedSongs.songId],
    references: [songs.id],
  }),
}));
