const { env } = require("../config/env");

// 404 handler - place after all routes
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Final error handler - place last, after notFound
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || "Something went wrong on our end.",
    ...(env.nodeEnv === "development" ? { detail: err.message, stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
