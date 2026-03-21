const Room = require('../models/Room');
const jwt  = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET || 'collabcode-secret';
const roomUsers   = {};
const roomVersion = {};
const roomHistory = {};

function transform(opA, opB) {
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opB.position < opA.position ||
       (opB.position === opA.position && opB.author < opA.author)) {
      return { ...opA, position: opA.position + opB.text.length };
    }
    return opA;
  }
  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opB.position < opA.position)
      return { ...opA, position: Math.max(opB.position, opA.position - opB.length) };
    return opA;
  }
  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opB.position <= opA.position)
      return { ...opA, position: opA.position + opB.text.length };
    return opA;
  }
  if (opA.type === 'delete' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      const overlap = Math.min(opB.position + opB.length, opA.position) - opB.position;
      return { ...opA, position: opA.position - overlap };
    }
    return opA;
  }
  return opA;
}

// ── Get userId from session OR JWT token ──────────────────────────────────────
function getUserId(socket) {
  // 1. Try session (works locally)
  if (socket.request?.session?.userId) return socket.request.session.userId;

  // 2. Try JWT from socket handshake auth (works in production)
  const token = socket.handshake?.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch {}
  }

  // 3. Try JWT from handshake headers
  const authHeader = socket.handshake?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
      return decoded.userId;
    } catch {}
  }

  return null;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('join-room', async ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);

      if (!roomUsers[roomId])   roomUsers[roomId]   = [];
      if (!roomVersion[roomId]) roomVersion[roomId] = 0;
      if (!roomHistory[roomId]) roomHistory[roomId] = [];

      const existing = roomUsers[roomId].find(u => u.socketId === socket.id);
      if (existing) existing.username = username;
      else roomUsers[roomId].push({ username, socketId: socket.id, cursor: null });

      socket.emit('init-version', { version: roomVersion[roomId] });
      io.in(roomId).emit('user-list', roomUsers[roomId]);
      socket.to(roomId).emit('receive-message', {
        username: 'System',
        message:  `${username} joined the workspace`,
        time:     new Date(),
        isSystem: true,
      });

      const userId = getUserId(socket);
      console.log('join-room userId:', userId);

      if (!userId) {
        console.warn('⚠️  No userId — room not saved to MongoDB');
      } else {
        try {
          await Room.findOneAndUpdate(
            { _id: roomId },
            {
              $setOnInsert: { _id: roomId, name: `Room_${roomId}`, createdBy: userId },
              $addToSet:    { members: userId },
              $set:         { lastActive: new Date() },
            },
            { upsert: true, new: true }
          );
          console.log(`✅ Room ${roomId} saved`);
        } catch (err) {
          console.error('Room upsert error:', err.message);
        }
      }

      console.log(`${username} joined room: ${roomId}`);
    });

    socket.on('operation', ({ roomId, op, baseVersion }) => {
      if (!roomId || !op) return;
      if (!roomVersion[roomId]) roomVersion[roomId] = 0;
      if (!roomHistory[roomId]) roomHistory[roomId] = [];

      let transformedOp = op;
      for (const histOp of roomHistory[roomId].slice(baseVersion))
        transformedOp = transform(transformedOp, histOp);

      roomVersion[roomId]++;
      transformedOp.version = roomVersion[roomId];
      roomHistory[roomId].push(transformedOp);
      if (roomHistory[roomId].length > 500)
        roomHistory[roomId] = roomHistory[roomId].slice(-500);

      socket.emit('operation-ack', { version: roomVersion[roomId] });
      socket.to(roomId).emit('operation', { op: transformedOp, version: roomVersion[roomId] });
      Room.findByIdAndUpdate(roomId, { lastActive: new Date() }).exec().catch(() => {});
    });

    socket.on('language-change', ({ roomId, language }) => {
      if (!roomId || !language) return;
      roomVersion[roomId] = 0;
      roomHistory[roomId] = [];
      socket.to(roomId).emit('language-change', language);
      Room.findByIdAndUpdate(roomId, { language, lastActive: new Date() }).exec().catch(() => {});
    });

    socket.on('code-change', ({ roomId, code }) => {
      if (!roomId) return;
      socket.to(roomId).emit('code-update', code);
      Room.findByIdAndUpdate(roomId, { code, lastActive: new Date() }).exec().catch(() => {});
    });

    socket.on('cursor-move', ({ roomId, cursor }) => {
      if (!roomId || !cursor) return;
      const user = roomUsers[roomId]?.find(u => u.socketId === socket.id);
      if (user) user.cursor = cursor;
      socket.to(roomId).emit('cursor-update', { socketId: socket.id, cursor });
    });

    socket.on('send-message', ({ roomId, username, message }) => {
      if (!roomId || !message?.trim()) return;
      socket.to(roomId).emit('receive-message', { username, message, time: new Date(), isMe: false });
    });

    socket.on('output-update', ({ roomId, output, isExecuting }) => {
      if (!roomId) return;
      socket.to(roomId).emit('output-update', { output, isExecuting });
    });

    socket.on('disconnecting', () => {
      Array.from(socket.rooms).forEach((roomId) => {
        if (!roomUsers[roomId]) return;
        const user = roomUsers[roomId].find(u => u.socketId === socket.id);
        if (user) {
          socket.to(roomId).emit('receive-message', {
            username: 'System', message: `${user.username} left the workspace`,
            time: new Date(), isSystem: true,
          });
          socket.to(roomId).emit('cursor-remove', { socketId: socket.id });
        }
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
          delete roomVersion[roomId];
          delete roomHistory[roomId];
        } else {
          io.in(roomId).emit('user-list', roomUsers[roomId]);
        }
      });
    });

    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
  });
};
