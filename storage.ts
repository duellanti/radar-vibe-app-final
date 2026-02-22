import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateProfileSchema, insertVibeSchema, insertMessageSchema, LIVE_VIBE_DURATION_HOURS, BUSSOLA_RADIUS_KM } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

const SessionStore = MemoryStore(session);

const vibeBodySchema = insertVibeSchema.extend({
  expiresAt: z.coerce.date(),
  scheduledAt: z.coerce.date().optional(),
  photos: z.array(z.string()).optional(),
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/uploads", (await import("express")).default.static(uploadsDir));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "radarvibe-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    })
  );

  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  }

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ error: "Username taken" });
      const user = await storage.createUser({ username, password });
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Invalid data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await storage.updateProfile(req.session.userId!, data);
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Invalid data" });
    }
  });

  app.post("/api/location", requireAuth, async (req, res) => {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    await storage.updateLocation(req.session.userId!, latitude, longitude);
    res.json({ ok: true });
  });

  app.post("/api/ghost-mode", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isPremium) return res.status(403).json({ error: "Premium required" });
    const { enabled } = req.body;
    await storage.toggleGhostMode(req.session.userId!, !!enabled);
    res.json({ ok: true, ghostMode: !!enabled });
  });

  app.get("/api/users/visible", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(401).json({ error: "User not found" });
    const visibleUsers = await storage.getVisibleUsers(user.id, user.isPremium);
    const safeUsers = visibleUsers.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      isPremium: u.isPremium,
      latitude: u.latitude ? u.latitude + (Math.random() - 0.5) * 0.003 : null,
      longitude: u.longitude ? u.longitude + (Math.random() - 0.5) * 0.003 : null,
      bio: u.bio,
      instagram: u.instagram,
      discord: u.discord,
      psnId: u.psnId,
      keywords: u.keywords,
    }));
    res.json(safeUsers);
  });

  app.get("/api/bussola", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isPremium) return res.status(403).json({ error: "Premium required" });
    const keyword = req.query.keyword as string;
    if (!keyword) return res.status(400).json({ error: "Keyword required" });
    const nearby = await storage.getUsersNearKeyword(user.id, keyword, BUSSOLA_RADIUS_KM);
    res.json(nearby.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      keywords: u.keywords,
      latitude: u.latitude ? u.latitude + (Math.random() - 0.5) * 0.003 : null,
      longitude: u.longitude ? u.longitude + (Math.random() - 0.5) * 0.003 : null,
    })));
  });

  app.get("/api/vibes", async (req, res) => {
    try {
      const userId = req.session.userId;
      let isPremium = false;
      if (userId) {
        const user = await storage.getUser(userId);
        isPremium = user?.isPremium ?? false;
      }
      const allVibes = await storage.getVibes(isPremium);
      res.json(allVibes);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vibes" });
    }
  });

  app.get("/api/vibes/:id", async (req, res) => {
    try {
      const vibe = await storage.getVibe(req.params.id);
      if (!vibe) return res.status(404).json({ error: "Vibe not found" });
      res.json(vibe);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vibe" });
    }
  });

  app.post("/api/vibes", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ error: "User not found" });

      const body = { ...req.body, creatorId: user.id };

      if (body.type === "planned" && !user.isPremium) {
        return res.status(403).json({ error: "Planned vibes require Premium" });
      }

      if (body.type === "live" && !body.expiresAt) {
        body.expiresAt = new Date(Date.now() + LIVE_VIBE_DURATION_HOURS * 60 * 60 * 1000).toISOString();
      }

      if (body.photos && Array.isArray(body.photos)) {
        body.photos = body.photos.slice(0, 3);
      }

      const parsed = vibeBodySchema.parse(body);
      const vibe = await storage.createVibe(parsed);
      res.status(201).json(vibe);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Invalid vibe data" });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const msgs = await storage.getMessages(req.session.userId!, req.params.userId);
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const convos = await storage.getConversations(req.session.userId!);
      res.json(convos);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ error: "User not found" });

      if (!user.isPremium) {
        await storage.resetMessageCountIfNeeded(user.id);
        const canSend = await storage.canSendMessage(user.id);
        if (!canSend) {
          return res.status(429).json({ error: "Daily message limit reached. Watch an ad to unlock more." });
        }
      }

      const parsed = insertMessageSchema.parse({
        ...req.body,
        senderId: user.id,
      });
      const msg = await storage.sendMessage(parsed);

      if (!user.isPremium) {
        await storage.incrementMessageCount(user.id);
      }

      res.status(201).json(msg);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Invalid message" });
    }
  });

  app.post("/api/messages/unlock", requireAuth, async (req, res) => {
    await storage.grantBonusMessages(req.session.userId!, 3);
    res.json({ ok: true, message: "3 bonus messages unlocked" });
  });

  app.post("/api/upload", requireAuth, upload.array("photos", 3), (req: any, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const urls = req.files.map((f: any) => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  app.post("/api/upload/avatar", requireAuth, upload.single("avatar"), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await storage.updateProfile(req.session.userId!, { avatarUrl });
    const { password: _, ...safeUser } = user;
    res.json({ avatarUrl, user: safeUser });
  });

  app.post("/api/subscribe", requireAuth, async (req, res) => {
    const { plan, productId } = req.body;
    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const expectedProductId = plan === "monthly"
      ? "radarvibe_premium_monthly"
      : "radarvibe_premium_annually";

    const user = await storage.setPremium(req.session.userId!, plan);
    const { password: _, ...safeUser } = user;
    res.json({
      message: "Premium activated",
      plan,
      productId: productId || expectedProductId,
      isPremium: true,
      user: safeUser,
    });
  });

  setInterval(async () => {
    try {
      const deleted = await storage.deleteExpiredVibes();
      if (deleted > 0) console.log(`Cleaned up ${deleted} expired vibes`);
    } catch (err) {
      console.error("Failed to cleanup expired vibes:", err);
    }
  }, 24 * 60 * 60 * 1000);

  return httpServer;
}
