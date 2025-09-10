import { NextResponse } from 'next/server';
import { getClientConfig, isJwtEnabled, isDatabaseEnabled, isDevelopment } from '@/config/env';

/**
 * API route to get public configuration
 * This demonstrates how to use the config system on the server side
 */
export async function GET() {
  try {
    const publicConfig = getClientConfig();
    
    // Server-side config checks (not exposed to client)
    const serverStatus = {
      jwtEnabled: isJwtEnabled,
      databaseEnabled: isDatabaseEnabled,
      isDevelopment,
    };

    return NextResponse.json({
      config: publicConfig,
      status: serverStatus,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
