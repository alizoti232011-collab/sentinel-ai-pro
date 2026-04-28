import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as features from "./features";
import { invokeLLM } from "./_core/llm";

export const journalRouter = router({
  // Create journal entry
  createEntry: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1),
        emotionTags: z.array(z.string()).optional(),
        moodScore: z.number().min(1).max(10).optional(),
        isPrivate: z.boolean().optional(),
        isShareableWithTherapist: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.createJournalEntry(ctx.user.id, input);

      // AI Analysis: Sentiment, themes, reflection
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an empathetic AI therapist. Analyze this journal entry and provide:
1. Sentiment classification (very_negative, negative, neutral, positive, very_positive)
2. Key themes (extract 2-3 main themes)
3. A brief, compassionate reflection (2-3 sentences)

Respond in JSON format: { "sentiment": "...", "themes": [...], "reflection": "..." }`,
            },
            {
              role: "user",
              content: input.content,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "journal_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  sentiment: { type: "string" },
                  themes: { type: "array", items: { type: "string" } },
                  reflection: { type: "string" },
                },
                required: ["sentiment", "themes", "reflection"],
                additionalProperties: false,
              },
            },
          },
        });

        const analysis = JSON.parse(response.choices[0].message.content as string);
        // Update entry with analysis (would need to add this to features.ts)
      } catch (error) {
        console.error("LLM analysis failed:", error);
      }

      return { success: true };
    }),

  // Get all entries
  getEntries: protectedProcedure.query(async ({ ctx }) => {
    return await features.getJournalEntries(ctx.user.id);
  }),

  // Get journal stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await features.getJournalStats(ctx.user.id);
  }),

  // Get journal insights
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    const stats = await features.getJournalStats(ctx.user.id);
    const entries = await features.getJournalEntries(ctx.user.id, 100);

    // Calculate mood trend
    const moodTrend = entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / entries.length
      : 0;

    // Most common triggers
    const triggers: Record<string, number> = {};
    entries.forEach((e) => {
      const words = e.content.toLowerCase().split(/\s+/);
      const commonWords = ["work", "family", "friend", "stress", "anxiety", "happy", "sad", "tired"];
      words.forEach((word) => {
        if (commonWords.includes(word)) {
          triggers[word] = (triggers[word] || 0) + 1;
        }
      });
    });

    return {
      stats,
      moodTrend,
      topTriggers: Object.entries(triggers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }),

  // Track intervention effectiveness
  trackEffectiveness: protectedProcedure
    .input(
      z.object({
        interventionId: z.number(),
        moodBefore: z.number().optional(),
        moodAfter: z.number().optional(),
        userReachedOut: z.boolean().optional(),
        userExercised: z.boolean().optional(),
        userJournaled: z.boolean().optional(),
        effectiveness: z.number().optional(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.trackInterventionEffectiveness(ctx.user.id, input.interventionId, input);
      return { success: true };
    }),

  // Get intervention effectiveness
  getEffectiveness: protectedProcedure.query(async ({ ctx }) => {
    return await features.getInterventionEffectiveness(ctx.user.id);
  }),

  // Create silence period
  createSilencePeriod: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.createSilencePeriod(ctx.user.id, input);
      return { success: true };
    }),

  // Check if user is in silence
  isInSilence: protectedProcedure.query(async ({ ctx }) => {
    return await features.isUserInSilence(ctx.user.id);
  }),

  // Get behavioral debt
  getBehavioralDebt: protectedProcedure.query(async ({ ctx }) => {
    return await features.getBehavioralDebt(ctx.user.id);
  }),

  // Update behavioral debt
  updateBehavioralDebt: protectedProcedure
    .input(
      z.object({
        skippedExerciseDays: z.number().optional(),
        cancelledPlansCount: z.number().optional(),
        isolationDays: z.number().optional(),
        exerciseDaysCompleted: z.number().optional(),
        plansHonored: z.number().optional(),
        socialEngagements: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.updateBehavioralDebt(ctx.user.id, input);
      return { success: true };
    }),

  // Create mood anchor
  createMoodAnchor: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string(),
        transcription: z.string().optional(),
        recordedWhen: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.createMoodAnchor(ctx.user.id, input);
      return { success: true };
    }),

  // Get mood anchors
  getMoodAnchors: protectedProcedure.query(async ({ ctx }) => {
    return await features.getMoodAnchors(ctx.user.id);
  }),

  // Get pattern history (for Pattern Replay)
  getPatternHistory: protectedProcedure.query(async ({ ctx }) => {
    return await features.getPatternHistory(ctx.user.id);
  }),

  // Create pattern snapshot
  createPatternSnapshot: protectedProcedure
    .input(
      z.object({
        avgMood: z.number().optional(),
        avgSleep: z.number().optional(),
        avgScreenTime: z.number().optional(),
        avgActivity: z.number().optional(),
        activePatterns: z.array(z.string()).optional(),
        wellnessScore: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.createPatternSnapshot(ctx.user.id, input);
      return { success: true };
    }),

  // Get reverse interventions
  getReverseInterventions: protectedProcedure.query(async ({ ctx }) => {
    return await features.getReverseInterventions(ctx.user.id);
  }),

  // Create reverse intervention
  createReverseIntervention: protectedProcedure
    .input(
      z.object({
        suggestion: z.string(),
        helpType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await features.createReverseIntervention(ctx.user.id, input);
      return { success: true };
    }),

  // Get buddy match
  getBuddyMatch: protectedProcedure.query(async ({ ctx }) => {
    return await features.getBuddyMatch(ctx.user.id);
  }),

  // Export for therapist
  exportForTherapist: protectedProcedure.query(async ({ ctx }) => {
    const entries = await features.getJournalEntries(ctx.user.id, 30);
    const stats = await features.getJournalStats(ctx.user.id);
    const effectiveness = await features.getInterventionEffectiveness(ctx.user.id);

    return {
      exportDate: new Date(),
      userName: ctx.user.name,
      entries: entries.filter((e) => e.isShareableWithTherapist),
      stats,
      effectiveness,
      recommendation: "Please discuss these patterns and coping strategies with your therapist.",
    };
  }),
});
