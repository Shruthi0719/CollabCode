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

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
const roomRoutes = require('./routes/rooms');      // ← moved here with the others

const app    = express();
const server = http.createServer(app);

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// 2. SOCKET.IO
const io = new Server(server, {
  cors: {
    origin:      'http://localhost:5173',
    methods:     ['GET', 'POST'],
    credentials: true,
  }
});

// 3. MIDDLEWARE
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. CORS — must be before routes
app.use(cors({
  origin:      'http://localhost:5173',
  credentials: true,
}));

// 5. SESSIONS
const sessionMiddleware = session({
  secret:            process.env.SESSION_SECRET || 'dev_secret',
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure:   false,
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 24,
  }
});
app.use(sessionMiddleware);

// Share session with Socket.io so getUserId(socket) works
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// 6. API ROUTES
app.use('/api/auth',  authRoutes);
app.use('/api/code',  codeRoutes);
app.use('/api/rooms', roomRoutes);   // ← added here after app is defined

// 7. SOCKET LOGIC
require('./sockets/socketmain')(io);

// 8. SERVE FRONTEND (production only)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// 9. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server live at http://localhost:${PORT}`);
});