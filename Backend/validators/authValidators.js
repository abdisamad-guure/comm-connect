const { optionalString, requiredString, validateBody, validateEmail } = require('./common');

const registerValidator = validateBody(({ name, email, password }) => {
  const errors = [
    requiredString(name, 'name', { min: 2, max: 80 }),
    validateEmail(email) ? null : 'A valid email is required',
    typeof password === 'string' && password.length >= 8 && password.length <= 128
      ? null
      : 'password must be between 8 and 128 characters',
  ];
  return errors.filter(Boolean);
});

const loginValidator = validateBody(({ email, password }) => [
  validateEmail(email) ? null : 'A valid email is required',
  typeof password === 'string' && password ? null : 'password is required',
].filter(Boolean));

const profileValidator = validateBody(({ name, email, location }) => {
  const errors = [];
  if (name !== undefined) errors.push(optionalString(name, 'name', { min: 2, max: 80 }));
  if (email !== undefined && !validateEmail(email)) errors.push('email must be valid');
  if (location !== undefined && location !== null) {
    errors.push(optionalString(location, 'location', { max: 160 }));
  }
  return errors.filter(Boolean);
});

module.exports = { registerValidator, loginValidator, profileValidator };
