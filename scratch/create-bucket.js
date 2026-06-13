// Set up environment variables manually
process.env.DATABASE_URL = "postgresql://postgres.fvcxbtoiboxrlyncvjsr:xFEUx9o59eM5pauO@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fvcxbtoiboxrlyncvjsr.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XIqgPPnLRNT0nnFW70FKuw_c5YIdACz";

const { supabase } = require('../lib/supabase.ts');

async function run() {
  if (!supabase) {
    console.error("Supabase client not initialized.");
    return;
  }

  try {
    console.log("Attempting to create public bucket 'charity-assets'...");
    const { data, error } = await supabase.storage.createBucket('charity-assets', {
      public: true
    });

    if (error) {
      console.error("Failed to create bucket:", error);
    } else {
      console.log("Success! Bucket created:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
