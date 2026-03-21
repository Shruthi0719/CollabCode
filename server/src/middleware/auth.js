const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

const attachUser = (req, res, next) => {
  next();
};

module.exports = { requireAuth, attachUser };