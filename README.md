# 🚀 CollabCode | Elite Real-Time Collaborative IDE

CollabCode is a premium, high-performance collaborative coding platform featuring real-time code synchronization, operational transformation for conflict resolution, Google Docs-style cursor presence, team chat, and an integrated multi-language execution engine — built like a mini Replit meets Google Docs.

<div align="center">

![CollabCode](https://img.shields.io/badge/CollabCode-Elite%20IDE-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

</div>

---

## ✨ Features

- **Operational Transformation (OT)**: Conflict resolution engine that handles concurrent edits from multiple users simultaneously — no text overwrites, no cursor jumps. Each keystroke is transmitted as a versioned operation and transformed against concurrent ops server-side.
- **Google Docs-Style Cursor Presence**: See exactly where every collaborator's cursor is in real time, with a colored vertical line and floating name tag — each user gets a unique color.
- **Real-Time Code Sync**: Seamless multi-user synchronization using optimized WebSockets with version tracking.
- **Multi-Language Execution**: Run JavaScript, Python, C++, Java, TypeScript, Rust, and HTML directly in the browser via a secure backend execution bridge (Wandbox API).
- **Output Console Sync**: When any user runs code, the terminal output is broadcast to all users in the room simultaneously.
- **Online Presence**: Dynamic navbar avatars showing exactly who is active with live "Online" status indicators. Avatar colors match each user's cursor color.
- **System Notifications**: Integrated "Join/Leave" system messages within the chat to track user activity.
- **Elite Dark UI**: A professional-grade glassmorphic dashboard with deep slate tones and dimensional layering.
- **Interactive Terminal**: Custom terminal with Emerald for success output, Red for errors.
- **Team Chat**: Instant room-based messaging for seamless communication.
- **HTML Preview**: Live iframe preview for HTML code — no backend call needed.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (Elite Dark Design System)
- **Framer Motion** (Animations & Transitions)
- **Monaco Editor** (The engine behind VS Code)
- **Socket.io-client** (Real-time events)

### Backend
- **Node.js & Express**
- **Socket.io** (Bidirectional communication & Room management)
- **MongoDB + Mongoose** (User authentication & data persistence)
- **Wandbox API** (Code execution engine — supports 6 languages)

---

## 🔬 How OT Works

Instead of sending the full document on every keystroke, CollabCode sends lightweight operations:

```json
{ "type": "insert", "position": 5, "text": "A", "version": 3, "author": "shruthii18" }
```

The server maintains a version counter and operation history per room. When two users type simultaneously, the server transforms the concurrent operations against each other so both edits survive without conflict.

```
User A types "X" at position 5  (version 3)
User B types "Y" at position 5  (version 3)  ← concurrent!

Server transforms B's op against A's op:
B's position becomes 6 → both characters inserted correctly
```

---

## 🔧 Socket Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Joins a workspace and registers username |
| `user-list` | Server → Client | Updates navbar avatars for all users |
| `operation` | Client → Server | Sends an OT operation (insert/delete) |
| `operation-ack` | Server → Client | Acknowledges op with new version number |
| `cursor-move` | Client → Server | Broadcasts cursor position |
| `cursor-update` | Server → Client | Updates another user's cursor in editor |
| `cursor-remove` | Server → Client | Removes cursor when user disconnects |
| `language-change` | Client → Server | Broadcasts language switch to room |
| `output-update` | Server → Client | Syncs terminal output to all users |
| `send-message` | Client → Server | Sends a chat message |
| `receive-message` | Server → Client | Delivers chat + system notifications |

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Shruthi0719/CollabCode.git
cd CollabCode
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```
MONGO_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secret_key
PORT=4000
```

Start the server:
```bash
node src/server.js
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com)

Set the following environment variable on Vercel:
```
VITE_BACKEND_URL=https://your-render-app.onrender.com
```

Set the following on Render:
```
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## 👤 Author

**Shruthi**

- GitHub: [@Shruthi0719](https://github.com/Shruthi0719)
- Project: CollabCode

---

<div align="center">

Copyright © 2026 CollabCode. Inventing the future, one line of code at a time.

</div>