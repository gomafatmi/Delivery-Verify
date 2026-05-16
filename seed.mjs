import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres({
  host: "localhost",
  port: 5433,
  database: "delivery_verify",
  user: "postgres",
  password: "postgres",
});

const users = [
  { name: "Admin Amazon", email: "admin@amazon.com", password: "admin123", role: "amazon_admin" },
  { name: "Livreur Test", email: "livreur@test.com", password: "delivery123", role: "delivery_person" },
  { name: "Client Test", email: "client@test.com", password: "customer123", role: "customer" },
];

console.log("=== CRÉATION DES COMPTES DE TEST ===");

for (const u of users) {
  const existing = await sql`SELECT id FROM users WHERE email = ${u.email}`;
  if (existing.length > 0) {
    console.log(`  SKIP ${u.email} — already exists`);
    continue;
  }
  const hash = await bcrypt.hash(u.password, 12);
  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${u.name}, ${u.email}, ${hash}, ${u.role})
  `;
  console.log(`  CREATED ${u.email} (${u.role})`);
}

console.log("\n✅ Comptes de test créés :");
console.log("  admin@amazon.com / admin123     (Admin Amazon)");
console.log("  livreur@test.com / delivery123  (Livreur)");
console.log("  client@test.com / customer123   (Client)");

await sql.end();
