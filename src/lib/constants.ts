import { getAppSettings } from './config-db';

export async function getSupportPhone(): Promise<string> {
  const settings = await getAppSettings();
  return settings.NEXT_PUBLIC_SUPPORT_PHONE || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 96041 36010";
}

export async function getGstRateFallback(): Promise<number> {
  const settings = await getAppSettings();
  if (settings.GST_RATE) return Number(settings.GST_RATE);
  return process.env.NEXT_PUBLIC_GST_RATE ? parseFloat(process.env.NEXT_PUBLIC_GST_RATE) : 0.18;
}
