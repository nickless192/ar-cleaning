const requireAdminFlag = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.user.adminFlag) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = requireAdminFlag;
