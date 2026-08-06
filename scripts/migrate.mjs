import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL est manquante. Chargez .env.local avant de lancer la migration.");
}

const sql = neon(process.env.DATABASE_URL);
const migrationsDirectory = resolve(process.cwd(), "migrations");
const files = (await readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

for (const filename of files) {
  const applied = await sql`SELECT 1 FROM schema_migrations WHERE filename = ${filename} LIMIT 1`;
  if (applied.length) {
    console.log(`Déjà appliquée: ${filename}`);
    continue;
  }

  const migration = await readFile(resolve(migrationsDirectory, filename), "utf8");
  const statements = migration
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await sql.transaction((tx) => [
    ...statements.map((statement) => tx.query(statement)),
    tx`INSERT INTO schema_migrations (filename) VALUES (${filename})`,
  ]);
  console.log(`Appliquée: ${filename}`);
}
