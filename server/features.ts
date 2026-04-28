import { getDb } from "./db";
import { journalEntries, interventionEffectiveness, buddyMatches, silencePeriods, behavioralDebt, moodAnchors, patternHistory, reverseInterventions } from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

/**
 * JOURNAL FEATURES
 */

export async function createJournalEntry(userId: number, data: {
  title?: string;
  content: string;
  emotionTags?: string[];
  moodScore?: number;
  isPrivate?: boolean;
  isShareableWithTherapist?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(journalEntries).values({
    userId,
    title: data.title,
    content: data.content,
    emotionTags: data.emotionTags ? JSON.stringify(data.emotionTags) : null,
    moodScore: data.moodScore,
    isPrivate: data.isPrivate ?? true,
    isShareableWithTherapist: data.isShareableWithTherapist ?? false,
    entryDate: new Date(),
  });

  return result;
}

export async function getJournalEntries(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.entryDate))
    .limit(limit);

  return entries.map(e => ({
    ...e,
    emotionTags: e.emotionTags ? JSON.parse(e.emotionTags as string) : [],
    keyThemes: e.keyThemes ? JSON.parse(e.keyThemes as string) : [],
  }));
}

export async function updateJournalEntry(entryId: number, userId: number, data: {
  sentiment?: string;
  keyThemes?: string[];
  aiReflection?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(journalEntries)
    .set({
      sentiment: data.sentiment as any,
      keyThemes: data.keyThemes ? JSON.stringify(data.keyThemes) : undefined,
      aiReflection: data.aiReflection,
    })
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));
}

export async function getJournalStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId));

  const stats = {
    totalEntries: entries.length,
    averageMood: entries.length > 0 
      ? entries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / entries.length 
      : 0,
    emotionFrequency: {} as Record<string, number>,
    sentimentDistribution: {} as Record<string, number>,
  };

  entries.forEach(e => {
    if (e.emotionTags) {
      const tags = JSON.parse(e.emotionTags as string);
      tags.forEach((tag: string) => {
        stats.emotionFrequency[tag] = (stats.emotionFrequency[tag] || 0) + 1;
      });
    }
    if (e.sentiment) {
      stats.sentimentDistribution[e.sentiment] = (stats.sentimentDistribution[e.sentiment] || 0) + 1;
    }
  });

  return stats;
}

/**
 * INTERVENTION EFFECTIVENESS
 */

