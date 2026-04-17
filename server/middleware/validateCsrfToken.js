const validateCsrfToken = (req, res, next) => {
  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
};

module.exports = validateCsrfToken;
