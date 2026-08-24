const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = authorization.slice(7);
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'The user for this token no longer exists');
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
