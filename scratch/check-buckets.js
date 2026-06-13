const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fvcxbtoiboxrlyncvjsr.supabase.co";
const supabaseAnonKey = "sb_publishable_XIqgPPnLRNT0nnFW70FKuw_c5YIdACz";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    console.log("Checking buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Failed to list buckets:", error);
    } else {
      console.log("Available buckets:", data);
    }
  } catch (err) {
    console.error("Error listing buckets:", err);
  }
}

check();
