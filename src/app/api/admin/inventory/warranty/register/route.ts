import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, requireAdminContext } from "@/lib/auth/admin-guard";
import { logger } from "@/lib/logger";
import { WhatsAppService } from "@/lib/whatsapp-service";

const PayloadSchema = z.object({
  serialNumber: z.string().trim().min(1).max(128),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/),
  deviceType: z.string().trim().min(1).max(64),
});

const ADJACENT_COMPUTE_MATRIX: Record<string, string[]> = {
  IP_CAMERA: ["Surveillance-rated 2TB Storage Unit", "PoE Power Layout Switch"],
  BIOMETRIC: ["Magnetic Strike Lock", "Battery Backup UPS System"],
  DEFAULT: ["Annual Maintenance Contract (AMC)", "Surge Protection Module"],
};

export async function POST(req: Request) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const parsed = PayloadSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid warranty payload" }, { status: 400 });
    }

    const { serialNumber, phone, deviceType } = parsed.data;
    const recommendations = ADJACENT_COMPUTE_MATRIX[deviceType] || ADJACENT_COMPUTE_MATRIX.DEFAULT;

    const { error } = await supabase.from("warranties").insert({
      serial_number: serialNumber,
      phone_identifier: phone,
      device_type: deviceType,
      status: "ACTIVE_SLA",
    });

    if (error) {
      logger.error("warranty_register.insert_failed", { error: error.message });
      return NextResponse.json({ error: "Failed to register warranty" }, { status: 500 });
    }

    const message = [
      "*TECBUNNY WARRANTY ACTIVATED*",
      "",
      `Serial: ${serialNumber}`,
      `Device: ${deviceType}`,
      "Status: Active SLA",
      "",
      "*SYSTEM UPGRADE SUGGESTION:*",
      "To optimize your recent setup, we recommend integrating:",
      `1. ${recommendations[0]}`,
      `2. ${recommendations[1]}`,
      "",
      "*YOUR 48-HR UPGRADE COUPON:*",
      "Use code *UPGRADE48* for 15% off adjacent hardware.",
      "",
      "Tap to deploy: https://tecbunny.com/shop?apply=UPGRADE48",
    ].join("\n");

    const whatsappService = new WhatsAppService();
    await whatsappService.sendMessage(phone, message, "text");

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error("warranty_register.unhandled", { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
