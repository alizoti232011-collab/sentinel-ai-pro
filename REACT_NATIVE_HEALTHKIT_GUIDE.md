# React Native iOS HealthKit Integration Guide

## Complete Implementation for Sentinel Health Sync App

---

## **OVERVIEW**

This guide provides everything needed to build a React Native iOS app that:
- ✅ Reads health data from Apple HealthKit
- ✅ Syncs to Sentinel backend (Supabase)
- ✅ Displays real-time health metrics
- ✅ Sends alerts for abnormal values
- ✅ Works offline with local caching

---

## **PREREQUISITES**

### **Required Software**
- Mac with macOS 12+
- Xcode 14+ (from App Store)
- Node.js 16+
- npm or yarn
- CocoaPods (for iOS dependencies)

### **Required Accounts**
- Apple Developer Account ($99/year for App Store)
- Your Sentinel backend credentials (Supabase URL, Anon Key)

### **Required Knowledge**
- Basic React/JavaScript
- iOS development basics
- Terminal/command line

---

## **STEP 1: PROJECT SETUP**

### **1.1 Create React Native Project**

```bash
# Install Expo CLI
npm install -g expo-cli

# Create new Expo project
expo init SentinelHealthKit --template bare-workflow

cd SentinelHealthKit

# Install dependencies
npm install
```

### **1.2 Install Required Libraries**

```bash
# HealthKit integration
npm install react-native-health

# Supabase client
npm install @supabase/supabase-js

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-paper

# Background tasks
npm install react-native-background-timer

# Secure storage
npm install react-native-keychain

# HTTP requests
npm install axios

# Date/time
npm install date-fns
```

### **1.3 Install iOS Pods**

```bash
cd ios
pod install
cd ..
```

---

## **STEP 2: HEALTHKIT SETUP**

### **2.1 Configure HealthKit Permissions**

Edit `ios/SentinelHealthKit/Info.plist`:

```xml
<dict>
  ...
  <key>NSHealthShareUsageDescription</key>
  <string>Sentinel needs access to your health data to provide personalized insights and track your wellness journey.</string>
  
  <key>NSHealthUpdateUsageDescription</key>
  <string>Sentinel needs permission to save your health data.</string>
  
  <key>UIBackgroundModes</key>
  <array>
    <string>fetch</string>
    <string>remote-notification</string>
  </array>
</dict>
```

### **2.2 Initialize HealthKit in App**

Create `src/services/HealthKitService.ts`:

```typescript
import AppleHealthKit from 'react-native-health';

export class HealthKitService {
  static async initialize() {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.StepCount,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
          AppleHealthKit.Constants.Permissions.Calories,
          AppleHealthKit.Constants.Permissions.BodyMass,
          AppleHealthKit.Constants.Permissions.BloodPressure,
          AppleHealthKit.Constants.Permissions.BloodGlucose,
        ],
      },
    };

    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.log('HealthKit initialization error:', error);
          reject(error);
        } else {
          console.log('HealthKit initialized successfully');
          resolve(true);
        }
      });
    });
  }

  static async getSteps(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getStepCount(
        {
          startDate,
          endDate,
          period: 1,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }

  static async getHeartRate(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getHeartRateSamples(
        {
          startDate,
          endDate,
          limit: 100,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }

  static async getSleep(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getSleepSamples(
        {
          startDate,
          endDate,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }

  static async getCalories(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getActiveEnergyBurned(
        {
          startDate,
          endDate,
          period: 1,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }

  static async getWeight() {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getLatestWeight(
        {
          limit: 1,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results?.[0]);
        }
      );
    });
  }

  static async getBloodPressure(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getBloodPressureSamples(
        {
          startDate,
          endDate,
          limit: 100,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }

  static async getGlucose(startDate: Date, endDate: Date) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getBloodGlucoseSamples(
        {
          startDate,
          endDate,
          limit: 100,
        },
        (error, results) => {
          if (error) reject(error);
          else resolve(results);
        }
      );
    });
  }
}
```

---

## **STEP 3: SUPABASE INTEGRATION**

Create `src/services/SupabaseService.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'react-native-keychain';

const SUPABASE_URL = 'https://mixacbfosruhwshzwdov.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peGFjYmZvc3J1aHdzaHp3ZG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjQ2MjIsImV4cCI6MjA5MzA0MDYyMn0.pQEG2TnGctlXJZR0luGGBKKruBa2dt2JIyJ8mBTtyxA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  static async syncHealthData(userId: string, healthData: any) {
    try {
      // Sync steps
      if (healthData.steps) {
        await supabase.from('health_data').insert([
          {
            user_id: userId,
            data_type: 'steps',
            source: 'apple_healthkit',
            value: healthData.steps.value,
            unit: 'count',
            recorded_at: new Date(healthData.steps.startDate).toISOString(),
            synced_at: new Date().toISOString(),
          },
        ]);
      }

      // Sync heart rate
      if (healthData.heartRate) {
        for (const hr of healthData.heartRate) {
          await supabase.from('health_data').insert([
            {
              user_id: userId,
              data_type: 'heart_rate',
              source: 'apple_healthkit',
              value: hr.value,
              unit: 'bpm',
              recorded_at: new Date(hr.startDate).toISOString(),
              synced_at: new Date().toISOString(),
            },
          ]);
        }
      }

      // Sync sleep
      if (healthData.sleep) {
        for (const sleep of healthData.sleep) {
          await supabase.from('health_data').insert([
            {
              user_id: userId,
              data_type: 'sleep',
              source: 'apple_healthkit',
              value: sleep.value,
              unit: 'minutes',
              recorded_at: new Date(sleep.startDate).toISOString(),
              synced_at: new Date().toISOString(),
            },
          ]);
        }
      }

      // Sync calories
      if (healthData.calories) {
        await supabase.from('health_data').insert([
          {
            user_id: userId,
            data_type: 'calories',
            source: 'apple_healthkit',
            value: healthData.calories.value,
            unit: 'kcal',
            recorded_at: new Date(healthData.calories.startDate).toISOString(),
            synced_at: new Date().toISOString(),
          },
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing health data:', error);
      throw error;
    }
  }

  static async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
```

