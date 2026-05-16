import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`
    SELECT d.*, u.name as customer_name
    FROM deliveries d JOIN users u ON u.id = d.customer_id
    ORDER BY d.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "amazon_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { amazonOrderId, customerId, productDescription, productValue, deliveryAddress, deliveryLat, deliveryLng } = body;
    if (!amazonOrderId || !customerId || !productValue || !deliveryAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO deliveries (amazon_order_id, customer_id, product_description, product_value, delivery_address, delivery_lat, delivery_lng, otp_code, status)
      VALUES (${amazonOrderId}, ${customerId}, ${productDescription ?? null}, ${productValue}, ${deliveryAddress}, ${deliveryLat ?? null}, ${deliveryLng ?? null}, ${otp}, 'pending')
      RETURNING id
    `;
    const id = inserted[0]!.id;
    logger.info("delivery_created", { deliveryId: id, amazonOrderId });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    logger.error("delivery_create_failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
