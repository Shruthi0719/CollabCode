const roomUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    // --- JOIN ROOM ---
    socket.on('join-room', ({ roomId, username }) => {
      // ✅ Guard: ignore malformed events
      if (!roomId || !username) return;

      socket.join(roomId);

      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      // ✅ If the same socket rejoins (e.g. React StrictMode double-mount),
      // update their username rather than pushing a duplicate entry
      const existing = roomUsers[roomId].find(u => u.socketId === socket.id);
      if (existing) {
        existing.username = username;
      } else {
        roomUsers[roomId].push({ username, socketId: socket.id });
      }

      io.in(roomId).emit('user-list', roomUsers[roomId]);

      // ✅ Only broadcast the join message to OTHERS — the joining user
      // doesn't need to see "You joined the workspace" in their own chat
      socket.to(roomId).emit('receive-message', {
        username: 'System',
        message: `${username} joined the workspace`,
        time: new Date(),
        isSystem: true,
      });

      console.log(`${username} joined room: ${roomId}`);
    });

    // --- CODE CHANGE ---
    socket.on('code-change', ({ roomId, code }) => {
      if (!roomId) return;
      socket.to(roomId).emit('code-update', code);
    });

    // --- LANGUAGE CHANGE ---
    socket.on('language-change', ({ roomId, language }) => {
      if (!roomId || !language) return;
      socket.to(roomId).emit('language-change', language);
    });

    // --- CHAT MESSAGE ---
    socket.on('send-message', ({ roomId, username, message }) => {
      if (!roomId || !message?.trim()) return;
      socket.to(roomId).emit('receive-message', {
        username,
        message,
        time: new Date(),
        isMe: false,
      });
    });

    // --- DISCONNECT ---
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);

      rooms.forEach((roomId) => {
        if (!roomUsers[roomId]) return;

        const user = roomUsers[roomId].find(u => u.socketId === socket.id);

        if (user) {
          socket.to(roomId).emit('receive-message', {
            username: 'System',
            message: `${user.username} left the workspace`,
            time: new Date(),
            isSystem: true,
          });
        }

        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);

        // ✅ Clean up empty rooms so the object doesn't grow forever
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
        } else {
          io.in(roomId).emit('user-list', roomUsers[roomId]);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
};