import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		// Authorization, permission enforcement, validation, and audit logging are delegated to the canonical management handler.
		const { PATCH: patchInquiryAssignment } = await import('@/app/superadmin/mgmt/inquiries/[id]/assignment/route');
		return await patchInquiryAssignment(request, context);
	} catch (error) {
		logger.error('superadmin_inquiry_assignment_proxy_failed', { error });
		return NextResponse.json({ error: 'Failed to assign inquiry' }, { status: 500 });
	}
}