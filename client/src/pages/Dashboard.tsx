import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, TrendingDown, Heart, Zap, Activity, Users } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sleepHours, setSleepHours] = useState(7);
  const [screenTimeHours, setScreenTimeHours] = useState(4);
  const [moodScore, setMoodScore] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [activityKm, setActivityKm] = useState(3);
  const [cancelledPlans, setCancelledPlans] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logDataMutation = trpc.behavioral.logData.useMutation();
  const statsQuery = trpc.user.getStats.useQuery();

  const handleLogData = async () => {
    setIsSubmitting(true);
    try {
      const result = await logDataMutation.mutateAsync({
        sleepHours,
        screenTimeHours,
        moodScore,
        energyLevel,
        activityKm,
        cancelledPlans,
      });

      toast.success("Daily data logged successfully!");

      if (result.intervention && result.intervention !== null) {
        toast.custom((t) => (
          <Card className="p-4 bg-blue-50 border-blue-200 max-w-md">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 mb-2">Sentinel AI Check-In</p>
                <p className="text-sm text-slate-700 mb-3">{result.intervention?.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    Talk to Sentinel
                  </Button>
                  <Button size="sm" variant="outline">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ));
      }

      setSleepHours(7);
      setScreenTimeHours(4);
      setMoodScore(7);
      setEnergyLevel(7);
      setActivityKm(3);
      setCancelledPlans(0);
    } catch (error) {
      toast.error("Failed to log data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = statsQuery.data;
  const recentLogs = stats?.recentLogs || [];

  const chartData = recentLogs
    .slice()
    .reverse()
    .map((log) => ({
      date: new Date(log.logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood: log.moodScore,
      sleep: log.sleepHours,
      screenTime: log.screenTimeHours,
    }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Sentinel AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Logging Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Today's Check-In</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Sleep Hours: {sleepHours.toFixed(1)}h
                  </Label>
                  <Slider
                    value={[sleepHours]}
                    onValueChange={(val) => setSleepHours(val[0])}
                    min={0}
                    max={12}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Screen Time: {screenTimeHours.toFixed(1)}h
                  </Label>
                  <Slider
                    value={[screenTimeHours]}
                    onValueChange={(val) => setScreenTimeHours(val[0])}
                    min={0}
                    max={24}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Mood: {moodScore}/10
                  </Label>
                  <Slider
                    value={[moodScore]}
                    onValueChange={(val) => setMoodScore(val[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Energy: {energyLevel}/10
                  </Label>
                  <Slider
                    value={[energyLevel]}
                    onValueChange={(val) => setEnergyLevel(val[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Activity: {activityKm.toFixed(1)}km
                  </Label>
                  <Slider
                    value={[activityKm]}
                    onValueChange={(val) => setActivityKm(val[0])}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Cancelled Plans: {cancelledPlans}
                  </Label>
                  <Slider
                    value={[cancelledPlans]}
                    onValueChange={(val) => setCancelledPlans(val[0])}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleLogData}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Logging..." : "Log Today's Data"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.currentStreak || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">days</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-200" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Wellness Score</p>
                    <p className="text-2xl font-bold text-slate-900">{typeof stats?.wellnessScore === 'number' ? stats.wellnessScore.toFixed(1) : '0.0'}</p>
                    <p className="text-xs text-slate-500 mt-1">out of 100</p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-200" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Mood</p>
                    <p className="text-2xl font-bold text-slate-900">{(stats?.avgMood || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500 mt-1">out of 10</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-200" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Interventions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.interventionHistory?.totalInterventions || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">received</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-200" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Mood Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[1, 10]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sleep & Screen Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="sleep" fill="#10b981" name="Sleep (h)" />
                      <Bar dataKey="screenTime" fill="#f59e0b" name="Screen Time (h)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </>
            )}

            {chartData.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-slate-600">Log your first day's data to see trends and insights</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
