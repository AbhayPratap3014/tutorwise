const https = require("https");

/**
 * Email service using Resend
 * Docs: https://resend.com/docs
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@tutorwise.app";

/**
 * Send email via Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<object>} Response from Resend
 */
async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set. Email skipped.");
    return { error: "RESEND_API_KEY not configured" };
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });

    const options = {
      hostname: "api.resend.com",
      port: 443,
      path: "/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Resend error: ${res.statusCode} ${parsed.message}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Send welcome email after registration
 */
async function sendWelcomeEmail(email, name) {
  const subject = "Welcome to TutorWise! 🎓";
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
      <h1 style="color: #f59e0b; margin-top: 0;">Welcome to TutorWise, ${name}! 🎓</h1>
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
        We're excited to have you on board. TutorWise helps you master any subject with AI-powered personalized tests and instant feedback.
      </p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #1f2937; margin-top: 0;">What's next?</h3>
        <ul style="color: #6b7280; line-height: 1.8;">
          <li><strong>Take your first test</strong> — Pick a subject and get started</li>
          <li><strong>View your progress</strong> — Track accuracy and improvement</li>
          <li><strong>Get AI insights</strong> — Understand your weak areas</li>
        </ul>
      </div>
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        Open TutorWise
      </a>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        Questions? Reply to this email or visit our support page.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail(email, subject, html);
    console.log(`✅ Welcome email sent to ${email}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send welcome email to ${email}:`, err.message);
    throw err;
  }
}

/**
 * Send test result notification email
 */
async function sendTestResultEmail(email, name, testName, score, subject) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
      <h1 style="color: #f59e0b; margin-top: 0;">Test Results – ${testName} 📊</h1>
      <p style="color: #6b7280; font-size: 16px;">Hi ${name},</p>
      <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">Your Score on <strong>${subject}</strong></p>
        <h2 style="color: #10b981; font-size: 48px; margin: 10px 0;">${score}%</h2>
      </div>
      <a href="${process.env.FRONTEND_URL}/pages/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        View Full Results
      </a>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        Keep practicing to improve your scores!
      </p>
    </div>
  `;

  try {
    const result = await sendEmail(email, `Test Results: ${testName}`, html);
    console.log(`✅ Test result email sent to ${email}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send test result email to ${email}:`, err.message);
    throw err;
  }
}

/**
 * Send password reset confirmation (complementary — Supabase sends main reset link)
 */
async function sendPasswordResetEmail(email, name) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
      <h1 style="color: #f59e0b; margin-top: 0;">Password Reset Request 🔐</h1>
      <p style="color: #6b7280; font-size: 16px;">Hi ${name},</p>
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
        We received a password reset request for your TutorWise account. If you didn't request this, please ignore this email.
      </p>
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; margin: 0; font-weight: 600;">Check your email for a password reset link from TutorWise.</p>
      </div>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        This email was sent because a password reset was requested. If you didn't request this, no action is needed.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail(email, "Password Reset Request – TutorWise", html);
    console.log(`✅ Password reset email sent to ${email}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send password reset email to ${email}:`, err.message);
    throw err;
  }
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTestResultEmail,
  sendPasswordResetEmail,
};
