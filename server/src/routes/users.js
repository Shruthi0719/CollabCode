const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    bio:      { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return require('bcryptjs').compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);