const Event = require('../models/Event');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const creatorFields = 'name profileImage location';
const attendeeFields = 'name profileImage location';



function eventPayload(body) {
  const { title, description, date, time, location } = body;
  return { title, description, date, time, location };
}

const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.query.upcoming === 'true' ? { date: { $gte: new Date() } } : {};
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ date: 1, time: 1 }).skip(skip).limit(limit).populate('createdBy', creatorFields),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, data: { events }, meta: getPaginationMeta(page, limit, total) });
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId)
    .populate('createdBy', creatorFields)
    .populate('attendees', attendeeFields);
  if (!event) throw new ApiError(404, 'Event not found');

  res.json({ success: true, data: { event } });
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...eventPayload(req.body),
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdBy: req.user._id,
  });
  await event.populate('createdBy', creatorFields);

  res.status(201).json({ success: true, message: 'Event created', data: { event } });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  let changed = false;
  for (const field of ['title', 'description', 'date', 'time', 'location']) {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
      changed = true;
    }
  }
  if (req.file) {
    event.image = `/uploads/${req.file.filename}`;
    changed = true;
  }
  if (!changed) throw new ApiError(400, 'Provide at least one event field to update');

  await event.save();
  await event.populate('createdBy', creatorFields);
  res.json({ success: true, message: 'Event updated', data: { event } });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

const joinEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.eventId, attendees: { $ne: req.user._id } },
    { $addToSet: { attendees: req.user._id } },
    { new: true }
  );
  if (!event) {
    const exists = await Event.exists({ _id: req.params.eventId });
    throw new ApiError(exists ? 409 : 404, exists ? 'You have already joined this event' : 'Event not found');
  }

  res.json({
    success: true,
    message: 'You joined the event',
    data: { eventId: event._id, attendeesCount: event.attendees.length },
  });
});

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, joinEvent };
