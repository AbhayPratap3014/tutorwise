const express = require("express");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

// Note: signup/login/logout/password-reset happen client-side via the
// Supabase JS SDK (frontend/js/auth.js). This route just creates the
// app-specific profile row right after a successful signup.
router.post("/complete-registration", requireAuth, authController.completeRegistration);
router.get("/me", requireAuth, authController.getCurrentUser);

module.exports = router;
