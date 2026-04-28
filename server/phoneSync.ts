import { invokeLLM } from "./_core/llm";

export interface HealthKitData {
  sleepHours?: number;
  stepCount?: number;
  distanceKm?: number;
  heartRate?: number;
  activeEnergyBurned?: number;
}

export interface GoogleFitData {
  sleepMinutes?: number;
  stepCount?: number;
  distanceMeters?: number;
  heartRate?: number;
  caloriesBurned?: number;
}

export interface SyncedBehavioralData {
  sleepHours: number;
  screenTimeHours: number;
  moodScore: number;
  energyLevel: number;
  activityKm: number;
  cancelledPlans: number;
}

/**
 * Convert Apple HealthKit data to behavioral metrics
 */
export const mapHealthKitData = (healthKitData: HealthKitData): Partial<SyncedBehavioralData> => {
  const mapped: Partial<SyncedBehavioralData> = {};

  if (healthKitData.sleepHours !== undefined) {
    mapped.sleepHours = Math.min(healthKitData.sleepHours, 12);
  }

  if (healthKitData.distanceKm !== undefined) {
    mapped.activityKm = Math.min(healthKitData.distanceKm, 50);
  }

  // Estimate energy level from active energy burned (rough heuristic)
  if (healthKitData.activeEnergyBurned !== undefined) {
    const energyScore = Math.min((healthKitData.activeEnergyBurned / 500) * 10, 10);
    mapped.energyLevel = Math.max(1, Math.round(energyScore));
  }

  return mapped;
};

/**
 * Convert Google Fit data to behavioral metrics
 */
export const mapGoogleFitData = (googleFitData: GoogleFitData): Partial<SyncedBehavioralData> => {
  const mapped: Partial<SyncedBehavioralData> = {};

  if (googleFitData.sleepMinutes !== undefined) {
    mapped.sleepHours = Math.min(googleFitData.sleepMinutes / 60, 12);
  }

  if (googleFitData.distanceMeters !== undefined) {
    mapped.activityKm = Math.min(googleFitData.distanceMeters / 1000, 50);
  }

  // Estimate energy level from calories burned
  if (googleFitData.caloriesBurned !== undefined) {
    const energyScore = Math.min((googleFitData.caloriesBurned / 500) * 10, 10);
    mapped.energyLevel = Math.max(1, Math.round(energyScore));
  }

  return mapped;
};

/**
 * Estimate screen time from device usage patterns
 * This is a placeholder - real implementation would use device APIs
 */
export const estimateScreenTime = (deviceUsageData: any): number => {
  // In a real app, this would come from iOS Screen Time API or Android Digital Wellbeing
  // For now, return a default value that users can override
  return 4;
};

/**
 * Use LLM to estimate mood from health metrics
 */
export const estimateMoodFromHealth = async (
  sleepHours: number,
  activityKm: number,
  energyLevel: number
): Promise<number> => {
  const prompt = `Based on these health metrics, estimate the person's mood score (1-10):
- Sleep: ${sleepHours} hours
- Activity: ${activityKm} km
- Energy Level: ${energyLevel}/10

Provide only a single number between 1 and 10.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system" as const,
        content: "You are a health analytics AI. Estimate mood based on health metrics. Respond with only a number.",
      },
      {
        role: "user" as const,
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  const moodStr = typeof content === "string" ? content.trim() : "5";
  const mood = Math.max(1, Math.min(10, parseInt(moodStr) || 5));

  return mood;
};

/**
 * Merge manual and synced data, with synced data taking precedence
 */
export const mergeBehavioralData = (
  manualData: Partial<SyncedBehavioralData>,
  syncedData: Partial<SyncedBehavioralData>
): SyncedBehavioralData => {
  return {
    sleepHours: syncedData.sleepHours ?? manualData.sleepHours ?? 7,
    screenTimeHours: syncedData.screenTimeHours ?? manualData.screenTimeHours ?? 4,
    moodScore: syncedData.moodScore ?? manualData.moodScore ?? 7,
    energyLevel: syncedData.energyLevel ?? manualData.energyLevel ?? 7,
    activityKm: syncedData.activityKm ?? manualData.activityKm ?? 3,
    cancelledPlans: syncedData.cancelledPlans ?? manualData.cancelledPlans ?? 0,
  };
};

/**
 * Validate synced data is within reasonable ranges
 */
export const validateSyncedData = (data: Partial<SyncedBehavioralData>): boolean => {
  if (data.sleepHours !== undefined && (data.sleepHours < 0 || data.sleepHours > 12)) return false;
  if (data.screenTimeHours !== undefined && (data.screenTimeHours < 0 || data.screenTimeHours > 24)) return false;
  if (data.moodScore !== undefined && (data.moodScore < 1 || data.moodScore > 10)) return false;
  if (data.energyLevel !== undefined && (data.energyLevel < 1 || data.energyLevel > 10)) return false;
  if (data.activityKm !== undefined && (data.activityKm < 0 || data.activityKm > 50)) return false;
  if (data.cancelledPlans !== undefined && (data.cancelledPlans < 0 || data.cancelledPlans > 10)) return false;
  return true;
};
