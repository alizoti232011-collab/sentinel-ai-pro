import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createBehavioralLog,
  getBehavioralLogsByUserId,
  getLatestBehavioralLog,
  createPattern,
  getPatternsByUserId,
  createIntervention,
  getInterventionsByUserId,
  updateInterventionResponse,
  getOrCreateInterventionHistory,
  updateInterventionHistory,
} from "./db";
import { invokeLLM } from "./_core/llm";

const detectPatterns = async (userId: number, log: any) => {
  const patterns = [];
  let riskScore = 0;

  if (log.screenTimeHours > 3.5) {
    patterns.push({
      type: "doom_scrolling",
      severity: log.screenTimeHours > 5 ? "high" : "medium",
      score: Math.min((log.screenTimeHours / 8) * 100, 100),
    });
    riskScore += log.screenTimeHours > 5 ? 3 : 2;
  }

  if (log.sleepHours < 6) {
    patterns.push({
      type: "sleep_deprivation",
      severity: log.sleepHours < 4 ? "high" : "medium",
      score: Math.min(((6 - log.sleepHours) / 6) * 100, 100),
    });
    riskScore += log.sleepHours < 4 ? 3 : 2;
  }

  if (log.cancelledPlans >= 2) {
    patterns.push({
      type: "social_withdrawal",
      severity: log.cancelledPlans >= 3 ? "high" : "medium",
      score: Math.min((log.cancelledPlans / 5) * 100, 100),
    });
    riskScore += log.cancelledPlans >= 3 ? 3 : 2;
  }

  if (log.moodScore < 5) {
    patterns.push({
      type: "mood_decline",
      severity: log.moodScore < 3 ? "high" : "medium",
      score: Math.min(((5 - log.moodScore) / 5) * 100, 100),
    });
    riskScore += log.moodScore < 3 ? 3 : 2;
  }

  if (log.activityKm < 2) {
    patterns.push({
      type: "inactivity",
      severity: log.activityKm < 0.5 ? "high" : "medium",
      score: Math.min(((2 - log.activityKm) / 2) * 100, 100),
    });
    riskScore += log.activityKm < 0.5 ? 2 : 1;
  }

  for (const pattern of patterns) {
    await createPattern(userId, {
      patternType: pattern.type as any,
      severity: pattern.severity as any,
      riskScore: pattern.score,
      description: `Detected ${pattern.type.replace(/_/g, " ")}`,
    });
  }

  return { patterns, riskScore: Math.min(riskScore, 100) };
};

const generateInterventionMessage = async (userId: number, patterns: any[], log: any) => {
  const patternDescriptions = patterns
    .map((p) => `- ${p.type.replace(/_/g, " ")}: ${p.severity} severity`)
    .join("\n");

  const prompt = `You are Sentinel AI, a compassionate mental wellness assistant. A user has shown behavioral patterns suggesting they might be struggling:

${patternDescriptions}

Current metrics: Sleep ${log.sleepHours}h, Screen ${log.screenTimeHours}h, Mood ${log.moodScore}/10, Energy ${log.energyLevel}/10, Activity ${log.activityKm}km, Cancelled plans ${log.cancelledPlans}.

Generate a brief (2-3 sentences), warm, empathetic message that gently reaches out.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system" as const,
        content: "You are Sentinel AI, a compassionate mental wellness assistant.",
      },
      {
        role: "user" as const,
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Hey, I've noticed something might be off. Want to talk?";
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  behavioral: router({
    logData: protectedProcedure
      .input(
        z.object({
          sleepHours: z.number().min(0).max(12),
          screenTimeHours: z.number().min(0).max(24),
          moodScore: z.number().min(1).max(10),
          energyLevel: z.number().min(1).max(10),
          activityKm: z.number().min(0).max(50),
          cancelledPlans: z.number().min(0).max(10),
          logDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const logDate = input.logDate || new Date();

        await createBehavioralLog(ctx.user.id, {
          sleepHours: input.sleepHours,
          screenTimeHours: input.screenTimeHours,
          moodScore: input.moodScore,
          energyLevel: input.energyLevel,
          activityKm: input.activityKm,
          cancelledPlans: input.cancelledPlans,
          logDate,
        });

        const { patterns, riskScore } = await detectPatterns(ctx.user.id, input);

        let intervention = null;
        if (riskScore >= 40 && patterns.length >= 2) {
          const message = await generateInterventionMessage(ctx.user.id, patterns, input);

          await createIntervention(ctx.user.id, {
            message,
            detectedPatterns: patterns,
            riskScore,
          });

          intervention = { message, riskScore, patterns };
        }

        return { success: true, patterns, riskScore, intervention };
      }),

    getRecent: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return getBehavioralLogsByUserId(ctx.user.id, input.days);
      }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return getLatestBehavioralLog(ctx.user.id);
    }),
  }),

  patterns: router({
    getRecent: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return getPatternsByUserId(ctx.user.id, input.days);
      }),
  }),

  interventions: router({
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return getInterventionsByUserId(ctx.user.id, input.limit);
      }),

    respond: protectedProcedure
      .input(
        z.object({
          interventionId: z.number(),
          response: z.enum(["accepted", "dismissed", "ignored"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateInterventionResponse(input.interventionId, input.response);
        await updateInterventionHistory(ctx.user.id);
        return { success: true };
      }),
  }),

  user: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const recentLogs = await getBehavioralLogsByUserId(ctx.user.id, 7);
      const recentPatterns = await getPatternsByUserId(ctx.user.id, 7);
      const recentInterventions = await getInterventionsByUserId(ctx.user.id, 10);
      const interventionHistory = await getOrCreateInterventionHistory(ctx.user.id);

      const avgMood =
        recentLogs.length > 0
          ? recentLogs.reduce((sum, log) => sum + log.moodScore, 0) / recentLogs.length
          : 0;

      return {
        currentStreak: ctx.user.currentStreak || 0,
        longestStreak: ctx.user.longestStreak || 0,
        wellnessScore: ctx.user.wellnessScore || 0,
        recentLogs,
        recentPatterns,
        recentInterventions,
        interventionHistory,
        avgMood,
      };
    }),
  }),

  admin: router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return { totalUsers: 0, activeUsers: 0, interventionRate: 0 };
    }),
  }),
});

export type AppRouter = typeof appRouter;
