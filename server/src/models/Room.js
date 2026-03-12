import mongoose from "mongoose";

/**
 * Operation Log Schema
 * Stores individual edits for Operational Transformation
 */
const operationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["insert", "delete"],
      required: true,
    },
    index: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      default: "", // For deletes, this is empty
    },
    length: {
      type: Number,
      default: 0, // For inserts, this is 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Room Schema
 * Stores collaborative code editing rooms
 */
const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Room title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      default: "",
    },
    code: {
      type: String,
      default: "// Start coding here\n",
    },
    language: {
      type: String,
      enum: [
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
      ],
      default: "javascript",
    },
    version: {
      type: Number,
      default: 0, // Incremented on each operation
    },
    operationLog: [operationSchema],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Index for faster queries
 */
roomSchema.index({ createdBy: 1, createdAt: -1 });
roomSchema.index({ members: 1 });
roomSchema.index({ createdAt: -1 });

/**
 * Method: Add operation to log
 * @param {object} operation - Operation to add
 * @param {string} operation.type - "insert" or "delete"
 * @param {number} operation.index - Position in text
 * @param {string} operation.text - Text being inserted
 * @param {number} operation.length - Number of chars to delete
 * @param {string} userId - User ID making the change
 */
roomSchema.methods.addOperation = function (operation, userId) {
  this.operationLog.push({
    ...operation,
    userId,
    timestamp: new Date(),
  });
  this.version += 1;
};

/**
 * Method: Get room data for client
 * Excludes sensitive data if needed
 */
roomSchema.methods.toJSON = function () {
  const room = this.toObject();
  // Don't expose full operation log by default (can be requested separately)
  return room;
};

export const Room = mongoose.model("Room", roomSchema);
