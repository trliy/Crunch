
import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We might want to cache the SoundCloud Client ID or tracks
export const cache = pgTable("cache", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(), // Store client_id or track data
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCacheSchema = createInsertSchema(cache);

export type CacheItem = typeof cache.$inferSelect;
export type InsertCacheItem = z.infer<typeof insertCacheSchema>;

// Stremio Types (not stored in DB, but used for API contract)
export const manifestSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resources: z.array(z.string()),
  types: z.array(z.string()),
  catalogs: z.array(z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    extra: z.array(z.object({
      name: z.string(),
      isRequired: z.boolean().optional(),
    })).optional(),
  })),
  idPrefixes: z.array(z.string()).optional(),
  logo: z.string().optional(),
  background: z.string().optional(),
});

export const streamSchema = z.object({
  url: z.string().optional(),
  ytId: z.string().optional(),
  title: z.string().optional(),
  infoHash: z.string().optional(),
  fileIdx: z.number().optional(),
});

export const metaSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  poster: z.string().optional(),
  background: z.string().optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  releaseInfo: z.string().optional(),
  imdbRating: z.string().optional(),
  released: z.string().optional(),
});

export type Manifest = z.infer<typeof manifestSchema>;
export type Stream = z.infer<typeof streamSchema>;
export type Meta = z.infer<typeof metaSchema>;
