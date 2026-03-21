// server/src/models/Room.js  ← REPLACE your entire Room.js with this
// Note: We use String _id so the random room codes (e.g. "L04S8F00") work directly.

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    _id:      { type: String, required: true },   // room code IS the _id, e.g. "L04S8F00"
    name:     { type: String, default: function () { return `Room_${this._id}`; } },
    language: {
      type:    String,
      enum:    ['javascript','typescript','python3','java','cpp','rust','html'],
      default: 'javascript',
    },
    code:       { type: String, default: '' },
    members:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    _id: false,  // we're providing _id manually
  }
);

roomSchema.index({ members: 1, lastActive: -1 });

module.exports = mongoose.model('Room', roomSchema);