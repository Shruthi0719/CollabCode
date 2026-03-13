const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');

const app = express();
const server = http.createServer(app);

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// 2. SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
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
  origin: 'http://localhost:5173',
  credentials: true,
}));

// 5. SESSIONS
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: false,   // true only in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

// 6. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);

// 7. SOCKET LOGIC
// ✅ FIX: path uses 'socketMain' not 'socketmain' — check your actual filename casing
require('./sockets/socketmain')(io);

// 8. SERVE FRONTEND (production only)
// ✅ FIX: In development you DON'T need this — Vite runs on :5173 separately.
// This only applies when you run `npm run build` and serve the built files.
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// 9. HEALTH CHECK — visit localhost:4000/api/health to confirm server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server live at http://localhost:${PORT}`);
});