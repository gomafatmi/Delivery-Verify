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
    const delivery = (await sql<{ id: string; status: string }[]>`
      SELECT id, status FROM deliveries WHERE id = ${id}
    `)[0];
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }
    if (!["pending", "assigned", "in_transit"].includes(delivery.status)) {
      return NextResponse.json({ error: "Invalid delivery status" }, { status: 400 });
    }
    await sql`UPDATE deliveries SET status = 'arrived', delivery_person_id = ${session.user.id} WHERE id = ${id}`;
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO verification_sessions (delivery_id, status) VALUES (${id}, 'in_progress') RETURNING id
    `;
    const sessionId = inserted[0]!.id;
    await sql`
      INSERT INTO verification_events (session_id, event_type, status, metadata)
      VALUES (${sessionId}, 'arrival', 'success', ${JSON.stringify({ deliveryPersonId: session.user.id })})
    `;
    logger.info("verification_session_started", { deliveryId: id, sessionId });
    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (err) {
    logger.error("verify_session_failed", { deliveryId: id, error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
