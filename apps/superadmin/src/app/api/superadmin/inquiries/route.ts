import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';

export async function GET(request: NextRequest) {
	try {
		// Authorization, permission enforcement, and audit logging are delegated to the canonical management handler.
		const { GET: getInquiries } = await import('@/app/superadmin/mgmt/inquiries/route');
		return await getInquiries(request);
	} catch (error) {
		logger.error('superadmin_inquiries_proxy_failed', { error });
		return NextResponse.json({ error: 'Failed to load inquiry pipeline' }, { status: 500 });
	}
}