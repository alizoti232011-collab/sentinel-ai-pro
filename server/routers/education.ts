import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { storagePut } from '../storage';

/**
 * Education & Provider Integration Router
 * Prenatal education hub, birth plan templates, and provider sharing
 */

export const educationRouter = router({
  // ============================================================================
  // PRENATAL EDUCATION HUB
  // ============================================================================

  /**
   * Get education resources
   */
  getEducationResources: protectedProcedure
    .input(
      z.object({
        category: z.enum(['labor', 'nutrition', 'exercise', 'mental_health', 'partner', 'postpartum', 'general']).optional(),
        trimester: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = supabase.from('education_resources').select('*');

        if (input.category) {
          query = query.eq('category', input.category);
        }

        if (input.trimester) {
          query = query.contains('recommended_trimester', [input.trimester]);
        }

        const { data, error } = await query.limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get education resources: ${error.message}`);
      }
    }),

  /**
   * Create birth plan
   */
  createBirthPlan: protectedProcedure
    .input(
      z.object({
        laborPreferences: z.object({
          birthLocation: z.enum(['hospital', 'birthing_center', 'home']),
          laborSupport: z.array(z.string()),
          painManagement: z.array(z.string()),
          positions: z.array(z.string()),
          music: z.boolean(),
          lighting: z.string().optional(),
        }),
        deliveryPreferences: z.object({
          episiotomy: z.enum(['avoid', 'if_necessary', 'no_preference']),
          immediateContact: z.boolean(),
          delayedCordClamping: z.boolean(),
          placenta: z.enum(['hospital', 'keep', 'no_preference']),
        }),
        postpartumPreferences: z.object({
          skinToSkin: z.boolean(),
          breastfeeding: z.boolean(),
          rooming: z.boolean(),
          visitors: z.string().optional(),
        }),
        emergencyPreferences: z.object({
          cesarean: z.string().optional(),
          complications: z.string().optional(),
          nicu: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('birth_plans').insert([
          {
            user_id: ctx.user.id,
            labor_preferences: input.laborPreferences,
            delivery_preferences: input.deliveryPreferences,
            postpartum_preferences: input.postpartumPreferences,
            emergency_preferences: input.emergencyPreferences,
            status: 'draft',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Birth plan created!',
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to create birth plan: ${error.message}`);
      }
    }),

  /**
   * Get birth plan
   */
  getBirthPlan: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('birth_plans')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    } catch (error: any) {
      throw new Error(`Failed to get birth plan: ${error.message}`);
    }
  }),

  /**
   * Export birth plan as PDF
   */
  exportBirthPlanPDF: protectedProcedure
    .input(z.object({ birthPlanId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: birthPlan, error: planError } = await supabase
          .from('birth_plans')
          .select('*')
          .eq('id', input.birthPlanId)
          .eq('user_id', ctx.user.id)
          .single();

        if (planError) throw planError;

        // Create PDF content
        const pdfContent = `
BIRTH PLAN

Labor Preferences:
- Location: ${birthPlan.labor_preferences.birthLocation}
- Support: ${birthPlan.labor_preferences.laborSupport.join(', ')}
- Pain Management: ${birthPlan.labor_preferences.painManagement.join(', ')}
- Positions: ${birthPlan.labor_preferences.positions.join(', ')}
- Music: ${birthPlan.labor_preferences.music ? 'Yes' : 'No'}

Delivery Preferences:
- Episiotomy: ${birthPlan.delivery_preferences.episiotomy}
- Immediate Contact: ${birthPlan.delivery_preferences.immediateContact ? 'Yes' : 'No'}
- Delayed Cord Clamping: ${birthPlan.delivery_preferences.delayedCordClamping ? 'Yes' : 'No'}
- Placenta: ${birthPlan.delivery_preferences.placenta}

Postpartum Preferences:
- Skin to Skin: ${birthPlan.postpartum_preferences.skinToSkin ? 'Yes' : 'No'}
- Breastfeeding: ${birthPlan.postpartum_preferences.breastfeeding ? 'Yes' : 'No'}
- Rooming: ${birthPlan.postpartum_preferences.rooming ? 'Yes' : 'No'}
- Visitors: ${birthPlan.postpartum_preferences.visitors || 'Not specified'}

Emergency Preferences:
${birthPlan.emergency_preferences.cesarean ? `- Cesarean: ${birthPlan.emergency_preferences.cesarean}` : ''}
${birthPlan.emergency_preferences.complications ? `- Complications: ${birthPlan.emergency_preferences.complications}` : ''}
${birthPlan.emergency_preferences.nicu ? `- NICU: ${birthPlan.emergency_preferences.nicu}` : ''}
        `;

        return {
          success: true,
          content: pdfContent,
          fileName: 'birth-plan.pdf',
        };
      } catch (error: any) {
        throw new Error(`Failed to export birth plan: ${error.message}`);
      }
    }),

  // ============================================================================
  // PROVIDER INTEGRATION
  // ============================================================================

  /**
   * Generate PPD report for provider
   */
  generatePPDReport: protectedProcedure
    .input(z.object({ daysPostpartum: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get PPD screening
        const { data: screening, error: screeningError } = await supabase
          .from('ppd_screening')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (screeningError && screeningError.code !== 'PGRST116') throw screeningError;

        // Get postpartum mood history
        const { data: moodHistory, error: moodError } = await supabase
          .from('postpartum_mood_tracking')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false });

        if (moodError) throw moodError;

        // Calculate averages
        const avgMood = moodHistory ? (moodHistory.reduce((sum: number, m: any) => sum + m.mood_score, 0) / moodHistory.length).toFixed(1) : 'N/A';
        const avgAnxiety = moodHistory ? (moodHistory.reduce((sum: number, m: any) => sum + m.anxiety_level, 0) / moodHistory.length).toFixed(1) : 'N/A';
        const avgSleep = moodHistory ? (moodHistory.reduce((sum: number, m: any) => sum + m.sleep_quality, 0) / moodHistory.length).toFixed(1) : 'N/A';

        const reportContent = `
POSTPARTUM DEPRESSION SCREENING REPORT

Patient: ${ctx.user.name || 'Patient'}
Generated: ${new Date().toLocaleDateString()}

SCREENING RESULTS:
Risk Level: ${screening?.risk_level || 'Not assessed'}
Risk Score: ${screening?.risk_score || 'N/A'}%

Risk Factors Identified:
- History of Depression: ${screening?.history_of_depression ? 'Yes' : 'No'}
- History of Anxiety: ${screening?.history_of_anxiety ? 'Yes' : 'No'}
- Lack of Support: ${screening?.lack_of_support ? 'Yes' : 'No'}
- Pregnancy Complications: ${screening?.pregnancy_complications ? 'Yes' : 'No'}
- Trauma History: ${screening?.trauma_history ? 'Yes' : 'No'}
- Sleep Deprivation: ${screening?.sleep_deprivation ? 'Yes' : 'No'}
- Stressful Events: ${screening?.stressful_events ? 'Yes' : 'No'}
- Hormone Changes: ${screening?.hormone_changes ? 'Yes' : 'No'}
- Previous PPD: ${screening?.previous_ppd ? 'Yes' : 'No'}

POSTPARTUM MOOD TRACKING:
Average Mood Score: ${avgMood}/10
Average Anxiety Level: ${avgAnxiety}/10
Average Sleep Quality: ${avgSleep}/10
Tracking Days: ${moodHistory?.length || 0}

RECOMMENDATIONS:
${screening?.risk_level === 'very_high' ? '- URGENT: Refer to mental health specialist' : ''}
${screening?.risk_level === 'high' ? '- Recommend mental health evaluation' : ''}
${screening?.risk_level === 'moderate' ? '- Monitor for PPD symptoms' : ''}
- Regular follow-up appointments recommended
- Encourage support system engagement
- Consider therapy or counseling

This report is for clinical reference only and should be reviewed by a healthcare provider.
        `;

        return {
          success: true,
          content: reportContent,
          fileName: 'ppd-report.pdf',
          riskLevel: screening?.risk_level,
        };
      } catch (error: any) {
        throw new Error(`Failed to generate PPD report: ${error.message}`);
      }
    }),

  /**
   * Share report with provider
   */
  shareReportWithProvider: protectedProcedure
    .input(
      z.object({
        providerEmail: z.string().email(),
        reportType: z.enum(['ppd', 'birth_plan', 'mood_history']),
        expiryDays: z.number().default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const shareToken = Math.random().toString(36).substring(2, 15);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + input.expiryDays);

        const { data, error } = await supabase.from('provider_shares').insert([
          {
            user_id: ctx.user.id,
            provider_email: input.providerEmail,
            report_type: input.reportType,
            share_token: shareToken,
            expiry_date: expiryDate.toISOString(),
            accessed: false,
          },
        ]);

        if (error) throw error;

        // In production, send email with share link
        const shareLink = `${process.env.VITE_APP_URL}/provider/access/${shareToken}`;

        return {
          success: true,
          message: `Report shared with ${input.providerEmail}`,
          shareLink,
          expiresIn: input.expiryDays,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to share report: ${error.message}`);
      }
    }),

  /**
   * Get provider directory
   */
  getProviderDirectory: protectedProcedure
    .input(
      z.object({
        specialty: z.enum(['obgyn', 'psychiatrist', 'therapist', 'midwife', 'lactation']).optional(),
        location: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = supabase.from('provider_directory').select('*');

        if (input.specialty) {
          query = query.eq('specialty', input.specialty);
        }

        if (input.location) {
          query = query.ilike('location', `%${input.location}%`);
        }

        const { data, error } = await query.limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get provider directory: ${error.message}`);
      }
    }),

  /**
   * Add provider to favorites
   */
  addProviderFavorite: protectedProcedure
    .input(z.object({ providerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('provider_favorites').insert([
          {
            user_id: ctx.user.id,
            provider_id: input.providerId,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Provider added to favorites',
        };
      } catch (error: any) {
        throw new Error(`Failed to add favorite: ${error.message}`);
      }
    }),
});
