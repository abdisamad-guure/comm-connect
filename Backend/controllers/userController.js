const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const Report = require('../models/Report');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
  const filter = search
    ? {
      $or: [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { email: { $regex: escapeRegex(search), $options: 'i' } },
        { location: { $regex: escapeRegex(search), $options: 'i' } },
      ],
    }
    : {};
  const [users, total] = await Promise.all([
    User.find(filter).select('name email profileImage location role createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: { users }, meta: getPaginationMeta(page, limit, total) });
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('name profileImage location role createdAt');
  if (!user) throw new ApiError(404, 'User not found');

  res.json({ success: true, data: { user } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot remove your own administrator account');
  if (user.role === 'admin') throw new ApiError(403, 'Administrator accounts cannot be removed here');

  const authoredPostIds = await Post.find({ author: user._id }).distinct('_id');
  const removedCommentIds = await Comment.find({
    $or: [{ author: user._id }, { post: { $in: authoredPostIds } }],
  }).distinct('_id');

  await Promise.all([
    Comment.deleteMany({ $or: [{ author: user._id }, { post: { $in: authoredPostIds } }] }),
    Report.deleteMany({ createdBy: user._id }),
    Notification.deleteMany({
      $or: [
        { recipient: user._id },
        { comment: { $in: removedCommentIds } },
        { post: { $in: authoredPostIds } },
      ],
    }),
    Post.updateMany({ likes: user._id }, { $pull: { likes: user._id } }),
    Event.updateMany({ attendees: user._id }, { $pull: { attendees: user._id } }),
    Post.deleteMany({ author: user._id }),
    Event.deleteMany({ createdBy: user._id }),
    Announcement.deleteMany({ createdBy: user._id }),
  ]);

  await user.deleteOne();
  res.json({ success: true, message: 'User and related community content removed' });
});

module.exports = { listUsers, getPublicProfile, deleteUser };
