import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'eeqhqsteeobegaekynse';
const TABLES = [
  'public.used_listings',
  'public.listing_reports',
  'public.profiles',
  'public.user_preferences',
  'public.document_signatures',
  'public.suggestions',
  'private.user_roles',
];
const BACKUP_DIR = join(root, 'supabase', 'backups');

function loadLocalEnv() {
  try {
    const content = readFileSync(join(root, '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    return;
  }
}

async function runQuery(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    throw new Error(`Management API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function backupTable(table) {
  const [schema, name] = table.split('.');
  const rows = await runQuery(`select * from ${quoteIdentifier(schema)}.${quoteIdentifier(name)}`);
  return { table, rowCount: rows.length, rows };
}

async function main() {
  loadLocalEnv();
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.error('Falta SUPABASE_ACCESS_TOKEN (ponlo en .env).');
    process.exit(1);
  }

  const startedAt = new Date();
  const results = [];
  for (const table of TABLES) {
    results.push(await backupTable(table));
    console.log(`${table}: ${results[results.length - 1].rowCount} filas`);
  }

  const payload = {
    project: PROJECT_REF,
    createdAt: startedAt.toISOString(),
    tables: results,
  };
  mkdirSync(BACKUP_DIR, { recursive: true });
  const file = join(BACKUP_DIR, `backup-${startedAt.toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2));
  const total = results.reduce((sum, entry) => sum + entry.rowCount, 0);
  console.log(`Backup listo: ${file} (${total} filas en ${results.length} tablas).`);
  console.log('La restauración está documentada en supabase/README.md.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
