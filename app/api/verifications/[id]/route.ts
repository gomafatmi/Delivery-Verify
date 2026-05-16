import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [sessionRow] = await sql`SELECT * FROM verification_sessions WHERE id = ${id}`;
  if (!sessionRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const events = await sql`
    SELECT ve.*, e.type as evidence_type, e.file_path as evidence_file_path, e.file_hash
    FROM verification_events ve
    LEFT JOIN evidence e ON e.event_id = ve.id
    WHERE ve.session_id = ${id}
    ORDER BY ve.created_at ASC
  `;
  return NextResponse.json({ session: sessionRow, events });
}
