// src/scripts/diag-runtime-db.ts
import pg from 'pg';

const { Client } = pg;

function mask(url?: string) {
  if (!url) return 'MISSING';
  return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}

(async () => {
  console.log('NODE_ENV=', process.env.NODE_ENV);
  console.log('DATABASE_URL=', mask(process.env.DATABASE_URL));

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const r = await client.query(`
    select
      current_database() as db,
      current_schema() as schema,
      current_user as usr,
      inet_server_addr() as host,
      inet_server_port() as port,
      to_regclass('public._pages_v_blocks_partners') as v_partners
  `);

  console.log(r.rows[0]);

  await client.end();
})();
