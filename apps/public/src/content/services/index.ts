import { cctvService } from './cctv';
import { itSupportService } from './it-support';
import { rfidLocksService } from './rfid-locks';
import { networkingService } from './networking';
import { webdevService } from './webdev';
import type { ServiceContent } from './types';

const services: Record<string, ServiceContent> = {
  [cctvService.slug]: cctvService,
  [itSupportService.slug]: itSupportService,
  [rfidLocksService.slug]: rfidLocksService,
  [networkingService.slug]: networkingService,
  [webdevService.slug]: webdevService,
};

export function getServiceContent(slug: string): ServiceContent | undefined {
  return services[slug];
}

export {
  cctvService,
  itSupportService,
  networkingService,
  rfidLocksService,
  webdevService,
};
export type { ServiceContent, ServiceDetail, ServiceFaq } from './types';
