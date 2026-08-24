const { optionalString, requiredString, validateBody } = require('./common');

function postFields(body, required) {
  const errors = [];
  if (required || body.title !== undefined) errors.push((required ? requiredString : optionalString)(body.title, 'title', { min: 3, max: 160 }));
  if (required || body.content !== undefined) errors.push((required ? requiredString : optionalString)(body.content, 'content', { min: 3, max: 10000 }));
  return errors.filter(Boolean);
}

function announcementFields(body, required) {
  return postFields(body, required);
}

function eventFields(body, required) {
  const errors = [];
  const validate = required ? requiredString : optionalString;
  if (required || body.title !== undefined) errors.push(validate(body.title, 'title', { min: 3, max: 160 }));
  if (required || body.description !== undefined) errors.push(validate(body.description, 'description', { min: 3, max: 5000 }));
  if (required || body.location !== undefined) errors.push(validate(body.location, 'location', { min: 2, max: 240 }));
  if (required || body.date !== undefined) {
    errors.push(body.date && !Number.isNaN(Date.parse(body.date)) ? null : 'date must be a valid date');
  }
  if (required || body.time !== undefined) {
    errors.push(typeof body.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.time) ? null : 'time must use 24-hour HH:MM format');
  }
  return errors.filter(Boolean);
}

const createPostValidator = validateBody((body) => postFields(body, true));
const updatePostValidator = validateBody((body) => postFields(body, false));
const commentValidator = validateBody(({ content, post }) => [
  requiredString(content, 'content', { min: 1, max: 2000 }),
  post ? null : 'post is required',
].filter(Boolean));
const updateCommentValidator = validateBody(({ content }) => [
  requiredString(content, 'content', { min: 1, max: 2000 }),
].filter(Boolean));
const commentVisibilityValidator = validateBody(({ hidden }) => (
  typeof hidden === 'boolean' ? [] : ['hidden must be true or false']
));
const reportValidator = validateBody(({ title, description, location }) => [
  requiredString(title, 'title', { min: 3, max: 160 }),
  requiredString(description, 'description', { min: 3, max: 5000 }),
  requiredString(location, 'location', { min: 2, max: 240 }),
].filter(Boolean));
const eventValidator = validateBody((body) => eventFields(body, true));
const updateEventValidator = validateBody((body) => eventFields(body, false));
const announcementValidator = validateBody((body) => announcementFields(body, true));
const updateAnnouncementValidator = validateBody((body) => announcementFields(body, false));
const reportStatusValidator = validateBody(({ status }) => (
  ['pending', 'reviewing', 'resolved', 'rejected'].includes(status) ? [] : ['status must be pending, reviewing, resolved, or rejected']
));

module.exports = {
  createPostValidator,
  updatePostValidator,
  commentValidator,
  updateCommentValidator,
  commentVisibilityValidator,
  reportValidator,
  eventValidator,
  updateEventValidator,
  announcementValidator,
  updateAnnouncementValidator,
  reportStatusValidator,
};
