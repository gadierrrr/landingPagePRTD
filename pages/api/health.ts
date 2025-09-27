import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

interface HealthReport {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  uptime: number;
  checks: {
    redis: HealthCheck;
    filesystem: HealthCheck;
    memory: HealthCheck;
    environment: HealthCheck;
  };
  version: string;
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  let client: ReturnType<typeof createClient> | null = null;
  
  try {
    client = createClient({
      socket: {
        host: 'localhost',
        port: 6379,
        connectTimeout: 2000
      }
    });

    await client.connect();
    await client.ping();
    await client.disconnect();
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    if (client) {
      try { await client.disconnect(); } catch {}
    }
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Redis connection failed'
    };
  }
}

async function checkFilesystem(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Check if we can read/write to critical directories
    const tempFile = path.join(process.cwd(), '.health-check-temp');
    
    await fs.promises.writeFile(tempFile, 'health-check', 'utf8');
    await fs.promises.readFile(tempFile, 'utf8');
    await fs.promises.unlink(tempFile);
    
    // Check if data directories exist and are writable
    const dataDir = process.env.NODE_ENV === 'production' ? '/var/prtd-data' : path.join(process.cwd(), 'data');
    
    if (fs.existsSync(dataDir)) {
      await fs.promises.access(dataDir, fs.constants.R_OK | fs.constants.W_OK);
    }
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Filesystem check failed'
    };
  }
}

function checkMemory(): HealthCheck {
  const start = Date.now();
  
  try {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal + usage.external;
    const usedMemory = usage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    // Consider degraded if memory usage > 85%
    const status = memoryUsagePercent > 85 ? 'degraded' : 'healthy';
    
    return {
      status,
      responseTime: Date.now() - start,
      ...(status === 'degraded' && { error: `High memory usage: ${memoryUsagePercent.toFixed(1)}%` })
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Memory check failed'
    };
  }
}

function checkEnvironment(): HealthCheck {
  const start = Date.now();
  
  try {
    const requiredEnvVars = ['NODE_ENV'];
    const optionalEnvVars = ['ADMIN_TOKEN', 'MAILCHIMP_API_KEY'];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    const warnings = optionalEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: `Missing required environment variables: ${missing.join(', ')}`
      };
    }
    
    if (warnings.length > 0) {
      return {
        status: 'degraded',
        responseTime: Date.now() - start,
        error: `Missing optional environment variables: ${warnings.join(', ')}`
      };
    }
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Environment check failed'
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const [redisCheck, filesystemCheck, memoryCheck, environmentCheck] = await Promise.all([
      checkRedis(),
      checkFilesystem(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkEnvironment())
    ]);
    
    const checks = {
      redis: redisCheck,
      filesystem: filesystemCheck,
      memory: memoryCheck,
      environment: environmentCheck
    };
    
    // Determine overall status
    const hasUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy');
    const hasDegraded = Object.values(checks).some(check => check.status === 'degraded');
    
    const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
    
    const report: HealthReport = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: process.uptime(),
      checks,
      version: process.env.npm_package_version || '0.1.0'
    };
    
    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    
    res.status(httpStatus).json(report);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Health check failed',
      version: process.env.npm_package_version || '0.1.0'
    });
  }
}
