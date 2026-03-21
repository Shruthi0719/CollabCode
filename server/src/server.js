const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const helmet     = require('helmet');
const morgan     = require('morgan');
const cors       = require('cors');
require('dotenv').config();

// ROUTES
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
const roomRoutes = require('./routes/rooms');

const app    = express();
const server = http.createServer(app);


// =======================
// 1. DATABASE CONNECTION
// =======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));


// =======================
// 2. FRONTEND URL (IMPORTANT)
// =======================
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";


// =======================
// 3. SOCKET.IO
// =======================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // important for production
});


// =======================
// 4. MIDDLEWARE
// =======================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =======================
// 5. CORS
// =======================
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));


// =======================
// 6. SESSION
// =======================
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === "production", // 🔥 important
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 🔥 important
    maxAge: 1000 * 60 * 60 * 24,
  }
});

app.use(sessionMiddleware);


// =======================
// 7. SHARE SESSION WITH SOCKET
// =======================
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


// =======================
// 8. ROUTES
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/rooms', roomRoutes);


// =======================
// 9. SOCKET LOGIC
// =======================
require('./sockets/socketmain')(io);


// =======================
// 10. HEALTH CHECK
// =======================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running 🚀' });
});


// =======================
// 11. START SERVER
// =======================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});