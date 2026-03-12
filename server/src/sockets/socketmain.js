module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        socket.on('code-change', ({ roomId, code }) => {
            socket.to(roomId).emit('code-update', code);
        });

        // Add this for Language Sync!
        socket.on('language-change', ({ roomId, language }) => {
            socket.to(roomId).emit('language-change', language);
        });
    });
};