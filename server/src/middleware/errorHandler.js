/**
 * Centralized error handler for Express
 * Should be registered as the LAST middleware in server.js
 */

export const errorHandler = (err, req, res, next) => {
  // Default values
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error
  console.error("[error]", {
    status,
    message,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  // Handle common error types
  if (err.name === "CastError") {
    // MongoDB invalid ID format
    status = 400;
    message = "Invalid ID format";
  }

  if (err.name === "ValidationError") {
    // Mongoose validation error
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    status = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Send response
  res.status(status).json({
    error: message,
    status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
