import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { detectCrisisIndicators, getEmergencyResources } from '../lib/aiSafety';
import { generateIntervention } from '../lib/ollama';

/**
 * Pregnancy Features Router
 * Handles all pregnancy-related features including tracking, PPD screening, prenatal care
 */

export const pregnancyRouter = router({
  // ============================================================================
  // PREGNANCY TRACKING
  // ============================================================================

  /**
   * Start pregnancy tracking
   */
  startPregnancy: protectedProcedure
    .input(
      z.object({
        conceptionDate: z.string().datetime(),
        dueDate: z.string().datetime(),
        pregnancyType: z.enum(['singleton', 'twins', 'triplets', 'other']),
        previousPregnancies: z.number().min(0),
        previousMiscarriages: z.number().min(0),
        medicalConditions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const conceptionDate = new Date(input.conceptionDate);
        const dueDate = new Date(input.dueDate);
        const currentDate = new Date();

        // Calculate pregnancy week
        const weeksDiff = Math.floor((currentDate.getTime() - conceptionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const trimester = weeksDiff <= 12 ? 1 : weeksDiff <= 27 ? 2 : 3;

        const { data, error } = await supabase.from('pregnancy_tracking').insert([
          {
            user_id: ctx.user.id,
            conception_date: conceptionDate.toISOString(),
            due_date: dueDate.toISOString(),
            current_week: weeksDiff,
            trimester,
            pregnancy_type: input.pregnancyType,
            previous_pregnancies: input.previousPregnancies,
            previous_miscarriages: input.previousMiscarriages,
            medical_conditions: input.medicalConditions || [],
            status: 'active',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: `Pregnancy tracking started! You are ${weeksDiff} weeks pregnant (Trimester ${trimester})`,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to start pregnancy tracking: ${error.message}`);
      }
    }),

  /**
   * Get pregnancy status
   */
  getPregnancyStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_tracking')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return { isPregnant: false, data: null };
      }

      // Calculate current week
      const conceptionDate = new Date(data.conception_date);
      const currentDate = new Date();
      const currentWeek = Math.floor((currentDate.getTime() - conceptionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

      return {
        isPregnant: true,
        data: {
          ...data,
          current_week: currentWeek,
          weeks_remaining: Math.max(0, 40 - currentWeek),
          trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get pregnancy status: ${error.message}`);
    }
  }),

  // ============================================================================
  // PPD RISK SCREENING
  // ============================================================================

  /**
   * Complete PPD risk screening
   */
  completePPDScreening: protectedProcedure
    .input(
      z.object({
        historyOfDepression: z.boolean(),
        historyOfAnxiety: z.boolean(),
        lackOfSupport: z.boolean(),
        pregnancyComplications: z.boolean(),
        traumaHistory: z.boolean(),
        sleepDeprivation: z.boolean(),
        stressfulEvents: z.boolean(),
        hormoneChanges: z.boolean(),
        previousPPD: z.boolean(),
        additionalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Calculate PPD risk score
        const riskFactors = Object.values(input).filter((v) => v === true).length;
        const riskScore = (riskFactors / 9) * 100;

        let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
        if (riskScore < 25) riskLevel = 'low';
        else if (riskScore < 50) riskLevel = 'moderate';
        else if (riskScore < 75) riskLevel = 'high';
        else riskLevel = 'very_high';

        const { data, error } = await supabase.from('ppd_screening').insert([
          {
            user_id: ctx.user.id,
            history_of_depression: input.historyOfDepression,
            history_of_anxiety: input.historyOfAnxiety,
            lack_of_support: input.lackOfSupport,
            pregnancy_complications: input.pregnancyComplications,
            trauma_history: input.traumaHistory,
            sleep_deprivation: input.sleepDeprivation,
            stressful_events: input.stressfulEvents,
            hormone_changes: input.hormoneChanges,
            previous_ppd: input.previousPPD,
            risk_score: riskScore,
            risk_level: riskLevel,
            additional_notes: input.additionalNotes,
          },
        ]);

        if (error) throw error;

        // Generate personalized recommendation
        let recommendation = '';
        if (riskLevel === 'very_high') {
          recommendation = 'You have significant risk factors for PPD. Please schedule an appointment with your OB/GYN or mental health professional before delivery.';
        } else if (riskLevel === 'high') {
          recommendation = 'You have moderate to high risk factors for PPD. Consider connecting with a postpartum support specialist.';
        } else if (riskLevel === 'moderate') {
          recommendation = 'You have some risk factors for PPD. Building a strong support system will be helpful.';
        } else {
          recommendation = 'Your PPD risk appears lower, but postpartum support is always beneficial.';
        }

        return {
          success: true,
          riskLevel,
          riskScore,
          recommendation,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to complete PPD screening: ${error.message}`);
      }
    }),

  /**
   * Get PPD screening results
   */
  getPPDScreening: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('ppd_screening')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    } catch (error: any) {
      throw new Error(`Failed to get PPD screening: ${error.message}`);
    }
  }),

  // ============================================================================
  // POSTPARTUM MOOD TRACKING
  // ============================================================================

  /**
   * Log postpartum mood
   */
  logPostpartumMood: protectedProcedure
    .input(
      z.object({
        moodScore: z.number().min(1).max(10),
        anxietyLevel: z.number().min(1).max(10),
        sleepQuality: z.number().min(1).max(10),
        bondingFeeling: z.number().min(1).max(10),
        energyLevel: z.number().min(1).max(10),
        notes: z.string().optional(),
        daysSinceDelivery: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('postpartum_mood_tracking').insert([
          {
            user_id: ctx.user.id,
            mood_score: input.moodScore,
            anxiety_level: input.anxietyLevel,
            sleep_quality: input.sleepQuality,
            bonding_feeling: input.bondingFeeling,
            energy_level: input.energyLevel,
            notes: input.notes,
            days_since_delivery: input.daysSinceDelivery,
          },
        ]);

        if (error) throw error;

        // Check for crisis indicators
        const crisisCheck = detectCrisisIndicators(input.notes || '');
        if (crisisCheck.needsImmediateIntervention) {
          const resources = getEmergencyResources();
          return {
            success: true,
            data: data?.[0],
            crisis: true,
            crisisMessage: crisisCheck.recommendedAction,
            resources,
          };
        }

        // Generate supportive message if mood is low
        if (input.moodScore <= 4) {
          const intervention = await generateIntervention(
            `Postpartum mother feeling low (${input.moodScore}/10). Anxiety: ${input.anxietyLevel}/10. Sleep: ${input.sleepQuality}/10. Notes: ${input.notes}`
          );

          return {
            success: true,
            data: data?.[0],
            intervention,
          };
        }

        return { success: true, data: data?.[0] };
      } catch (error: any) {
        throw new Error(`Failed to log postpartum mood: ${error.message}`);
      }
    }),

  /**
   * Get postpartum mood history
   */
  getPostpartumMoodHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase
          .from('postpartum_mood_tracking')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get postpartum mood history: ${error.message}`);
      }
    }),

  // ============================================================================
  // PRENATAL APPOINTMENTS
  // ============================================================================

  /**
   * Schedule prenatal appointment
   */
  schedulePrenatalAppointment: protectedProcedure
    .input(
      z.object({
        appointmentDate: z.string().datetime(),
        appointmentType: z.enum(['ultrasound', 'checkup', 'lab', 'specialist', 'other']),
        provider: z.string(),
        location: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('prenatal_appointments').insert([
          {
            user_id: ctx.user.id,
            appointment_date: input.appointmentDate,
            appointment_type: input.appointmentType,
            provider: input.provider,
            location: input.location,
            notes: input.notes,
            status: 'scheduled',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: `Appointment scheduled with ${input.provider} on ${new Date(input.appointmentDate).toLocaleDateString()}`,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to schedule appointment: ${error.message}`);
      }
    }),

  /**
   * Get upcoming appointments
   */
  getUpcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('prenatal_appointments')
        .select('*')
        .eq('user_id', ctx.user.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to get appointments: ${error.message}`);
    }
  }),

  /**
   * Mark appointment as completed
   */
  completeAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        notes: z.string().optional(),
        nextAppointmentDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase
          .from('prenatal_appointments')
          .update({ status: 'completed', completion_notes: input.notes })
          .eq('id', input.appointmentId)
          .eq('user_id', ctx.user.id);

        if (error) throw error;

        return { success: true, message: 'Appointment marked as completed' };
      } catch (error: any) {
        throw new Error(`Failed to complete appointment: ${error.message}`);
      }
    }),
});
