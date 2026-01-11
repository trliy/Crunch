
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import soundcloudKeyFetch from "soundcloud-key-fetch";
import axios from "axios";

// Helper to get SoundCloud Client ID
async function getClientId(): Promise<string> {
  const cached = await storage.getCache("sc_client_id");
  if (cached && cached.value) {
    // Refresh every 24h? For now assume it's good if it exists, or maybe check date
    // Simple: just return cached for speed
    return cached.value as string;
  }

  try {
    const key = await soundcloudKeyFetch.fetchKey();
    if (key) {
      await storage.setCache("sc_client_id", key);
      return key;
    }
  } catch (e) {
    console.error("Failed to fetch SC key:", e);
  }
  
  // Fallback or error
  throw new Error("Could not fetch SoundCloud Client ID");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // CORS for Stremio
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // 1. Manifest
  app.get(api.addon.manifest.path, (req, res) => {
    res.json({
      id: "org.crunch.addon",
      version: "1.0.0",
      name: "Crunch",
      description: "SoundCloud Stremio Addon",
      resources: ["catalog", "stream"],
      types: ["music"],
      catalogs: [
        {
          type: "music",
          id: "sc_top",
          name: "SoundCloud Top",
          extra: [{ name: "search", isRequired: false }]
        }
      ],
      idPrefixes: ["sc:"],
      logo: "https://raw.githubusercontent.com/stremio/stremio-packages/master/soundcloud-logo.png", // Placeholder
      background: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    });
  });

  // 2. Catalog
  app.get('/catalog/:type/:id.json', async (req, res) => {
    return handleCatalog(req, res);
  });
  
  // Handle extra args (search) - Stremio format: /catalog/music/sc_top/search=query.json
  app.get('/catalog/:type/:id/:extra.json', async (req, res) => {
    return handleCatalog(req, res);
  });

  async function handleCatalog(req: any, res: any) {
    const { type, id, extra } = req.params;
    
    if (type !== "music") {
      return res.json({ metas: [] });
    }

    try {
      const clientId = await getClientId();
      let tracks = [];
      
      // Parse extra args
      let searchQuery = "";
      if (extra) {
        const params = new URLSearchParams(extra.replace('.json', ''));
        searchQuery = params.get('search') || "";
        // Manually parse if URLSearchParams fails on stremio format "search=foo"
        if (!searchQuery && extra.startsWith("search=")) {
          searchQuery = extra.split('=')[1];
        }
      }

      if (searchQuery) {
        // Search
        const response = await axios.get(`https://api-v2.soundcloud.com/search/tracks`, {
          params: {
            q: searchQuery,
            client_id: clientId,
            limit: 20
          }
        });
        tracks = response.data.collection;
      } else if (id === "sc_top") {
        // Trending / Top
        // Using a generic chart endpoint or just exploring
        const response = await axios.get(`https://api-v2.soundcloud.com/charts`, {
          params: {
            kind: 'top',
            genre: 'soundcloud:genres:all-music',
            client_id: clientId,
            limit: 20
          }
        });
        tracks = response.data.collection.map((item: any) => item.track);
      }

      const metas = tracks.map((track: any) => ({
        id: `sc:${track.id}`,
        type: "music",
        name: track.title,
        poster: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : "",
        description: track.description || "",
        background: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : "",
        releaseInfo: new Date(track.created_at).getFullYear().toString(),
      }));

      return res.json({ metas });

    } catch (error) {
      console.error("Catalog error:", error);
      return res.json({ metas: [] });
    }
  }

  // 3. Stream
  app.get(api.addon.stream.path, async (req, res) => {
    const { type, id } = req.params;
    
    if (type !== "music" || !id.startsWith("sc:")) {
      return res.json({ streams: [] });
    }

    const trackId = id.split(":")[1];

    try {
      const clientId = await getClientId();
      
      // Get track details to find the stream URL
      // We might need to call the /stream endpoint if we had OAuth, but with Client ID we usually look at media.transcodings
      
      // First get track info
      const trackRes = await axios.get(`https://api-v2.soundcloud.com/tracks/${trackId}`, {
        params: { client_id: clientId }
      });
      
      const track = trackRes.data;
      
      // Find a progressive stream (mp3)
      const transcoding = track.media.transcodings.find((t: any) => 
        t.format.protocol === 'progressive' && t.format.mime_type.includes('audio')
      ) || track.media.transcodings.find((t: any) => t.format.protocol === 'hls');

      if (!transcoding) {
        return res.json({ streams: [] });
      }

      // The transcoding url is authenticated with client_id
      const streamUrlRes = await axios.get(transcoding.url, {
        params: { client_id: clientId }
      });

      return res.json({
        streams: [{
          url: streamUrlRes.data.url,
          title: track.title,
          description: track.user?.username
        }]
      });

    } catch (error) {
      console.error("Stream error:", error);
      return res.json({ streams: [] });
    }
  });

  return httpServer;
}
