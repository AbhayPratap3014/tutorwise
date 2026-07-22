const { createClient } = require("@supabase/supabase-js");
const { env } = require("./env");

// Service-role client: used ONLY on the backend. It bypasses Row Level
// Security, so every query built on top of it must manually scope
// results to the authenticated user (see middleware/auth.js).
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin };
