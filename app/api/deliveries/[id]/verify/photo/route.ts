import crypto from "node:crypto";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { savePhoto } from "@/lib/photo";
import { logger } from "@/lib/audit";
import { analyzePhoto, isCompliant } from "@/lib/ai-vision";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const delivery = (await sql<{ session_id: string }[]>`
      SELECT vs.id as session_id
      FROM deliveries d
      JOIN verification_sessions vs ON vs.delivery_id = d.id AND vs.status = 'in_progress'
      WHERE d.id = ${id}
    `)[0];
    if (!delivery) {
      return NextResponse.json({ error: "No active verification session" }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get("photo") as File | null;
    const role = form.get("role") as string | null;
    if (!file || !role) {
      return NextResponse.json({ error: "Missing photo or role" }, { status: 400 });
    }
    if (!["customer", "delivery"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { filePath, fileHash } = await savePhoto(buffer, file.type, id, `photo_${role}`);
    const eventType = role === "customer" ? "photo_customer" : "photo_delivery";
    const eventId = crypto.randomUUID();
    await sql`
      INSERT INTO verification_events (id, session_id, event_type, status, metadata)
      VALUES (${eventId}, ${delivery.session_id}, ${eventType}, 'success',
        ${JSON.stringify({ filePath, fileHash })}
      )
    `;
    await sql`
      INSERT INTO evidence (event_id, type, file_path, file_hash, captured_at)
      VALUES (${eventId}, 'photo', ${filePath}, ${fileHash}, NOW())
    `;
    logger.info("photo_uploaded", { deliveryId: id, role, fileHash });

    let aiWarnings: string[] = [];
    try {
      const aiResult = await analyzePhoto(buffer, file.type, role);
      const aiEventId = crypto.randomUUID();
      const aiCompliant = isCompliant(aiResult);
      aiWarnings = aiResult.summary.warnings;
      await sql`
        INSERT INTO verification_events (id, session_id, event_type, status, metadata)
        VALUES (${aiEventId}, ${delivery.session_id}, 'ai_vision_check',
          ${aiCompliant ? 'success' : 'failed'},
          ${JSON.stringify({
            provider: "mock",
            role,
            privacy: aiResult.privacy,
            packageDetection: aiResult.packageDetection,
            authenticity: aiResult.authenticity,
            summary: aiResult.summary,
          })}
        )
      `;
      await sql`
        INSERT INTO evidence (event_id, type, file_path, file_hash, captured_at)
        VALUES (${aiEventId}, 'screenshot', ${filePath}, ${fileHash}, NOW())
      `;
      logger.info("ai_vision_check", { deliveryId: id, role, compliant: aiCompliant });
    } catch (aiErr) {
      logger.warn("ai_vision_skipped", { deliveryId: id, error: String(aiErr) });
    }

    return NextResponse.json({ success: true, aiWarnings });
  } catch (err) {
    logger.error("photo_upload_failed", { deliveryId: id, error: String(err) });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
