/**
 * Input Validation Middleware
 * Validates request body fields before passing to controllers
 */

/**
 * Validate signup request
 * Checks: email (valid email format), password (min 6 chars), username (2-50 chars)
 */
export const validateSignup = (req, res, next) => {
  const errors = {};
  const { email, password, username } = req.body;

  // Email validation
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.email = "Please provide a valid email";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Username validation
  if (!username) {
    errors.username = "Username is required";
  } else if (username.length < 2) {
    errors.username = "Username must be at least 2 characters";
  } else if (username.length > 50) {
    errors.username = "Username must not exceed 50 characters";
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Validate login request
 * Checks: email (required), password (required)
 */
export const validateLogin = (req, res, next) => {
  const errors = {};
  const { email, password } = req.body;

  // Email validation
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.email = "Please provide a valid email";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Sanitize common fields
 * Trims whitespace from input
 */
export const sanitizeAuthInput = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.username) {
    req.body.username = req.body.username.trim();
  }
  next();
};

/**
 * Validate create room request
 * Checks: title (required, 1-100 chars), language (optional, must be valid)
 */
export const validateCreateRoom = (req, res, next) => {
  const errors = {};
  const { title, language } = req.body;

  const validLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "csharp",
    "go",
    "rust",
    "php",
    "ruby",
    "sql",
    "html",
    "css",
    "json",
    "markdown",
  ];

  // Title validation
  if (!title) {
    errors.title = "Room title is required";
  } else if (title.length < 1) {
    errors.title = "Title must be at least 1 character";
  } else if (title.length > 100) {
    errors.title = "Title must not exceed 100 characters";
  }

  // Language validation (optional)
  if (language && !validLanguages.includes(language)) {
    errors.language = `Invalid language. Valid options: ${validLanguages.join(", ")}`;
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Validate update room request
 * Checks: title (optional but must be valid), language (optional but must be valid)
 */
export const validateUpdateRoom = (req, res, next) => {
  const errors = {};
  const { title, language } = req.body;

  const validLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "csharp",
    "go",
    "rust",
    "php",
    "ruby",
    "sql",
    "html",
    "css",
    "json",
    "markdown",
  ];

  // Title validation (if provided)
  if (title !== undefined) {
    if (typeof title !== "string") {
      errors.title = "Title must be a string";
    } else if (title.length < 1) {
      errors.title = "Title must be at least 1 character";
    } else if (title.length > 100) {
      errors.title = "Title must not exceed 100 characters";
    }
  }

  // Language validation (if provided)
  if (language && !validLanguages.includes(language)) {
    errors.language = `Invalid language. Valid options: ${validLanguages.join(", ")}`;
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

/**
 * Sanitize room input
 * Trims whitespace from text fields
 */
export const sanitizeRoomInput = (req, res, next) => {
  if (req.body.title) {
    req.body.title = req.body.title.trim();
  }
  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  if (req.body.language) {
    req.body.language = req.body.language.toLowerCase().trim();
  }
  next();
};
