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

const app = express();
const server = http.createServer(app);

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); 
  });

// 2. SOCKET.IO CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 3. ESSENTIAL MIDDLEWARE (Security & Parsing)
app.use(helmet({ 
  contentSecurityPolicy: false, 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. CORS CONFIGURATION (Must be BEFORE routes)
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 5. SESSION CONFIGURATION
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_shhh',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

// 6. API ROUTES
const authRoutes = require('./routes/authRoutes'); 
app.use('/api/auth', authRoutes);

// 7. SOCKET.IO LOGIC
require('./sockets/socketMain')(io);

// 8. FRONTEND STATIC SERVING (For production)
const buildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(buildPath));

// 9. SPA ROUTING
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  }
});

// 10. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 CollabCode Server running at http://localhost:${PORT}`);
});