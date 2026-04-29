import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

/**
 * Integrations Router
 * Manages all health data, wearable, and smart speaker integrations
 */

export const integrationsRouter = router({
  // ============================================================================
  // FITBIT INTEGRATION
  // ============================================================================

  /**
   * Start Fitbit OAuth flow
   */
  connectFitbit: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const clientId = process.env.FITBIT_CLIENT_ID;
      const redirectUri = `${process.env.VITE_APP_URL}/api/integrations/fitbit/callback`;
      const scope = 'activity heartrate sleep nutrition profile';

      const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${ctx.user.id}`;

      return {
        success: true,
        authUrl,
      };
    } catch (error: any) {
      throw new Error(`Failed to start Fitbit auth: ${error.message}`);
    }
  }),

  /**
   * Handle Fitbit OAuth callback
   */
  fitbitCallback: protectedProcedure
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Exchange code for access token
        const response = await fetch('https://api.fitbit.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            code: input.code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.VITE_APP_URL}/api/integrations/fitbit/callback`,
          }),
        });

        const data = await response.json();

        // Store tokens
        const { error } = await supabase.from('integration_accounts').insert([
          {
            user_id: ctx.user.id,
            integration_type: 'fitbit',
            account_data: { userId: data.user_id },
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
            connected_at: new Date().toISOString(),
            status: 'connected',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Fitbit connected successfully!',
        };
      } catch (error: any) {
        throw new Error(`Failed to connect Fitbit: ${error.message}`);
      }
    }),

  /**
   * Get Fitbit data
   */
  getFitbitData: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['steps', 'heart_rate', 'sleep', 'calories']),
        days: z.number().default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get Fitbit account
        const { data: account, error: accountError } = await supabase
          .from('integration_accounts')
          .select('*')
          .eq('user_id', ctx.user.id)
          .eq('integration_type', 'fitbit')
          .single();

        if (accountError) throw accountError;
        if (!account) return [];

        // Fetch from Fitbit API
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const fitbitEndpoint = {
          steps: `/1/user/${account.account_data.userId}/activities/steps/date/${startDate.toISOString().split('T')[0]}/today.json`,
          heart_rate: `/1/user/${account.account_data.userId}/activities/heart/date/${startDate.toISOString().split('T')[0]}/today.json`,
          sleep: `/1.2/user/${account.account_data.userId}/sleep/date/${startDate.toISOString().split('T')[0]}/today.json`,
          calories: `/1/user/${account.account_data.userId}/activities/calories/date/${startDate.toISOString().split('T')[0]}/today.json`,
        };

        const response = await fetch(`https://api.fitbit.com${fitbitEndpoint[input.dataType]}`, {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
          },
        });

        const fitbitData = await response.json();

        // Store in database
        await supabase.from('health_data').insert([
          {
            user_id: ctx.user.id,
            data_type: input.dataType,
            source: 'fitbit',
            value: fitbitData['activities-' + input.dataType]?.[0]?.value || 0,
            unit: input.dataType === 'steps' ? 'count' : input.dataType === 'calories' ? 'kcal' : 'bpm',
            recorded_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
          },
        ]);

        return fitbitData;
      } catch (error: any) {
        throw new Error(`Failed to get Fitbit data: ${error.message}`);
      }
    }),

  /**
   * Disconnect Fitbit
   */
  disconnectFitbit: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await supabase
        .from('integration_accounts')
        .update({ status: 'disconnected' })
        .eq('user_id', ctx.user.id)
        .eq('integration_type', 'fitbit');

      if (error) throw error;

      return {
        success: true,
        message: 'Fitbit disconnected',
      };
    } catch (error: any) {
      throw new Error(`Failed to disconnect Fitbit: ${error.message}`);
    }
  }),

  // ============================================================================
  // HEALTH DATA AGGREGATION
  // ============================================================================

  /**
   * Get health summary
   */
  getHealthSummary: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('health_data')
          .select('data_type, source, value, unit')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: false });

        if (error) throw error;

        // Aggregate by data type
        const summary: Record<string, any> = {};

        (data || []).forEach((item: any) => {
          if (!summary[item.data_type]) {
            summary[item.data_type] = {
              latest: item.value,
              average: 0,
              min: item.value,
              max: item.value,
              unit: item.unit,
              sources: [],
              count: 0,
            };
          }

          summary[item.data_type].sources.push(item.source);
          summary[item.data_type].count++;
          summary[item.data_type].average += item.value;
          summary[item.data_type].min = Math.min(summary[item.data_type].min, item.value);
          summary[item.data_type].max = Math.max(summary[item.data_type].max, item.value);
        });

        // Calculate averages
        Object.keys(summary).forEach((key) => {
          summary[key].average = Math.round(summary[key].average / summary[key].count);
          summary[key].sources = Array.from(new Set(summary[key].sources));
        });

        return summary;
      } catch (error: any) {
        throw new Error(`Failed to get health summary: ${error.message}`);
      }
    }),

  /**
   * Get health timeline
   */
  getHealthTimeline: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get health timeline: ${error.message}`);
      }
    }),

  // ============================================================================
  // SCREEN TIME TRACKING
  // ============================================================================

  /**
   * Log screen time data
   */
  logScreenTime: protectedProcedure
    .input(
      z.object({
        appName: z.string(),
        usageMinutes: z.number(),
        source: z.enum(['ios', 'android', 'samsung']),
        date: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('screen_time_data').insert([
          {
            user_id: ctx.user.id,
            app_name: input.appName,
            usage_minutes: input.usageMinutes,
            date: input.date ? new Date(input.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            source: input.source,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to log screen time: ${error.message}`);
      }
    }),

  /**
   * Get screen time summary
   */
  getScreenTimeSummary: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const { data, error } = await supabase
          .from('screen_time_data')
          .select('*')
          .eq('user_id', ctx.user.id)
          .gte('date', startDate.toISOString().split('T')[0]);

        if (error) throw error;

        // Aggregate by app
        const summary: Record<string, number> = {};
        (data || []).forEach((item: any) => {
          summary[item.app_name] = (summary[item.app_name] || 0) + item.usage_minutes;
        });

        // Sort by usage
        const sorted = Object.entries(summary)
          .sort((a, b) => b[1] - a[1])
          .map(([app, minutes]) => ({ app, minutes }));

        return {
          totalMinutes: Object.values(summary).reduce((a, b) => a + b, 0),
          apps: sorted,
          topApp: sorted[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to get screen time summary: ${error.message}`);
      }
    }),

  // ============================================================================
  // VOICE INTERACTIONS
  // ============================================================================

  /**
   * Log voice interaction
   */
  logVoiceInteraction: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['alexa', 'google_assistant', 'bixby']),
        intent: z.string(),
        transcript: z.string(),
        response: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('voice_interactions').insert([
          {
            user_id: ctx.user.id,
            platform: input.platform,
            intent: input.intent,
            transcript: input.transcript,
            response: input.response,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to log voice interaction: ${error.message}`);
      }
    }),

  /**
   * Get voice interactions
   */
  getVoiceInteractions: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase
          .from('voice_interactions')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get voice interactions: ${error.message}`);
      }
    }),

  // ============================================================================
  // INTEGRATION MANAGEMENT
  // ============================================================================

  /**
   * Get all integration statuses
   */
  getIntegrationStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('integration_accounts')
        .select('integration_type, status, connected_at, last_sync')
        .eq('user_id', ctx.user.id);

      if (error) throw error;

      const status: Record<string, any> = {
        fitbit: { connected: false },
        apple_healthkit: { connected: false },
        google_fit: { connected: false },
        screen_time_ios: { connected: false },
        screen_time_android: { connected: false },
        samsung_health: { connected: false },
        alexa: { connected: false },
        google_assistant: { connected: false },
        bixby: { connected: false },
        apple_watch: { connected: false },
        wear_os: { connected: false },
        samsung_watch: { connected: false },
      };

      (data || []).forEach((item: any) => {
        if (status[item.integration_type]) {
          status[item.integration_type] = {
            connected: item.status === 'connected',
            connectedAt: item.connected_at,
            lastSync: item.last_sync,
          };
        }
      });

      return status;
    } catch (error: any) {
      throw new Error(`Failed to get integration status: ${error.message}`);
    }
  }),

  /**
   * Get sync logs
   */
  getSyncLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase
          .from('sync_logs')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('synced_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get sync logs: ${error.message}`);
      }
    }),
});
