import postgres from "postgres";

const sql = postgres({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? "delivery_verify",
  username: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export default sql;
