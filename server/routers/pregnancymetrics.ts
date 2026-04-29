import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { invokeLLM } from '../_core/llm';

/**
 * Pregnancy Metrics Router
 * Handles all pregnancy-specific health tracking and risk assessment
 */

export const pregnancyMetricsRouter = router({
  // ============================================================================
  // WEIGHT TRACKING
  // ============================================================================

  logWeight: protectedProcedure
    .input(
      z.object({
        weight_kg: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get previous weight for gain calculation
        const { data: prevWeight } = await supabase
          .from('pregnancy_weight')
          .select('weight_kg')
          .eq('user_id', ctx.user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);

        const weight_gain_kg = prevWeight && prevWeight.length > 0 ? input.weight_kg - prevWeight[0].weight_kg : 0;

        const { data, error } = await supabase.from('pregnancy_weight').insert([
          {
            user_id: ctx.user.id,
            weight_kg: input.weight_kg,
            weight_lbs: input.weight_kg * 2.20462,
            weight_gain_kg,
            notes: input.notes,
            recorded_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to log weight: ${error.message}`);
      }
    }),

  getWeightHistory: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_weight')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get weight history: ${error.message}`);
      }
    }),

  // ============================================================================
  // BLOOD PRESSURE TRACKING
  // ============================================================================

  logBloodPressure: protectedProcedure
    .input(
      z.object({
        systolic: z.number(),
        diastolic: z.number(),
        pulse: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Determine risk level
        let risk_level = 'normal';
        if (input.systolic >= 140 || input.diastolic >= 90) {
          risk_level = 'high'; // Preeclampsia risk
        } else if (input.systolic >= 130 || input.diastolic >= 80) {
          risk_level = 'elevated';
        }

        const { data, error } = await supabase.from('pregnancy_blood_pressure').insert([
          {
            user_id: ctx.user.id,
            systolic: input.systolic,
            diastolic: input.diastolic,
            pulse: input.pulse,
            notes: input.notes,
            risk_level,
            recorded_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        // Alert if high risk
        if (risk_level === 'high') {
          await supabase.from('pregnancy_risk_assessments').insert([
            {
              user_id: ctx.user.id,
              risk_type: 'preeclampsia',
              risk_level: 'high',
              risk_score: 8.5,
              contributing_factors: { systolic: input.systolic, diastolic: input.diastolic },
              recommendations: 'Contact your OB/GYN immediately. High blood pressure during pregnancy requires urgent attention.',
              assessed_at: new Date().toISOString(),
            },
          ]);
        }

        return {
          success: true,
          data: data?.[0],
          risk_level,
        };
      } catch (error: any) {
        throw new Error(`Failed to log blood pressure: ${error.message}`);
      }
    }),

  getBloodPressureHistory: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_blood_pressure')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get blood pressure history: ${error.message}`);
      }
    }),

  // ============================================================================
  // GLUCOSE TRACKING
  // ============================================================================

  logGlucose: protectedProcedure
    .input(
      z.object({
        glucose_mg_dl: z.number(),
        test_type: z.enum(['fasting', 'random', '2hr_after_meal']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Determine risk level for gestational diabetes
        let risk_level = 'normal';
        if (input.test_type === 'fasting' && input.glucose_mg_dl >= 126) {
          risk_level = 'high';
        } else if (input.test_type === '2hr_after_meal' && input.glucose_mg_dl >= 140) {
          risk_level = 'high';
        } else if (input.glucose_mg_dl >= 100) {
          risk_level = 'elevated';
        }

        const { data, error } = await supabase.from('pregnancy_glucose').insert([
          {
            user_id: ctx.user.id,
            glucose_mg_dl: input.glucose_mg_dl,
            glucose_mmol_l: input.glucose_mg_dl / 18.0,
            test_type: input.test_type,
            notes: input.notes,
            risk_level,
            recorded_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        // Alert if high risk
        if (risk_level === 'high') {
          await supabase.from('pregnancy_risk_assessments').insert([
            {
              user_id: ctx.user.id,
              risk_type: 'gestational_diabetes',
              risk_level: 'high',
              risk_score: 8.0,
              contributing_factors: { glucose_mg_dl: input.glucose_mg_dl, test_type: input.test_type },
              recommendations: 'Your glucose level is elevated. Consult with your OB/GYN about gestational diabetes screening.',
              assessed_at: new Date().toISOString(),
            },
          ]);
        }

        return {
          success: true,
          data: data?.[0],
          risk_level,
        };
      } catch (error: any) {
        throw new Error(`Failed to log glucose: ${error.message}`);
      }
    }),

  getGlucoseHistory: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_glucose')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get glucose history: ${error.message}`);
      }
    }),

  // ============================================================================
  // FETAL MOVEMENT TRACKING
  // ============================================================================

  logFetalMovement: protectedProcedure
    .input(
      z.object({
        kicks_count: z.number(),
        duration_minutes: z.number(),
        movement_quality: z.enum(['normal', 'decreased', 'increased']).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Determine risk level (normal: 10+ kicks per hour)
        const kicks_per_hour = (input.kicks_count / input.duration_minutes) * 60;
        let risk_level = 'normal';

        if (kicks_per_hour < 10) {
          risk_level = 'concerning';
        }

        const { data, error } = await supabase.from('pregnancy_fetal_movement').insert([
          {
            user_id: ctx.user.id,
            kicks_count: input.kicks_count,
            duration_minutes: input.duration_minutes,
            movement_quality: input.movement_quality || 'normal',
            notes: input.notes,
            risk_level,
            recorded_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        // Alert if concerning
        if (risk_level === 'concerning') {
          await supabase.from('pregnancy_risk_assessments').insert([
            {
              user_id: ctx.user.id,
              risk_type: 'decreased_fetal_movement',
              risk_level: 'moderate',
              risk_score: 6.0,
              contributing_factors: { kicks_count: input.kicks_count, duration_minutes: input.duration_minutes },
              recommendations: 'Decreased fetal movement detected. Contact your OB/GYN if this continues.',
              assessed_at: new Date().toISOString(),
            },
          ]);
        }

        return {
          success: true,
          data: data?.[0],
          risk_level,
          kicks_per_hour: Math.round(kicks_per_hour),
        };
      } catch (error: any) {
        throw new Error(`Failed to log fetal movement: ${error.message}`);
      }
    }),

  getFetalMovementHistory: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_fetal_movement')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get fetal movement history: ${error.message}`);
      }
    }),

  // ============================================================================
  // APPOINTMENTS
  // ============================================================================

  scheduleAppointment: protectedProcedure
    .input(
      z.object({
        appointment_type: z.string(),
        provider_name: z.string(),
        provider_type: z.enum(['obgyn', 'midwife', 'nurse']),
        appointment_date: z.string().datetime(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('pregnancy_appointments').insert([
          {
            user_id: ctx.user.id,
            appointment_type: input.appointment_type,
            provider_name: input.provider_name,
            provider_type: input.provider_type,
            appointment_date: input.appointment_date,
            notes: input.notes,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to schedule appointment: ${error.message}`);
      }
    }),

  getUpcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_appointments')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('completed', false)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to get appointments: ${error.message}`);
    }
  }),

  // ============================================================================
  // LAB RESULTS
  // ============================================================================

  logLabResult: protectedProcedure
    .input(
      z.object({
        test_name: z.string(),
        test_type: z.enum(['blood_work', 'ultrasound', 'genetic_screening', 'other']),
        result_value: z.string().optional(),
        result_unit: z.string().optional(),
        reference_range: z.string().optional(),
        status: z.enum(['normal', 'abnormal', 'pending']),
        test_date: z.string().datetime(),
        result_date: z.string().datetime().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('pregnancy_lab_results').insert([
          {
            user_id: ctx.user.id,
            test_name: input.test_name,
            test_type: input.test_type,
            result_value: input.result_value,
            result_unit: input.result_unit,
            reference_range: input.reference_range,
            status: input.status,
            test_date: input.test_date,
            result_date: input.result_date,
            notes: input.notes,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to log lab result: ${error.message}`);
      }
    }),

  getLabResults: protectedProcedure
    .input(z.object({ days: z.number().default(90) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_lab_results')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('test_date', startDate.toISOString())
          .order('test_date', { ascending: false });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get lab results: ${error.message}`);
      }
    }),

  // ============================================================================
  // SYMPTOMS
  // ============================================================================

  logSymptom: protectedProcedure
    .input(
      z.object({
        symptom_name: z.string(),
        severity: z.number().min(1).max(10),
        duration_hours: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('pregnancy_symptoms').insert([
          {
            user_id: ctx.user.id,
            symptom_name: input.symptom_name,
            severity: input.severity,
            duration_hours: input.duration_hours,
            notes: input.notes,
            recorded_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to log symptom: ${error.message}`);
      }
    }),

  getSymptomHistory: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('pregnancy_symptoms')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: false });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get symptom history: ${error.message}`);
      }
    }),

  // ============================================================================
  // MEDICATIONS
  // ============================================================================

  addMedication: protectedProcedure
    .input(
      z.object({
        medication_name: z.string(),
        medication_type: z.enum(['prenatal_vitamin', 'prescription', 'supplement', 'other']),
        dosage: z.string(),
        frequency: z.string(),
        reason: z.string(),
        prescribed_by: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('pregnancy_medications').insert([
          {
            user_id: ctx.user.id,
            medication_name: input.medication_name,
            medication_type: input.medication_type,
            dosage: input.dosage,
            frequency: input.frequency,
            reason: input.reason,
            prescribed_by: input.prescribed_by,
            notes: input.notes,
            start_date: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to add medication: ${error.message}`);
      }
    }),

  getCurrentMedications: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_medications')
        .select('*')
        .eq('user_id', ctx.user.id)
        .is('end_date', null)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to get medications: ${error.message}`);
    }
  }),

  // ============================================================================
  // RISK ASSESSMENT
  // ============================================================================

  getRiskAssessments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_risk_assessments')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('assessed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to get risk assessments: ${error.message}`);
    }
  }),

  getPregnancyDashboard: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get latest metrics
      const [weight, bp, glucose, fetal, appointments, risks] = await Promise.all([
        supabase
          .from('pregnancy_weight')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('pregnancy_blood_pressure')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('pregnancy_glucose')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('pregnancy_fetal_movement')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('pregnancy_appointments')
          .select('*')
          .eq('user_id', ctx.user.id)
          .eq('completed', false)
          .gte('appointment_date', new Date().toISOString())
          .order('appointment_date', { ascending: true })
          .limit(3),
        supabase
          .from('pregnancy_risk_assessments')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('assessed_at', { ascending: false })
          .limit(5),
      ]);

      return {
        latestWeight: weight.data?.[0],
        latestBloodPressure: bp.data?.[0],
        latestGlucose: glucose.data?.[0],
        latestFetalMovement: fetal.data?.[0],
        upcomingAppointments: appointments.data || [],
        riskAssessments: risks.data || [],
      };
    } catch (error: any) {
      throw new Error(`Failed to get pregnancy dashboard: ${error.message}`);
    }
  }),
});
