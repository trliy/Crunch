
import { db } from "./db";
import { cache, type CacheItem, type InsertCacheItem } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCache(key: string): Promise<CacheItem | undefined>;
  setCache(key: string, value: any): Promise<CacheItem>;
}

export class DatabaseStorage implements IStorage {
  async getCache(key: string): Promise<CacheItem | undefined> {
    const [item] = await db.select().from(cache).where(eq(cache.key, key));
    return item;
  }

  async setCache(key: string, value: any): Promise<CacheItem> {
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
