import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const deliveryRows = await sql<{ otp_code: string; id: string; session_id: string; session_status: string }[]>`
      SELECT d.otp_code, vs.id as session_id, vs.status as session_status
      FROM deliveries d
      JOIN verification_sessions vs ON vs.delivery_id = d.id AND vs.status = 'in_progress'
      WHERE d.id = ${id}
    `;
    const delivery = deliveryRows[0];
    if (!delivery) {
      return NextResponse.json({ error: "No active verification session" }, { status: 400 });
    }
    const { otp, signature } = await req.json();

    // If OTP provided, verify it
    if (otp) {
      if (otp !== delivery.otp_code) {
        await sql`
          INSERT INTO verification_events (session_id, event_type, status, metadata)
          VALUES (${delivery.session_id}, 'otp_entry', 'failed',
            ${JSON.stringify({ enteredOtp: otp })}
          )
        `;
        logger.warn("otp_mismatch", { deliveryId: id });
        return NextResponse.json({ success: false, error: "Invalid OTP code" });
      }
      await sql`
        INSERT INTO verification_events (session_id, event_type, status, metadata)
        VALUES (${delivery.session_id}, 'otp_entry', 'success',
          ${JSON.stringify({ otpLength: otp.length })}
        )
      `;
      logger.info("otp_verified", { deliveryId: id });
      return NextResponse.json({ success: true });
    }

    // If signature provided, complete the verification
    if (signature) {
      const role = session.user.role === "delivery_person" ? "delivery" : "customer";
      const eventType = role === "customer" ? "signature_customer" : "signature_delivery";
      await sql`
        INSERT INTO verification_events (session_id, event_type, status, metadata)
        VALUES (${delivery.session_id}, ${eventType}, 'success',
          ${JSON.stringify({ signedBy: session.user.name, signatureLength: signature.length })}
        )
      `;
      // Both parties must sign
      const sigEvents = await sql<{ event_type: string }[]>`
        SELECT event_type FROM verification_events
        WHERE session_id = ${delivery.session_id}
        AND event_type IN ('signature_customer', 'signature_delivery')
        AND status = 'success'
      `;
      const signed = new Set(sigEvents.map((e) => e.event_type));
      if (signed.has("signature_customer") && signed.has("signature_delivery")) {
        await sql`
          INSERT INTO verification_events (session_id, event_type, status)
          VALUES (${delivery.session_id}, 'confirmation', 'success')
        `;
        await sql`UPDATE verification_sessions SET status = 'passed', completed_at = NOW() WHERE id = ${delivery.session_id}`;
        await sql`UPDATE deliveries SET status = 'completed', updated_at = NOW() WHERE id = ${id}`;
        logger.info("delivery_completed", { deliveryId: id, sessionId: delivery.session_id });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing otp or signature" }, { status: 400 });
  } catch (err) {
    logger.error("confirm_failed", { deliveryId: id, error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
