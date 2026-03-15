import type { Express } from "express";
import type { Server } from "http";
import { storage, type BRSEvent } from "./storage";
import { api } from "@shared/routes";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

import { AccessToken } from "livekit-server-sdk";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/verify-persona", async (req, res) => {
    try {
      const { slug, pin } = z.object({ slug: z.string(), pin: z.string() }).parse(req.body);
      const user = await storage.getUserBySlug(slug);
      
      console.log("Verify Persona - Slug:", slug, "PIN provided:", pin);
      
      if (!user) {
        console.log("Verify Persona - User not found for slug:", slug);
        return res.status(404).json({ message: "Persona not found" });
      }

      console.log("Verify Persona - User found:", user.id, "User PIN in DB:", user.pin);

      // Normalize PINs to strings for comparison and trim whitespace
      const pinInDb = String(user.pin || "").trim();
      const providedPin = String(pin || "").trim();
      
      console.log("Verify Persona - Comparing PINs:", { pinInDb, providedPin, slug });

      if (pinInDb !== providedPin) {
        console.log("Verify Persona - PIN mismatch for slug:", slug);
        return res.status(401).json({ message: "Invalid PIN" });
      }

      const { password: _, ...safeUser } = user;
      res.status(200).json(safeUser);
    } catch (err) {
      console.error("Auth error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/featured-slugs", async (req, res) => {
    try {
      const slugs = await storage.getFeaturedSlugs();
      res.json({ slugs });
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch featured slugs" });
    }
  });

  app.post("/api/featured-slugs", async (req, res) => {
    try {
      const { slugs } = z.object({ slugs: z.array(z.string()) }).parse(req.body);
      await storage.saveFeaturedSlugs(slugs);
      res.json({ slugs });
    } catch (e) {
      res.status(500).json({ message: "Failed to save featured slugs" });
    }
  });

  app.get("/api/livekit/token", async (req, res) => {
    const roomName = "pitch-room";
    const participantName = "user-" + Math.floor(Math.random() * 1000);
    
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      return res.status(500).json({ error: "LiveKit credentials not configured" });
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      }
    );
    at.addGrant({ roomJoin: true, room: roomName });

    res.json({ token: await at.toJwt() });
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email || "");
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(input.password || "", user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { password: _, ...safeUser } = user;
      res.status(200).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      if (input.email) {
        const existingUser = await storage.getUserByEmail(input.email);
        if (existingUser) {
          const { password: _, ...updateData } = input as any;
          const updatedUser = await storage.updateUser(existingUser.id, updateData);
          
          let userWithSlug = updatedUser;
          if (!existingUser.uniqueSlug && storage.getUserBySlug) {
            let uniqueSlug = "";
            const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 10) {
              attempts++;
              uniqueSlug = "";
              for (let i = 0; i < 5; i++) {
                uniqueSlug += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              const existing = await storage.getUserBySlug(uniqueSlug);
              if (!existing) isUnique = true;
            }
            if (isUnique) {
              userWithSlug = await storage.updateUser(existingUser.id, { uniqueSlug } as any);
            }
          }
          
          const { password: __, ...safeUser } = userWithSlug;
          return res.status(200).json(safeUser);
        }
      }

      const hashedPassword = input.password ? await bcrypt.hash(input.password, SALT_ROUNDS) : await bcrypt.hash(Math.random().toString(), SALT_ROUNDS);
      
      let uniqueSlug = "";
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10 && storage.getUserBySlug) {
        attempts++;
        uniqueSlug = "";
        for (let i = 0; i < 5; i++) {
          uniqueSlug += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await storage.getUserBySlug(uniqueSlug);
        if (!existing) {
          isUnique = true;
        }
      }

      if (!isUnique) {
        throw new Error("Could not generate a unique slug");
      }

      const user = await storage.createUser({ 
        ...input, 
        email: input.email || "",
        password: hashedPassword,
        uniqueSlug
      } as any);
      
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/check-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const existing = await storage.getUserBySlug(slug);
      res.json({ taken: !!existing });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/slug", async (req, res) => {
    try {
      const { uniqueSlug, userId } = z.object({ 
        uniqueSlug: z.string(),
        userId: z.string().optional()
      }).parse(req.body);
      
      let user;
      if (userId) {
        user = await storage.getUser(userId);
      } else {
        const users = await storage.getUsers?.() || [];
        user = users[0];
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existing = await storage.getUserBySlug(uniqueSlug);
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ message: "Persona code already taken" });
      }

      const updatedUser = await storage.updateUser(user.id, { uniqueSlug });
      const { password: _, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (err) {
      console.error("Update slug error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { password, id: _id, createdAt, pin, ...allowedFields } = req.body;
      
      const updateData = { ...allowedFields };
      if (pin !== undefined) {
        updateData.pin = pin;
      }
      
      const user = await storage.updateUser(id, updateData);
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      console.error("Update user error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const user = await storage.getUserBySlug(slug);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Increment reachCount when someone views a profile
      // We'll increment it for every GET request to this endpoint
      
      const isSelf = req.query.self === 'true';
      if (!isSelf) {
        const now = new Date();
        const currentTimestamp = now.toISOString();
        const reachHistory = user.reachHistory || [];
        
        // Find if we have an entry within the last 12 hours
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const lastEntry = reachHistory.length > 0 ? reachHistory[reachHistory.length - 1] : null;
        
        let newHistory = [...reachHistory];
        if (lastEntry && new Date(lastEntry.timestamp) > twelveHoursAgo) {
          // Update the last 12h entry
          newHistory[newHistory.length - 1] = { 
            ...lastEntry, 
            count: (lastEntry.count || 0) + 1 
          };
        } else {
          // Create a new 12h slot
          newHistory.push({ timestamp: currentTimestamp, count: 1 });
        }
        
        // Keep last 14 entries (7 days * 2 entries/day)
        if (newHistory.length > 14) {
          newHistory = newHistory.slice(-14);
        }

        await storage.updateUser(user.id, { 
          reachCount: (user.reachCount || 0) + 1,
          reachHistory: newHistory as any
        });
      }

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tweet-video/:tweetId", async (req, res) => {
    try {
      const { tweetId } = req.params;
      if (!/^\d+$/.test(tweetId)) return res.status(400).json({ error: "Invalid tweet ID" });

      const token = Math.floor(Number(tweetId) / 1e15 * Math.PI).toString();
      const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&token=${token}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Referer": "https://platform.twitter.com/",
          "Origin": "https://platform.twitter.com"
        }
      });

      if (!response.ok) return res.status(404).json({ error: "Tweet not found or not accessible" });

      const data = await response.json() as any;
      const mediaDetails = data.mediaDetails || data.extended_entities?.media || [];
      const videoMedia = mediaDetails.find((m: any) => m.type === "video" || m.type === "animated_gif");

      if (!videoMedia) return res.status(404).json({ error: "No video found in this tweet" });

      const variants: any[] = (videoMedia.video_info?.variants || [])
        .filter((v: any) => v.content_type === "video/mp4" && v.url)
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      if (!variants.length) return res.status(404).json({ error: "No MP4 video variants found" });

      res.json({
        videoUrl: `/api/tweet-video-proxy/${tweetId}`,
        thumbnailUrl: videoMedia.media_url_https || videoMedia.media_url || null,
        allVariants: variants.map((v: any) => ({ url: v.url, bitrate: v.bitrate }))
      });
    } catch (err) {
      console.error("Tweet video error:", err);
      res.status(500).json({ error: "Failed to extract video" });
    }
  });

  app.get("/api/tweet-video-proxy/:tweetId", async (req, res) => {
    try {
      const { tweetId } = req.params;
      if (!/^\d+$/.test(tweetId)) return res.status(400).send("Invalid tweet ID");

      const token = Math.floor(Number(tweetId) / 1e15 * Math.PI).toString();
      const metaUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&token=${token}`;

      const metaRes = await fetch(metaUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Referer": "https://platform.twitter.com/",
          "Origin": "https://platform.twitter.com"
        }
      });

      if (!metaRes.ok) return res.status(404).send("Tweet not found");

      const data = await metaRes.json() as any;
      const mediaDetails = data.mediaDetails || data.extended_entities?.media || [];
      const videoMedia = mediaDetails.find((m: any) => m.type === "video" || m.type === "animated_gif");
      if (!videoMedia) return res.status(404).send("No video found");

      const variants: any[] = (videoMedia.video_info?.variants || [])
        .filter((v: any) => v.content_type === "video/mp4" && v.url)
        .sort((a: any, b: any) => (a.bitrate || 0) - (b.bitrate || 0));

      if (!variants.length) return res.status(404).send("No MP4 variants found");

      // Pick the second-lowest bitrate if available (better quality than minimum, still smooth)
      const videoUrl = (variants[1] || variants[0]).url;
      const range = req.headers.range;

      const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://twitter.com/",
        "Origin": "https://twitter.com",
      };
      if (range) fetchHeaders["Range"] = range;

      const videoRes = await fetch(videoUrl, { headers: fetchHeaders });

      res.setHeader("Content-Type", videoRes.headers.get("content-type") || "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
      const contentLength = videoRes.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const contentRange = videoRes.headers.get("content-range");
      if (contentRange) res.setHeader("Content-Range", contentRange);

      res.status(videoRes.status);
      const body = videoRes.body as any;
      if (body && body.pipe) {
        body.pipe(res);
      } else if (body) {
        const reader = body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); break; }
            res.write(Buffer.from(value));
          }
        };
        pump().catch(() => res.end());
      } else {
        const buf = await videoRes.arrayBuffer();
        res.end(Buffer.from(buf));
      }
    } catch (err) {
      console.error("Tweet video proxy error:", err);
      res.status(500).send("Failed to proxy video");
    }
  });

  const instaVideoCache = new Map<string, { videoUrl: string; thumbnailUrl: string | null; expires: number }>();

  async function fetchInstaVideo(reelId: string): Promise<{ videoUrl: string; thumbnailUrl: string | null } | null> {
    const cached = instaVideoCache.get(reelId);
    if (cached && cached.expires > Date.now()) return { videoUrl: cached.videoUrl, thumbnailUrl: cached.thumbnailUrl };

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://www.instagram.com/",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
    };

    const res = await fetch(`https://www.instagram.com/reel/${reelId}/`, { headers });
    if (!res.ok) return null;
    const html = await res.text();

    const videoMatch = html.match(/"video_url":"(https:[^"]+)"/);
    const thumbMatch = html.match(/"thumbnail_src":"(https:[^"]+)"/) || html.match(/"display_url":"(https:[^"]+)"/);

    if (!videoMatch) return null;

    const videoUrl = videoMatch[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
    const thumbnailUrl = thumbMatch ? thumbMatch[1].replace(/\\u0026/g, "&").replace(/\\/g, "") : null;

    instaVideoCache.set(reelId, { videoUrl, thumbnailUrl, expires: Date.now() + 30 * 60 * 1000 });
    return { videoUrl, thumbnailUrl };
  }

  app.get("/api/insta-video/:reelId", async (req, res) => {
    try {
      const { reelId } = req.params;
      if (!/^[\w-]+$/.test(reelId)) return res.status(400).json({ error: "Invalid reel ID" });

      const result = await fetchInstaVideo(reelId);
      if (!result) return res.status(404).json({ error: "No video found in this reel" });

      res.json({ videoUrl: `/api/insta-video-proxy/${reelId}`, thumbnailUrl: result.thumbnailUrl });
    } catch (err) {
      console.error("Instagram video error:", err);
      res.status(500).json({ error: "Failed to extract video" });
    }
  });

  app.get("/api/insta-video-proxy/:reelId", async (req, res) => {
    try {
      const { reelId } = req.params;
      if (!/^[\w-]+$/.test(reelId)) return res.status(400).send("Invalid reel ID");

      const result = await fetchInstaVideo(reelId);
      if (!result) return res.status(404).send("Video not found");

      const range = req.headers.range;
      const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36",
        "Referer": "https://www.instagram.com/",
      };
      if (range) fetchHeaders["Range"] = range;

      const videoRes = await fetch(result.videoUrl, { headers: fetchHeaders });

      res.setHeader("Content-Type", videoRes.headers.get("content-type") || "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=1800");
      const contentLength = videoRes.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const contentRange = videoRes.headers.get("content-range");
      if (contentRange) res.setHeader("Content-Range", contentRange);
      res.status(videoRes.status);

      const body = videoRes.body as any;
      if (body && body.pipe) {
        body.pipe(res);
      } else if (body) {
        const reader = body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); break; }
            res.write(Buffer.from(value));
          }
        };
        pump().catch(() => res.end());
      } else {
        const buf = await videoRes.arrayBuffer();
        res.end(Buffer.from(buf));
      }
    } catch (err) {
      console.error("Instagram video proxy error:", err);
      res.status(500).send("Failed to proxy video");
    }
  });

  app.post("/api/user/connect", async (req, res) => {
    try {
      const { userId, targetSlug } = z.object({
        userId: z.string(),
        targetSlug: z.string()
      }).parse(req.body);

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const connections = user.connections || [];
      const now = new Date();
      
      // Filter out expired connections (older than 48h)
      const validConnections = connections.filter(conn => {
        const connectedAt = new Date(conn.connectedAt);
        const diffHours = (now.getTime() - connectedAt.getTime()) / (1000 * 60 * 60);
        return diffHours < 48;
      });

      if (!validConnections.find(c => c.slug === targetSlug)) {
        await storage.updateUser(userId, {
          connections: [...validConnections, { slug: targetSlug, connectedAt: now.toISOString() }]
        });
      } else if (validConnections.length !== connections.length) {
        // Just update if some expired even if target already exists
        await storage.updateUser(userId, {
          connections: validConnections
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Connect error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/user/:id/connections", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const connections = user.connections || [];
      const now = new Date();

      // Filter out expired connections (older than 48h)
      const validConnections = connections.filter(conn => {
        const connectedAt = new Date(conn.connectedAt);
        const diffHours = (now.getTime() - connectedAt.getTime()) / (1000 * 60 * 60);
        return diffHours < 48;
      });

      // Update user if some connections expired
      if (validConnections.length !== connections.length) {
        await storage.updateUser(user.id, { connections: validConnections });
      }

      const connectionProfiles = await Promise.all(
        validConnections.map(async (conn) => {
          const profile = await storage.getUserBySlug(conn.slug);
          if (profile) {
            const connectedAt = new Date(conn.connectedAt);
            const expiresAt = new Date(connectedAt.getTime() + 48 * 60 * 60 * 1000);
            return {
              name: profile.name || "Anonymous",
              industry: profile.industry || "Unknown",
              slug: profile.uniqueSlug,
              expiresAt: expiresAt.toISOString()
            };
          }
          return null;
        })
      );

      res.json(connectionProfiles.filter(Boolean));
    } catch (err) {
      console.error("Get connections error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = z.object({ type: z.enum(["insta", "linkedin", "whatsapp", "website"]) }).parse(req.body);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const field = `${type}Clicks` as keyof InsertUser;
      const currentCount = (user as any)[field] || 0;
      
      const updatedUser = await storage.updateUser(id, { [field]: currentCount + 1 });
      const { password: _, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (err) {
      console.error("Click track error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      const now = new Date().toISOString().split("T")[0];
      const active = events.filter((e) => e.date >= now);
      res.json(active);
    } catch (err) {
      console.error("Get events error:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const input = z.object({
        title: z.string().min(1),
        description: z.string().default(""),
        date: z.string().min(1),
        time: z.string().optional(),
        location: z.string().optional(),
      }).parse(req.body);
      const events = await storage.getEvents();
      const newEvent: BRSEvent = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: new Date().toISOString(),
      };
      await storage.saveEvents([...events, newEvent]);
      res.status(201).json(newEvent);
    } catch (err) {
      console.error("Create event error:", err);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        location: z.string().optional(),
      }).parse(req.body);
      const events = await storage.getEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ message: "Event not found" });
      events[idx] = { ...events[idx], ...input };
      await storage.saveEvents(events);
      res.json(events[idx]);
    } catch (err) {
      console.error("Update event error:", err);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const events = await storage.getEvents();
      const filtered = events.filter((e) => e.id !== id);
      await storage.saveEvents(filtered);
      res.json({ success: true });
    } catch (err) {
      console.error("Delete event error:", err);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  return httpServer;
}
