// server/src/middleware/errorHandler.js

/**
 * Global Express error handler.
 * Maps Prisma error codes to meaningful HTTP responses.
 */
export function errorHandler(err, req, res, next) {
  console.error('[IronLog Error]', err.message || err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Already exists' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Validation errors from shared
  if (err.status === 400) {
    return res.status(400).json({ error: err.message, errors: err.errors });
  }

  // Default
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}
