const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file does not exist');
  process.exit(1);
}

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

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('DATABASE_URL is not set or placeholder is not replaced in .env');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function main() {
  try {
    console.log('Terminating other active database sessions to prevent locks...');
    try {
      await sql`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = current_database() AND pid <> pg_backend_pid()
      `;
      console.log('Other active sessions terminated.');
    } catch (connErr) {
      console.warn('Could not terminate other connections (may lack superuser, continuing):', connErr.message);
    }

    console.log('Dropping conflicting tables...');
    await sql`
      DROP TABLE IF EXISTS 
        settings, banners, gallery, causes, payment, queries, volunteers, 
        users, roles, donors, donations, donation_receipts, cause_gallery, 
        gallery_albums, events, event_registrations, blog_categories, blogs, 
        testimonials, team_members, contact_enquiries, documents, 
        razorpay_orders, razorpay_payments, razorpay_refunds, payment_webhooks, 
        audit_logs 
      CASCADE
    `;
    console.log('Conflicting tables dropped successfully!');
  } catch (error) {
    console.error('Failed to drop tables:', error);
  } finally {
    await sql.end();
  }
}

main();
