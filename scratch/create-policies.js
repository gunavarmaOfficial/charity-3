const postgres = require('postgres');

const connectionString = "postgresql://postgres.fvcxbtoiboxrlyncvjsr:xFEUx9o59eM5pauO@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = postgres(connectionString, { max: 1 });

  try {
    console.log("Checking existing storage.objects policies...");
    const existing = await client`
      SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    `;
    console.log("Existing policies on storage.objects:", existing.map(p => p.policyname));

    // Define policies to create
    const policies = [
      {
        name: "Allow authenticated upload to charity-assets",
        sql: `
          CREATE POLICY "Allow authenticated upload to charity-assets" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (bucket_id = 'charity-assets')
        `
      },
      {
        name: "Allow public read from charity-assets",
        sql: `
          CREATE POLICY "Allow public read from charity-assets" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = 'charity-assets')
        `
      },
      {
        name: "Allow authenticated delete from charity-assets",
        sql: `
          CREATE POLICY "Allow authenticated delete from charity-assets" ON storage.objects
            FOR DELETE TO authenticated
            USING (bucket_id = 'charity-assets')
        `
      }
    ];

    for (const policy of policies) {
      if (!existing.some(p => p.policyname === policy.name)) {
        console.log(`Creating policy: ${policy.name}...`);
        await client.unsafe(policy.sql);
        console.log(`Created policy: ${policy.name}`);
      } else {
        console.log(`Policy already exists: ${policy.name}`);
      }
    }
  } catch (error) {
    console.error("Failed to check/create policies:", error);
  } finally {
    await client.end();
  }
}

run();
