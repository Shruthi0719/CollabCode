const express = require('express');
const router  = express.Router();
const Room    = require('../models/Room');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'collabcode-secret';

// Works with BOTH session AND JWT token (sent as Authorization header)
function requireAuth(req, res, next) {
  // 1. Try session first
  if (req.session?.userId) {
    req.userId = req.session.userId;
    return next();
  }
  // 2. Fall back to JWT Bearer token
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

router.get('/user', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .sort({ lastActive: -1 })
      .limit(50)
      .select('_id name language lastActive createdAt');
    res.json(rooms);
  } catch (err) {
    console.error('GET_ROOMS_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId }).select('members');
    const collaboratorSet = new Set();
    rooms.forEach(room => {
      room.members.forEach(id => {
        if (id.toString() !== req.userId.toString()) collaboratorSet.add(id.toString());
      });
    });
    res.json({ activeRooms: rooms.length, collaborators: collaboratorSet.size, status: 'Online' });
  } catch (err) {
    console.error('STATS_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/rooms/:id — remove a room (only if user is a member)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Only members can delete
    const isMember = room.members.some(m => m.toString() === req.userId.toString());
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('DELETE_ROOM_ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
