const postgres = require('postgres');

const connectionString = "postgresql://postgres.fvcxbtoiboxrlyncvjsr:xFEUx9o59eM5pauO@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = postgres(connectionString, { max: 1 });

  try {
    console.log("Checking if charity-assets exists in storage.buckets...");
    const existing = await client`SELECT * FROM storage.buckets WHERE id = 'charity-assets'`;
    console.log("Existing buckets matching 'charity-assets':", existing);

    if (existing.length === 0) {
      console.log("Inserting charity-assets into storage.buckets...");
      const result = await client`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'charity-assets', 
          'charity-assets', 
          true, 
          5242880, 
          '{"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}'::text[]
        )
        RETURNING *
      `;
      console.log("Success! Inserted bucket details:", result);
    } else {
      console.log("Bucket already exists in database.");
    }
  } catch (error) {
    console.error("SQL operation failed:", error);
  } finally {
    await client.end();
  }
}

run();
