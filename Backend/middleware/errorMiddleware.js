const multer = require('multer');

function notFoundMiddleware(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}

function errorMiddleware(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected server error occurred';
  let details = error.details;

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session is invalid or has expired';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : message;
  }

  const payload = { success: false, message };
  if (details) payload.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) payload.stack = error.stack;

  res.status(statusCode).json(payload);
}

module.exports = { notFoundMiddleware, errorMiddleware };
