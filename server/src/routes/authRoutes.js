const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'collabcode-secret';
const isProd     = process.env.NODE_ENV === 'production';

function makeToken(userId) {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user, token) {
  return {
    _id:      user._id,
    username: user.username,
    email:    user.email,
    bio:      user.bio || '',
    token,            // ← frontend stores this in localStorage
  };
}

function requireAuth(req, res, next) {
  if (req.session?.userId) { req.userId = req.session.userId; return next(); }
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
      req.userId = decoded.userId;
      return next();
    } catch {}
  }
  return res.status(401).json({ message: 'Not authenticated' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({
      username: username?.trim() || email.split('@')[0],
      email:    email.toLowerCase(),
      password: hashed,
    });

    const token = makeToken(user._id);
    req.session.userId = user._id.toString();
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.status(201).json(userResponse(user, token));
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
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = makeToken(user._id);
    req.session.userId = user._id.toString();
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.json(userResponse(user, token));
    });
  } catch (err) {
    console.error('LOGIN_ERROR:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = makeToken(user._id);
    res.json(userResponse(user, token));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid', { sameSite: isProd ? 'none' : 'lax', secure: isProd });
    res.json({ message: 'Logged out' });
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    if (!username?.trim()) return res.status(400).json({ message: 'Username required' });
    const taken = await User.findOne({ username: username.trim(), _id: { $ne: req.userId } });
    if (taken) return res.status(400).json({ message: 'Username already taken' });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username: username.trim(), bio: bio?.trim() || '' },
      { new: true }
    ).select('-password');
    res.json(userResponse(user, makeToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/password
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be 8+ characters' });
    const user  = await User.findById(req.userId);
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
