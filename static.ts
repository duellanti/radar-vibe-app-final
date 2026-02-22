import { db } from "./db";
import { vibes, users } from "@shared/schema";

export async function seedDatabase() {
  const existingVibes = await db.select().from(vibes).limit(1);
  if (existingVibes.length > 0) return;

  const existingUsers = await db.select().from(users).limit(1);

  let demoUserId: string;

  if (existingUsers.length === 0) {
    const [demoUser] = await db.insert(users).values([
      {
        username: "demo",
        password: "demo123",
        displayName: "Demo User",
        bio: "Exploring the vibe",
        isPremium: false,
        latitude: 48.8566,
        longitude: 2.3522,
        keywords: ["music", "art"],
        language: "en",
      },
      {
        username: "golduser",
        password: "gold123",
        displayName: "Gold Explorer",
        bio: "Premium vibes only",
        isPremium: true,
        premiumPlan: "yearly",
        latitude: 48.8600,
        longitude: 2.3400,
        instagram: "@goldexplorer",
        discord: "goldexplorer#1234",
        keywords: ["nightlife", "networking", "gaming"],
        language: "en",
      },
    ]).returning();
    demoUserId = demoUser.id;
  } else {
    demoUserId = existingUsers[0].id;
  }

  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);

  const seedVibes = [
    {
      creatorId: demoUserId,
      title: "Rooftop Sunset Session",
      description: "Chill vibes with panoramic city views and live music.",
      latitude: 48.8606,
      longitude: 2.3376,
      type: "live" as const,
      expiresAt: h(3),
    },
    {
      creatorId: demoUserId,
      title: "Underground Art Night",
      description: "Secret gallery meets after-dark party.",
      latitude: 48.8530,
      longitude: 2.3499,
      type: "live" as const,
      expiresAt: h(2),
    },
    {
      creatorId: demoUserId,
      title: "Startup Mixer",
      description: "Connect with founders over craft cocktails.",
      latitude: 48.8700,
      longitude: 2.3508,
      type: "live" as const,
      expiresAt: h(4),
    },
  ];

  await db.insert(vibes).values(seedVibes);
  console.log("Database seeded with sample vibes and users");
}
