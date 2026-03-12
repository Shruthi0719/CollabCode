import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 * @returns { user }
 */
router.get("/profile", asyncHandler(getUserProfile));

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 * @body    { username, avatar }
 * @returns { user }
 */
router.patch("/profile", asyncHandler(updateUserProfile));

/**
 * @route   PATCH /api/users/password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword, newPassword }
 * @returns { message }
 */
router.patch("/password", asyncHandler(changePassword));

export default router;
