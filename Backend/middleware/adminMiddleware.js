const ApiError = require('../utils/apiError');


function adminMiddleware(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Administrator access is required'));
  }

  next();
}

module.exports = adminMiddleware;
