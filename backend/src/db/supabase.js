const { createClient } = require("@supabase/supabase-js");

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (err) {
    console.warn("⚠️ Warning: Failed to initialize Supabase client:", err.message);
  }
} else {
  console.log("ℹ️ Running without remote Supabase credentials (in-memory & local fallback mode)");
}

module.exports = { supabase };
