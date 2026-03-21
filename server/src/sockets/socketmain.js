// server/src/sockets/socketMain.js  ← REPLACE your entire socketMain.js with this

const Room = require('../models/Room');

const roomUsers   = {};
const roomVersion = {};
const roomHistory = {};

// ─── OT Transform (unchanged) ────────────────────────────────────────────────
function transform(opA, opB) {
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opB.position < opA.position ||
       (opB.position === opA.position && opB.author < opA.author)) {
      return { ...opA, position: opA.position + opB.text.length };
    }
    return opA;
  }
  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      return { ...opA, position: Math.max(opB.position, opA.position - opB.length) };
    }
    return opA;
  }
  if (opA.type === 'delete' && opB.type === 'insert') {
    if (opB.position <= opA.position) {
      return { ...opA, position: opA.position + opB.text.length };
    }
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

// ─── Helper: get userId from socket session ───────────────────────────────────
// express-session attaches to socket.request.session
function getUserId(socket) {
  return socket.request?.session?.userId ?? null;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    // ─── JOIN ROOM ─────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);

      if (!roomUsers[roomId])   roomUsers[roomId]   = [];
      if (!roomVersion[roomId]) roomVersion[roomId] = 0;
      if (!roomHistory[roomId]) roomHistory[roomId] = [];

      const existing = roomUsers[roomId].find(u => u.socketId === socket.id);
      if (existing) {
        existing.username = username;
      } else {
        roomUsers[roomId].push({ username, socketId: socket.id, cursor: null });
      }

      socket.emit('init-version', { version: roomVersion[roomId] });
      io.in(roomId).emit('user-list', roomUsers[roomId]);

      socket.to(roomId).emit('receive-message', {
        username: 'System',
        message:  `${username} joined the workspace`,
        time:     new Date(),
        isSystem: true,
      });

      // ── SAVE TO MONGODB ──────────────────────────────────────────────────
      // Upsert the room so it's always in the DB, add user to members list
      const userId = getUserId(socket);
      try {
        await Room.findOneAndUpdate(
          { _id: roomId },
          {
            $setOnInsert: { _id: roomId, name: `Room_${roomId}`, createdBy: userId },
            $addToSet:    { members: userId },   // add user only once
            $set:         { lastActive: new Date() },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        // Don't crash the socket if DB write fails — just log it
        console.error('Room upsert error:', err.message);
      }

      console.log(`${username} joined room: ${roomId}`);
    });

    // ─── OT OPERATION ──────────────────────────────────────────────────────
    socket.on('operation', ({ roomId, op, baseVersion }) => {
      if (!roomId || !op) return;

      if (!roomVersion[roomId]) roomVersion[roomId] = 0;
      if (!roomHistory[roomId]) roomHistory[roomId] = [];

      let transformedOp       = op;
      const concurrentOps     = roomHistory[roomId].slice(baseVersion);
      for (const histOp of concurrentOps) {
        transformedOp = transform(transformedOp, histOp);
      }

      roomVersion[roomId]++;
      transformedOp.version = roomVersion[roomId];
      roomHistory[roomId].push(transformedOp);

      if (roomHistory[roomId].length > 500) {
        roomHistory[roomId] = roomHistory[roomId].slice(-500);
      }

      socket.emit('operation-ack', { version: roomVersion[roomId] });
      socket.to(roomId).emit('operation', { op: transformedOp, version: roomVersion[roomId] });

      // ── UPDATE lastActive in background (don't await — non-blocking) ───
      Room.findByIdAndUpdate(roomId, { lastActive: new Date() }).exec()
        .catch(err => console.error('lastActive update failed:', err.message));
    });

    // ─── LANGUAGE CHANGE ───────────────────────────────────────────────────
    socket.on('language-change', ({ roomId, language }) => {
      if (!roomId || !language) return;
      roomVersion[roomId] = 0;
      roomHistory[roomId] = [];
      socket.to(roomId).emit('language-change', language);

      // ── SAVE language to MongoDB ────────────────────────────────────────
      Room.findByIdAndUpdate(roomId, { language, lastActive: new Date() }).exec()
        .catch(err => console.error('Language update failed:', err.message));
    });

    // ─── FALLBACK CODE CHANGE ──────────────────────────────────────────────
    socket.on('code-change', ({ roomId, code }) => {
      if (!roomId) return;
      socket.to(roomId).emit('code-update', code);

      // ── SAVE latest code snapshot to MongoDB ────────────────────────────
      Room.findByIdAndUpdate(roomId, { code, lastActive: new Date() }).exec()
        .catch(err => console.error('Code save failed:', err.message));
    });

    // ─── CURSOR PRESENCE ───────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, cursor }) => {
      if (!roomId || !cursor) return;
      if (roomUsers[roomId]) {
        const user = roomUsers[roomId].find(u => u.socketId === socket.id);
        if (user) user.cursor = cursor;
      }
      socket.to(roomId).emit('cursor-update', { socketId: socket.id, cursor });
    });

    // ─── CHAT MESSAGE ───────────────────────────────────────────────────────
    socket.on('send-message', ({ roomId, username, message }) => {
      if (!roomId || !message?.trim()) return;
      socket.to(roomId).emit('receive-message', {
        username,
        message,
        time:  new Date(),
        isMe:  false,
      });
    });

    // ─── OUTPUT SYNC ────────────────────────────────────────────────────────
    socket.on('output-update', ({ roomId, output, isExecuting }) => {
      if (!roomId) return;
      socket.to(roomId).emit('output-update', { output, isExecuting });
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnecting', () => {
      Array.from(socket.rooms).forEach((roomId) => {
        if (!roomUsers[roomId]) return;

        const user = roomUsers[roomId].find(u => u.socketId === socket.id);
        if (user) {
          socket.to(roomId).emit('receive-message', {
            username: 'System',
            message:  `${user.username} left the workspace`,
            time:     new Date(),
            isSystem: true,
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