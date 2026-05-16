import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [delivery] = await sql`
    SELECT d.*, c.name as customer_name, c.email as customer_email,
           dp.name as delivery_person_name
    FROM deliveries d
    JOIN users c ON c.id = d.customer_id
    LEFT JOIN users dp ON dp.id = d.delivery_person_id
    WHERE d.id = ${id}
  `;
  if (!delivery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(delivery);
}
