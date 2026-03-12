const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user already exists (helps debug duplicate errors)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? "Email already exists" : "Username already taken" 
      });
    }

    // 2. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      username, 
      email, 
      password: hashedPassword 
    });

    // 3. Set the session
    req.session.userId = user._id;

    // 4. Save session explicitly before responding to ensure the cookie is set
    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error:", err);
        return res.status(500).json({ message: "Session initialization failed" });
      }
      res.status(201).json({ id: user._id, username: user.username });
    });

  } catch (err) {
    console.error("SIGNUP_ERROR:", err); // This shows in your terminal
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id;
      
      return req.session.save(() => {
        res.json({ id: user._id, username: user.username });
      });
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
};