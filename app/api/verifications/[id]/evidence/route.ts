import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import fs from "node:fs/promises";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [evidence] = await sql`
    SELECT e.file_path, e.type, e.file_hash
    FROM evidence e
    JOIN verification_events ve ON ve.id = e.event_id
    WHERE ve.session_id = ${id}
  `;
  if (!evidence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const buffer = await fs.readFile(evidence.file_path);
    const ext = evidence.file_path.endsWith(".png") ? "png" : evidence.file_path.endsWith(".webp") ? "webp" : "jpeg";
    return new NextResponse(buffer, {
      headers: { "Content-Type": `image/${ext}` },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
