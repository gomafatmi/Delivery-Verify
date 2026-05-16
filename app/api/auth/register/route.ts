import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";
import { logger } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    if (!["amazon_admin", "delivery_person", "customer"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email déjà inscrit" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${role})
    `;
    logger.info("user_registered", { email, role });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logger.error("register_failed", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
