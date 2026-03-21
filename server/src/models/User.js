const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, default: '' },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio:      { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);