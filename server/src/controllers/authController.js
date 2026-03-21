const User   = require('../models/User');
const bcrypt = require('bcryptjs');

function userResponse(user) {
  return { _id: user._id, username: user.username, email: user.email, bio: user.bio ?? '' };
}

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already taken',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword });
    req.session.userId = user._id.toString();
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: 'Session initialization failed' });
      res.status(201).json(userResponse(user));
    });
  } catch (err) {
    console.error('SIGNUP_ERROR:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    req.session.userId = user._id.toString();
    req.session.save(() => res.json(userResponse(user)));
  } catch (err) {
    console.error('LOGIN_ERROR:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(userResponse(user));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const { username, bio } = req.body;
    if (!username?.trim()) return res.status(400).json({ message: 'Username cannot be empty' });
    const taken = await User.findOne({ username: username.trim(), _id: { $ne: req.session.userId } });
    if (taken) return res.status(400).json({ message: 'Username already taken' });
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { username: username.trim(), bio: bio?.trim() ?? '' },
      { new: true }
    ).select('-password');
    res.json(userResponse(user));
  } catch (err) {
    console.error('UPDATE_PROFILE_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const user = await User.findById(req.session.userId);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect current password' });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('CHANGE_PASSWORD_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};