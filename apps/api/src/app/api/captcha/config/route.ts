import { NextResponse } from 'next/server';

import { captchaService } from "@tecbunny/core/captcha/captcha-service";
import { logger } from "@tecbunny/core/logger";

/**
 * GET /api/captcha/config
 * Returns client-side CAPTCHA configuration
 */
export async function GET() {
  try {
    const config = captchaService.getClientConfig();
    
    return NextResponse.json(config);
  } catch (error) {
    logger.error('captcha_config_fetch_failed', { error });
    
    return NextResponse.json(
      { error: 'Failed to load CAPTCHA configuration' },
      { status: 500 }
    );
  }
}
