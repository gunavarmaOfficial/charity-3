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
if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function main() {
  const email = 'admin@sriviswacharitabletrust.com';
  const password = 'adminPassword123';
  const name = 'Trust Administrator';

  try {
    console.log('Inserting admin account directly into the database auth schema...');
    
    await sql.begin(async (sql) => {
      // 1. Generate UUID
      const [uuidResult] = await sql`SELECT gen_random_uuid() as id`;
      const userId = uuidResult.id;
      console.log(`Generated user ID: ${userId}`);

      // 2. Fetch super_admin role ID
      const [roleResult] = await sql`SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1`;
      if (!roleResult) {
        throw new Error("super_admin role not found. Run the seed script first.");
      }
      const roleId = roleResult.id;

      // 3. Insert into auth.users
      console.log('Inserting into auth.users...');
      await sql`
        INSERT INTO auth.users (
          id, aud, role, email, encrypted_password, email_confirmed_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_anonymous
        ) VALUES (
          ${userId}, 'authenticated', 'authenticated', ${email}, 
          crypt(${password}, gen_salt('bf', 10)), NOW(),
          '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), false
        )
      `;

      // Get user ID of existing/inserted user to make sure we map correctly
      const [userResult] = await sql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`;
      const finalUserId = userResult.id;

      // 4. Insert into auth.identities
      console.log('Inserting into auth.identities...');
      const identityData = JSON.stringify({ sub: finalUserId, email: email });
      await sql`
        INSERT INTO auth.identities (
          id, user_id, provider_id, provider, identity_data, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${finalUserId}, ${email}, 'email',
          ${identityData}::jsonb, NOW(), NOW()
        )
        ON CONFLICT (provider, provider_id) DO NOTHING
      `;

      // 5. Insert into public.users
      console.log('Inserting into public.users profile...');
      await sql`
        INSERT INTO public.users (id, role_id, name, email, created_at)
        VALUES (${finalUserId}, ${roleId}, ${name}, ${email}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          role_id = EXCLUDED.role_id,
          name = EXCLUDED.name,
          email = EXCLUDED.email
      `;
    });

    console.log('Super Admin account created successfully directly in the database!');
  } catch (err) {
    console.error('Failed to create Super Admin account:', err.message || err);
  } finally {
    await sql.end();
  }
}

main();
