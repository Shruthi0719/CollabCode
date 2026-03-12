import mongoose from "mongoose";

/**
 * Message Schema
 * Stores in-room chat messages
 */
const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      minlength: [1, "Message must be at least 1 character"],
      maxlength: [2000, "Message must not exceed 2000 characters"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Indexes for efficient queries
 */
messageSchema.index({ roomId: 1, createdAt: -1 }); // Get messages for a room, sorted by date
messageSchema.index({ userId: 1, createdAt: -1 }); // Get user's messages

/**
 * Static method: Get messages for a room
 * @param {string} roomId - Room ID
 * @param {number} limit - Max messages to fetch
 * @param {number} skip - Messages to skip
 * @returns {Promise<array>} Array of messages with user data
 */
messageSchema.statics.getByRoom = async function (roomId, limit = 50, skip = 0) {
  return await this.find({ roomId })
    .populate("userId", "username avatar email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

/**
 * Method: Transform message for client response
 */
messageSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    roomId: this.roomId,
    userId: this.userId,
    text: this.text,
    createdAt: this.createdAt,
  };
};

export const Message = mongoose.model("Message", messageSchema);
