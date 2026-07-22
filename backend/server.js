const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { env, assertRequiredEnv } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

assertRequiredEnv();

const app = express();

app.use(helmet());
// Allow both the configured frontend URL and tutorwise-plum.vercel.app
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.frontendUrl,
      'https://tutorwise-plum.vercel.app',
      'https://tutorwise.vercel.app',
      'http://localhost:3000' // for local development
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", env: env.nodeEnv }));

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`TutorWise API running on port ${env.port} [${env.nodeEnv}]`);
});
