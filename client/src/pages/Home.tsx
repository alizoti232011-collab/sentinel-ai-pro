import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Heart, TrendingUp, AlertCircle, MessageCircle, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Sentinel AI</span>
          </div>
          <div>
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard")} variant="default">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
            The AI That Notices <span className="text-blue-600">Before You Do</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Sentinel AI passively monitors your daily patterns and reaches out with empathetic support when it detects signs of distress. No asking. No waiting. Just care, when you need it most.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How Sentinel Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 border-slate-200 hover:border-blue-300 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Pattern Detection</h3>
            <p className="text-slate-600">
              Sentinel AI analyzes your daily metrics: sleep, screen time, mood, energy, activity, and social engagement.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 hover:border-blue-300 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Early Warning</h3>
            <p className="text-slate-600">
              When multiple negative patterns emerge, Sentinel detects the risk and prepares to reach out with support.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 hover:border-blue-300 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Proactive Care</h3>
            <p className="text-slate-600">
              Sentinel reaches out with a personalized, empathetic message before crisis strikes. Support when you need it.
            </p>
          </Card>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What We Monitor</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">💤</div>
              <h3 className="font-semibold text-slate-900 mb-1">Sleep Quality</h3>
              <p className="text-slate-600 text-sm">Detects sleep deprivation patterns</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">📱</div>
              <h3 className="font-semibold text-slate-900 mb-1">Screen Time</h3>
              <p className="text-slate-600 text-sm">Identifies doom-scrolling behavior</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">😊</div>
              <h3 className="font-semibold text-slate-900 mb-1">Mood Trends</h3>
              <p className="text-slate-600 text-sm">Tracks emotional well-being changes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">⚡</div>
              <h3 className="font-semibold text-slate-900 mb-1">Energy Levels</h3>
              <p className="text-slate-600 text-sm">Monitors fatigue and burnout</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">🏃</div>
              <h3 className="font-semibold text-slate-900 mb-1">Physical Activity</h3>
              <p className="text-slate-600 text-sm">Detects sedentary patterns</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">👥</div>
              <h3 className="font-semibold text-slate-900 mb-1">Social Engagement</h3>
              <p className="text-slate-600 text-sm">Identifies social withdrawal</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-slate-900">Ready to Get Started?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their mental wellness with Sentinel AI.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="gap-2"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-slate-900">Sentinel AI</span>
              </div>
              <p className="text-sm text-slate-600">Proactive mental wellness for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">About</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2026 Sentinel AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Footer />
    </div>
  );
}
