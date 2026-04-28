import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional fields for Sentinel AI.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Sentinel AI specific fields
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastLogDate: timestamp("lastLogDate"),
  wellnessScore: decimal("wellnessScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Daily behavioral logs - stores user's daily input data
 */
export const behavioralLogs = mysqlTable("behavioral_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Daily metrics
  sleepHours: decimal("sleepHours", { precision: 4, scale: 2 }).notNull(),
  screenTimeHours: decimal("screenTimeHours", { precision: 4, scale: 2 }).notNull(),
  moodScore: int("moodScore").notNull(), // 1-10
  energyLevel: int("energyLevel").notNull(), // 1-10
  activityKm: decimal("activityKm", { precision: 5, scale: 2 }).notNull(),
  cancelledPlans: int("cancelledPlans").default(0).notNull(),
  
  // Metadata
  logDate: timestamp("logDate").notNull(), // The date being logged for
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BehavioralLog = typeof behavioralLogs.$inferSelect;
export type InsertBehavioralLog = typeof behavioralLogs.$inferInsert;

/**
 * Detected patterns - stores pattern detection results
 */
export const patterns = mysqlTable("patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Pattern types
  patternType: mysqlEnum("patternType", [
    "doom_scrolling",
    "sleep_deprivation",
    "social_withdrawal",
    "mood_decline",
    "inactivity",
    "combined_distress"
  ]).notNull(),
  
  // Pattern data
  severity: mysqlEnum("severity", ["low", "medium", "high"]).notNull(),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).notNull(), // 0-100
  description: text("description"),
  
  // Detection metadata
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Pattern = typeof patterns.$inferSelect;
export type InsertPattern = typeof patterns.$inferInsert;

/**
 * Interventions - stores AI-generated intervention messages and user responses
 */
export const interventions = mysqlTable("interventions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Intervention content
  message: text("message").notNull(), // AI-generated empathetic message
  detectedPatterns: json("detectedPatterns").notNull(), // JSON array of pattern IDs
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).notNull(),
  
  // User response
  userResponse: mysqlEnum("userResponse", ["accepted", "dismissed", "ignored"]).default("ignored"),
  respondedAt: timestamp("respondedAt"),
  
  // Metadata
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Intervention = typeof interventions.$inferSelect;
export type InsertIntervention = typeof interventions.$inferInsert;

/**
 * Chat conversations - stores AI chat history after intervention
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  interventionId: int("interventionId").notNull(),
  
  // Conversation metadata
  status: mysqlEnum("status", ["active", "closed", "archived"]).default("active").notNull(),
  
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Chat messages - stores individual messages in a conversation
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  
  // Message content
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Intervention history - aggregate data for analytics
 */
export const interventionHistory = mysqlTable("intervention_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Aggregate metrics
  totalInterventions: int("totalInterventions").default(0).notNull(),
  acceptedInterventions: int("acceptedInterventions").default(0).notNull(),
  dismissedInterventions: int("dismissedInterventions").default(0).notNull(),
  acceptanceRate: decimal("acceptanceRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  
  // Last intervention
  lastInterventionAt: timestamp("lastInterventionAt"),
  
  // Timestamps
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterventionHistory = typeof interventionHistory.$inferSelect;
export type InsertInterventionHistory = typeof interventionHistory.$inferInsert;

/**
 * Admin metrics - pre-aggregated data for investor dashboard
 */
export const adminMetrics = mysqlTable("admin_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Daily snapshot metrics
  metricsDate: timestamp("metricsDate").notNull(),
  
  // User metrics
  totalUsers: int("totalUsers").default(0).notNull(),
  activeUsers: int("activeUsers").default(0).notNull(),
  dailyActiveUsers: int("dailyActiveUsers").default(0).notNull(),
  
  // Intervention metrics
  totalInterventions: int("totalInterventions").default(0).notNull(),
  interventionAcceptanceRate: decimal("interventionAcceptanceRate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  
  // Retention metrics
  retentionDay1: decimal("retentionDay1", { precision: 5, scale: 2 }).default("0.00").notNull(),
  retentionDay7: decimal("retentionDay7", { precision: 5, scale: 2 }).default("0.00").notNull(),
  retentionDay30: decimal("retentionDay30", { precision: 5, scale: 2 }).default("0.00").notNull(),
  
  // Engagement metrics
  avgMoodScore: decimal("avgMoodScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  avgWellnessScore: decimal("avgWellnessScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminMetric = typeof adminMetrics.$inferSelect;
export type InsertAdminMetric = typeof adminMetrics.$inferInsert;
