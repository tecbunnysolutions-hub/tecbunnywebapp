import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMedia } from '@/services/infobipService';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import crypto from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const mediaMessageSchema = z.object({
  to: z.string().min(6),
  type: z.enum(['image', 'video', 'audio', 'document']),
});

export async function POST(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const parsed = mediaMessageSchema.safeParse({
      to: formData.get('to'),
      type: formData.get('type'),
    });

    if (!file || !parsed.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { to, type } = parsed.data;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure bucket exists
    await supabase.storage.createBucket('whatsapp_media', { public: true }).catch(() => {});

    // Generate unique filename preserving extension
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `outbound_${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('whatsapp_media')
      .upload(fileName, buffer, { 
        contentType: file.type, 
        upsert: true 
      });

    if (uploadError) {
      throw new Error(`Supabase Upload Error: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('whatsapp_media').getPublicUrl(fileName);
    const mediaUrl = data.publicUrl;

    // Dispatch to Infobip
    const response = await sendWhatsAppMedia(to, type, mediaUrl);

    if (response?.success) {
      return NextResponse.json({ success: true, mediaUrl });
    } else {
      return NextResponse.json({ error: 'Failed to send media to Infobip', details: response?.error }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
