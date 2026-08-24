export function formatDate(value, options = { dateStyle: 'medium' }) {
  return value ? new Intl.DateTimeFormat(undefined, options).format(new Date(value)) : 'Not set';
}

export function formatEventDate(value, time) {
  const date = formatDate(value, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return time ? `${date} · ${time}` : date;
}

export function getErrorMessage(error) {
  if (Array.isArray(error?.details)) return error.details.join('. ');
  return error?.message || 'Something went wrong. Please try again.';
}

export function isOwner(resource, user) {
  if (!resource || !user) return false;
  const owner = resource.author || resource.createdBy;
  const ownerId = typeof owner === 'object' ? owner?._id : owner;
  return ownerId === user._id;
}
