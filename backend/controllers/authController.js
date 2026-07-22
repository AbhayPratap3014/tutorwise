const { supabaseAdmin } = require("../config/supabase");
const supabaseService = require("../services/supabaseService");
const emailService = require("../services/emailService");

// Supabase Auth itself handles signup/login/password reset from the
// frontend via the JS client (see frontend/js/auth.js). This endpoint
// runs right after signup to create the matching row in `profiles`,
// since that table holds app-specific fields Supabase Auth doesn't.
async function completeRegistration(req, res, next) {
  try {
    const { name, classNum } = req.body;
    if (!name || !classNum) {
      const err = new Error("Name and class are required.");
      err.status = 400;
      err.publicMessage = err.message;
      throw err;
    }

    const profile = await supabaseService.upsertProfile(req.user.id, {
      email: req.user.email,
      name,
      class_num: classNum,
      avatar_url: null,
    });

    // Send welcome email (async — don't block response)
    emailService.sendWelcomeEmail(req.user.email, name).catch(err => {
      console.error("Welcome email failed (non-fatal):", err.message);
    });

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const profile = await supabaseService.getProfile(req.user.id);
    res.json({ user: req.user, profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { completeRegistration, getCurrentUser };
