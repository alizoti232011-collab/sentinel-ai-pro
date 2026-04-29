/**
 * AI Safety & Content Moderation Module
 * Includes: crisis detection, harmful content filtering, content moderation
 */

// ============================================================================
// 1. CRISIS DETECTION (Suicide Risk Assessment)
// ============================================================================

interface CrisisIndicators {
  suicideRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  recommendedAction: string;
  needsImmediateIntervention: boolean;
}

const CRISIS_KEYWORDS = {
  critical: [
    'kill myself',
    'end my life',
    'suicide',
    'hang myself',
    'jump off',
    'overdose',
    'cut my wrists',
    'slit wrists',
    'no point living',
    'better off dead',
    'goodbye forever',
    'last message',
    'final note',
  ],
  high: [
    'want to die',
    'tired of living',
    'give up',
    'not worth it',
    'hopeless',
    'worthless',
    'burden',
    'everyone better off',
    'nothing matters',
    'can\'t take it anymore',
  ],
  moderate: [
    'depressed',
    'anxious',
    'stressed',
    'overwhelmed',
    'struggling',
    'can\'t cope',
    'falling apart',
  ],
};

/**
 * Detect crisis indicators in text
 */
export function detectCrisisIndicators(text: string): CrisisIndicators {
  const lowerText = text.toLowerCase();
  const indicators: string[] = [];
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';

  // Check for critical keywords
  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (lowerText.includes(keyword)) {
      indicators.push(`Critical keyword detected: "${keyword}"`);
      riskLevel = 'critical';
    }
  }

  // Check for high-risk keywords
  if (riskLevel !== 'critical') {
    for (const keyword of CRISIS_KEYWORDS.high) {
      if (lowerText.includes(keyword)) {
        indicators.push(`High-risk keyword detected: "${keyword}"`);
        riskLevel = 'high';
      }
    }
  }

  // Check for moderate keywords
  if (riskLevel === 'low') {
    for (const keyword of CRISIS_KEYWORDS.moderate) {
      if (lowerText.includes(keyword)) {
        indicators.push(`Moderate keyword detected: "${keyword}"`);
        riskLevel = 'moderate';
      }
    }
  }

  // Determine recommended action
  let recommendedAction = '';
  let needsImmediateIntervention = false;

  switch (riskLevel) {
    case 'critical':
      recommendedAction = 'IMMEDIATE: Contact crisis hotline or emergency services';
      needsImmediateIntervention = true;
      break;
    case 'high':
      recommendedAction = 'URGENT: Encourage user to contact mental health professional or crisis line';
      needsImmediateIntervention = true;
      break;
    case 'moderate':
      recommendedAction = 'Provide supportive resources and encourage professional help';
      needsImmediateIntervention = false;
      break;
    default:
      recommendedAction = 'Continue monitoring';
      needsImmediateIntervention = false;
  }

  return {
    suicideRiskLevel: riskLevel,
    indicators,
    recommendedAction,
    needsImmediateIntervention,
  };
}

// ============================================================================
// 2. HARMFUL CONTENT DETECTION
// ============================================================================

interface HarmfulContentAnalysis {
  isHarmful: boolean;
  harmType: 'violence' | 'self_harm' | 'abuse' | 'illegal' | 'none';
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

const HARMFUL_PATTERNS = {
  violence: ['kill', 'murder', 'stab', 'shoot', 'beat', 'attack'],
  self_harm: ['cut', 'hurt myself', 'harm myself', 'injure', 'wound'],
  abuse: ['abuse', 'assault', 'rape', 'molest', 'harass'],
  illegal: ['steal', 'drugs', 'bomb', 'weapon', 'illegal'],
};

/**
 * Analyze content for harmful material
 */
export function analyzeHarmfulContent(text: string): HarmfulContentAnalysis {
  const lowerText = text.toLowerCase();

  for (const [harmType, keywords] of Object.entries(HARMFUL_PATTERNS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return {
          isHarmful: true,
          harmType: harmType as 'violence' | 'self_harm' | 'abuse' | 'illegal',
          severity: 'high',
          reason: `Detected harmful keyword: "${keyword}"`,
        };
      }
    }
  }

  return {
    isHarmful: false,
    harmType: 'none',
    severity: 'low',
    reason: 'No harmful content detected',
  };
}

// ============================================================================
// 3. CONTENT MODERATION
// ============================================================================

interface ModerationResult {
  shouldBlock: boolean;
  category: string;
  confidence: number;
  reason: string;
}

/**
 * Moderate user-generated content
 */
