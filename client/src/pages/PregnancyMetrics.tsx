import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Heart, Activity, Pill, Calendar, FileText } from 'lucide-react';

/**
 * Pregnancy Metrics Dashboard
 * Track weight, blood pressure, glucose, fetal movement, and more
 */

export default function PregnancyMetricsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    weight: null,
    bloodPressure: null,
    glucose: null,
    fetalMovement: null,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pregnancy Health Metrics</h1>
          <p className="text-gray-600 mt-2">Track your health during pregnancy with AI-powered insights</p>
        </div>
        <Activity className="w-12 h-12 text-pink-500" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weight Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-- kg</div>
                <p className="text-xs text-gray-600">Weight gain: -- kg</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Log Weight
                </Button>
              </CardContent>
            </Card>

            {/* Blood Pressure Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-- / --</div>
                <p className="text-xs text-gray-600">mmHg</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Log BP
                </Button>
              </CardContent>
            </Card>

            {/* Glucose Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Glucose Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-- mg/dL</div>
                <p className="text-xs text-gray-600">Last recorded</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Log Glucose
                </Button>
              </CardContent>
            </Card>

            {/* Fetal Movement Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fetal Kicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-- kicks</div>
                <p className="text-xs text-gray-600">Today</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Log Kicks
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Risk Alerts */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5" />
                Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800">No active alerts. Keep monitoring your health metrics.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* METRICS TAB */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weight Tracking
                </CardTitle>
                <CardDescription>Normal pregnancy weight gain: 25-35 lbs (11-16 kg)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <input type="number" placeholder="Enter weight" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea placeholder="Any notes?" className="w-full px-3 py-2 border rounded-lg" rows={2} />
                </div>
                <Button className="w-full">Log Weight</Button>
              </CardContent>
            </Card>

            {/* Blood Pressure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Blood Pressure
                </CardTitle>
                <CardDescription>Normal: &lt;140/90 mmHg</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Systolic</label>
                    <input type="number" placeholder="120" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Diastolic</label>
                    <input type="number" placeholder="80" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Pulse</label>
                  <input type="number" placeholder="70" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <Button className="w-full">Log Blood Pressure</Button>
              </CardContent>
            </Card>

            {/* Glucose */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Glucose Level
                </CardTitle>
                <CardDescription>Screen for gestational diabetes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Glucose (mg/dL)</label>
                  <input type="number" placeholder="100" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium">Test Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Fasting</option>
                    <option>Random</option>
                    <option>2 hours after meal</option>
                  </select>
                </div>
                <Button className="w-full">Log Glucose</Button>
              </CardContent>
            </Card>

            {/* Fetal Movement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Fetal Movement
                </CardTitle>
                <CardDescription>Normal: 10+ kicks per hour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Number of Kicks</label>
                  <input type="number" placeholder="10" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <input type="number" placeholder="60" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <Button className="w-full">Log Fetal Movement</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* APPOINTMENTS TAB */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Prenatal Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Appointment Type</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Regular Checkup</option>
                  <option>Ultrasound</option>
                  <option>Lab Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider Name</label>
                <input type="text" placeholder="Dr. Smith" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <Button className="w-full">Schedule Appointment</Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">No upcoming appointments scheduled.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RISK ASSESSMENT TAB */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Health Risk Assessment
              </CardTitle>
              <CardDescription>AI-powered analysis of your pregnancy health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">Preeclampsia Risk</h4>
                  <p className="text-xs text-gray-600 mt-1">Low - Your blood pressure is normal</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">Gestational Diabetes Risk</h4>
                  <p className="text-xs text-gray-600 mt-1">Low - Your glucose levels are normal</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">Fetal Health</h4>
                  <p className="text-xs text-gray-600 mt-1">Good - Normal fetal movement detected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-900">
                <li>✓ Continue prenatal vitamins daily</li>
                <li>✓ Maintain regular exercise (30 min/day)</li>
                <li>✓ Stay hydrated (8-10 glasses/day)</li>
                <li>✓ Schedule glucose screening at 24-28 weeks</li>
                <li>✓ Monitor blood pressure weekly</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
