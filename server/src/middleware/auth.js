/**
 * Authentication middleware
 * Checks if user is logged in (session exists)
 */

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "You must be logged in to access this resource",
    });
  }

  // Attach user to request for downstream handlers
  req.user = req.session.user;
  next();
};

/**
 * Optional: Log current user info to request
 * Doesn't block unauthenticated requests
 */
export const attachUser = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
};
