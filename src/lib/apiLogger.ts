/**
 * Simple API request/response logger for monitoring endpoint performance
 * Used during optimization to track API endpoint usage and performance
 */

interface LogEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  duration?: number;
  status?: number;
  ip?: string;
  userAgent?: string;
  error?: string;
}

class ApiLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 entries in memory

  /**
   * Log API request start
   */
  logRequest(endpoint: string, method: string, ip?: string, userAgent?: string): string {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      ip,
      userAgent
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${method} ${endpoint}`, { ip, userAgent });
    }

    this.addLog(entry);
    return requestId;
  }

  /**
   * Log API request completion
   */
  logResponse(endpoint: string, method: string, status: number, duration: number, error?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      status,
      duration,
      error
    };

    // Log to console in development or if error
    if (process.env.NODE_ENV === 'development' || error) {
      const level = error ? 'ERROR' : 'INFO';
      console.log(`[API ${level}] ${method} ${endpoint} - ${status} (${duration}ms)`, error ? { error } : {});
    }

    this.addLog(entry);
  }

  /**
   * Add log entry and maintain max size
   */
  private addLog(entry: LogEntry) {
    this.logs.push(entry);

    // Trim logs if exceeded max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Get recent logs for specific endpoint
   */
  getEndpointLogs(endpoint: string, limit = 100): LogEntry[] {
    return this.logs
      .filter(log => log.endpoint === endpoint)
      .slice(-limit);
  }

  /**
   * Get performance stats for endpoint
   */
  getEndpointStats(endpoint: string): {
    totalRequests: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    errorCount: number;
    statusCodes: Record<number, number>;
  } {
    const logs = this.logs.filter(log =>
      log.endpoint === endpoint &&
      log.duration !== undefined &&
      log.status !== undefined
    );

    if (logs.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorCount: 0,
        statusCodes: {}
      };
    }

    const durations = logs.map(l => l.duration!);
    const statusCodes: Record<number, number> = {};
    let errorCount = 0;

    logs.forEach(log => {
      if (log.status! >= 400) errorCount++;
      statusCodes[log.status!] = (statusCodes[log.status!] || 0) + 1;
    });

    return {
      totalRequests: logs.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      errorCount,
      statusCodes
    };
  }

  /**
   * Get all logs (for debugging)
   */
  getAllLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }
}

// Singleton instance
export const apiLogger = new ApiLogger();

/**
 * Helper middleware to measure API handler duration
 */
export function measureDuration<T>(
  fn: () => T | Promise<T>,
  onComplete: (duration: number) => void
): Promise<T> {
  const start = Date.now();

  const complete = () => {
    const duration = Date.now() - start;
    onComplete(duration);
  };

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.then(
        (value) => {
          complete();
          return value;
        },
        (error) => {
          complete();
          throw error;
        }
      );
    } else {
      complete();
      return Promise.resolve(result);
    }
  } catch (error) {
    complete();
    throw error;
  }
}
