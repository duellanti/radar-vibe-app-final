import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumPlan: text("premium_plan"),
  premiumExpiresAt: timestamp("premium_expires_at"),
  ghostMode: boolean("ghost_mode").default(false).notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastLocationUpdate: timestamp("last_location_update"),
  instagram: text("instagram"),
  discord: text("discord"),
  psnId: text("psn_id"),
  keywords: text("keywords").array().default(sql`'{}'::text[]`),
  language: text("language").default("en").notNull(),
  messagesToday: integer("messages_today").default(0).notNull(),
  messagesResetAt: timestamp("messages_reset_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vibes = pgTable("vibes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  photoUrl: text("photo_url"),
  photos: text("photos").array().default(sql`'{}'::text[]`),
  type: text("type").notNull().default("live"),
  scheduledAt: timestamp("scheduled_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  instagram: z.string().optional(),
  discord: z.string().optional(),
  psnId: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  language: z.string().optional(),
});

export const insertVibeSchema = createInsertSchema(vibes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Vibe = typeof vibes.$inferSelect;
export type InsertVibe = z.infer<typeof insertVibeSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type VibeType = "live" | "planned";

export const SUPPORTED_LANGUAGES = ["en", "it", "fr", "de", "es", "pt", "sv"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const FREE_MESSAGE_LIMIT = 3;
export const LIVE_VIBE_DURATION_HOURS = 4;
export const BUSSOLA_RADIUS_KM = 10;
