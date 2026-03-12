import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateSignup,
  validateLogin,
  sanitizeAuthInput,
} from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    User registration
 * @access  Public
 * @body    { email, password, username }
 * @returns { user, sessionActive }
 */
router.post(
  "/signup",
  sanitizeAuthInput,
  validateSignup,
  asyncHandler(signup)
);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 * @body    { email, password }
 * @returns { user, sessionActive }
 */
router.post(
  "/login",
  sanitizeAuthInput,
  validateLogin,
  asyncHandler(login)
);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (destroy session)
 * @access  Private
 * @returns { message }
 */
router.post("/logout", requireAuth, asyncHandler(logout));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 * @returns { user }
 */
router.get("/me", requireAuth, asyncHandler(getCurrentUser));

export default router;
