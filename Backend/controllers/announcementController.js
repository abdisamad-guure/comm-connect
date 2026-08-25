const Announcement = require('../models/Announcement');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');



const creatorFields = 'name profileImage location';

const listAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [announcements, total] = await Promise.all([
    Announcement.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', creatorFields),
    Announcement.countDocuments(),
  ]);

  res.json({ success: true, data: { announcements }, meta: getPaginationMeta(page, limit, total) });
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.announcementId).populate('createdBy', creatorFields);
  if (!announcement) throw new ApiError(404, 'Announcement not found');

  res.json({ success: true, data: { announcement } });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    title: req.body.title,
    content: req.body.content,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdBy: req.user._id,
  });
  await announcement.populate('createdBy', creatorFields);

  res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.announcementId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');

  let changed = false;
  for (const field of ['title', 'content']) {
    if (req.body[field] !== undefined) {
      announcement[field] = req.body[field];
      changed = true;
    }
  }
  if (req.file) {
    announcement.image = `/uploads/${req.file.filename}`;
    changed = true;
  }
  if (!changed) throw new ApiError(400, 'Provide at least one announcement field to update');

  await announcement.save();
  await announcement.populate('createdBy', creatorFields);
  res.json({ success: true, message: 'Announcement updated', data: { announcement } });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.announcementId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');

  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
});

module.exports = {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
