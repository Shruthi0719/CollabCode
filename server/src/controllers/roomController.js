import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";

/**
 * Room Controller
 * Handles room CRUD operations and membership
 */

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms or user's rooms
 * @access  Private
 * @query   {boolean} mine - If true, return only user's rooms
 * @returns {array} Array of rooms
 */
export const getRooms = async (req, res, next) => {
  try {
    const { mine } = req.query;
    let query = {};

    if (mine === "true") {
      // Get only rooms created by the user or where user is a member
      query = {
        $or: [{ createdBy: req.user._id }, { members: req.user._id }],
      };
    }

    const rooms = await Room.find(query)
      .select("_id title description language createdBy members createdAt")
      .populate("createdBy", "username email avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/rooms
 * @desc    Create new coding room
 * @access  Private
 * @body    {string} title, {string} language, {string} description (optional)
 * @returns {object} Created room
 */
export const createRoom = async (req, res, next) => {
  try {
    const { title, language, description } = req.body;

    const room = new Room({
      title,
      language: language || "javascript",
      description: description || "",
      code: "// Start coding here\n",
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically a member
    });

    await room.save();

    // Populate creator info
    await room.populate("createdBy", "username email avatar");

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rooms/:id
 * @desc    Get specific room with code and messages
 * @access  Private
 * @returns {object} Room with code, messages, and members
 */
export const getRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("createdBy", "username email avatar")
      .populate("members", "username email avatar");

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check if user has access to private rooms
    if (room.isPrivate && !room.members.some((m) => m._id.equals(req.user._id))) {
      return res.status(403).json({
        error: "Access denied to this private room",
      });
    }

    // Get recent messages
    const messages = await Message.getByRoom(id, 50);

    res.status(200).json({
      room,
      messages: messages.reverse(), // Return in chronological order
      isCreator: room.createdBy._id.equals(req.user._id),
      isMember: room.members.some((m) => m._id.equals(req.user._id)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/rooms/:id
 * @desc    Update room details (title, description, language)
 * @access  Private (creator only)
 * @body    {string} title, {string} description, {string} language
 * @returns {object} Updated room
 */
export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, language } = req.body;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Only creator can update room
    if (!room.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        error: "Only room creator can update room details",
      });
    }

    // Update fields if provided
    if (title) room.title = title;
    if (description !== undefined) room.description = description;
    if (language) room.language = language;

    await room.save();
    await room.populate("createdBy", "username email avatar");

    res.status(200).json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room (creator only)
 * @access  Private
 * @returns {object} Confirmation message
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Only creator can delete room
    if (!room.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        error: "Only room creator can delete the room",
      });
    }

    // Delete associated messages
    await Message.deleteMany({ roomId: id });

    // Delete room
    await Room.findByIdAndDelete(id);

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/rooms/:id/join
 * @desc    Join an existing room
 * @access  Private
 * @returns {object} Updated room with members
 */
export const joinRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check if private
    if (room.isPrivate) {
      return res.status(403).json({
        error: "This is a private room. You need an invitation.",
      });
    }

    // Check if already a member
    if (room.members.some((m) => m.equals(req.user._id))) {
      return res.status(200).json({
        message: "You are already a member of this room",
        room: await room.populate("members", "username email avatar"),
      });
    }

    // Add user to members
    room.members.push(req.user._id);
    await room.save();
    await room.populate("members", "username email avatar");
    await room.populate("createdBy", "username email avatar");

    res.status(200).json({
      message: "Joined room successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/rooms/:id/leave
 * @desc    Leave a room
 * @access  Private
 * @returns {object} Confirmation message
 */
export const leaveRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check if user is a member
    if (!room.members.some((m) => m.equals(req.user._id))) {
      return res.status(400).json({
        error: "You are not a member of this room",
      });
    }

    // Creator cannot leave (would orphan the room)
    if (room.createdBy.equals(req.user._id)) {
      return res.status(400).json({
        error: "Room creator cannot leave. Delete the room instead.",
      });
    }

    // Remove user from members
    room.members = room.members.filter((m) => !m.equals(req.user._id));
    await room.save();

    res.status(200).json({
      message: "Left room successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rooms/:id/messages
 * @desc    Get paginated messages for a room
 * @access  Private
 * @query   {number} limit (default 50), {number} page (default 1)
 * @returns {array} Array of messages
 */
export const getRoomMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const limitNum = Math.min(parseInt(limit), 100); // Max 100
    const skipNum = (parseInt(page) - 1) * limitNum;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check access
    if (room.isPrivate && !room.members.some((m) => m.equals(req.user._id))) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const messages = await Message.find({ roomId: id })
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const totalCount = await Message.countDocuments({ roomId: id });

    res.status(200).json({
      messages: messages.reverse(), // Chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limitNum),
        totalMessages: totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};
