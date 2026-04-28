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


/**
 * Journal entries - stores user journal entries with AI analysis
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Entry content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  
  // Emotion/mood tagging
  emotionTags: json("emotionTags"), // JSON array of emotions
  moodScore: int("moodScore"), // 1-10 if provided
  
  // AI analysis
  sentiment: mysqlEnum("sentiment", ["very_negative", "negative", "neutral", "positive", "very_positive"]),
  keyThemes: json("keyThemes"), // JSON array of extracted themes
  aiReflection: text("aiReflection"), // AI-generated response
  
  // Privacy
  isPrivate: boolean("isPrivate").default(true).notNull(),
  isShareableWithTherapist: boolean("isShareableWithTherapist").default(false).notNull(),
  
  // Timestamps
  entryDate: timestamp("entryDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Intervention effectiveness tracking
 */
export const interventionEffectiveness = mysqlTable("intervention_effectiveness", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  interventionId: int("interventionId").notNull(),
  
  // Effectiveness metrics
  moodBefore: int("moodBefore"), // 1-10
  moodAfter: int("moodAfter"), // 1-10 (measured 24h later)
  userReachedOut: boolean("userReachedOut").default(false),
  userExercised: boolean("userExercised").default(false),
  userJournaled: boolean("userJournaled").default(false),
  
  // User rating
  effectiveness: int("effectiveness"), // 1-5 rating
  feedback: text("feedback"),
  
  // Timestamps
  measuredAt: timestamp("measuredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterventionEffectiveness = typeof interventionEffectiveness.$inferSelect;
export type InsertInterventionEffectiveness = typeof interventionEffectiveness.$inferInsert;

/**
 * Accountability buddy matching
 */
export const buddyMatches = mysqlTable("buddy_matches", {
  id: int("id").autoincrement().primaryKey(),
  userId1: int("userId1").notNull(),
  userId2: int("userId2").notNull(),
  
  // Match metadata
  matchedAt: timestamp("matchedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "paused", "ended"]).default("active").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuddyMatch = typeof buddyMatches.$inferSelect;
export type InsertBuddyMatch = typeof buddyMatches.$inferInsert;

/**
 * Silence periods - when users don't want interventions
 */
export const silencePeriods = mysqlTable("silence_periods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Period details
  reason: varchar("reason", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  // Monitoring (silent but still tracking)
  stillMonitoring: boolean("stillMonitoring").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SilencePeriod = typeof silencePeriods.$inferSelect;
export type InsertSilencePeriod = typeof silencePeriods.$inferInsert;

/**
 * Behavioral debt tracking
 */
export const behavioralDebt = mysqlTable("behavioral_debt", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Debt metrics
  skippedExerciseDays: int("skippedExerciseDays").default(0).notNull(),
  cancelledPlansCount: int("cancelledPlansCount").default(0).notNull(),
  isolationDays: int("isolationDays").default(0).notNull(),
  
  // Payback
  exerciseDaysCompleted: int("exerciseDaysCompleted").default(0).notNull(),
  plansHonored: int("plansHonored").default(0).notNull(),
  socialEngagements: int("socialEngagements").default(0).notNull(),
  
  // Timestamps
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BehavioralDebt = typeof behavioralDebt.$inferSelect;
export type InsertBehavioralDebt = typeof behavioralDebt.$inferInsert;

/**
 * Mood anchors - voice memos for tough times
 */
export const moodAnchors = mysqlTable("mood_anchors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Audio content
  audioUrl: text("audioUrl").notNull(), // URL to stored audio file
  transcription: text("transcription"),
  
  // Metadata
  recordedWhen: varchar("recordedWhen", { length: 255 }), // e.g., "happy", "grateful", "hopeful"
  duration: int("duration"), // seconds
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodAnchor = typeof moodAnchors.$inferSelect;
export type InsertMoodAnchor = typeof moodAnchors.$inferInsert;

/**
 * Pattern history for replay feature
 */
export const patternHistory = mysqlTable("pattern_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Pattern snapshot
  snapshotDate: timestamp("snapshotDate").notNull(),
  
  // Metrics at that time
  avgMood: decimal("avgMood", { precision: 5, scale: 2 }),
  avgSleep: decimal("avgSleep", { precision: 5, scale: 2 }),
  avgScreenTime: decimal("avgScreenTime", { precision: 5, scale: 2 }),
  avgActivity: decimal("avgActivity", { precision: 5, scale: 2 }),
  
  // Detected patterns
  activePatterns: json("activePatterns"), // JSON array
  wellnessScore: decimal("wellnessScore", { precision: 5, scale: 2 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PatternHistory = typeof patternHistory.$inferSelect;
export type InsertPatternHistory = typeof patternHistory.$inferInsert;

/**
 * Reverse interventions - when user is doing well and can help others
 */
export const reverseInterventions = mysqlTable("reverse_interventions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Suggestion
  suggestion: text("suggestion").notNull(), // "You're doing well, consider helping..."
  helpType: varchar("helpType", { length: 255 }), // e.g., "listen_to_friend", "volunteer", "mentor"
  
  // User response
  userResponse: mysqlEnum("userResponse", ["accepted", "dismissed", "ignored"]).default("ignored"),
  respondedAt: timestamp("respondedAt"),
  
  // Timestamps
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReverseIntervention = typeof reverseInterventions.$inferSelect;
export type InsertReverseIntervention = typeof reverseInterventions.$inferInsert;


/**
 * ============================================================================
 * PREGNANCY FEATURES (39 tables)
 * ============================================================================
 */

/**
 * Pregnancy tracking - core pregnancy information
 */
export const pregnancyTracking = mysqlTable("pregnancy_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Pregnancy status
  pregnancyStatus: mysqlEnum("pregnancyStatus", ["not_pregnant", "pregnant", "postpartum", "not_trying"]).default("not_pregnant").notNull(),
  pregnancyWeek: int("pregnancyWeek"),
  trimester: mysqlEnum("trimester", ["first", "second", "third"]),
  dueDate: timestamp("dueDate"),
  lastMenstrualPeriod: timestamp("lastMenstrualPeriod"),
  
  // Risk factors
  hasHistoryOfMiscarriage: boolean("hasHistoryOfMiscarriage").default(false).notNull(),
  hasHistoryOfPPD: boolean("hasHistoryOfPPD").default(false).notNull(),
  hasHistoryOfMentalIllness: boolean("hasHistoryOfMentalIllness").default(false).notNull(),
  highRiskPregnancy: boolean("highRiskPregnancy").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PregnancyTracking = typeof pregnancyTracking.$inferSelect;
export type InsertPregnancyTracking = typeof pregnancyTracking.$inferInsert;

/**
 * Daily pregnancy metrics
 */
export const pregnancyMetrics = mysqlTable("pregnancy_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Daily scores
  bodyImageScore: int("bodyImageScore"), // 1-10
  relationshipSatisfaction: int("relationshipSatisfaction"), // 1-10
  laborAnxiety: int("laborAnxiety"), // 1-10
  perinatalAnxietyScore: int("perinatalAnxietyScore"), // 1-10
  hormoneLevel: varchar("hormoneLevel", { length: 50 }), // "low", "normal", "high"
  
  // Tracking
  ppdRiskScore: decimal("ppdRiskScore", { precision: 5, scale: 2 }), // 0-100
  ppdRiskFactors: json("ppdRiskFactors"), // JSON array of risk factors
  prenatalCareAdherence: int("prenatalCareAdherence"), // 0-100%
  
  // Timestamps
  metricDate: timestamp("metricDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PregnancyMetric = typeof pregnancyMetrics.$inferSelect;
export type InsertPregnancyMetric = typeof pregnancyMetrics.$inferInsert;

/**
 * Pregnancy medications tracking
 */
export const pregnancyMedications = mysqlTable("pregnancy_medications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Medication info
  medicationName: varchar("medicationName", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 255 }),
  frequency: varchar("frequency", { length: 255 }),
  safetyStatus: mysqlEnum("safetyStatus", ["safe", "caution", "avoid", "unknown"]).default("unknown").notNull(),
  
  // Tracking
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PregnancyMedication = typeof pregnancyMedications.$inferSelect;
export type InsertPregnancyMedication = typeof pregnancyMedications.$inferInsert;

/**
 * Prenatal appointments tracking
 */
export const prenatalAppointments = mysqlTable("prenatal_appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Appointment details
  appointmentType: varchar("appointmentType", { length: 255 }), // "OB visit", "ultrasound", etc
  appointmentDate: timestamp("appointmentDate").notNull(),
  completed: boolean("completed").default(false).notNull(),
  
  // Results
  notes: text("notes"),
  testResults: json("testResults"), // JSON object of results
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrenatalAppointment = typeof prenatalAppointments.$inferSelect;
export type InsertPrenatalAppointment = typeof prenatalAppointments.$inferInsert;

/**
 * Miscarriage trauma tracking
 */
export const miscarriageTrauma = mysqlTable("miscarriage_trauma", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Trauma info
  miscarriageDate: timestamp("miscarriageDate").notNull(),
  weekOfPregnancy: int("weekOfPregnancy"),
  traumaLevel: int("traumaLevel"), // 1-10
  
  // Support
  supportReceived: text("supportReceived"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MiscarriageTrauma = typeof miscarriageTrauma.$inferSelect;
export type InsertMiscarriageTrauma = typeof miscarriageTrauma.$inferInsert;

/**
 * High-risk pregnancy conditions
 */
export const highRiskConditions = mysqlTable("high_risk_conditions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Condition info
  conditionName: varchar("conditionName", { length: 255 }).notNull(), // "gestational hypertension", etc
  diagnosedDate: timestamp("diagnosedDate").notNull(),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]).default("mild").notNull(),
  
  // Management
  managementPlan: text("managementPlan"),
  monitoringFrequency: varchar("monitoringFrequency", { length: 255 }), // "daily", "weekly", etc
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HighRiskCondition = typeof highRiskConditions.$inferSelect;
export type InsertHighRiskCondition = typeof highRiskConditions.$inferInsert;

/**
 * Pregnancy loss grief tracking
 */
export const pregnancyLossGrief = mysqlTable("pregnancy_loss_grief", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Loss info
  lossDate: timestamp("lossDate").notNull(),
  lossType: mysqlEnum("lossType", ["miscarriage", "stillbirth", "termination"]).notNull(),
  weekOfPregnancy: int("weekOfPregnancy"),
  
  // Grief tracking
  griefStage: mysqlEnum("griefStage", ["denial", "anger", "bargaining", "depression", "acceptance"]).default("denial").notNull(),
  griefIntensity: int("griefIntensity"), // 1-10
  
  // Support
  supportGroups: json("supportGroups"), // JSON array of support group IDs
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PregnancyLossGrief = typeof pregnancyLossGrief.$inferSelect;
export type InsertPregnancyLossGrief = typeof pregnancyLossGrief.$inferInsert;

/**
 * Postpartum metrics
 */
export const postpartumMetrics = mysqlTable("postpartum_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Days postpartum
  dayPostpartum: int("dayPostpartum").notNull(),
  
  // Screening scores
  edinburghScore: int("edinburghScore"), // PPD screening (0-30)
  postpartumAnxietyScore: int("postpartumAnxietyScore"), // 1-10
  bondingScore: int("bondingScore"), // 1-10
  
  // Physical recovery
  sleepHours: decimal("sleepHours", { precision: 4, scale: 2 }),
  physicalSymptoms: json("physicalSymptoms"), // JSON array
  
  // Mental health
  feedingBurnout: int("feedingBurnout"), // 1-10
  returnToWorkAnxiety: int("returnToWorkAnxiety"), // 1-10
  
  // Timestamps
  metricDate: timestamp("metricDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostpartumMetric = typeof postpartumMetrics.$inferSelect;
export type InsertPostpartumMetric = typeof postpartumMetrics.$inferInsert;

/**
 * Postpartum support planning
 */
export const postpartumSupportPlan = mysqlTable("postpartum_support_plan", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Support arrangements
  postpartumDoula: varchar("postpartumDoula", { length: 255 }),
  therapist: varchar("therapist", { length: 255 }),
  supportGroup: varchar("supportGroup", { length: 255 }),
  emergencyContacts: json("emergencyContacts"), // JSON array
  
  // Plan details
  planDetails: text("planDetails"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostpartumSupportPlan = typeof postpartumSupportPlan.$inferSelect;
export type InsertPostpartumSupportPlan = typeof postpartumSupportPlan.$inferInsert;

/**
 * Breastfeeding tracking
 */
export const breastfeedingTracking = mysqlTable("breastfeeding_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Feeding info
  feedingMethod: mysqlEnum("feedingMethod", ["breastfeeding", "pumping", "formula", "mixed"]).notNull(),
  durationMinutes: int("durationMinutes"),
  
  // Mood tracking
  moodBefore: int("moodBefore"), // 1-10
  moodAfter: int("moodAfter"), // 1-10
  
  // Challenges
  challenges: json("challenges"), // JSON array of challenges
  
  // Timestamps
  feedingDate: timestamp("feedingDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BreastfeedingTracking = typeof breastfeedingTracking.$inferSelect;
export type InsertBreastfeedingTracking = typeof breastfeedingTracking.$inferInsert;

/**
 * Maternal identity tracking
 */
export const maternalIdentity = mysqlTable("maternal_identity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Identity metrics
  identitySatisfaction: int("identitySatisfaction"), // 1-10
  identityIntegration: int("identityIntegration"), // 1-10
  
  // Reflections
  reflection: text("reflection"),
  
  // Timestamps
  metricDate: timestamp("metricDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaternalIdentity = typeof maternalIdentity.$inferSelect;
export type InsertMaternalIdentity = typeof maternalIdentity.$inferInsert;

/**
 * Financial stress tracking
 */
export const financialStressTracking = mysqlTable("financial_stress_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Stress level
  financialStress: int("financialStress"), // 1-10
  
  // Resources
  resourcesAccessed: json("resourcesAccessed"), // JSON array
  
  // Timestamps
  metricDate: timestamp("metricDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialStressTracking = typeof financialStressTracking.$inferSelect;
export type InsertFinancialStressTracking = typeof financialStressTracking.$inferInsert;

/**
 * Social support tracking
 */
export const socialSupportTracking = mysqlTable("social_support_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Connection metrics
  socialConnectionScore: int("socialConnectionScore"), // 1-10
  isolationLevel: int("isolationLevel"), // 1-10
  
  // Engagements
  socialEngagements: int("socialEngagements"), // count
  
  // Timestamps
  metricDate: timestamp("metricDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialSupportTracking = typeof socialSupportTracking.$inferSelect;
export type InsertSocialSupportTracking = typeof socialSupportTracking.$inferInsert;

/**
 * OB/GYN collaboration
 */
export const obGynCollaboration = mysqlTable("ob_gyn_collaboration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Doctor info
  doctorName: varchar("doctorName", { length: 255 }),
  doctorEmail: varchar("doctorEmail", { length: 255 }),
  
  // Data sharing
  dataSharing: boolean("dataSharing").default(false).notNull(),
  lastSharedAt: timestamp("lastSharedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ObGynCollaboration = typeof obGynCollaboration.$inferSelect;
export type InsertObGynCollaboration = typeof obGynCollaboration.$inferInsert;

/**
 * Midwife integration
 */
export const midwifeIntegration = mysqlTable("midwife_integration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Midwife info
  midwifeName: varchar("midwifeName", { length: 255 }),
  midwifeEmail: varchar("midwifeEmail", { length: 255 }),
  
  // Care coordination
  careCoordination: boolean("careCoordination").default(false).notNull(),
  lastCoordinatedAt: timestamp("lastCoordinatedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MidwifeIntegration = typeof midwifeIntegration.$inferSelect;
export type InsertMidwifeIntegration = typeof midwifeIntegration.$inferInsert;

/**
 * Perinatal psychiatrist connection
 */
export const perinatalPsychiatrist = mysqlTable("perinatal_psychiatrist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Specialist info
  psychiatristName: varchar("psychiatristName", { length: 255 }),
  psychiatristEmail: varchar("psychiatristEmail", { length: 255 }),
  telemedicineAvailable: boolean("telemedicineAvailable").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerinatalPsychiatrist = typeof perinatalPsychiatrist.$inferSelect;
export type InsertPerinatalPsychiatrist = typeof perinatalPsychiatrist.$inferInsert;

/**
 * Lactation consultant integration
 */
export const lactationConsultant = mysqlTable("lactation_consultant", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Consultant info
  consultantName: varchar("consultantName", { length: 255 }),
  consultantEmail: varchar("consultantEmail", { length: 255 }),
  
  // Data sharing
  feedingDataSharing: boolean("feedingDataSharing").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LactationConsultant = typeof lactationConsultant.$inferSelect;
export type InsertLactationConsultant = typeof lactationConsultant.$inferInsert;

/**
 * Pregnancy support groups
 */
export const pregnancySupportGroups = mysqlTable("pregnancy_support_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Group info
  groupName: varchar("groupName", { length: 255 }).notNull(),
  groupType: varchar("groupType", { length: 255 }), // "general", "high-risk", "loss", etc
  
  // Membership
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PregnancySupportGroup = typeof pregnancySupportGroups.$inferSelect;
export type InsertPregnancySupportGroup = typeof pregnancySupportGroups.$inferInsert;

/**
 * Mother-to-mother mentoring
 */
export const mentorMatching = mysqlTable("mentor_matching", {
  id: int("id").autoincrement().primaryKey(),
  menteeId: int("menteeId").notNull(),
  mentorId: int("mentorId").notNull(),
  
  // Match info
  matchedAt: timestamp("matchedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "paused", "ended"]).default("active").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorMatching = typeof mentorMatching.$inferSelect;
export type InsertMentorMatching = typeof mentorMatching.$inferInsert;

/**
 * Partner support program
 */
export const partnerSupport = mysqlTable("partner_support", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Partner info
  partnerName: varchar("partnerName", { length: 255 }),
  partnerEmail: varchar("partnerEmail", { length: 255 }),
  
  // Education
  educationCompleted: boolean("educationCompleted").default(false).notNull(),
  educationModules: json("educationModules"), // JSON array
  
  // Engagement
  engagementLevel: int("engagementLevel"), // 1-10
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerSupport = typeof partnerSupport.$inferSelect;
export type InsertPartnerSupport = typeof partnerSupport.$inferInsert;

/**
 * Family education tracking
 */
export const familyEducation = mysqlTable("family_education", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Family members
  familyMemberName: varchar("familyMemberName", { length: 255 }),
  relationship: varchar("relationship", { length: 255 }), // "mother", "sister", etc
  
  // Education
  educationCompleted: boolean("educationCompleted").default(false).notNull(),
  educationModules: json("educationModules"), // JSON array
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyEducation = typeof familyEducation.$inferSelect;
export type InsertFamilyEducation = typeof familyEducation.$inferInsert;

/**
 * Workplace accommodation guide
 */
export const workplaceAccommodations = mysqlTable("workplace_accommodations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Accommodation info
  accommodationType: varchar("accommodationType", { length: 255 }), // "flexible schedule", etc
  requested: boolean("requested").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  
  // Communication
  employerCommunication: text("employerCommunication"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkplaceAccommodation = typeof workplaceAccommodations.$inferSelect;
export type InsertWorkplaceAccommodation = typeof workplaceAccommodations.$inferInsert;

/**
 * Fertility & conception tracking
 */
export const fertilityTracking = mysqlTable("fertility_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Fertility journey
  tryingToConceiveMonths: int("tryingToConceiveMonths"),
  cycleLength: int("cycleLength"),
  
  // Grief tracking
  infertilityGrief: int("infertilityGrief"), // 1-10
  
  // Support
  counselorConnected: boolean("counselorConnected").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FertilityTracking = typeof fertilityTracking.$inferSelect;
export type InsertFertilityTracking = typeof fertilityTracking.$inferInsert;

/**
 * ============================================================================
 * ADVANCED FEATURES (25 tables)
 * ============================================================================
 */

/**
 * Wearable device ecosystem
 */
export const wearableDevices = mysqlTable("wearable_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Device info
  deviceType: mysqlEnum("deviceType", ["apple_watch", "fitbit", "oura_ring", "whoop", "other"]).notNull(),
  deviceName: varchar("deviceName", { length: 255 }),
  
  // Connection
  connected: boolean("connected").default(false).notNull(),
  connectedAt: timestamp("connectedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = typeof wearableDevices.$inferInsert;

/**
 * Wearable data points (HRV, sleep, stress, activity)
 */
export const wearableData = mysqlTable("wearable_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: int("deviceId").notNull(),
  
  // Biomarkers
  heartRateVariability: decimal("heartRateVariability", { precision: 5, scale: 2 }), // HRV
  sleepQuality: int("sleepQuality"), // 1-10
  stressLevel: int("stressLevel"), // 1-10
  activityMinutes: int("activityMinutes"),
  
  // Timestamps
  dataDate: timestamp("dataDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableDataPoint = typeof wearableData.$inferSelect;
export type InsertWearableDataPoint = typeof wearableData.$inferInsert;

/**
 * Voice analysis & emotion detection
 */
export const voiceAnalysis = mysqlTable("voice_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Audio info
  audioUrl: text("audioUrl").notNull(),
  transcription: text("transcription"),
  duration: int("duration"), // seconds
  
  // Analysis
  tone: varchar("tone", { length: 255 }), // "anxious", "calm", etc
  pitch: decimal("pitch", { precision: 5, scale: 2 }),
  speed: decimal("speed", { precision: 5, scale: 2 }),
  detectedEmotions: json("detectedEmotions"), // JSON array
  emotionScore: decimal("emotionScore", { precision: 5, scale: 2 }), // 0-100
  
  // Timestamps
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoiceAnalysis = typeof voiceAnalysis.$inferSelect;
export type InsertVoiceAnalysis = typeof voiceAnalysis.$inferInsert;

/**
 * Facial expression analysis
 */
export const facialAnalysis = mysqlTable("facial_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Video info
  videoUrl: text("videoUrl").notNull(),
  duration: int("duration"), // seconds
  
  // Analysis
  detectedExpressions: json("detectedExpressions"), // JSON array
  microExpressions: json("microExpressions"), // JSON array
  distressIndicators: json("distressIndicators"), // JSON array
  overallMood: varchar("overallMood", { length: 255 }),
  
  // Timestamps
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FacialAnalysis = typeof facialAnalysis.$inferSelect;
export type InsertFacialAnalysis = typeof facialAnalysis.$inferInsert;

/**
 * Sleep architecture analysis
 */
export const sleepArchitecture = mysqlTable("sleep_architecture", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Sleep stages
  remSleep: decimal("remSleep", { precision: 5, scale: 2 }), // percentage
  deepSleep: decimal("deepSleep", { precision: 5, scale: 2 }), // percentage
  lightSleep: decimal("lightSleep", { precision: 5, scale: 2 }), // percentage
  
  // Quality
  sleepQuality: int("sleepQuality"), // 1-10
  
  // Recommendations
  recommendations: json("recommendations"), // JSON array
  
  // Timestamps
  sleepDate: timestamp("sleepDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SleepArchitecture = typeof sleepArchitecture.$inferSelect;
export type InsertSleepArchitecture = typeof sleepArchitecture.$inferInsert;

/**
 * Gut-brain axis tracking
 */
export const gutBrainAxis = mysqlTable("gut_brain_axis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Food intake
  foodItem: varchar("foodItem", { length: 255 }).notNull(),
  mealType: varchar("mealType", { length: 255 }), // "breakfast", "lunch", etc
  
  // Mood correlation
  moodBefore: int("moodBefore"), // 1-10
  moodAfter: int("moodAfter"), // 1-10
  anxietyLevel: int("anxietyLevel"), // 1-10
  
  // Timestamps
  mealDate: timestamp("mealDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GutBrainAxis = typeof gutBrainAxis.$inferSelect;
export type InsertGutBrainAxis = typeof gutBrainAxis.$inferInsert;

/**
 * Microbiome integration
 */
export const microbiomeData = mysqlTable("microbiome_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Test info
  testProvider: varchar("testProvider", { length: 255 }), // "Viome", "Thorne", etc
  testDate: timestamp("testDate").notNull(),
  
  // Analysis
  depressionMarkers: decimal("depressionMarkers", { precision: 5, scale: 2 }), // risk score
  recommendations: json("recommendations"), // JSON array
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MicrobiomeData = typeof microbiomeData.$inferSelect;
export type InsertMicrobiomeData = typeof microbiomeData.$inferInsert;

/**
 * Menstrual cycle tracking (women)
 */
export const menstrualCycleTracking = mysqlTable("menstrual_cycle_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Cycle info
  cycleDay: int("cycleDay"),
  phase: mysqlEnum("phase", ["menstruation", "follicular", "ovulation", "luteal"]),
  
  // Mood tracking
  moodScore: int("moodScore"), // 1-10
  anxietyLevel: int("anxietyLevel"), // 1-10
  
  // Symptoms
  symptoms: json("symptoms"), // JSON array
  
  // Timestamps
  trackingDate: timestamp("trackingDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenstrualCycleTracking = typeof menstrualCycleTracking.$inferSelect;
export type InsertMenstrualCycleTracking = typeof menstrualCycleTracking.$inferInsert;

/**
 * Hormone tracking (testosterone, cortisol)
 */
export const hormoneTracking = mysqlTable("hormone_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Hormone levels
  testosterone: decimal("testosterone", { precision: 8, scale: 2 }),
  cortisol: decimal("cortisol", { precision: 8, scale: 2 }),
  estrogen: decimal("estrogen", { precision: 8, scale: 2 }),
  progesterone: decimal("progesterone", { precision: 8, scale: 2 }),
  
  // Mood correlation
  moodScore: int("moodScore"), // 1-10
  
  // Timestamps
  testDate: timestamp("testDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HormoneTracking = typeof hormoneTracking.$inferSelect;
export type InsertHormoneTracking = typeof hormoneTracking.$inferInsert;

/**
 * Social network analysis
 */
export const socialNetworkAnalysis = mysqlTable("social_network_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Relationship info
  contactName: varchar("contactName", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 255 }), // "friend", "family", etc
  
  // Impact analysis
  stressImpact: int("stressImpact"), // 1-10 (negative impact)
  supportLevel: int("supportLevel"), // 1-10 (positive support)
  
  // Recommendations
  boundaryRecommendations: text("boundaryRecommendations"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialNetworkAnalysis = typeof socialNetworkAnalysis.$inferSelect;
export type InsertSocialNetworkAnalysis = typeof socialNetworkAnalysis.$inferInsert;

/**
 * Environmental data tracking
 */
export const environmentalTracking = mysqlTable("environmental_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Environmental factors
  airQualityIndex: int("airQualityIndex"),
  lightQuality: int("lightQuality"), // 1-10
  noiseLevel: int("noiseLevel"), // dB
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // Celsius
  
  // Mood correlation
  moodScore: int("moodScore"), // 1-10
  anxietyLevel: int("anxietyLevel"), // 1-10
  
  // Timestamps
  dataDate: timestamp("dataDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EnvironmentalTracking = typeof environmentalTracking.$inferSelect;
export type InsertEnvironmentalTracking = typeof environmentalTracking.$inferInsert;

/**
 * Chronotype optimization
 */
export const chronotypeOptimization = mysqlTable("chronotype_optimization", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Chronotype
  chronotype: mysqlEnum("chronotype", ["morning_person", "night_owl", "intermediate"]),
  
  // Optimal schedule
  optimalWakeTime: varchar("optimalWakeTime", { length: 255 }), // "7:00 AM"
  optimalBedTime: varchar("optimalBedTime", { length: 255 }), // "11:00 PM"
  optimalWorkTime: varchar("optimalWorkTime", { length: 255 }), // "10:00 AM - 2:00 PM"
  
  // Productivity & mood
  productivityScore: int("productivityScore"), // 1-10
  moodScore: int("moodScore"), // 1-10
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChronotypeOptimization = typeof chronotypeOptimization.$inferSelect;
export type InsertChronotypeOptimization = typeof chronotypeOptimization.$inferInsert;

/**
 * Neurotransmitter prediction
 */
export const neurotransmitterPrediction = mysqlTable("neurotransmitter_prediction", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Predicted levels
  dopamineLevel: int("dopamineLevel"), // 1-10
  serotoninLevel: int("serotoninLevel"), // 1-10
  gabaLevel: int("gabaLevel"), // 1-10
  
  // Recommendations
  boostingActivities: json("boostingActivities"), // JSON array
  
  // Timestamps
  predictionDate: timestamp("predictionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NeurotransmitterPrediction = typeof neurotransmitterPrediction.$inferSelect;
export type InsertNeurotransmitterPrediction = typeof neurotransmitterPrediction.$inferInsert;

/**
 * Inflammation tracking
 */
export const inflammationTracking = mysqlTable("inflammation_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Biomarkers
  crpLevel: decimal("crpLevel", { precision: 8, scale: 2 }), // C-Reactive Protein
  inflammatoryMarkers: json("inflammatoryMarkers"), // JSON array
  
  // Mood correlation
  moodScore: int("moodScore"), // 1-10
  depressionRisk: int("depressionRisk"), // 1-100
  
  // Recommendations
  antiInflammatoryPlan: text("antiInflammatoryPlan"),
  
  // Timestamps
  testDate: timestamp("testDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InflammationTracking = typeof inflammationTracking.$inferSelect;
export type InsertInflammationTracking = typeof inflammationTracking.$inferInsert;

/**
 * Genetic data & counseling
 */
export const geneticData = mysqlTable("genetic_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // DNA info
  dnaProvider: varchar("dnaProvider", { length: 255 }), // "23andMe", "Ancestry", etc
  uploadDate: timestamp("uploadDate").notNull(),
  
  // Genetic risks
  mentalHealthRisks: json("mentalHealthRisks"), // JSON array
  bipolarRisk: decimal("bipolarRisk", { precision: 5, scale: 2 }), // percentage
  depressionRisk: decimal("depressionRisk", { precision: 5, scale: 2 }), // percentage
  
  // Counselor connection
  counselorConnected: boolean("counselorConnected").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneticData = typeof geneticData.$inferSelect;
export type InsertGeneticData = typeof geneticData.$inferInsert;

/**
 * Circadian rhythm biohacking
 */
export const circadianBiohacking = mysqlTable("circadian_biohacking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Light exposure
  sunlightExposureTime: varchar("sunlightExposureTime", { length: 255 }), // "7:00 AM"
  sunlightDuration: int("sunlightDuration"), // minutes
  
  // Melatonin
  melatoninTime: varchar("melatoninTime", { length: 255 }), // "9:00 PM"
  melatoninDosage: varchar("melatoninDosage", { length: 255 }), // "0.5mg"
  
  // Sleep-wake cycle
  sleepQuality: int("sleepQuality"), // 1-10
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CircadianBiohacking = typeof circadianBiohacking.$inferSelect;
export type InsertCircadianBiohacking = typeof circadianBiohacking.$inferInsert;

/**
 * Trauma-informed care tracking
 */
export const traumaInformedCare = mysqlTable("trauma_informed_care", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Trauma history
  traumaHistory: text("traumaHistory"),
  traumaType: varchar("traumaType", { length: 255 }), // "PTSD", "childhood abuse", etc
  
  // Triggers
  identifiedTriggers: json("identifiedTriggers"), // JSON array
  
  // Safe interventions
  safeInterventions: json("safeInterventions"), // JSON array
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TraumaInformedCare = typeof traumaInformedCare.$inferSelect;
export type InsertTraumaInformedCare = typeof traumaInformedCare.$inferInsert;

/**
 * Cultural competency tracking
 */
export const culturalCompetency = mysqlTable("cultural_competency", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Cultural background
  culturalBackground: varchar("culturalBackground", { length: 255 }),
  primaryLanguage: varchar("primaryLanguage", { length: 255 }),
  
  // Cultural values
  culturalValues: json("culturalValues"), // JSON array
  
  // Preferences
  culturalPreferences: json("culturalPreferences"), // JSON array
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CulturalCompetency = typeof culturalCompetency.$inferSelect;
export type InsertCulturalCompetency = typeof culturalCompetency.$inferInsert;

/**
 * Accessibility settings
 */
export const accessibilitySettings = mysqlTable("accessibility_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Settings
  voiceOnlyMode: boolean("voiceOnlyMode").default(false).notNull(),
  textToSpeechEnabled: boolean("textToSpeechEnabled").default(false).notNull(),
  dyslexiaFriendlyFont: boolean("dyslexiaFriendlyFont").default(false).notNull(),
  adhdFriendlyUI: boolean("adhdFriendlyUI").default(false).notNull(),
  highContrast: boolean("highContrast").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccessibilitySettings = typeof accessibilitySettings.$inferSelect;
export type InsertAccessibilitySettings = typeof accessibilitySettings.$inferInsert;

/**
 * Data ownership & marketplace
 */
export const dataOwnership = mysqlTable("data_ownership", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Data sharing
  dataOwnershipEnabled: boolean("dataOwnershipEnabled").default(true).notNull(),
  canSellAnonymizedData: boolean("canSellAnonymizedData").default(false).notNull(),
  
  // Earnings
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataOwnership = typeof dataOwnership.$inferSelect;
export type InsertDataOwnership = typeof dataOwnership.$inferInsert;

/**
 * AI therapist clone
 */
export const aiTherapistClone = mysqlTable("ai_therapist_clone", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Therapist info
  therapistName: varchar("therapistName", { length: 255 }),
  
  // Training data
  recordedSessions: int("recordedSessions").default(0).notNull(),
  therapistStyle: text("therapistStyle"), // Learned style description
  
  // Availability
  cloneAvailable: boolean("cloneAvailable").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiTherapistClone = typeof aiTherapistClone.$inferSelect;
export type InsertAiTherapistClone = typeof aiTherapistClone.$inferInsert;

/**
 * Psychedelic integration
 */
export const psychedelicIntegration = mysqlTable("psychedelic_integration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Session info
  sessionDate: timestamp("sessionDate").notNull(),
  substanceType: varchar("substanceType", { length: 255 }), // "psilocybin", "LSD", etc
  dosage: varchar("dosage", { length: 255 }),
  
  // Integration tracking
  integrationStage: mysqlEnum("integrationStage", ["pre_session", "during_session", "post_session", "integrated"]).default("pre_session").notNull(),
  insights: text("insights"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PsychedelicIntegration = typeof psychedelicIntegration.$inferSelect;
export type InsertPsychedelicIntegration = typeof psychedelicIntegration.$inferInsert;

/**
 * Meditation brain training
 */
export const meditationBrainTraining = mysqlTable("meditation_brain_training", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Session info
  sessionDuration: int("sessionDuration"), // minutes
  sessionType: varchar("sessionType", { length: 255 }), // "breathing", "body scan", etc
  
  // Brain wave data
  thetaWaves: decimal("thetaWaves", { precision: 5, scale: 2 }), // percentage
  alphaWaves: decimal("alphaWaves", { precision: 5, scale: 2 }), // percentage
  
  // Quality
  meditationQuality: int("meditationQuality"), // 1-10
  
  // Gamification
  streakDays: int("streakDays").default(0).notNull(),
  
  // Timestamps
  sessionDate: timestamp("sessionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationBrainTraining = typeof meditationBrainTraining.$inferSelect;
export type InsertMeditationBrainTraining = typeof meditationBrainTraining.$inferInsert;

/**
 * Longevity prediction
 */
export const longevityPrediction = mysqlTable("longevity_prediction", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Prediction
  predictedLifespan: int("predictedLifespan"), // years
  mentalHealthContribution: int("mentalHealthContribution"), // years added/subtracted
  
  // Health score
  overallHealthScore: int("overallHealthScore"), // 1-100
  
  // Timestamps
  predictionDate: timestamp("predictionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LongevityPrediction = typeof longevityPrediction.$inferSelect;
export type InsertLongevityPrediction = typeof longevityPrediction.$inferInsert;

/**
 * Ancestral trauma healing
 */
export const ancestralTraumaHealing = mysqlTable("ancestral_trauma_healing", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Family history
  familyMemberName: varchar("familyMemberName", { length: 255 }),
  relationship: varchar("relationship", { length: 255 }), // "grandmother", "father", etc
  traumaType: varchar("traumaType", { length: 255 }), // "war", "migration", etc
  
  // Generational patterns
  identifiedPatterns: json("identifiedPatterns"), // JSON array
  
  // Healing practices
  healingPractices: json("healingPractices"), // JSON array
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AncestralTraumaHealing = typeof ancestralTraumaHealing.$inferSelect;
export type InsertAncestralTraumaHealing = typeof ancestralTraumaHealing.$inferInsert;
