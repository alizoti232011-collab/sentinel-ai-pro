import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Create daily log
 */
export async function createDailyLog(userId: string, log: any) {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([{ user_id: userId, ...log }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error creating daily log:', error);
    return null;
  }
}

/**
 * Get daily logs for user
 */
export async function getDailyLogs(userId: string, limit: number = 30) {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting daily logs:', error);
    return [];
  }
}

/**
 * Create pattern
 */
export async function createPattern(userId: string, pattern: any) {
  try {
    const { data, error } = await supabase
      .from('patterns')
      .insert([{ user_id: userId, ...pattern }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error creating pattern:', error);
    return null;
  }
}

/**
 * Get patterns for user
 */
export async function getPatterns(userId: string) {
  try {
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting patterns:', error);
    return [];
  }
}

/**
 * Create intervention
 */
export async function createIntervention(userId: string, intervention: any) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .insert([{ user_id: userId, ...intervention }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error creating intervention:', error);
    return null;
  }
}

/**
 * Get interventions for user
 */
export async function getInterventions(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting interventions:', error);
    return [];
  }
}

/**
 * Update intervention (mark as accepted/rated)
 */
export async function updateIntervention(interventionId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .update(updates)
      .eq('id', interventionId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error updating intervention:', error);
    return null;
  }
}

/**
 * Create journal entry
 */
export async function createJournalEntry(userId: string, entry: any) {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{ user_id: userId, ...entry }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return null;
  }
}

/**
 * Get journal entries for user
 */
export async function getJournalEntries(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting journal entries:', error);
    return [];
  }
}

/**
 * Get journal entry by ID
 */
export async function getJournalEntryById(entryId: string) {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting journal entry:', error);
    return null;
  }
}

/**
 * Update journal entry
 */
export async function updateJournalEntry(entryId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', entryId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error updating journal entry:', error);
    return null;
  }
}
