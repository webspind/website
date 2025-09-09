export interface AppConfig {
  siteName: string;
  timezone: string;
  paymentsEnabled: boolean;
  jwtSecret?: string;
  tokensEnabled: boolean;
  databaseUrl: string;
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret && process.env.NODE_ENV !== 'production') {
  console.warn(
    'JWT_SECRET is not set. Token creation will be disabled.'
  );
}

export const config: AppConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Webspind',
  timezone: process.env.NEXT_PUBLIC_TIMEZONE ?? 'Europe/Copenhagen',
  paymentsEnabled:
    process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
  jwtSecret,
  tokensEnabled: Boolean(jwtSecret),
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://user:pass@localhost:5432/webspind',
};
