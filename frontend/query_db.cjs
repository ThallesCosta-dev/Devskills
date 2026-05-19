const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.zxkphvaeeugcoxzsvpzs:4POA@faeterj@aws-1-us-west-2.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM auth.users');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
