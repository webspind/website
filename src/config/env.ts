/**
 * Environment configuration for Webspind
 * 
 * This module provides a centralized, typed configuration system
 * that reads environment variables and provides sensible defaults.
 */

// Public environment variables (exposed to the browser)
export interface PublicConfig {
  siteName: string;
  timezone: string;
  paymentsEnabled: boolean;
}

// Server-only environment variables (not exposed to the browser)
export interface ServerConfig {
  jwtSecret: string | null;
  databaseUrl: string | null;
  nodeEnv: string;
}

// Combined configuration
export interface Config {
  public: PublicConfig;
  server: ServerConfig;
}

/**
 * Validates and parses environment variables
 */
function parseEnvVar<T>(
  value: string | undefined,
  parser: (val: string) => T,
  defaultValue: T,
  required = false
): T {
  if (!value) {
    if (required) {
      throw new Error(`Required environment variable is missing`);
    }
    return defaultValue;
  }
  
  try {
    return parser(value);
  } catch (error) {
    if (required) {
      throw new Error(`Invalid environment variable: ${error}`);
    }
    return defaultValue;
  }
}

/**
 * Parse boolean environment variables
 */
function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

/**
 * Get public configuration (safe to expose to browser)
 */
function getPublicConfig(): PublicConfig {
  return {
    siteName: parseEnvVar(
      process.env.NEXT_PUBLIC_SITE_NAME,
      (val) => val,
      'Webspind'
    ),
    timezone: parseEnvVar(
      process.env.NEXT_PUBLIC_TIMEZONE,
      (val) => val,
      'Europe/Copenhagen'
    ),
    paymentsEnabled: parseEnvVar(
      process.env.NEXT_PUBLIC_PAYMENTS_ENABLED,
      parseBoolean,
      false
    ),
  };
}

/**
 * Get server-only configuration (not exposed to browser)
 */
function getServerConfig(): ServerConfig {
  const jwtSecret = process.env.JWT_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Development warnings for missing secrets
  if (nodeEnv === 'development') {
    if (!jwtSecret || jwtSecret === 'dev-only-secret-change-me') {
      console.warn('⚠️  JWT_SECRET is not set or using default value. Token creation will be disabled.');
      console.warn('   Set JWT_SECRET in .env.local for full functionality.');
    }
    
    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL is not set. Database features will be disabled.');
      console.warn('   Set DATABASE_URL in .env.local to enable database functionality.');
    }
  }

  return {
    jwtSecret: jwtSecret || null,
    databaseUrl: databaseUrl || null,
    nodeEnv,
  };
}

/**
 * Main configuration object
 */
export const config: Config = {
  public: getPublicConfig(),
  server: getServerConfig(),
};

/**
 * Helper functions for common config checks
 */
export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
export const isJwtEnabled = !!config.server.jwtSecret;
export const isDatabaseEnabled = !!config.server.databaseUrl;

/**
 * Get a safe subset of config for client-side use
 */
export function getClientConfig(): PublicConfig {
  return config.public;
}

// Export individual configs for convenience
export const publicConfig = config.public;
export const serverConfig = config.server;
