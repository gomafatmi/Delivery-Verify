import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { isWithinRadius } from "@/lib/gps";
import { logger } from "@/lib/audit";

const RADIUS_METERS = 50;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const { deliveryLat, deliveryLng, customerLat, customerLng } = await req.json();
    if (!deliveryLat || !deliveryLng || !customerLat || !customerLng) {
      return NextResponse.json({ error: "Missing GPS coordinates" }, { status: 400 });
    }
    const delivery = (await sql<{ delivery_lat: string; delivery_lng: string; session_id: string }[]>`
      SELECT d.delivery_lat, d.delivery_lng, vs.id as session_id
      FROM deliveries d
      JOIN verification_sessions vs ON vs.delivery_id = d.id AND vs.status = 'in_progress'
      WHERE d.id = ${id}
    `)[0];
    if (!delivery) {
      return NextResponse.json({ error: "No active verification session" }, { status: 400 });
    }
    const expectedLat = Number(delivery.delivery_lat ?? deliveryLat);
    const expectedLng = Number(delivery.delivery_lng ?? deliveryLng);
    const withinRange = isWithinRadius(
      deliveryLat, deliveryLng,
      customerLat, customerLng,
      RADIUS_METERS
    );
    const eventStatus = withinRange ? "success" : "failed";
    const eventId = crypto.randomUUID();
    await sql`
      INSERT INTO verification_events (id, session_id, event_type, status, metadata)
      VALUES (${eventId}, ${delivery.session_id}, 'gps_check', ${eventStatus},
        ${JSON.stringify({
          deliveryGps: { lat: deliveryLat, lng: deliveryLng },
          customerGps: { lat: customerLat, lng: customerLng },
          radiusMeters: RADIUS_METERS,
        })}
      )
    `;
    logger.info("gps_check", { deliveryId: id, withinRange });
    if (!withinRange) {
      await sql`UPDATE verification_sessions SET status = 'failed' WHERE id = ${delivery.session_id}`;
      await sql`UPDATE deliveries SET status = 'failed' WHERE id = ${id}`;
      return NextResponse.json({ success: false, error: "Location not within delivery radius" });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("gps_check_failed", { deliveryId: id, error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
