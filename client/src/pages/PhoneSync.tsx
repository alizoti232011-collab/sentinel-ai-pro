import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Smartphone, Apple, Activity, CheckCircle } from "lucide-react";

export default function PhoneSync() {
  const { user } = useAuth();
  const [syncType, setSyncType] = useState<"apple" | "google" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apple Health data
  const [appleSleep, setAppleSleep] = useState(7);
  const [appleDistance, setAppleDistance] = useState(3);
  const [appleEnergy, setAppleEnergy] = useState(300);

  // Google Fit data
  const [googleSleep, setGoogleSleep] = useState(420);
  const [googleDistance, setGoogleDistance] = useState(3000);
  const [googleCalories, setGoogleCalories] = useState(300);

  const syncAppleHealthMutation = trpc.phoneSync.syncAppleHealth.useMutation();
  const syncGoogleFitMutation = trpc.phoneSync.syncGoogleFit.useMutation();
  const logWithSyncMutation = trpc.phoneSync.logWithSync.useMutation();

  const handleSyncAppleHealth = async () => {
    setIsLoading(true);
    try {
      const result = await syncAppleHealthMutation.mutateAsync({
        sleepHours: appleSleep,
        distanceKm: appleDistance,
        activeEnergyBurned: appleEnergy,
      });

      toast.success("Apple Health synced successfully!");
      setSyncType("apple");

      // Log the synced data
      await logWithSyncMutation.mutateAsync({
        manualData: {},
        syncedData: result.syncedData,
      });
    } catch (error) {
      toast.error("Failed to sync Apple Health");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncGoogleFit = async () => {
    setIsLoading(true);
    try {
      const result = await syncGoogleFitMutation.mutateAsync({
        sleepMinutes: googleSleep,
        distanceMeters: googleDistance,
        caloriesBurned: googleCalories,
      });

      toast.success("Google Fit synced successfully!");
      setSyncType("google");

      // Log the synced data
      await logWithSyncMutation.mutateAsync({
        manualData: {},
        syncedData: result.syncedData,
      });
    } catch (error) {
      toast.error("Failed to sync Google Fit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connect Your Phone</h1>
          <p className="text-slate-600">Sync your health data from Apple Health or Google Fit for automatic behavioral tracking.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Apple Health */}
          <Card className="p-6 border-slate-200 hover:border-blue-300 transition">
            <div className="flex items-center gap-3 mb-6">
              <Apple className="w-8 h-8 text-slate-900" />
              <h2 className="text-xl font-semibold text-slate-900">Apple Health</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sleep: {appleSleep.toFixed(1)}h
                </Label>
                <Slider
                  value={[appleSleep]}
                  onValueChange={(val) => setAppleSleep(val[0])}
                  min={0}
                  max={12}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Distance: {appleDistance.toFixed(1)}km
                </Label>
                <Slider
                  value={[appleDistance]}
                  onValueChange={(val) => setAppleDistance(val[0])}
                  min={0}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Active Energy: {appleEnergy.toFixed(0)} kcal
                </Label>
                <Slider
                  value={[appleEnergy]}
                  onValueChange={(val) => setAppleEnergy(val[0])}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleSyncAppleHealth}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Syncing..." : "Sync Apple Health"}
              </Button>

              {syncType === "apple" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Synced successfully</span>
                </div>
              )}
            </div>
          </Card>

          {/* Google Fit */}
          <Card className="p-6 border-slate-200 hover:border-blue-300 transition">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-green-600" />
              <h2 className="text-xl font-semibold text-slate-900">Google Fit</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sleep: {(googleSleep / 60).toFixed(1)}h ({googleSleep}m)
                </Label>
                <Slider
                  value={[googleSleep]}
                  onValueChange={(val) => setGoogleSleep(val[0])}
                  min={0}
                  max={720}
                  step={30}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Distance: {(googleDistance / 1000).toFixed(1)}km ({googleDistance}m)
                </Label>
                <Slider
                  value={[googleDistance]}
                  onValueChange={(val) => setGoogleDistance(val[0])}
                  min={0}
                  max={50000}
                  step={500}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Calories: {googleCalories.toFixed(0)} kcal
                </Label>
                <Slider
                  value={[googleCalories]}
                  onValueChange={(val) => setGoogleCalories(val[0])}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleSyncGoogleFit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Syncing..." : "Sync Google Fit"}
              </Button>

              {syncType === "google" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Synced successfully</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How Phone Sync Works</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>✓ Sleep data is automatically converted to hours</li>
                <li>✓ Distance is converted to kilometers</li>
                <li>✓ Energy/calories are used to estimate energy level</li>
                <li>✓ Synced data overrides manual entries</li>
                <li>✓ Your data is encrypted and never shared</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
