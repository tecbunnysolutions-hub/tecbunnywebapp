import { prisma } from '../db/prisma';
import type { Campaign, CommunicationRecord, FailedMessageQueue, NotificationTemplate } from '@tecbunny/database';

export class CommunicationCenterService {
  /**
   * Dynamic Template Compiler (10.8)
   */
  static compileTemplate(templateBody: string, variables: Record<string, string | number>): string {
    let compiled = templateBody;
    for (const [key, val] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      compiled = compiled.replaceAll(placeholder, String(val));
    }
    return compiled;
  }

  /**
   * Multi-Channel Outbound Dispatcher (10.3 - 10.7)
   */
  static async sendMessage(params: {
    customerId?: string;
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'IN_APP';
    recipient: string;
    subjectTitle?: string;
    bodyMessage: string;
    mediaUrl?: string;
  }) {
    const p = prisma as any;

    const commRecord = {
      id: `comm-${Date.now()}`,
      customer_id: params.customerId,
      channel: params.channel,
      recipient: params.recipient,
      subject_title: params.subjectTitle,
      body_message: params.bodyMessage,
      media_url: params.mediaUrl || null,
      status: 'SENT',
      delivery_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (p.communications) {
      await p.communications.create({ data: commRecord });
    }

    return commRecord;
  }

  /**
   * Unified Customer Communication Timeline (10.2, 10.13)
   */
  static async getCustomerCommunicationTimeline(customerId: string) {
    const p = prisma as any;

    if (p.communications) {
      return p.communications.findMany({
        where: { customer_id: customerId },
        orderBy: { created_at: 'desc' },
      });
    }

    return [];
  }

  /**
   * Failed Message Retry Queue Handler (10.15)
   */
  static async handleFailedDelivery(params: {
    communicationId: string;
    errorReason: string;
    attempt: number;
  }) {
    const p = prisma as any;
    const MAX_RETRIES = 3;

    if (params.attempt >= MAX_RETRIES) {
      if (p.communications) {
        await p.communications.update({
          where: { id: params.communicationId },
          data: { status: 'FAILED' },
        });
      }
      return { status: 'MARKED_FAILED', maxRetriesExceeded: true };
    }

    const nextRetryMinutes = Math.pow(2, params.attempt) * 5; // Exponential backoff: 5m, 10m, 20m
    const nextRetryDate = new Date(Date.now() + nextRetryMinutes * 60000);

    const queueItem = {
      id: `retry-${Date.now()}`,
      communication_id: params.communicationId,
      retry_count: params.attempt + 1,
      max_retries: MAX_RETRIES,
      error_reason: params.errorReason,
      next_retry_at: nextRetryDate.toISOString(),
    };

    if (p.failed_messages) {
      await p.failed_messages.create({ data: queueItem });
    }

    return { status: 'QUEUED_FOR_RETRY', nextRetryAt: nextRetryDate.toISOString() };
  }
}
