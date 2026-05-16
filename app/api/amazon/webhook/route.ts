import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logger } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, orderId, data } = body as {
      event: string;
      orderId: string;
      data: Record<string, unknown>;
    };
    if (!event || !orderId) {
      return NextResponse.json({ error: "Missing event or orderId" }, { status: 400 });
    }
    switch (event) {
      case "delivery_assigned": {
        const deliveryPersonId = data.deliveryPersonId as string | undefined;
        if (deliveryPersonId) {
          await sql`UPDATE deliveries SET delivery_person_id = ${deliveryPersonId}, status = 'assigned', updated_at = NOW() WHERE amazon_order_id = ${orderId}`;
        }
        break;
      }
      case "delivery_status": {
        const status = data.status as string | undefined;
        if (status) {
          await sql`UPDATE deliveries SET status = ${status}, updated_at = NOW() WHERE amazon_order_id = ${orderId}`;
        }
        break;
      }
      case "dispute_opened": {
        await sql`UPDATE deliveries SET status = 'disputed', updated_at = NOW() WHERE amazon_order_id = ${orderId}`;
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
    logger.info("amazon_webhook", { event, orderId });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("amazon_webhook_failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
