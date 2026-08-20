import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const tables = await client.query(`
  select count(*)::int as n
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
`);
const admins = await client.query(`select count(*)::int as n from admin_users`);
console.log(`DB_OK tables=${tables.rows[0].n} admins=${admins.rows[0].n}`);
await client.end();