export function moderateContent(text: string): ModerationResult {
  // Check length
  if (text.length > 10000) {
    return {
      shouldBlock: true,
      category: 'spam',
      confidence: 0.9,
      reason: 'Content exceeds maximum length',
    };
  }

  // Check for crisis indicators
  const crisisCheck = detectCrisisIndicators(text);
  if (crisisCheck.needsImmediateIntervention) {
    return {
      shouldBlock: false, // Don't block, but flag for review
      category: 'crisis',
      confidence: 0.95,
      reason: crisisCheck.recommendedAction,
    };
  }

  // Check for harmful content
  const harmCheck = analyzeHarmfulContent(text);
  if (harmCheck.isHarmful) {
    return {
      shouldBlock: true,
      category: harmCheck.harmType,
      confidence: 0.85,
      reason: harmCheck.reason,
    };
  }

  // Check for spam patterns
  const spamScore = calculateSpamScore(text);
  if (spamScore > 0.7) {
    return {
      shouldBlock: true,
      category: 'spam',
      confidence: spamScore,
      reason: 'Content appears to be spam',
    };
  }

  return {
    shouldBlock: false,
    category: 'clean',
    confidence: 0.99,
    reason: 'Content passed moderation',
  };
}

/**
 * Calculate spam score
 */
function calculateSpamScore(text: string): number {
  let score = 0;

  // Check for excessive links
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 5) score += 0.3;

  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5) score += 0.2;

  // Check for excessive punctuation
  const punctRatio = (text.match(/[!?]{2,}/g) || []).length;
  if (punctRatio > 3) score += 0.2;

  // Check for repeated characters
  if (/(.)\1{4,}/.test(text)) score += 0.2;

  return Math.min(score, 1);
}

// ============================================================================
// 4. EMERGENCY RESOURCES
// ============================================================================

interface EmergencyResource {
  country: string;
  service: string;
  phone: string;
  website?: string;
  available24_7: boolean;
}

const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    country: 'USA',
    service: 'National Suicide Prevention Lifeline',
    phone: '988',
    website: 'https://suicidepreventionlifeline.org',
    available24_7: true,
  },
  {
    country: 'USA',
    service: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    available24_7: true,
  },
  {
    country: 'UK',
    service: 'Samaritans',
    phone: '116 123',
    website: 'https://www.samaritans.org',
    available24_7: true,
  },
  {
    country: 'Canada',
    service: 'Canada Suicide Prevention Service',
    phone: '1-833-456-4566',
    website: 'https://www.crisisservicescanada.ca',
    available24_7: true,
  },
  {
    country: 'Australia',
    service: 'Lifeline',
    phone: '13 11 14',
    website: 'https://www.lifeline.org.au',
    available24_7: true,
  },
  {
    country: 'Germany',
    service: 'Telefonseelsorge',
    phone: '0800 111 0 111',
    website: 'https://www.telefonseelsorge.de',
    available24_7: true,
  },
  {
    country: 'France',
    service: '3114 - National Suicide Prevention Number',
    phone: '3114',
    website: 'https://www.3114.fr',
    available24_7: true,
  },
  {
    country: 'Japan',
    service: 'Inochi no Denwa',
    phone: '0570-783-556',
    website: 'https://www.inochinodenwa.org',
    available24_7: true,
  },
];

/**
 * Get emergency resources by country
 */
export function getEmergencyResources(country?: string): EmergencyResource[] {
  if (!country) {
    return EMERGENCY_RESOURCES;
  }

  return EMERGENCY_RESOURCES.filter((r) => r.country.toLowerCase() === country.toLowerCase());
}

/**
 * Get crisis intervention message
 */
export function getCrisisInterventionMessage(riskLevel: 'high' | 'critical'): string {
  if (riskLevel === 'critical') {
    return `
🚨 IMMEDIATE SUPPORT AVAILABLE 🚨

I'm concerned about your safety. Please reach out for immediate help:

📞 National Suicide Prevention Lifeline: 988 (call or text)
💬 Crisis Text Line: Text HOME to 741741
🌐 International Resources: https://findahelpline.com

You are not alone. Help is available right now.
    `.trim();
  }

  return `
I'm here to listen and support you. If you're having thoughts of self-harm, please reach out:

📞 Crisis Support: 988 (USA) or text HOME to 741741
🌐 Find local resources: https://findahelpline.com

Your wellbeing matters. Professional support is available.
    `.trim();
}

// ============================================================================
// 5. CONTENT FILTERING
// ============================================================================

/**
 * Filter and sanitize AI-generated content
 */
export function filterAIContent(content: string): { filtered: string; flagged: boolean } {
  let filtered = content;
  let flagged = false;

  // Remove any harmful suggestions
  const harmfulPatterns = [
    /suggest.*suicide/gi,
    /recommend.*self.?harm/gi,
    /try.*overdose/gi,
    /consider.*ending/gi,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(filtered)) {
      filtered = filtered.replace(pattern, '[content removed]');
      flagged = true;
    }
  }

  // Ensure we're not providing medical advice
  if (/prescribe|dosage|medication/i.test(filtered)) {
    filtered += '\n\n⚠️ Note: I cannot prescribe medications. Please consult a healthcare provider.';
    flagged = true;
  }

  return { filtered, flagged };
}
