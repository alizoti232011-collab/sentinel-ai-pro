import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Brain, TrendingUp, Calendar, Filter, Download, Plus, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const EMOTIONS = ["Happy", "Sad", "Anxious", "Angry", "Grateful", "Hopeful", "Overwhelmed", "Lonely", "Motivated", "Exhausted", "Confused", "Peaceful"];

const JOURNAL_PROMPTS = [
  { category: "Emotional", text: "How are you feeling right now? What triggered this emotion?" },
  { category: "Gratitude", text: "What are 3 things you're grateful for today?" },
  { category: "Reflection", text: "What's one thing that went well today? What would you change?" },
  { category: "Challenge", text: "What challenge did you face today? How did you handle it?" },
  { category: "Tomorrow", text: "What's one thing you want to accomplish tomorrow?" },
  { category: "Relationship", text: "How did your interactions with others go today?" },
  { category: "Self-Care", text: "What did you do today to take care of yourself?" },
  { category: "Worry", text: "What's worrying you? What can you control vs can't control?" },
];

export default function Journal() {
  const [activeTab, setActiveTab] = useState<"write" | "history" | "insights" | "prompts">("write");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [moodScore, setMoodScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(true);
  const [moodBefore, setMoodBefore] = useState(5);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const { data: entries, isLoading: entriesLoading } = trpc.journal.getEntries.useQuery();
  const { data: stats } = trpc.journal.getStats.useQuery();
  const createEntry = trpc.journal.createEntry.useMutation();

  const handleCreateEntry = async () => {
    if (!entryContent.trim()) return;

    await createEntry.mutateAsync({
      title: entryTitle,
      content: entryContent,
      emotionTags: selectedEmotions,
      moodScore,
      isPrivate,
    });

    // Reset form
    setEntryTitle("");
    setEntryContent("");
    setSelectedEmotions([]);
    setMoodScore(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Your Journal</h1>
          </div>
          <p className="text-slate-600">Express yourself. Let AI understand your patterns. Heal faster.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-2 font-medium ${activeTab === "write" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600"}`}
          >
            Write
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium ${activeTab === "history" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600"}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 font-medium ${activeTab === "insights" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600"}`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`px-4 py-2 font-medium ${activeTab === "prompts" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600"}`}
          >
            Prompts
          </button>
        </div>

        {/* WRITE TAB */}
        {activeTab === "write" && (
          <div className="space-y-6">
            {/* Mood Before */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                How are you feeling right now? (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-blue-600 w-12">{moodBefore}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Journaling typically improves mood by 1-3 points
              </p>
            </Card>

            {/* Entry Title */}
            <Card className="p-6">
              <input
                type="text"
                placeholder="Give this entry a title (optional)"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Card>

            {/* Entry Content */}
            <Card className="p-6">
              <textarea
                placeholder="Write freely... What's on your mind? What happened today? How are you feeling?"
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                {entryContent.length} characters • AI will analyze this for patterns and themes
              </p>
            </Card>

            {/* Emotion Tags */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-4">
                What emotions are you experiencing?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() =>
                      setSelectedEmotions((prev) =>
                        prev.includes(emotion)
                          ? prev.filter((e) => e !== emotion)
                          : [...prev, emotion]
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedEmotions.includes(emotion)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </Card>

            {/* Mood Score */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Rate your mood for this entry (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-blue-600 w-12">{moodScore}</span>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Keep this entry private (not shareable with therapist)
                </span>
              </label>
            </Card>

            {/* Submit */}
            <Button
              onClick={handleCreateEntry}
              disabled={!entryContent.trim() || createEntry.isPending}
              className="w-full py-3 text-lg"
            >
              {createEntry.isPending ? "Saving..." : "Save Entry"}
            </Button>

            {/* AI Coaching */}
            {entryContent.length > 50 && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">AI Coaching Tip</p>
                    <p className="text-sm text-slate-700 mt-1">
                      After you save this entry, I'll provide personalized insights and ask follow-up questions to help you reflect deeper.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {entriesLoading ? (
              <Card className="p-6 text-center text-slate-500">Loading entries...</Card>
            ) : entries && entries.length > 0 ? (
              entries.map((entry: any) => (
                <Card key={entry.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{entry.title || "Untitled"}</h3>
                      <p className="text-sm text-slate-500">
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      entry.sentiment === "very_positive" ? "bg-green-100 text-green-700" :
                      entry.sentiment === "positive" ? "bg-lime-100 text-lime-700" :
                      entry.sentiment === "neutral" ? "bg-slate-100 text-slate-700" :
                      entry.sentiment === "negative" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {entry.sentiment || "unanalyzed"}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3 line-clamp-2">{entry.content}</p>
                  {entry.emotionTags && Array.isArray(entry.emotionTags) && entry.emotionTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(entry.emotionTags as string[]).map((emotion: string) => (
                        <span key={emotion} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.aiReflection && (
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400 text-sm text-slate-700">
                      <strong>AI Reflection:</strong> {entry.aiReflection}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-slate-500">
                No entries yet. Start journaling to see your history!
              </Card>
            )}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Journal Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Total Entries</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalEntries || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Average Mood</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.averageMood ? stats.averageMood.toFixed(1) : "—"}/10
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Most Common Emotions
              </h3>
              <div className="space-y-2">
                {stats?.emotionFrequency && Object.entries(stats.emotionFrequency)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([emotion, count]) => (
                    <div key={emotion} className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">{emotion}</span>
                      <span className="font-bold text-blue-600">{count}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {/* PROMPTS TAB */}
        {activeTab === "prompts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JOURNAL_PROMPTS.map((prompt, idx) => (
              <Card
                key={idx}
                className="p-6 cursor-pointer hover:shadow-lg transition hover:border-blue-400"
                onClick={() => {
                  setSelectedPrompt(prompt.text);
                  setEntryContent(prompt.text + "\n\n");
                  setActiveTab("write");
                }}
              >
                <p className="text-xs font-semibold text-blue-600 mb-2">{prompt.category}</p>
                <p className="text-slate-900 font-medium">{prompt.text}</p>
                <Button variant="ghost" className="mt-4 w-full">
                  Use This Prompt →
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
