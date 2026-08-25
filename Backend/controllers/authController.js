const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const createToken = require('../utils/token');

function sendAuthenticationResponse(res, user, statusCode, message) {
  const token = createToken(user._id);
  res.status(statusCode).json({ success: true, message, data: { user, token } });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  sendAuthenticationResponse(res, user, 201, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  sendAuthenticationResponse(res, user, 200, 'Login successful');
});

const logout = asyncHandler(async (_req, res) => {
  // JWTs are stateless. The client must remove its token; short expirations limit exposure.
  res.json({ success: true, message: 'Logout successful. Remove the token from the client.' });
});


const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ['name', 'email', 'location']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;

  if (!Object.keys(updates).length) {
    throw new ApiError(400, 'Provide at least one profile field to update');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: 'Profile updated', data: { user } });
});

module.exports = { register, login, logout, getCurrentUser, updateProfile };
