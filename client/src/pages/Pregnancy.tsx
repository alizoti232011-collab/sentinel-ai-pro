import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Heart, Calendar, TrendingUp, Baby } from 'lucide-react';

/**
 * Pregnancy Features Dashboard
 * Comprehensive pregnancy tracking, PPD screening, and postpartum support
 */

export default function PregnancyPage() {
  const [activeTab, setActiveTab] = useState('tracking');
  const [pregnancyData, setPregnancyData] = useState({
    currentWeek: 0,
    trimester: 0,
    dueDate: '',
    pregnancyType: 'singleton',
  });

  const [ppdRiskLevel, setPpdRiskLevel] = useState<'low' | 'moderate' | 'high' | 'very_high' | null>(null);
  const [postpartumMood, setPostpartumMood] = useState<any[]>([]);

  // Mock data for visualization
  const moodData = [
    { day: 'Day 1', mood: 4, anxiety: 7, sleep: 3 },
    { day: 'Day 3', mood: 5, anxiety: 6, sleep: 4 },
    { day: 'Day 7', mood: 6, anxiety: 5, sleep: 5 },
    { day: 'Day 14', mood: 7, anxiety: 4, sleep: 6 },
    { day: 'Day 21', mood: 7, anxiety: 3, sleep: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pregnancy & Postpartum Support</h1>
          <p className="text-gray-600 mt-2">Comprehensive care for your pregnancy journey</p>
        </div>
        <Baby className="w-12 h-12 text-pink-500" />
      </div>

      {/* Pregnancy Status Card */}
      {pregnancyData.currentWeek > 0 && (
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Current Pregnancy Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Week</p>
                <p className="text-2xl font-bold text-pink-600">{pregnancyData.currentWeek}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trimester</p>
                <p className="text-2xl font-bold text-pink-600">{pregnancyData.trimester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-semibold">{pregnancyData.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-semibold capitalize">{pregnancyData.pregnancyType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="ppd">PPD Screening</TabsTrigger>
          <TabsTrigger value="postpartum">Postpartum</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        {/* TRACKING TAB */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start Pregnancy Tracking</CardTitle>
              <CardDescription>Track your pregnancy from conception to delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Conception Date</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Pregnancy Type</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>Singleton</option>
                    <option>Twins</option>
                    <option>Triplets</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Previous Pregnancies</label>
                  <Input type="number" min="0" className="mt-1" />
                </div>
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">Start Tracking</Button>
            </CardContent>
          </Card>

          {/* Trimester Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Trimester</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>✓ Morning sickness common</li>
                  <li>✓ Fatigue expected</li>
                  <li>✓ First ultrasound</li>
                  <li>✓ Screen for risks</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Second Trimester</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>✓ Feel baby kick</li>
                  <li>✓ Energy increases</li>
                  <li>✓ Anatomy scan</li>
                  <li>✓ Glucose screening</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Third Trimester</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>✓ Prepare for delivery</li>
                  <li>✓ Increased discomfort</li>
                  <li>✓ Frequent monitoring</li>
                  <li>✓ Birth plan review</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PPD SCREENING TAB */}
        <TabsContent value="ppd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Postpartum Depression (PPD) Risk Screening</CardTitle>
              <CardDescription>Identify risk factors early for better support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ppdRiskLevel === 'very_high' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    You have significant PPD risk factors. Please schedule an appointment with your OB/GYN or mental health professional.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>History of depression or anxiety</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Lack of support system</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Pregnancy complications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>History of trauma</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Sleep deprivation concerns</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Recent stressful events</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Significant hormone changes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Previous postpartum depression</span>
                </label>
              </div>

              <Button className="w-full bg-pink-600 hover:bg-pink-700">Complete Screening</Button>
            </CardContent>
          </Card>

          {/* PPD Resources */}
          <Card>
            <CardHeader>
              <CardTitle>PPD Support Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>📞 <strong>PSI Helpline:</strong> 1-800-944-4773 (call/text)</li>
                <li>💬 <strong>Postpartum Support International:</strong> www.postpartum.net</li>
                <li>👥 <strong>Support Groups:</strong> Local and online communities</li>
                <li>🏥 <strong>Professional Help:</strong> Therapists specializing in PPD</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTPARTUM TAB */}
        <TabsContent value="postpartum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Postpartum Mood Tracking</CardTitle>
              <CardDescription>Monitor your emotional wellbeing after delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Days Since Delivery</label>
                  <Input type="number" min="0" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mood (1-10)</label>
                  <Input type="range" min="1" max="10" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Anxiety Level (1-10)</label>
                  <Input type="range" min="1" max="10" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Sleep Quality (1-10)</label>
                  <Input type="range" min="1" max="10" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea className="w-full mt-1 p-2 border rounded-md" rows={3} placeholder="How are you feeling?" />
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">Log Mood</Button>
            </CardContent>
          </Card>

          {/* Mood Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Postpartum Mood Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#ec4899" name="Mood" />
                  <Line type="monotone" dataKey="anxiety" stroke="#f97316" name="Anxiety" />
                  <Line type="monotone" dataKey="sleep" stroke="#3b82f6" name="Sleep" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Warning Signs */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Seek help if you experience:</strong> Persistent sadness, inability to bond with baby, thoughts of harming yourself, severe anxiety, or difficulty sleeping despite opportunity.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* APPOINTMENTS TAB */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Prenatal Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Appointment Date</label>
                  <Input type="datetime-local" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>Checkup</option>
                    <option>Ultrasound</option>
                    <option>Lab Work</option>
                    <option>Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Provider Name</label>
                  <Input className="mt-1" placeholder="OB/GYN name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input className="mt-1" placeholder="Clinic or hospital" />
                </div>
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">Schedule Appointment</Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Routine Checkup</p>
                      <p className="text-sm text-gray-600">Dr. Sarah Johnson</p>
                    </div>
                    <p className="text-sm font-medium">May 15, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
