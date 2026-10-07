import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'eeqhqsteeobegaekynse';

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

function extractError(text) {
  try {
    const parsed = JSON.parse(text);
    return String(parsed.message || text).replace('Failed to run sql query: ', '').replace(/\s+/g, ' ').trim();
  } catch {
    return String(text).replace(/\s+/g, ' ').trim();
  }
}

async function main() {
  loadLocalEnv();

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('Falta SUPABASE_ACCESS_TOKEN (esperado en .env).');
    process.exit(1);
  }

  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/apply-migration.mjs supabase/migrations/ARCHIVO.sql');
    process.exit(1);
  }

  const sql = readFileSync(resolve(root, file), 'utf8');

  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Error al aplicar ${file}: ${extractError(text)}`);
    process.exit(1);
  }

  console.log(`Migración aplicada: ${file}`);
  if (text && text.trim() && text.trim() !== '[]') console.log(text.trim());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
