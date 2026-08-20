import 'dotenv/config';
import fs from 'node:fs';
import pg from 'pg';

const { Client } = pg;
const sql = fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);

const tables = await client.query(`
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by table_name
`);

console.log('SCHEMA_OK');
console.log(tables.rows.map((r) => r.table_name).join(', '));
await client.end();
