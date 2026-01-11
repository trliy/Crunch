
import { db } from "./db";
import { cache, type CacheItem, type InsertCacheItem } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCache(key: string): Promise<any | undefined>;
  setCache(key: string, value: any, ttl?: number): Promise<CacheItem>;
}

export class DatabaseStorage implements IStorage {
  async getCache(key: string): Promise<any | undefined> {
    const [item] = await db.select().from(cache).where(eq(cache.key, key));
    if (!item) return undefined;
    return item.value;
  }

  async setCache(key: string, value: any, ttl?: number): Promise<CacheItem> {
    const [item] = await db
      .insert(cache)
      .values({ key, value })
      .onConflictDoUpdate({
        target: cache.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
