import { User } from "../models/User.js";

/**
 * User Controller
 * Handles user profile operations
 */

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 * @returns {object} User profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user profile (username, avatar)
 * @access  Private
 * @body    {string} username (optional), {string} avatar (optional)
 * @returns {object} Updated user profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update fields if provided
    if (username) {
      if (username.length < 2 || username.length > 50) {
        return res.status(400).json({
          error: "Username must be between 2 and 50 characters",
        });
      }
      user.username = username.trim();
    }

    if (avatar !== undefined) {
      // Avatar can be null or a valid URL
      if (avatar && typeof avatar !== "string") {
        return res.status(400).json({
          error: "Avatar must be a string or null",
        });
      }
      user.avatar = avatar ? avatar.trim() : null;
    }

    await user.save();

    // Update session with new username if changed
    if (username) {
      req.session.user.username = user.username;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/users/password
 * @desc    Change user password
 * @access  Private
 * @body    {string} currentPassword, {string} newPassword
 * @returns {object} Confirmation message
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
