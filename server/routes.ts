import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const sckey = require("soundcloud-key-fetch");

// Helper to check environment variables or fetch key
let currentSCKey = process.env.SC_CLIENT_ID;
let isScraping = false;
let keyPromise: Promise<string | null> | null = null;

async function getSCClientId() {
  if (currentSCKey) return currentSCKey;
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    try {
      console.log("[Crunch] Attempting to scrape SoundCloud Client ID...");
      const key = await sckey.fetchKey().catch((err: any) => {
        console.error("[Crunch] Scraper library error:", err.message || err);
        return null;
      });

      if (key) {
        currentSCKey = key;
        console.log("[Crunch] Scraped and cached SoundCloud Client ID:", currentSCKey);
        return currentSCKey;
      }
      
      throw new Error("Scraper returned no key");
    } catch (error: any) {
      console.error("[Crunch] Failed to obtain SC Key:", error.message || error);
      keyPromise = null; // Allow retry on failure
      return process.env.SC_CLIENT_ID || null;
    }
  })();

  return keyPromise;
}

const SC_API_BASE = "https://api-v2.soundcloud.com";

// Stremio Manifest
const manifest = {
  id: "org.crunch.addon",
  version: "1.0.0",
  name: "Crunch",
  description: "Crunch is a lightweight Stremio addon for discovering and streaming user-uploaded music. It provides search, track metadata, and audio playback through a minimal install flow.",
  logo: "https://files.catbox.moe/xe084e.png", 
  icon: "https://files.catbox.moe/xe084e.png",
  resources: ["catalog", "meta", "stream"],
  types: ["music"],
  catalogs: [
    {
      type: "music",
      id: "crunch_search",
      name: "Crunch Search",
      extra: [{ name: "search", isRequired: true }]
    }
  ],
  idPrefixes: ["sc:"]
};

const builder = new addonBuilder(manifest);

// --- SoundCloud Helpers ---

async function searchTracks(query: string) {
  const clientId = await getSCClientId();
  if (!clientId) return [];
  const cacheKey = `search:${query}`;
  const cached = await storage.getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${SC_API_BASE}/search/tracks`, {
      params: { q: query, client_id: clientId, limit: 200 }
    });
    const data = response.data.collection || [];
    await storage.setCache(cacheKey, data, 3600);
    return data;
  } catch (error) {
    console.error("SC Search Error:", error);
    return [];
  }
}

async function getTrack(id: string) {
  const clientId = await getSCClientId();
  if (!clientId) return null;
  const cacheKey = `track:${id}`;
  const cached = await storage.getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${SC_API_BASE}/tracks/${id}`, {
      params: { client_id: clientId }
    });
    const data = response.data;
    await storage.setCache(cacheKey, data, 86400);
    return data;
  } catch (error) {
    console.error(`SC Get Track Error (${id}):`, error);
    return null;
  }
}

// --- Addon Handlers ---

builder.defineCatalogHandler(async ({ type, id, extra }: any) => {
  console.log(`[Crunch] Catalog Request: type=${type}, id=${id}, search="${extra?.search || ''}"`);
  
  if (type === "music") {
    let items = [];
    if (id === "crunch_search" && extra?.search) {
      items = await searchTracks(extra.search);
    }

    const metas = items.map((item: any) => ({
      id: `sc:${item.id}`,
      name: item.title,
      description: item.description || "",
      poster: item.artwork_url ? item.artwork_url.replace("-large", "-t500x500") : (item.user?.avatar_url || ""),
      background: item.artwork_url ? item.artwork_url.replace("-large", "-t500x500") : (item.user?.avatar_url || ""),
      type: "music",
      genres: [item.genre]
    }));
    return { metas };
  }
  return { metas: [] };
});

