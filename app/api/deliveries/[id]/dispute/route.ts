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
    const { reason } = await req.json();
    if (!reason) {
      return NextResponse.json({ error: "Missing reason" }, { status: 400 });
    }
    await sql`UPDATE deliveries SET status = 'disputed', updated_at = NOW() WHERE id = ${id}`;
    logger.warn("dispute_opened", { deliveryId: id, reason, customerId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("dispute_failed", { deliveryId: id, error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
