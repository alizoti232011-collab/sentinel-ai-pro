/**
 * Monitoring & Analytics Module
 * Includes: error tracking, performance monitoring, user analytics, A/B testing
 */

// ============================================================================
// 1. ERROR TRACKING
// ============================================================================

interface ErrorLog {
  timestamp: string;
  errorType: string;
  message: string;
  stack?: string;
  userId?: string;
  endpoint?: string;
  statusCode?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const errorLogs: ErrorLog[] = [];

/**
 * Log error
 */
export function logError(
  errorType: string,
  message: string,
  options?: {
    stack?: string;
    userId?: string;
    endpoint?: string;
    statusCode?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }
): void {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    errorType,
    message,
    stack: options?.stack,
    userId: options?.userId,
    endpoint: options?.endpoint,
    statusCode: options?.statusCode,
    severity: options?.severity || 'medium',
  };

  errorLogs.push(log);

  // Keep only last 10,000 errors
  if (errorLogs.length > 10000) {
    errorLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', log);
  }

  // Alert on critical errors
  if (log.severity === 'critical') {
    console.error('🚨 CRITICAL ERROR:', log);
    // In production, send to error tracking service (Sentry, etc.)
  }
}

/**
 * Get error logs
 */
export function getErrorLogs(options?: { limit?: number; severity?: string; userId?: string }): ErrorLog[] {
  let logs = errorLogs;

  if (options?.severity) {
    logs = logs.filter((log) => log.severity === options.severity);
  }

  if (options?.userId) {
    logs = logs.filter((log) => log.userId === options.userId);
  }

  const limit = options?.limit || 100;
  return logs.slice(-limit).reverse();
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  byType: { [key: string]: number };
  bySeverity: { [key: string]: number };
  last24Hours: number;
} {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  const byType: { [key: string]: number } = {};
  const bySeverity: { [key: string]: number } = {};
  let last24Hours = 0;

  for (const log of errorLogs) {
    const logTime = new Date(log.timestamp).getTime();

    byType[log.errorType] = (byType[log.errorType] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

    if (logTime > last24h) {
      last24Hours++;
    }
  }

  return {
    total: errorLogs.length,
    byType,
    bySeverity,
    last24Hours,
  };
}

// ============================================================================
// 2. PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
  timestamp: string;
  endpoint: string;
  method: string;
  duration: number; // milliseconds
  statusCode: number;
  userId?: string;
}

const performanceMetrics: PerformanceMetric[] = [];

/**
 * Record performance metric
 */
