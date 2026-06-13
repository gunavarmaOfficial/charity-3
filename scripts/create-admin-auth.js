const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = env.DATABASE_URL;

if (!supabaseUrl || !supabaseAnonKey || !databaseUrl) {
  console.error('Environment variables are missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const sql = postgres(databaseUrl);

async function main() {
  const email = 'admin@sriviswacharitabletrust.com';
  const password = 'adminPassword123';
  const name = 'Trust Administrator';

  try {
    let userId = null;

    // Try logging in first
    console.log(`Checking if user '${email}' already exists in Supabase Auth via sign-in...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData && signInData.user) {
      userId = signInData.user.id;
      console.log(`User exists and logged in successfully. User ID: ${userId}`);
    } else {
      console.log(`Sign-in failed: ${signInError.message}. Attempting to sign up user...`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      userId = data.user.id;
      console.log(`Signed up successfully! User ID: ${userId}`);
    }

    if (!userId) {
      throw new Error('User ID is null or undefined');
    }

    console.log('Fetching super_admin role ID from roles table...');
    const rolesResult = await sql`
      SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1
    `;

    if (rolesResult.length === 0) {
      throw new Error("Role 'super_admin' not found in database. Did you run the seed script?");
    }

    const roleId = rolesResult[0].id;
    console.log(`Found super_admin role ID: ${roleId}`);

    console.log(`Inserting profile for user '${name}' into public.users table...`);
    await sql`
      INSERT INTO users (id, role_id, name, email, created_at)
      VALUES (${userId}, ${roleId}, ${name}, ${email}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        name = EXCLUDED.name,
        email = EXCLUDED.email
    `;

    console.log('Super Admin account created successfully in both Supabase Auth and profiles database!');
  } catch (err) {
    console.error('Failed to create Super Admin account:', err.message || err);
  } finally {
    await sql.end();
  }
}

main();
