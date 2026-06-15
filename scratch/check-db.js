const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const sql = postgres(env.DATABASE_URL);

async function check() {
  try {
    const banners = await sql`SELECT * FROM banners`;
    console.log('BANNERS:', banners);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
