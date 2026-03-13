const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();

const server = http.createServer(app); // Important: Use http server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite dev port
    methods: ["GET", "POST"]
  }
});

// Pass the 'io' instance to your socket main file
require('./sockets/socketMain')(io);

server.listen(4000, () => console.log('Server running on port 4000'));