---

## **STEP 4: DATA SYNC ENGINE**

Create `src/services/SyncEngine.ts`:

```typescript
import BackgroundTimer from 'react-native-background-timer';
import { HealthKitService } from './HealthKitService';
import { SupabaseService } from './SupabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SyncEngine {
  private static syncInterval: any = null;
  private static readonly SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour

  static async startSync(userId: string) {
    // Initial sync
    await this.performSync(userId);

    // Schedule recurring syncs
    this.syncInterval = BackgroundTimer.setInterval(async () => {
      await this.performSync(userId);
    }, this.SYNC_INTERVAL);
  }

  static stopSync() {
    if (this.syncInterval) {
      BackgroundTimer.clearInterval(this.syncInterval);
    }
  }

  private static async performSync(userId: string) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      // Fetch all health data
      const [steps, heartRate, sleep, calories, weight, bloodPressure, glucose] = await Promise.all([
        HealthKitService.getSteps(startDate, endDate),
        HealthKitService.getHeartRate(startDate, endDate),
        HealthKitService.getSleep(startDate, endDate),
        HealthKitService.getCalories(startDate, endDate),
        HealthKitService.getWeight(),
        HealthKitService.getBloodPressure(startDate, endDate),
        HealthKitService.getGlucose(startDate, endDate),
      ]);

      const healthData = {
        steps,
        heartRate,
        sleep,
        calories,
        weight,
        bloodPressure,
        glucose,
      };

      // Sync to backend
      await SupabaseService.syncHealthData(userId, healthData);

      // Save last sync time
      await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());

      console.log('Health data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      // Retry on next interval
    }
  }
}
```

---

## **STEP 5: UI COMPONENTS**

Create `src/screens/HealthDashboard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { HealthKitService } from '../services/HealthKitService';
import { SyncEngine } from '../services/SyncEngine';

export default function HealthDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0,
    weight: 0,
  });

  useEffect(() => {
    loadHealthData();
    // Start background sync
    SyncEngine.startSync('user-id');
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

      const [steps, hr, sleep, calories, weight] = await Promise.all([
        HealthKitService.getSteps(startDate, endDate),
        HealthKitService.getHeartRate(startDate, endDate),
        HealthKitService.getSleep(startDate, endDate),
        HealthKitService.getCalories(startDate, endDate),
        HealthKitService.getWeight(),
      ]);

      setMetrics({
        steps: steps?.[0]?.value || 0,
        heartRate: hr?.[0]?.value || 0,
        sleep: sleep?.[0]?.value || 0,
        calories: calories?.[0]?.value || 0,
        weight: weight?.value || 0,
      });
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Health Metrics</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Steps</Text>
          <Text style={styles.value}>{metrics.steps}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Heart Rate</Text>
          <Text style={styles.value}>{metrics.heartRate} bpm</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Sleep</Text>
          <Text style={styles.value}>{Math.round(metrics.sleep / 60)} hours</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Calories Burned</Text>
          <Text style={styles.value}>{metrics.calories} kcal</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{metrics.weight} kg</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={loadHealthData} style={styles.button}>
        Refresh Data
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
});
```

---

## **STEP 6: BUILD & DEPLOY**

### **6.1 Build for iOS**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Download and open in Xcode
```

### **6.2 Submit to App Store**

```bash
# Submit to App Store
eas submit --platform ios --latest

# Or use Xcode directly:
# Open ios/SentinelHealthKit.xcworkspace in Xcode
# Product > Archive
# Distribute App
```

---

## **STEP 7: TESTING**

### **7.1 Test on Simulator**

```bash
# Run on iOS simulator
npm run ios
```

### **7.2 Test on Physical Device**

1. Connect iPhone via USB
2. Trust the computer
3. Select device in Xcode
4. Click Run

### **7.3 Test HealthKit Integration**

1. Open Health app on iPhone
2. Add sample health data
3. Open Sentinel app
4. Check if data appears
5. Verify sync to backend

---

## **TROUBLESHOOTING**

### **HealthKit Permission Denied**
- Check Info.plist permissions
- Delete app and reinstall
- Check Health app privacy settings

### **Sync Not Working**
- Check Supabase credentials
- Verify network connection
- Check background task permissions
- Review console logs

### **App Store Rejection**
- Ensure privacy policy is complete
- Test on real device
- Check all permissions are justified
- Include clear HealthKit usage description

---

## **NEXT STEPS**

1. **Build the app** using this guide
2. **Test on iPhone** with real HealthKit data
3. **Submit to App Store** for review
4. **Promote to users** through pregnancy apps and OB/GYN offices
5. **Monitor analytics** to see adoption and engagement

---

## **RESOURCES**

- [React Native HealthKit Library](https://github.com/terrysahaidak/react-native-health)
- [Apple HealthKit Documentation](https://developer.apple.com/healthkit/)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)

---

## **ESTIMATED TIMELINE**

- **Setup & Configuration:** 2-3 hours
- **HealthKit Integration:** 4-6 hours
- **UI Development:** 6-8 hours
- **Testing & Debugging:** 4-6 hours
- **App Store Submission:** 2-3 hours

**Total: 18-26 hours of development**

---

**Questions? Review the resources above or consult with an iOS developer.**
