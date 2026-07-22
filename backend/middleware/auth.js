const { supabaseAdmin } = require("../config/supabase");
const { env } = require("../config/env");

/**
 * Verifies the Supabase access token sent as "Authorization: Bearer <token>".
 * On success, attaches { id, email } to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authentication token." });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }

    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Must run after requireAuth. Restricts the route to emails listed in
 * ADMIN_EMAILS.
 */
function requireAdmin(req, res, next) {
  if (!req.user || !env.adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
