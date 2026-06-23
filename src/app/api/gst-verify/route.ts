import { NextRequest, NextResponse } from 'next/server';
import { resolveIndianStateInfo } from '@/lib/indian-tax';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const GST_VERIFY_RATE_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gstin = searchParams.get('gstin');
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'anonymous';

  if (!rateLimit(ip, 'gst_verify', GST_VERIFY_RATE_LIMIT)) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  if (!gstin || gstin.length !== 15) {
    return NextResponse.json({ success: false, error: 'Invalid GSTIN length' }, { status: 400 });
  }

  // Validate format
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(gstin.toUpperCase())) {
    return NextResponse.json({ success: false, error: 'Invalid GSTIN format' }, { status: 400 });
  }

  const stateCode = gstin.substring(0, 2);
  const stateInfo = resolveIndianStateInfo(stateCode);

  const nicClientId = process.env.NIC_GST_CLIENT_ID;
  const nicClientSecret = process.env.NIC_GST_CLIENT_SECRET;
  const nicAuthToken = process.env.NIC_GST_AUTH_TOKEN;
  const nicUserName = process.env.NIC_GST_USER_NAME;

  if (nicClientId && nicClientSecret && nicAuthToken && nicUserName) {
    try {
      const response = await fetch(`https://einv-apisandbox.nic.in/eivital/v1.03/Master/gstin/${gstin.toUpperCase()}`, {
        method: 'GET',
        headers: {
          'client_id': nicClientId,
          'client_secret': nicClientSecret,
          'Gstin': gstin.toUpperCase(),
          'user_name': nicUserName,
          'AuthToken': nicAuthToken,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data && data.Status === '1' && data.Data) {
        // Parse the embedded JSON string inside Data
        const gstData = typeof data.Data === 'string' ? JSON.parse(data.Data) : data.Data;
        
        return NextResponse.json({
          success: true,
          data: {
            businessName: gstData.TradeName || gstData.LegalName || '',
            address: [gstData.AddrBno, gstData.AddrFlno, gstData.AddrBnm, gstData.AddrSt, gstData.AddrLoc].filter(Boolean).join(', '),
            city: gstData.AddrLoc || '',
            state: stateInfo?.name || gstData.StateCode?.toString() || '',
            pincode: gstData.AddrPncd?.toString() || ''
          }
        });
      } else {
        logger.warn('gst_verify.nic_error', { status: response.status, data });
      }
    } catch (error) {
      logger.warn('gst_verify.nic_fetch_failed', { error: error instanceof Error ? error.message : error });
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'GST verification is temporarily unavailable.' },
      { status: 503 }
    );
  }

  // Local development fallback if API credentials are not set or API fails.
  return NextResponse.json({
    success: true,
    data: {
      businessName: 'Registered Business Name (API Required)',
      address: 'Registered GST Address Details',
      city: 'Default City',
      state: stateInfo?.name || '',
      pincode: '000000'
    }
  });
}
