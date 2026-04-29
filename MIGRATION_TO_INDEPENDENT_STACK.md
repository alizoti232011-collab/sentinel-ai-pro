# 🚀 Migration Guide: Sentinel (Independent Stack)

## Migration Overview

**From:** Manus-hosted platform  
**To:** Independent stack (Supabase + Ollama + custom domain)  
**Timeline:** 4-6 hours  
**Cost:** $0 forever  
**Email:** alizoti232011@gmail.com  

---

## Phase 1: Supabase Setup

### Step 1.1: Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up with: alizoti232011@gmail.com
- [ ] Create new project named "sentinel"
- [ ] Region: Choose closest to your users
- [ ] Password: Strong password (save it!)

### Step 1.2: Get Supabase Credentials
After project created, collect:
- [ ] Project URL: `https://[project-id].supabase.co`
- [ ] Anon Key: `eyJhbGc...` (public key)
- [ ] Service Role Key: `eyJhbGc...` (secret key)

### Step 1.3: Create Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sleep_hours DECIMAL(3,1),
  screen_time_hours DECIMAL(3,1),
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
  activity_minutes INT,
  social_plans TEXT,
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patterns table
CREATE TABLE patterns (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(100),
  detected_at TIMESTAMP,
  severity INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Interventions table
CREATE TABLE interventions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_id BIGINT REFERENCES patterns(id),
  intervention_text TEXT,
  ai_generated BOOLEAN DEFAULT TRUE,
  accepted BOOLEAN,
  effectiveness_rating INT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE journal_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  mood_before INT,
  mood_after INT,
  sentiment_score DECIMAL(3,2),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own logs" ON daily_logs
  FOR SELECT USING (user_id = auth.uid()::bigint);

CREATE POLICY "Users can insert own logs" ON daily_logs
  FOR INSERT WITH CHECK (user_id = auth.uid()::bigint);
```

---

## Phase 2: Replace Manus OAuth with Supabase Auth

### Step 2.1: Update Environment Variables

Create `.env.local`:
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 2.2: Install Supabase Client

```bash
cd /home/ubuntu/sentinel-ai-pro
pnpm add @supabase/supabase-js @supabase/auth-helpers-react
```

### Step 2.3: Create Supabase Client

Create `client/src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

### Step 2.4: Update Login Page

Replace `client/src/pages/Login.tsx`:
```typescript
import { useState } from 'react';
import { signIn } from '@/lib/supabase';
import { useNavigate } from 'wouter';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else if (data.session) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Sentinel</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
```

### Step 2.5: Update Signup Page

Create `client/src/pages/Signup.tsx`:
```typescript
import { useState } from 'react';
import { signUp } from '@/lib/supabase';
import { useNavigate } from 'wouter';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    } else if (data.user) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Sentinel</h1>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## Phase 3: Set Up Ollama with Llama 2

### Step 3.1: Install Ollama

```bash
# Download Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### Step 3.2: Pull Llama 2 Model

In a new terminal:
```bash
ollama pull llama2
```

### Step 3.3: Create Ollama Client

Create `server/lib/ollama.ts`:
```typescript
export async function generateIntervention(userContext: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `You are a compassionate mental health support AI. Based on this context: "${userContext}", generate a brief, empathetic intervention message (2-3 sentences max). Be warm, non-judgmental, and actionable.`,
      stream: false,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.response.trim();
}

export async function analyzeSentiment(text: string): Promise<number> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `Analyze the sentiment of this text on a scale of -1 (very negative) to 1 (very positive). Return only a number. Text: "${text}"`,
      stream: false,
    }),
  });

  const data = await response.json();
  const sentiment = parseFloat(data.response.trim());
  return isNaN(sentiment) ? 0 : sentiment;
}

export async function generateJournalInsights(journalText: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `Provide brief, actionable insights from this journal entry (2-3 sentences). Focus on patterns and suggestions. Entry: "${journalText}"`,
      stream: false,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.response.trim();
}
```

---

## Phase 4: Replace Manus Storage with Supabase Storage

### Step 4.1: Create Storage Bucket in Supabase

In Supabase dashboard:
- [ ] Go to Storage
- [ ] Create new bucket: `journal-exports`
- [ ] Make it private
- [ ] Create new bucket: `user-uploads`
- [ ] Make it private

### Step 4.2: Create Storage Helper

Create `client/src/lib/storage.ts`:
```typescript
import { supabase } from './supabase';

export async function uploadPDF(file: File, userId: string): Promise<string> {
  const filename = `${userId}-${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('journal-exports')
    .upload(filename, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('journal-exports')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function uploadUserFile(file: File, userId: string): Promise<string> {
  const filename = `${userId}-${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filename, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
```

---

## Phase 5: Remove Manus Branding

### Step 5.1: Update App Title

Edit `client/index.html`:
```html
<title>Sentinel - Proactive Mental Wellness</title>
<meta name="description" content="Sentinel detects your patterns and reaches out with support before you need to ask.">
```

### Step 5.2: Update App.tsx

Remove all Manus references:
```typescript
// Remove: import { ManusBranding } from '@/components/ManusBranding'
// Remove: <ManusBranding />

// Update title
export function App() {
  return (
    <div>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <h1 className="text-2xl font-bold">Sentinel</h1>
      </header>
      {/* Rest of app */}
    </div>
  );
}
```

### Step 5.3: Remove Manus Footer Links

Edit footer to remove:
- "Powered by Manus"
- Manus logo
- Manus links

---

## Phase 6: Update Backend for Supabase

### Step 6.1: Create Supabase Server Client

Create `server/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function createDailyLog(userId: string, log: any) {
  const { data, error } = await supabase
    .from('daily_logs')
    .insert([{ user_id: userId, ...log }]);

  if (error) throw error;
  return data;
}

export async function getPatterns(userId: string) {
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}
```

---

## Phase 7: Testing Checklist

- [ ] Supabase authentication works (signup/login/logout)
- [ ] Daily logs save to Supabase
- [ ] Ollama generates interventions
- [ ] Journal entries save and retrieve
- [ ] PDF export works
- [ ] No Manus branding visible
- [ ] All pages load correctly
- [ ] Mobile responsive

---

## Deployment Options (All Free)

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option B: Railway
- Go to railway.app
- Connect GitHub
- Deploy

### Option C: Render
- Go to render.com
- Connect GitHub
- Deploy

---

## Environment Variables for Production

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OLLAMA_URL=http://localhost:11434
NODE_ENV=production
```

---

## Cost Summary

| Component | Cost |
|-----------|------|
| Supabase (free tier) | $0 |
| Ollama (self-hosted) | $0 |
| Vercel (free tier) | $0 |
| Domain (optional) | $0-15/year |
| **Total** | **$0/month** |

---

## Support

If you run into issues:
1. Check Supabase docs: https://supabase.com/docs
2. Check Ollama docs: https://ollama.ai
3. Check deployment platform docs

---

**Status: Ready to implement** ✅
