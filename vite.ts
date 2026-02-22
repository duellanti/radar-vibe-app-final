import {
  type User, type InsertUser, type UpdateProfile,
  type Vibe, type InsertVibe,
  type Message, type InsertMessage,
  users, vibes, messages,
  FREE_MESSAGE_LIMIT
} from "@shared/schema";
import { db } from "./db";
import { eq, lt, desc, and, or, ne, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateProfile(userId: string, data: UpdateProfile): Promise<User>;
  updateLocation(userId: string, lat: number, lng: number): Promise<void>;
  toggleGhostMode(userId: string, enabled: boolean): Promise<void>;
  setPremium(userId: string, plan: string): Promise<User>;

  getVisibleUsers(viewerId: string, viewerIsPremium: boolean): Promise<User[]>;
  getUsersNearKeyword(userId: string, keyword: string, radiusKm: number): Promise<User[]>;

  getVibes(viewerIsPremium: boolean): Promise<Vibe[]>;
  getVibe(id: string): Promise<Vibe | undefined>;
  createVibe(vibe: InsertVibe): Promise<Vibe>;
  deleteExpiredVibes(): Promise<number>;

  getMessages(userId: string, otherId: string): Promise<Message[]>;
  getConversations(userId: string): Promise<{ userId: string; username: string; lastMessage: string; lastAt: Date }[]>;
  sendMessage(msg: InsertMessage): Promise<Message>;
  canSendMessage(userId: string): Promise<boolean>;
  incrementMessageCount(userId: string): Promise<void>;
  resetMessageCountIfNeeded(userId: string): Promise<void>;
  grantBonusMessages(userId: string, count: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfile): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
    await db.update(users).set({
      latitude: lat,
      longitude: lng,
      lastLocationUpdate: new Date(),
    }).where(eq(users.id, userId));
  }

  async toggleGhostMode(userId: string, enabled: boolean): Promise<void> {
    await db.update(users).set({ ghostMode: enabled }).where(eq(users.id, userId));
  }

  async setPremium(userId: string, plan: string): Promise<User> {
    const expiresAt = new Date();
    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    const [user] = await db.update(users).set({
      isPremium: true,
      premiumPlan: plan,
      premiumExpiresAt: expiresAt,
    }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getVisibleUsers(viewerId: string, viewerIsPremium: boolean): Promise<User[]> {
    if (viewerIsPremium) {
      return db.select().from(users)
        .where(and(ne(users.id, viewerId), eq(users.ghostMode, false)));
    }
    return db.select().from(users)
      .where(and(
        ne(users.id, viewerId),
        eq(users.ghostMode, false),
        eq(users.isPremium, false)
      ));
  }

  async getUsersNearKeyword(userId: string, keyword: string, radiusKm: number): Promise<User[]> {
    const user = await this.getUser(userId);
    if (!user || !user.latitude || !user.longitude) return [];
    const allUsers = await db.select().from(users)
      .where(and(ne(users.id, userId), eq(users.ghostMode, false)));
    return allUsers.filter((u: User) => {
      if (!u.latitude || !u.longitude) return false;
      const dist = getDistanceKm(user.latitude!, user.longitude!, u.latitude, u.longitude);
      if (dist > radiusKm) return false;
      return u.keywords?.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()));
    });
  }

  async getVibes(viewerIsPremium: boolean): Promise<Vibe[]> {
    const now = new Date();
    const allVibes = await db.select().from(vibes).orderBy(desc(vibes.createdAt));
    return allVibes.filter((v: Vibe) => {
      if (v.type === "planned" && !viewerIsPremium) return false;
      if (v.expiresAt < now && v.type === "live") return false;
      return true;
    });
  }

  async getVibe(id: string): Promise<Vibe | undefined> {
    const [vibe] = await db.select().from(vibes).where(eq(vibes.id, id));
    return vibe;
  }

  async createVibe(vibe: InsertVibe): Promise<Vibe> {
    const [created] = await db.insert(vibes).values(vibe).returning();
    return created;
  }

  async deleteExpiredVibes(): Promise<number> {
    const now = new Date();
    const result = await db.delete(vibes).where(lt(vibes.expiresAt, now)).returning();
    return result.length;
  }

  async getMessages(userId: string, otherId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))
      ))
      .orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<{ userId: string; username: string; lastMessage: string; lastAt: Date }[]> {
    const allMsgs = await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const convMap = new Map<string, { lastMessage: string; lastAt: Date }>();
    for (const m of allMsgs) {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { lastMessage: m.content, lastAt: m.createdAt });
      }
    }

    const result: { userId: string; username: string; lastMessage: string; lastAt: Date }[] = [];
    const entries = Array.from(convMap.entries());
    for (const [otherId, data] of entries) {
      const otherUser = await this.getUser(otherId);
      result.push({
        userId: otherId,
        username: otherUser?.displayName || otherUser?.username || "Unknown",
        lastMessage: data.lastMessage,
        lastAt: data.lastAt,
      });
    }
    return result;
  }

  async sendMessage(msg: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(msg).returning();
    return created;
  }

  async canSendMessage(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    if (user.isPremium) return true;
    await this.resetMessageCountIfNeeded(userId);
    const refreshed = await this.getUser(userId);
    return (refreshed?.messagesToday ?? 0) < FREE_MESSAGE_LIMIT;
  }

  async incrementMessageCount(userId: string): Promise<void> {
    await db.update(users).set({
      messagesToday: sql`${users.messagesToday} + 1`,
    }).where(eq(users.id, userId));
  }

  async resetMessageCountIfNeeded(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    const now = new Date();
    if (!user.messagesResetAt || now.toDateString() !== user.messagesResetAt.toDateString()) {
      await db.update(users).set({
        messagesToday: 0,
        messagesResetAt: now,
      }).where(eq(users.id, userId));
    }
  }

  async grantBonusMessages(userId: string, count: number): Promise<void> {
    await db.update(users).set({
      messagesToday: sql`GREATEST(${users.messagesToday} - ${count}, 0)`,
    }).where(eq(users.id, userId));
  }
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const storage = new DatabaseStorage();
