import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Activity, Target } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">You do not have access to this page.</p>
          <Button onClick={() => setLocation("/")} variant="default">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const mockMetrics = {
    totalUsers: 1250,
    activeUsers: 892,
    dailyActiveUsers: 456,
    interventionRate: 34.2,
    interventionAcceptanceRate: 78.5,
    retentionDay1: 85.3,
    retentionDay7: 62.1,
    retentionDay30: 41.8,
    avgMoodScore: 6.8,
    avgWellnessScore: 68.4,
  };

  const dailyMetrics = [
    { date: "Apr 21", users: 850, interventions: 120, acceptance: 75 },
    { date: "Apr 22", users: 920, interventions: 145, acceptance: 78 },
    { date: "Apr 23", users: 1050, interventions: 168, acceptance: 80 },
    { date: "Apr 24", users: 1180, interventions: 192, acceptance: 79 },
    { date: "Apr 25", users: 1220, interventions: 210, acceptance: 81 },
    { date: "Apr 26", users: 1240, interventions: 225, acceptance: 82 },
    { date: "Apr 27", users: 1250, interventions: 240, acceptance: 78 },
  ];

  const retentionData = [
    { day: "Day 1", retention: 85.3 },
    { day: "Day 7", retention: 62.1 },
    { day: "Day 30", retention: 41.8 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{mockMetrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-slate-900">{mockMetrics.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{((mockMetrics.activeUsers / mockMetrics.totalUsers) * 100).toFixed(1)}% of total</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Intervention Rate</p>
                <p className="text-3xl font-bold text-slate-900">{mockMetrics.interventionRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">of active users</p>
              </div>
              <Target className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Acceptance Rate</p>
                <p className="text-3xl font-bold text-slate-900">{mockMetrics.interventionAcceptanceRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">of interventions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Active Users & Interventions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyMetrics}>
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
                <Bar dataKey="users" fill="#2563eb" name="Active Users" />
                <Bar dataKey="interventions" fill="#f59e0b" name="Interventions" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Intervention Acceptance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="acceptance"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Acceptance Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Retention & Wellness */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Retention Rates</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="retention" fill="#2563eb" name="Retention %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Wellness Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Average Mood Score</span>
                  <span className="text-sm font-bold text-slate-900">{mockMetrics.avgMoodScore.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(mockMetrics.avgMoodScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Average Wellness Score</span>
                  <span className="text-sm font-bold text-slate-900">{mockMetrics.avgWellnessScore.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${mockMetrics.avgWellnessScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  <strong>Key Insight:</strong> Users who accept interventions show 3.2x higher retention rates and 2.1x higher wellness scores.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
