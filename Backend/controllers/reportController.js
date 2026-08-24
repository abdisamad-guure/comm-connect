const Report = require('../models/Report');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const reporterFields = 'name profileImage location';

const listReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
  if (req.user.role === 'admin' && ['pending', 'reviewing', 'resolved', 'rejected'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', reporterFields),
    Report.countDocuments(filter),
  ]);

  res.json({ success: true, data: { reports }, meta: getPaginationMeta(page, limit, total) });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId).populate('createdBy', reporterFields);
  if (!report) throw new ApiError(404, 'Report not found');
  if (req.user.role !== 'admin' && !report.createdBy._id.equals(req.user._id)) {
    throw new ApiError(403, 'You cannot view this report');
  }

  res.json({ success: true, data: { report } });
});

const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    createdBy: req.user._id,
  });
  await report.populate('createdBy', reporterFields);
  res.status(201).json({ success: true, message: 'Report submitted', data: { report } });
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = req.body.status;
  await report.save();
  await Notification.create({
    recipient: report.createdBy,
    type: 'report',
    message: `Your report \"${report.title}\" is now ${report.status}`,
  });

  await report.populate('createdBy', reporterFields);
  res.json({ success: true, message: 'Report status updated', data: { report } });
});

module.exports = { listReports, getReport, createReport, updateReportStatus };
