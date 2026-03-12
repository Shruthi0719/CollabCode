import express from "express";
import {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  getRoomMessages,
} from "../controllers/roomController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateCreateRoom,
  validateUpdateRoom,
  sanitizeRoomInput,
} from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms or user's rooms
 * @access  Private
 * @query   {boolean} mine - Get only user's rooms
 * @returns { count, rooms }
 */
router.get("/", asyncHandler(getRooms));

/**
 * @route   POST /api/rooms
 * @desc    Create new coding room
 * @access  Private
 * @body    { title, language, description }
 * @returns { room }
 */
router.post(
  "/",
  sanitizeRoomInput,
  validateCreateRoom,
  asyncHandler(createRoom)
);

/**
 * @route   GET /api/rooms/:id
 * @desc    Get specific room with code and messages
 * @access  Private
 * @returns { room, messages, isCreator, isMember }
 */
router.get("/:id", asyncHandler(getRoom));

/**
 * @route   GET /api/rooms/:id/messages
 * @desc    Get paginated messages for a room
 * @access  Private
 * @query   { limit, page }
 * @returns { messages, pagination }
 */
router.get("/:id/messages", asyncHandler(getRoomMessages));

/**
 * @route   PATCH /api/rooms/:id
 * @desc    Update room details (creator only)
 * @access  Private
 * @body    { title, description, language }
 * @returns { room }
 */
router.patch(
  "/:id",
  sanitizeRoomInput,
  validateUpdateRoom,
  asyncHandler(updateRoom)
);

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room (creator only)
 * @access  Private
 * @returns { message }
 */
router.delete("/:id", asyncHandler(deleteRoom));

/**
 * @route   POST /api/rooms/:id/join
 * @desc    Join an existing room
 * @access  Private
 * @returns { room }
 */
router.post("/:id/join", asyncHandler(joinRoom));

/**
 * @route   POST /api/rooms/:id/leave
 * @desc    Leave a room
 * @access  Private
 * @returns { message }
 */
router.post("/:id/leave", asyncHandler(leaveRoom));

export default router;
