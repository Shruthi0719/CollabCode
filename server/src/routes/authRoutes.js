const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ username, email, password: hashed });

    req.session.userId = user._id.toString();

    // ✅ MUST save session before responding — fixes cookie not being set
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: 'Session error' });
      res.status(201).json({
        _id:      user._id,
        username: user.username,
        email:    user.email,
        bio:      user.bio ?? '',
      });
    });

  } catch (err) {
    console.error('SIGNUP_ERROR:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id.toString();

    // ✅ MUST save session before responding
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: 'Session error' });
      res.json({
        _id:      user._id,
        username: user.username,
        email:    user.email,
        bio:      user.bio ?? '',
      });
    });

  } catch (err) {
    console.error('LOGIN_ERROR:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ _id: user._id, username: user.username, email: user.email, bio: user.bio ?? '' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid', { sameSite: 'none', secure: true });
    res.json({ message: 'Logged out' });
  });
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const { username, bio } = req.body;
    if (!username?.trim()) return res.status(400).json({ message: 'Username required' });
    const taken = await User.findOne({ username: username.trim(), _id: { $ne: req.session.userId } });
    if (taken) return res.status(400).json({ message: 'Username already taken' });
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { username: username.trim(), bio: bio?.trim() ?? '' },
      { new: true }
    ).select('-password');
    res.json({ _id: user._id, username: user.username, email: user.email, bio: user.bio });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/password
router.put('/password', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be 8+ characters' });
    const user  = await User.findById(req.session.userId);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect current password' });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;