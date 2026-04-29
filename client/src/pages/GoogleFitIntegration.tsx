import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * Google Fit Integration Page
 * Connect and manage Google Fit health data
 */

export default function GoogleFitIntegrationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // This would call your backend to check if Google Fit is connected
      setIsConnected(false);
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Call backend to get OAuth URL
      // const response = await trpc.googleFit.connectGoogleFit.mutate();
      // window.location.href = response.authUrl;

      // For now, show placeholder
      alert('Google Fit connection coming soon!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      // Call backend to disconnect
      // await trpc.googleFit.disconnectGoogleFit.mutate();
      setIsConnected(false);
      setHealthData({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Fit Integration</h1>
          <p className="text-gray-600 mt-2">Connect your Google Fit account to sync health data automatically</p>
        </div>
        <Activity className="w-12 h-12 text-blue-500" />
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Connection Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Manage your Google Fit account connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Google Fit Account</h3>
              <p className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Not connected'}</p>
            </div>
            {isConnected ? (
              <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Connecting...' : 'Connect Google Fit'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What Data We Access */}
      <Card>
        <CardHeader>
          <CardTitle>What Data We Access</CardTitle>
          <CardDescription>We only read the following health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Steps</h4>
                <p className="text-sm text-gray-600">Daily step count</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Zap className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Heart Rate</h4>
                <p className="text-sm text-gray-600">Resting and active heart rate</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Sleep</h4>
                <p className="text-sm text-gray-600">Sleep duration and quality</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Zap className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Calories</h4>
                <p className="text-sm text-gray-600">Calories burned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Data Summary */}
      {isConnected && Object.keys(healthData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Health Data</CardTitle>
            <CardDescription>Last 7 days summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(healthData).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold capitalize">{key.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">Average: {value.average} {value.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{value.latest}</p>
                    <p className="text-xs text-gray-600">{value.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">🔒 Your Privacy is Protected</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>✓ We only read health data, never modify it</li>
            <li>✓ Your data is encrypted in transit and at rest</li>
            <li>✓ You can disconnect anytime</li>
            <li>✓ GDPR and HIPAA compliant</li>
            <li>✓ We never sell your data</li>
          </ul>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Step-by-step guide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">1</div>
              <div>
                <h4 className="font-semibold">Connect Your Account</h4>
                <p className="text-sm text-gray-600">Click "Connect Google Fit" and authorize Sentinel</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">2</div>
              <div>
                <h4 className="font-semibold">Data Syncs Automatically</h4>
                <p className="text-sm text-gray-600">Your health data syncs every hour</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">3</div>
              <div>
                <h4 className="font-semibold">AI Analyzes Patterns</h4>
                <p className="text-sm text-gray-600">Our AI detects patterns and sends interventions</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">4</div>
              <div>
                <h4 className="font-semibold">See Your Dashboard</h4>
                <p className="text-sm text-gray-600">View your health trends and insights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
