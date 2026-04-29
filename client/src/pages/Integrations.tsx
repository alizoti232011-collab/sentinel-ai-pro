import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Smartphone, Mic, Watch, CheckCircle, AlertCircle, Clock } from 'lucide-react';

/**
 * Integrations Settings Page
 * Manage all health data, wearable, and smart speaker integrations
 */

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('health');
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load integration status
    setLoading(false);
  }, []);

  // Mock integration data
  const integrations = {
    health: [
      {
        id: 'fitbit',
        name: 'Fitbit',
        description: 'Track steps, heart rate, sleep, and calories',
        icon: '📊',
        connected: false,
        lastSync: null,
      },
      {
        id: 'apple_healthkit',
        name: 'Apple HealthKit',
        description: 'Sync health data from Apple devices',
        icon: '🍎',
        connected: false,
        lastSync: null,
      },
      {
        id: 'google_fit',
        name: 'Google Fit',
        description: 'Sync fitness data from Android devices',
        icon: '🟢',
        connected: false,
        lastSync: null,
      },
    ],
    screentime: [
      {
        id: 'screen_time_ios',
        name: 'iOS Screen Time',
        description: 'Track app usage and screen time on iPhone/iPad',
        icon: '📱',
        connected: false,
        lastSync: null,
      },
      {
        id: 'screen_time_android',
        name: 'Android Digital Wellbeing',
        description: 'Track app usage on Android devices',
        icon: '🤖',
        connected: false,
        lastSync: null,
      },
      {
        id: 'samsung_health',
        name: 'Samsung Health',
        description: 'Sync health data from Samsung devices',
        icon: '🔷',
        connected: false,
        lastSync: null,
      },
    ],
    voice: [
      {
        id: 'alexa',
        name: 'Amazon Alexa',
        description: 'Voice logging and daily check-ins with Alexa',
        icon: '🔊',
        connected: false,
        lastSync: null,
      },
      {
        id: 'google_assistant',
        name: 'Google Assistant',
        description: 'Voice logging with Google Assistant',
        icon: '🎤',
        connected: false,
        lastSync: null,
      },
      {
        id: 'bixby',
        name: 'Samsung Bixby',
        description: 'Voice control with Samsung Bixby',
        icon: '🎙️',
        connected: false,
        lastSync: null,
      },
    ],
    wearables: [
      {
        id: 'apple_watch',
        name: 'Apple Watch',
        description: 'Heart rate, workouts, and notifications',
        icon: '⌚',
        connected: false,
        lastSync: null,
      },
      {
        id: 'wear_os',
        name: 'Wear OS',
        description: 'Android smartwatch integration',
        icon: '⌚',
        connected: false,
        lastSync: null,
      },
      {
        id: 'samsung_watch',
        name: 'Samsung Galaxy Watch',
        description: 'Samsung smartwatch integration',
        icon: '⌚',
        connected: false,
        lastSync: null,
      },
    ],
  };

  const IntegrationCard = ({ integration }: { integration: any }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{integration.icon}</span>
            <div>
              <h4 className="font-semibold">{integration.name}</h4>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          </div>
          {integration.connected ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {integration.connected && integration.lastSync && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <Clock className="w-3 h-3" />
            Last sync: {integration.lastSync}
          </div>
        )}

        <div className="flex gap-2">
          {integration.connected ? (
            <>
              <Button variant="outline" className="flex-1">
                Settings
              </Button>
              <Button variant="destructive" className="flex-1">
                Disconnect
              </Button>
            </>
          ) : (
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect {integration.name}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect your health devices and apps to Sentinel</p>
        </div>
        <Activity className="w-12 h-12 text-blue-500" />
      </div>

      {/* Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Why Connect Your Devices?</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>✅ Automatic health tracking - no manual logging needed</li>
            <li>✅ Better insights - AI analyzes real data patterns</li>
            <li>✅ Early warnings - detect issues before they become serious</li>
            <li>✅ Personalized care - interventions based on your actual data</li>
          </ul>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="screentime" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Screen Time
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="wearables" className="flex items-center gap-2">
            <Watch className="w-4 h-4" />
            Wearables
          </TabsTrigger>
        </TabsList>

        {/* HEALTH TAB */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Data Integrations</CardTitle>
              <CardDescription>Connect fitness trackers and health apps to automatically sync your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.health.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCREEN TIME TAB */}
        <TabsContent value="screentime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Screen Time Tracking</CardTitle>
              <CardDescription>Monitor app usage and detect doom-scrolling patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.screentime.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VOICE TAB */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Assistants</CardTitle>
              <CardDescription>Use voice commands to log moods, get check-ins, and receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.voice.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>

              {/* Voice Commands Example */}
              <Card className="border-dashed bg-gray-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Example Voice Commands</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>"Alexa, ask Sentinel how I'm doing"</strong> - Daily check-in
                    </p>
                    <p>
                      <strong>"Hey Google, tell Sentinel my mood is 7"</strong> - Log mood
                    </p>
                    <p>
                      <strong>"Bixby, when is my next appointment?"</strong> - Check appointments
                    </p>
                    <p>
                      <strong>"Alexa, I'm having dark thoughts"</strong> - Crisis alert
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEARABLES TAB */}
        <TabsContent value="wearables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smartwatch Integration</CardTitle>
              <CardDescription>Connect your smartwatch for real-time health monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.wearables.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>

              {/* Wearable Features */}
              <Card className="border-dashed bg-gray-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Wearable Features</h4>
                  <div className="space-y-2 text-sm">
                    <p>✓ Real-time heart rate monitoring</p>
                    <p>✓ Automatic workout detection</p>
                    <p>✓ Quick mood logging from your wrist</p>
                    <p>✓ Instant notifications and alerts</p>
                    <p>✓ Sleep tracking and analysis</p>
                    <p>✓ Stress level monitoring</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Privacy */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">🔒 Your Data is Private</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>✓ All data is encrypted in transit and at rest</li>
            <li>✓ You control what data is shared with Sentinel</li>
            <li>✓ You can disconnect any integration anytime</li>
            <li>✓ GDPR and HIPAA compliant</li>
            <li>✓ We never sell your data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
