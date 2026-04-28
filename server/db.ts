import { eq, and, gte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import {
  behavioralLogs,
  patterns,
  interventions,
  chatConversations,
  chatMessages,
  interventionHistory,
  adminMetrics,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Behavioral Logs
 */
export async function createBehavioralLog(
  userId: number,
  data: {
    sleepHours: number;
    screenTimeHours: number;
    moodScore: number;
    energyLevel: number;
    activityKm: number;
    cancelledPlans: number;
    logDate: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(behavioralLogs).values({
    userId,
    sleepHours: data.sleepHours.toString(),
    screenTimeHours: data.screenTimeHours.toString(),
    moodScore: data.moodScore,
    energyLevel: data.energyLevel,
    activityKm: data.activityKm.toString(),
    cancelledPlans: data.cancelledPlans,
    logDate: data.logDate,
  });

  return result;
}

export async function getBehavioralLogsByUserId(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db
    .select()
    .from(behavioralLogs)
    .where(
      and(
        eq(behavioralLogs.userId, userId),
        gte(behavioralLogs.logDate, startDate)
      )
    )
    .orderBy(desc(behavioralLogs.logDate));
}

export async function getLatestBehavioralLog(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(behavioralLogs)
    .where(eq(behavioralLogs.userId, userId))
    .orderBy(desc(behavioralLogs.logDate))
    .limit(1);

  return result[0];
}

/**
 * Patterns
 */
export async function createPattern(
  userId: number,
  data: {
    patternType: "doom_scrolling" | "sleep_deprivation" | "social_withdrawal" | "mood_decline" | "inactivity" | "combined_distress";
    severity: "low" | "medium" | "high";
    riskScore: number;
    description?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(patterns).values({
    userId,
    patternType: data.patternType,
    severity: data.severity,
    riskScore: data.riskScore.toString(),
    description: data.description,
  });
}

export async function getPatternsByUserId(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db
    .select()
    .from(patterns)
    .where(
      and(
        eq(patterns.userId, userId),
        gte(patterns.detectedAt, startDate)
      )
    )
    .orderBy(desc(patterns.detectedAt));
}

/**
 * Interventions
 */
export async function createIntervention(
  userId: number,
  data: {
    message: string;
    detectedPatterns: any[];
    riskScore: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(interventions).values({
    userId,
    message: data.message,
    detectedPatterns: JSON.stringify(data.detectedPatterns),
    riskScore: data.riskScore.toString(),
  });
}

export async function getInterventionsByUserId(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(interventions)
    .where(eq(interventions.userId, userId))
    .orderBy(desc(interventions.triggeredAt))
    .limit(limit);
}

export async function updateInterventionResponse(
  interventionId: number,
  response: "accepted" | "dismissed" | "ignored"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(interventions)
    .set({
      userResponse: response,
      respondedAt: new Date(),
    })
    .where(eq(interventions.id, interventionId));
}

/**
 * Chat Conversations
 */
export async function createChatConversation(
  userId: number,
  interventionId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatConversations).values({
    userId,
    interventionId,
  });

  return result;
}

export async function getChatConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.id, conversationId))
    .limit(1);

  return result[0];
}

/**
 * Chat Messages
 */
export async function createChatMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(chatMessages).values({
    conversationId,
    role,
    content,
  });
}

export async function getChatMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt));
}

/**
 * Intervention History
 */
export async function getOrCreateInterventionHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(interventionHistory)
    .where(eq(interventionHistory.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(interventionHistory).values({
    userId,
  });

  return db
    .select()
    .from(interventionHistory)
    .where(eq(interventionHistory.userId, userId))
    .limit(1)
    .then((r) => r[0]);
}

export async function updateInterventionHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userInterventions = await db
    .select()
    .from(interventions)
    .where(eq(interventions.userId, userId));

  const total = userInterventions.length;
  const accepted = userInterventions.filter(
    (i) => i.userResponse === "accepted"
  ).length;
  const dismissed = userInterventions.filter(
    (i) => i.userResponse === "dismissed"
  ).length;
  const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

  return db
    .update(interventionHistory)
    .set({
      totalInterventions: total,
      acceptedInterventions: accepted,
      dismissedInterventions: dismissed,
      acceptanceRate: acceptanceRate.toString(),
      lastInterventionAt: userInterventions[0]?.triggeredAt,
    })
    .where(eq(interventionHistory.userId, userId));
}

/**
 * Admin Metrics
 */
export async function getAdminMetrics(metricsDate: Date) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminMetrics)
    .where(eq(adminMetrics.metricsDate, metricsDate))
    .limit(1);

  return result[0];
}

export async function createOrUpdateAdminMetrics(data: {
  metricsDate: Date;
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  totalInterventions: number;
  interventionAcceptanceRate: number;
  retentionDay1: number;
  retentionDay7: number;
  retentionDay30: number;
  avgMoodScore: number;
  avgWellnessScore: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getAdminMetrics(data.metricsDate);

  const updateData = {
    metricsDate: data.metricsDate,
    totalUsers: data.totalUsers,
    activeUsers: data.activeUsers,
    dailyActiveUsers: data.dailyActiveUsers,
    totalInterventions: data.totalInterventions,
    interventionAcceptanceRate: data.interventionAcceptanceRate.toString(),
    retentionDay1: data.retentionDay1.toString(),
    retentionDay7: data.retentionDay7.toString(),
    retentionDay30: data.retentionDay30.toString(),
    avgMoodScore: data.avgMoodScore.toString(),
    avgWellnessScore: data.avgWellnessScore.toString(),
  };

  if (existing) {
    return db
      .update(adminMetrics)
      .set(updateData)
      .where(eq(adminMetrics.metricsDate, data.metricsDate));
  }

  return db.insert(adminMetrics).values(updateData);
}


