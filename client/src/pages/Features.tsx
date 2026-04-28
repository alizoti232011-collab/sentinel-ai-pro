import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Heart, Brain, Zap, Target, BarChart3, Mic2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<string>("pattern-replay");

  const features = [
    {
      id: "pattern-replay",
      name: "Pattern Replay",
      icon: TrendingUp,
      description: "See your growth over 3 months",
      details: "Compare your patterns from 3 months ago vs today. Celebrate improvements in sleep, mood, activity, and more.",
      color: "blue",
    },
    {
      id: "effectiveness",
      name: "Intervention Effectiveness",
      icon: Target,
      description: "Learn what actually works for you",
      details: "Track which interventions improve your mood most. AI learns your personal triggers and best responses.",
      color: "green",
    },
    {
      id: "buddy",
      name: "Accountability Buddy",
      icon: Users,
      description: "Anonymous peer support",
      details: "Get matched with someone facing similar patterns. Check in together, celebrate wins, stay accountable.",
      color: "purple",
    },
    {
      id: "silence",
      name: "The Silence Feature",
      icon: Heart,
      description: "Respect your autonomy",
      details: "During crisis, grief, or recovery, pause interventions but keep monitoring. AI returns when you're ready.",
      color: "pink",
    },
    {
      id: "debt",
      name: "Behavioral Debt Tracker",
      icon: Zap,
      description: "Gamified accountability",
      details: "Track skipped exercise, cancelled plans. Celebrate when you pay back your 'debt' with positive actions.",
      color: "amber",
    },
    {
      id: "therapist",
      name: "AI Therapist Notes",
      icon: Brain,
      description: "Bridge to real therapy",
      details: "Export professional summaries for your therapist. Includes trends, patterns, and AI insights.",
      color: "indigo",
    },
    {
      id: "anchor",
      name: "Mood Anchors",
      icon: Mic2,
      description: "Your own voice in tough times",
      details: "Record voice memos when happy. During low mood, hear your own voice remind you why life is worth it.",
      color: "rose",
    },
    {
      id: "reverse",
      name: "Reverse Intervention",
      icon: BarChart3,
      description: "Help others when you're well",
      details: "When you're doing great, get suggestions to help someone struggling. Turn wellness into purpose.",
      color: "cyan",
    },
  ];

  const { data: patternHistory } = trpc.journal.getPatternHistory.useQuery();
  const { data: effectiveness } = trpc.journal.getEffectiveness.useQuery();
  const { data: buddyMatch } = trpc.journal.getBuddyMatch.useQuery();
  const { data: debt } = trpc.journal.getBehavioralDebt.useQuery();
  const { data: anchors } = trpc.journal.getMoodAnchors.useQuery();

  const currentFeature = features.find((f) => f.id === activeFeature);
  const IconComponent = currentFeature?.icon || TrendingUp;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Sentinel's Unique Features</h1>
          <p className="text-lg text-slate-600">
            8 features no other AI app has. Designed to help you heal faster and live better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature List */}
          <div className="lg:col-span-1 space-y-3">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`w-full text-left p-4 rounded-lg transition ${
                  activeFeature === feature.id
                    ? `bg-${feature.color}-100 border-2 border-${feature.color}-500`
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <feature.icon className="w-5 h-5" />
                  <div>
                    <p className="font-semibold text-slate-900">{feature.name}</p>
                    <p className="text-xs text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature Details */}
          <div className="lg:col-span-2">
            {currentFeature && (
              <Card className="p-8 sticky top-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 bg-${currentFeature.color}-100 rounded-lg`}>
                    <IconComponent className={`w-8 h-8 text-${currentFeature.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{currentFeature.name}</h2>
                    <p className="text-slate-600">{currentFeature.description}</p>
                  </div>
                </div>

                <p className="text-slate-700 mb-6 text-lg">{currentFeature.details}</p>

                {/* Feature-Specific Content */}
                {activeFeature === "pattern-replay" && patternHistory && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Your 3-Month Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {patternHistory.length > 0 && (
                        <>
                          <div className="p-4 bg-slate-50 rounded">
                            <p className="text-xs text-slate-600">3 Months Ago</p>
                            <p className="text-2xl font-bold text-slate-900">
                              {patternHistory[patternHistory.length - 1]?.avgMood || "—"}
                            </p>
                            <p className="text-xs text-slate-600">Avg Mood</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded">
                            <p className="text-xs text-slate-600">Today</p>
                            <p className="text-2xl font-bold text-green-600">
                              {patternHistory[0]?.avgMood || "—"}
                            </p>
                            <p className="text-xs text-slate-600">Avg Mood</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeFeature === "effectiveness" && effectiveness && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Your Intervention Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Avg Mood Improvement</p>
                        <p className="text-2xl font-bold text-blue-600">
                          +{effectiveness.averageMoodImprovement.toFixed(1)} pts
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Acceptance Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {effectiveness.acceptanceRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeature === "buddy" && buddyMatch && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Your Buddy Match</h3>
                    <div className="p-4 bg-purple-50 rounded">
                      <p className="text-slate-700">You're matched with someone facing similar patterns.</p>
                      <p className="text-sm text-slate-600 mt-2">Status: {buddyMatch.status}</p>
                      <p className="text-sm text-slate-600">Matched: {new Date(buddyMatch.matchedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {activeFeature === "debt" && debt && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Your Behavioral Debt</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded">
                        <p className="text-xs text-slate-600">Debt</p>
                        <p className="text-2xl font-bold text-red-600">
                          {(debt.skippedExerciseDays + debt.cancelledPlansCount + debt.isolationDays)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded">
                        <p className="text-xs text-slate-600">Paid Back</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(debt.exerciseDaysCompleted + debt.plansHonored + debt.socialEngagements)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeature === "anchor" && anchors && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Your Mood Anchors</h3>
                    <p className="text-slate-700">
                      You have {anchors.length} mood anchor{anchors.length !== 1 ? "s" : ""} recorded.
                    </p>
                    {anchors.length === 0 && (
                      <Button className="w-full">Record Your First Mood Anchor</Button>
                    )}
                  </div>
                )}

                <Button className="w-full mt-6">Learn More</Button>
              </Card>
            )}
          </div>
        </div>

        {/* Why These Features Matter */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why These Features Matter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ No Other AI Has These</p>
              <p className="text-slate-700">
                These features are genuinely novel. Apple, Meta, and Samsung don't have them. That's your competitive advantage.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ Psychologically Sound</p>
              <p className="text-slate-700">
                Based on real therapy concepts: pattern recognition, behavioral accountability, peer support, and autonomy.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ Data Moat</p>
              <p className="text-slate-700">
                Every feature generates data that makes the AI smarter. This is what health insurers and tech giants will pay for.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">✓ User Engagement</p>
              <p className="text-slate-700">
                These features keep users coming back. Streaks, buddy matching, and gamification drive retention.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
