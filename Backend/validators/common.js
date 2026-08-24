const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');

function requiredString(value, field, { min = 1, max = 10000 } = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    return `${field} is required`;
  }

  const length = value.trim().length;
  if (length < min || length > max) {
    return `${field} must be between ${min} and ${max} characters`;
  }

  return null;
}

function optionalString(value, field, { min = 1, max = 10000 } = {}) {
  if (value === undefined || value === null) return null;
  return requiredString(value, field, { min, max });
}

function validateBody(validator) {
  return (req, _res, next) => {
    const errors = validator(req.body || {});
    if (errors.length) {
      return next(new ApiError(400, 'Validation failed', errors));
    }
    next();
  };
}

function validateObjectId(parameter) {
  return (req, _res, next) => {
    if (!mongoose.isValidObjectId(req.params[parameter])) {
      return next(new ApiError(400, `Invalid ${parameter}`));
    }
    next();
  };
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

module.exports = {
  requiredString,
  optionalString,
  validateBody,
  validateObjectId,
  validateEmail,
};
