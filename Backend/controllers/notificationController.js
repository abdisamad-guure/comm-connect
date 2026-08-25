const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };
  if (req.query.read === 'true') filter.read = true;
  if (req.query.read === 'false') filter.read = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('post', 'title')
      .populate('comment', 'content hidden author post'),
    Notification.countDocuments(filter),
  ]);

  res.json({ success: true, data: { notifications }, meta: getPaginationMeta(page, limit, total) });
});



const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');

  res.json({ success: true, message: 'Notification marked as read', data: { notification } });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'Notifications marked as read', data: { updated: result.modifiedCount } });
});

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead };
