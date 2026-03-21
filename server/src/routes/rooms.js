const express = require('express');
const router  = express.Router();
const Room    = require('../models/Room');

function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ message: 'Not authenticated' });
  next();
}

// GET /api/rooms/user
router.get('/user', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.session.userId })
      .sort({ lastActive: -1 })
      .limit(50)
      .select('_id name language lastActive createdAt');
    res.json(rooms);
  } catch (err) {
    console.error('GET_ROOMS_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.session.userId }).select('members');
    const collaboratorSet = new Set();
    rooms.forEach(room => {
      room.members.forEach(id => {
        if (id.toString() !== req.session.userId) collaboratorSet.add(id.toString());
      });
    });
    res.json({ activeRooms: rooms.length, collaborators: collaboratorSet.size, status: 'Online' });
  } catch (err) {
    console.error('STATS_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;