export function recordPerformanceMetric(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  userId?: string
): void {
  performanceMetrics.push({
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    duration,
    statusCode,
    userId,
  });

  // Keep only last 50,000 metrics
  if (performanceMetrics.length > 50000) {
    performanceMetrics.shift();
  }

  // Alert if response time exceeds threshold
  if (duration > 5000) {
    console.warn(`⚠️ Slow endpoint: ${method} ${endpoint} took ${duration}ms`);
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(options?: { limit?: number; endpoint?: string }): PerformanceMetric[] {
  let metrics = performanceMetrics;

  if (options?.endpoint) {
    metrics = metrics.filter((m) => m.endpoint === options.endpoint);
  }

  const limit = options?.limit || 100;
  return metrics.slice(-limit);
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  errorRate: number;
} {
  if (performanceMetrics.length === 0) {
    return {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowestEndpoints: [],
      errorRate: 0,
    };
  }

  const durations = performanceMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const errors = performanceMetrics.filter((m) => m.statusCode >= 400).length;

  // Calculate percentiles
  const p95Index = Math.floor(durations.length * 0.95);
  const p99Index = Math.floor(durations.length * 0.99);

  // Calculate slowest endpoints
  const endpointStats: { [key: string]: { total: number; count: number } } = {};
  for (const metric of performanceMetrics) {
    if (!endpointStats[metric.endpoint]) {
      endpointStats[metric.endpoint] = { total: 0, count: 0 };
    }
    endpointStats[metric.endpoint].total += metric.duration;
    endpointStats[metric.endpoint].count += 1;
  }

  const slowestEndpoints = Object.entries(endpointStats)
    .map(([endpoint, stats]) => ({
      endpoint,
      avgTime: stats.total / stats.count,
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5);

  return {
    averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
    p95ResponseTime: durations[p95Index] || 0,
    p99ResponseTime: durations[p99Index] || 0,
    slowestEndpoints,
    errorRate: errors / performanceMetrics.length,
  };
}

// ============================================================================
// 3. USER ANALYTICS
// ============================================================================

interface UserAnalyticsEvent {
  timestamp: string;
  userId: string;
  eventType: string;
  eventData: any;
  sessionId: string;
}

const analyticsEvents: UserAnalyticsEvent[] = [];

/**
 * Track user event
 */
export function trackUserEvent(
  userId: string,
  eventType: string,
  eventData: any,
  sessionId: string
): void {
  analyticsEvents.push({
    timestamp: new Date().toISOString(),
    userId,
    eventType,
    eventData,
    sessionId,
  });

  // Keep only last 100,000 events
  if (analyticsEvents.length > 100000) {
    analyticsEvents.shift();
  }
}

/**
 * Get user analytics
 */
export function getUserAnalytics(userId: string): {
  totalEvents: number;
  eventTypes: { [key: string]: number };
  lastActive: string;
  sessionCount: number;
} {
  const userEvents = analyticsEvents.filter((e) => e.userId === userId);

  const eventTypes: { [key: string]: number } = {};
  const sessions = new Set<string>();

  for (const event of userEvents) {
    eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    sessions.add(event.sessionId);
  }

  return {
    totalEvents: userEvents.length,
    eventTypes,
    lastActive: userEvents[userEvents.length - 1]?.timestamp || 'Never',
    sessionCount: sessions.size,
  };
}

/**
 * Get global analytics
 */
export function getGlobalAnalytics(): {
  totalEvents: number;
  uniqueUsers: number;
  eventTypes: { [key: string]: number };
  last24Hours: number;
} {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  const uniqueUsers = new Set<string>();
  const eventTypes: { [key: string]: number } = {};
  let last24Hours = 0;

  for (const event of analyticsEvents) {
    uniqueUsers.add(event.userId);
    eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;

    const eventTime = new Date(event.timestamp).getTime();
    if (eventTime > last24h) {
      last24Hours++;
    }
  }

  return {
    totalEvents: analyticsEvents.length,
    uniqueUsers: uniqueUsers.size,
    eventTypes,
    last24Hours,
  };
}

// ============================================================================
// 4. A/B TESTING FRAMEWORK
// ============================================================================

interface ABTest {
  testId: string;
  name: string;
  variants: { [key: string]: number }; // variant -> percentage
  active: boolean;
  createdAt: string;
  results: { [key: string]: { conversions: number; impressions: number } };
}

const abTests: { [key: string]: ABTest } = {};

/**
 * Create A/B test
 */
export function createABTest(
  testId: string,
  name: string,
  variants: { [key: string]: number }
): ABTest {
  const test: ABTest = {
    testId,
    name,
    variants,
    active: true,
    createdAt: new Date().toISOString(),
    results: {},
  };

  for (const variant of Object.keys(variants)) {
    test.results[variant] = { conversions: 0, impressions: 0 };
  }

  abTests[testId] = test;
  return test;
}

/**
 * Get variant for user
 */
export function getABTestVariant(testId: string, userId: string): string | null {
  const test = abTests[testId];
  if (!test || !test.active) return null;

  // Deterministic variant assignment based on userId
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (hash % 100) / 100;

  let cumulative = 0;
  for (const [variant, percentage] of Object.entries(test.variants)) {
    cumulative += percentage / 100;
    if (random <= cumulative) {
      return variant;
    }
  }

  return Object.keys(test.variants)[0];
}

/**
 * Record A/B test impression
 */
export function recordABTestImpression(testId: string, variant: string): void {
  const test = abTests[testId];
  if (test && test.results[variant]) {
    test.results[variant].impressions++;
  }
}

/**
 * Record A/B test conversion
 */
export function recordABTestConversion(testId: string, variant: string): void {
  const test = abTests[testId];
  if (test && test.results[variant]) {
    test.results[variant].conversions++;
  }
}

/**
 * Get A/B test results
 */
export function getABTestResults(testId: string): ABTest | null {
  return abTests[testId] || null;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(testId: string): { [key: string]: number } {
  const test = abTests[testId];
  if (!test) return {};

  const rates: { [key: string]: number } = {};
  for (const [variant, results] of Object.entries(test.results)) {
    rates[variant] = results.impressions > 0 ? (results.conversions / results.impressions) * 100 : 0;
  }

  return rates;
}

// ============================================================================
// 5. HEALTH CHECK
// ============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    ollama: boolean;
    storage: boolean;
    errorRate: number;
    averageResponseTime: number;
  };
}

/**
 * Get system health status
 */
export function getHealthStatus(): HealthStatus {
  const stats = getPerformanceStats();
  const errorStats = getErrorStats();
  const errorRate = errorStats.total > 0 ? (errorStats.bySeverity['critical'] || 0) / errorStats.total : 0;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (stats.p99ResponseTime > 5000 || errorRate > 0.05) {
    status = 'degraded';
  }

  if (stats.p99ResponseTime > 10000 || errorRate > 0.1) {
    status = 'unhealthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: true, // Would check actual database connection
      ollama: true, // Would check actual Ollama connection
      storage: true, // Would check actual storage connection
      errorRate,
      averageResponseTime: stats.averageResponseTime,
    },
  };
}