builder.defineMetaHandler(async ({ type, id }: any) => {
  console.log(`[Crunch] \uD83D\uDFE2 Meta Request: type=${type}, id=${id}`);
  if (type === "music" && id.startsWith("sc:")) {
    const trackId = id.split(":")[1];
    console.log(`[Crunch] \uD83D\uDD0D Fetching metadata for SoundCloud track ID: ${trackId}`);
    const track = await getTrack(trackId);
    if (!track) {
      console.log(`[Crunch] \u274C No track found for ID: ${trackId}`);
      return { meta: null };
    }
    console.log(`[Crunch] \u2728 Successfully fetched track metadata: "${track.title}"`);
    console.log(`[Crunch] \uD83D\uDCCA Genre: ${track.genre}, Duration: ${track.duration}ms, Created: ${track.created_at}`);
    
    const meta = {
      id: id,
      name: track.title,
      description: track.description || "",
      poster: track.artwork_url ? track.artwork_url.replace("-large", "-t500x500") : "",
      background: track.artwork_url ? track.artwork_url.replace("-large", "-t500x500") : "",
      type: "music",
      genres: [track.genre],
      runtime: track.duration ? Math.floor(track.duration / 60000) + " min" : undefined,
      released: track.created_at
    };
    
    console.log(`[Crunch] \uD83D\uDCE1 Returning meta object to Stremio:`, JSON.stringify(meta, null, 2));
    return { meta };
  }
  console.log(`[Crunch] \u26A0\uFE0F Meta request ignored - incompatible type/id: type=${type}, id=${id}`);
  return { meta: null };
});

builder.defineStreamHandler(async ({ type, id }: any) => {
  console.log(`[Crunch] \uD83D\uDFE2 Stream Request: type=${type}, id=${id}`);
  if (type === "music" && id.startsWith("sc:")) {
    const trackId = id.split(":")[1];
    const clientId = await getSCClientId();

    try {
      // 1. Fetch track info using the provided pattern
      console.log(`[Crunch] \uD83D\uDD0D Fetching track info for ID: ${trackId}`);
      const trackResponse = await axios.get(`https://api.soundcloud.com/tracks/${trackId}`, {
        headers: {
          "accept": "application/json; charset=utf-8",
          "Authorization": `OAuth ${clientId}`
        }
      });
      const track = trackResponse.data;

      // 2. Fetch stream URL using the provided pattern
      console.log(`[Crunch] \uD83D\uDCE1 Fetching stream URL for ID: ${trackId}`);
      const streamResponse = await axios.get(`https://api.soundcloud.com/tracks/${trackId}/stream`, {
        headers: {
          "accept": "application/json; charset=utf-8",
          "Authorization": `OAuth ${clientId}`
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      // Handle direct location if 302 redirect
      const directUrl = streamResponse.headers.location || streamResponse.data.http_mp3_128_url || streamResponse.data.url;

      if (directUrl) {
        console.log(`[Crunch] \u2728 SUCCESS: Resolved direct stream URL: ${directUrl.substring(0, 100)}...`);
        return {
          streams: [{
            name: "Crunch",
            title: "MP3 (128kbps)",
            url: directUrl,
            behaviorHints: {
              notWebReady: false,
              proxyHeaders: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": "https://soundcloud.com/"
              }
            }
          }]
        };
      }
    } catch (err: any) {
      console.error(`[Crunch] \uD83E\uDDE8 ERROR using official pattern:`, err.message || err);
      
      // Fallback to internal V2 API resolution if official fails (v2 is often more resilient for scraped keys)
      console.log(`[Crunch] \uD83D\uDD04 Falling back to V2 API resolution...`);
      const v2TrackResponse = await axios.get(`https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${clientId}`);
      const transcodings = v2TrackResponse.data.media?.transcodings || [];
      const transcoding = transcodings.find((t: any) => t.format.protocol === "progressive" && t.format.mime_type.includes("mpeg")) || transcodings[0];
      
      if (transcoding) {
        const resolveResponse = await axios.get(`${transcoding.url}?client_id=${clientId}`);
        if (resolveResponse.data.url) {
          return {
            streams: [{
              name: "Crunch",
              title: "MP3 (128kbps)",
              url: resolveResponse.data.url,
              behaviorHints: {
                notWebReady: false,
                proxyHeaders: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                  "Referer": "https://soundcloud.com/"
                }
              }
            }]
          };
        }
      }
    }
  }
  return { streams: [] };
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const addonInterface = builder.getInterface();
  app.use(getRouter(addonInterface));

  // Test Endpoint for debugging
  app.get('/api/test-scraper', async (req, res) => {
    try {
      console.log("[Crunch] Manual test scraper triggered...");
      const clientId = await getSCClientId();
      if (!clientId) {
        throw new Error("Failed to obtain SoundCloud Client ID");
      }
      res.json({ clientId, status: 'ok' });
    } catch (error: any) {
      console.error("[Crunch] Test scraper error:", error.message);
      res.status(500).json({ error: error.message, status: 'error' });
    }
  });

  return httpServer;
}
