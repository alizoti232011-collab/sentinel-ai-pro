/**
 * Ollama LLM Integration
 * Uses local Llama 2 model for 100% free AI
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'tinyllama'; // Using TinyLlama for efficiency (works with 3.8GB RAM)

/**
 * Generate intervention message using Ollama
 */
export async function generateIntervention(userContext: string): Promise<string> {
  try {
    const prompt = `You are a compassionate mental health support AI. Based on this context: "${userContext}", generate a brief, empathetic intervention message (2-3 sentences max). Be warm, non-judgmental, and actionable. Focus on practical next steps.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error: any) {
    console.error('Error generating intervention:', error);
    // Fallback response if Ollama is unavailable
    return 'I notice you might be struggling. Remember, it\'s okay to reach out for support. Would you like to talk about what\'s on your mind?';
  }
}

/**
 * Analyze sentiment of text
 */
export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const prompt = `Analyze the sentiment of this text on a scale of -1 (very negative) to 1 (very positive). Return ONLY a single number between -1 and 1. Text: "${text}"`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const sentiment = parseFloat(data.response.trim());

    // Ensure sentiment is between -1 and 1
    if (isNaN(sentiment)) return 0;
    return Math.max(-1, Math.min(1, sentiment));
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    return 0;
  }
}

/**
 * Generate journal insights
 */
export async function generateJournalInsights(journalText: string): Promise<string> {
  try {
    const prompt = `Provide brief, actionable insights from this journal entry (2-3 sentences). Focus on patterns, emotions, and suggestions for wellbeing. Be supportive and constructive. Entry: "${journalText}"`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error: any) {
    console.error('Error generating journal insights:', error);
    return 'Thank you for sharing. Reflecting on your thoughts is a powerful step toward understanding yourself better.';
  }
}

/**
 * Generate personalized recommendation
 */
export async function generateRecommendation(userData: string): Promise<string> {
  try {
    const prompt = `Based on this user data: "${userData}", provide ONE specific, actionable recommendation for mental wellness (1-2 sentences). Be practical and encouraging.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    return 'Consider taking a short walk or practicing deep breathing today.';
  }
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.ok;
  } catch (error: any) {
    console.error('Ollama health check failed:', error);
    return false;
  }
}

/**
 * Get available models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error: any) {
    console.error('Error getting available models:', error);
    return [];
  }
}
