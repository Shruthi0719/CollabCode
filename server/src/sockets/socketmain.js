module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, username }) => {
      socket.join(roomId);
      console.log(`👤 ${username} joined room: ${roomId}`);
      socket.to(roomId).emit('user-joined', { username, socketId: socket.id });
    });

    socket.on('code-change', ({ roomId, code }) => {
      // Broadcast code to everyone in the room except the sender
      socket.to(roomId).emit('code-update', code);
    });

    socket.on('disconnecting', () => {
      const rooms = [...socket.rooms];
      rooms.forEach(roomId => {
        socket.to(roomId).emit('user-left', { socketId: socket.id });
      });
    });
  });
};