export async function trackInterventionEffectiveness(userId: number, interventionId: number, data: {
  moodBefore?: number;
  moodAfter?: number;
  userReachedOut?: boolean;
  userExercised?: boolean;
  userJournaled?: boolean;
  effectiveness?: number;
  feedback?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(interventionEffectiveness).values({
    userId,
    interventionId,
    moodBefore: data.moodBefore,
    moodAfter: data.moodAfter,
    userReachedOut: data.userReachedOut,
    userExercised: data.userExercised,
    userJournaled: data.userJournaled,
    effectiveness: data.effectiveness,
    feedback: data.feedback,
    measuredAt: new Date(),
  });
}

export async function getInterventionEffectiveness(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data = await db
    .select()
    .from(interventionEffectiveness)
    .where(eq(interventionEffectiveness.userId, userId));

  const stats = {
    totalInterventions: data.length,
    averageMoodImprovement: 0,
    acceptanceRate: 0,
    mostEffectiveType: "",
  };

  if (data.length > 0) {
    const improvements = data
      .filter(d => d.moodBefore && d.moodAfter)
      .map(d => (d.moodAfter || 0) - (d.moodBefore || 0));
    
    stats.averageMoodImprovement = improvements.length > 0
      ? improvements.reduce((a, b) => a + b, 0) / improvements.length
      : 0;

    const accepted = data.filter(d => d.effectiveness && d.effectiveness >= 4).length;
    stats.acceptanceRate = (accepted / data.length) * 100;
  }

  return stats;
}

/**
 * BUDDY MATCHING
 */

export async function createBuddyMatch(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(buddyMatches).values({
    userId1,
    userId2,
  });
}

export async function getBuddyMatch(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const match = await db
    .select()
    .from(buddyMatches)
    .where(and(
      eq(buddyMatches.status, "active"),
      // Match where user is either userId1 or userId2
    ))
    .limit(1);

  return match[0] || null;
}

/**
 * SILENCE PERIODS
 */

export async function createSilencePeriod(userId: number, data: {
  reason?: string;
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(silencePeriods).values({
    userId,
    reason: data.reason,
    startDate: data.startDate,
    endDate: data.endDate,
  });
}

export async function isUserInSilence(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const silences = await db
    .select()
    .from(silencePeriods)
    .where(and(
      eq(silencePeriods.userId, userId),
      lte(silencePeriods.startDate, now),
      gte(silencePeriods.endDate, now),
    ));

  return silences.length > 0;
}

/**
 * BEHAVIORAL DEBT
 */

export async function getBehavioralDebt(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const debt = await db
    .select()
    .from(behavioralDebt)
    .where(eq(behavioralDebt.userId, userId))
    .limit(1);

  return debt[0] || null;
}

export async function updateBehavioralDebt(userId: number, updates: {
  skippedExerciseDays?: number;
  cancelledPlansCount?: number;
  isolationDays?: number;
  exerciseDaysCompleted?: number;
  plansHonored?: number;
  socialEngagements?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getBehavioralDebt(userId);
  
  if (existing) {
    await db
      .update(behavioralDebt)
      .set(updates)
      .where(eq(behavioralDebt.userId, userId));
  } else {
    await db.insert(behavioralDebt).values({
      userId,
      ...updates,
    });
  }
}

/**
 * MOOD ANCHORS
 */

export async function createMoodAnchor(userId: number, data: {
  audioUrl: string;
  transcription?: string;
  recordedWhen?: string;
  duration?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(moodAnchors).values({
    userId,
    audioUrl: data.audioUrl,
    transcription: data.transcription,
    recordedWhen: data.recordedWhen,
    duration: data.duration,
  });
}

export async function getMoodAnchors(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(moodAnchors)
    .where(eq(moodAnchors.userId, userId));
}

/**
 * PATTERN HISTORY
 */

export async function createPatternSnapshot(userId: number, data: {
  avgMood?: number;
  avgSleep?: number;
  avgScreenTime?: number;
  avgActivity?: number;
  activePatterns?: string[];
  wellnessScore?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(patternHistory).values({
    userId,
    snapshotDate: new Date(),
    avgMood: data.avgMood ? String(data.avgMood) : null,
    avgSleep: data.avgSleep ? String(data.avgSleep) : null,
    avgScreenTime: data.avgScreenTime ? String(data.avgScreenTime) : null,
    avgActivity: data.avgActivity ? String(data.avgActivity) : null,
    activePatterns: data.activePatterns ? JSON.stringify(data.activePatterns) : null,
    wellnessScore: data.wellnessScore ? String(data.wellnessScore) : null,
  });
}

export async function getPatternHistory(userId: number, months = 3) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - months);

  const history = await db
    .select()
    .from(patternHistory)
    .where(and(
      eq(patternHistory.userId, userId),
      gte(patternHistory.snapshotDate, threeMonthsAgo),
    ))
    .orderBy(desc(patternHistory.snapshotDate));

  return history.map(h => ({
    ...h,
    activePatterns: h.activePatterns ? JSON.parse(h.activePatterns as string) : [],
  }));
}

/**
 * REVERSE INTERVENTIONS
 */

export async function createReverseIntervention(userId: number, data: {
  suggestion: string;
  helpType?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(reverseInterventions).values({
    userId,
    suggestion: data.suggestion,
    helpType: data.helpType,
  });
}

export async function getReverseInterventions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(reverseInterventions)
    .where(eq(reverseInterventions.userId, userId))
    .orderBy(desc(reverseInterventions.triggeredAt));
}
