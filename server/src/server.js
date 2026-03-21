require('dotenv').config();

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

const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
const roomRoutes = require('./routes/rooms');

const app    = express();
const server = http.createServer(app);

// ── DB ────────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err.message));

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allows both production URL and Vercel preview deployment URLs
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === CLIENT_ORIGIN) return true;
  // Allow all Vercel preview deployments for this project
  if (origin.endsWith('.vercel.app')) return true;
  if (origin === 'http://localhost:5173') return true;
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods:     ['GET', 'POST'],
    credentials: true,
  }
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Sessions ──────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  secret:            process.env.SESSION_SECRET || 'dev_secret',
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure:   isProd,              // true on Render (HTTPS), false locally
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-domain in prod
    maxAge:   1000 * 60 * 60 * 24, // 1 day
  }
});

app.use(sessionMiddleware);

// Share session with Socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/code',  codeRoutes);
app.use('/api/rooms', roomRoutes);

// ── Socket logic ──────────────────────────────────────────────────────────────
require('./sockets/socketmain')(io);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, origin: CLIENT_ORIGIN });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   CLIENT_ORIGIN: ${CLIENT_ORIGIN}`);
  console.log(`   NODE_ENV:      ${process.env.NODE_ENV}`);
});
