import { describe, expect, it } from "vitest";
import {
  mapHealthKitData,
  mapGoogleFitData,
  mergeBehavioralData,
  validateSyncedData,
} from "./phoneSync";

describe("Phone Sync Integration", () => {
  describe("mapHealthKitData", () => {
    it("should map Apple HealthKit sleep data correctly", () => {
      const healthKitData = { sleepHours: 8 };
      const result = mapHealthKitData(healthKitData);
      expect(result.sleepHours).toBe(8);
    });

    it("should cap sleep hours at 12", () => {
      const healthKitData = { sleepHours: 15 };
      const result = mapHealthKitData(healthKitData);
      expect(result.sleepHours).toBe(12);
    });

    it("should map distance correctly", () => {
      const healthKitData = { distanceKm: 5 };
      const result = mapHealthKitData(healthKitData);
      expect(result.activityKm).toBe(5);
    });

    it("should estimate energy level from active energy burned", () => {
      const healthKitData = { activeEnergyBurned: 500 };
      const result = mapHealthKitData(healthKitData);
      expect(result.energyLevel).toBeGreaterThan(0);
      expect(result.energyLevel).toBeLessThanOrEqual(10);
    });

    it("should handle partial data", () => {
      const healthKitData = { sleepHours: 7 };
      const result = mapHealthKitData(healthKitData);
      expect(result.sleepHours).toBe(7);
      expect(result.activityKm).toBeUndefined();
    });
  });

  describe("mapGoogleFitData", () => {
    it("should convert sleep minutes to hours", () => {
      const googleFitData = { sleepMinutes: 480 };
      const result = mapGoogleFitData(googleFitData);
      expect(result.sleepHours).toBe(8);
    });

    it("should convert distance meters to kilometers", () => {
      const googleFitData = { distanceMeters: 5000 };
      const result = mapGoogleFitData(googleFitData);
      expect(result.activityKm).toBe(5);
    });

    it("should estimate energy level from calories burned", () => {
      const googleFitData = { caloriesBurned: 500 };
      const result = mapGoogleFitData(googleFitData);
      expect(result.energyLevel).toBeGreaterThan(0);
      expect(result.energyLevel).toBeLessThanOrEqual(10);
    });

    it("should handle partial data", () => {
      const googleFitData = { sleepMinutes: 420 };
      const result = mapGoogleFitData(googleFitData);
      expect(result.sleepHours).toBe(7);
      expect(result.activityKm).toBeUndefined();
    });
  });

  describe("validateSyncedData", () => {
    it("should validate correct data", () => {
      const data = {
        sleepHours: 8,
        screenTimeHours: 4,
        moodScore: 7,
        energyLevel: 7,
        activityKm: 3,
        cancelledPlans: 0,
      };
      expect(validateSyncedData(data)).toBe(true);
    });

    it("should reject invalid sleep hours", () => {
      const data = { sleepHours: -1 };
      expect(validateSyncedData(data)).toBe(false);

      const data2 = { sleepHours: 13 };
      expect(validateSyncedData(data2)).toBe(false);
    });

    it("should reject invalid screen time", () => {
      const data = { screenTimeHours: 25 };
      expect(validateSyncedData(data)).toBe(false);
    });

    it("should reject invalid mood score", () => {
      const data = { moodScore: 0 };
      expect(validateSyncedData(data)).toBe(false);

      const data2 = { moodScore: 11 };
      expect(validateSyncedData(data2)).toBe(false);
    });

    it("should accept empty data object", () => {
      expect(validateSyncedData({})).toBe(true);
    });
  });

  describe("mergeBehavioralData", () => {
    it("should prefer synced data over manual data", () => {
      const manualData = { sleepHours: 6, moodScore: 5 };
      const syncedData = { sleepHours: 8, energyLevel: 8 };
      const result = mergeBehavioralData(manualData, syncedData);

      expect(result.sleepHours).toBe(8); // from synced
      expect(result.moodScore).toBe(5); // from manual
      expect(result.energyLevel).toBe(8); // from synced
    });

    it("should use defaults for missing data", () => {
      const manualData = {};
      const syncedData = {};
      const result = mergeBehavioralData(manualData, syncedData);

      expect(result.sleepHours).toBe(7);
      expect(result.screenTimeHours).toBe(4);
      expect(result.moodScore).toBe(7);
      expect(result.energyLevel).toBe(7);
      expect(result.activityKm).toBe(3);
      expect(result.cancelledPlans).toBe(0);
    });

    it("should handle partial synced data", () => {
      const manualData = { sleepHours: 6, screenTimeHours: 5 };
      const syncedData = { sleepHours: 8 };
      const result = mergeBehavioralData(manualData, syncedData);

      expect(result.sleepHours).toBe(8); // from synced
      expect(result.screenTimeHours).toBe(5); // from manual
    });
  });
});
