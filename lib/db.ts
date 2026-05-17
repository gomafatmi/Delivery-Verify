import postgres from "postgres";

const PGSSLMODE: "require" | undefined = process.env.PGSSLMODE === "require" ? "require" : process.env.VERCEL ? "require" : undefined;

const sql = postgres({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? "delivery_verify",
  username: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
  ssl: PGSSLMODE,
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export default sql;
