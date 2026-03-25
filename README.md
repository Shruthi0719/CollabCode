# 🚀 CollabCode | Elite Real-Time Collaborative IDE

CollabCode is a premium, high-performance collaborative coding platform featuring real-time code synchronization, operational transformation for conflict resolution, Google Docs-style cursor presence, team chat, and an integrated multi-language execution engine — built like a mini Replit meets Google Docs.

<div align="center">

![CollabCode](https://img.shields.io/badge/CollabCode-Elite%20IDE-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge\&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge\&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge\&logo=mongodb)

</div>

---

## ✨ Features

* **Operational Transformation (OT)**: Conflict resolution engine that handles concurrent edits from multiple users simultaneously — no text overwrites, no cursor jumps.
* **Google Docs-Style Cursor Presence**: Real-time cursor tracking with unique colors for each collaborator.
* **Real-Time Code Sync**: Seamless multi-user synchronization using WebSockets.
* **Multi-Language Execution**: Run JavaScript, Python, C++, Java, TypeScript, Rust, and HTML via Wandbox API.
* **Output Console Sync**: Terminal output is synchronized across all users.
* **Online Presence**: Live avatars showing active users in a room.
* **System Notifications**: Join/Leave notifications inside chat.
* **Collaborative Practice Problems 🧠**: Solve coding problems together in real-time.
* **Interactive Terminal**: Styled terminal with success/error outputs.
* **Team Chat**: Real-time messaging within rooms.
* **HTML Preview**: Live preview without backend calls.

---

## 🧠 Collaborative Problem Solving

CollabCode includes a built-in **practice problems system**:

* Select coding challenges
* Auto-load starter code into editor
* Solve collaboratively in real-time
* Simulates pair programming interviews

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Monaco Editor
* Socket.io-client

### Backend

* Node.js + Express
* Socket.io
* MongoDB + Mongoose
* Wandbox API

---

## 🔬 How OT Works

Instead of sending full documents, CollabCode sends operations:

```json
{ "type": "insert", "position": 5, "text": "A", "version": 3 }
```

Server transforms concurrent operations to prevent conflicts.

---

## 🔧 Socket Events

| Event           | Description       |
| --------------- | ----------------- |
| join-room       | Join workspace    |
| operation       | Send OT operation |
| operation-ack   | Confirm operation |
| cursor-move     | Send cursor       |
| cursor-update   | Update cursor     |
| output-update   | Sync terminal     |
| send-message    | Send chat         |
| receive-message | Receive chat      |

---

## 🚀 Installation

### Backend

```bash
cd server
npm install
```

.env:

```
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
PORT=4000
```

Run:

```bash
node src/server.js
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🌐 Deployment

### Frontend (Vercel)

```
VITE_API_URL=https://your-render-app.onrender.com
```

### Backend (Render)

```
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
```

---

## 🧠 System Architecture

```
Frontend (Vercel)
      ↓
Backend (Render)
      ↓
MongoDB Atlas
      ↓
Wandbox API
```

* WebSockets power real-time sync
* OT ensures conflict-free editing
* Sessions handle authentication

---

## 💡 Highlights

* Real-time collaborative editing with OT
* Production deployment with CORS + cookies handled
* Integrated multi-language execution
* Collaborative coding + problem solving

---

## 👤 Author

**Shruthi**

GitHub: https://github.com/Shruthi0719

---

<div align="center">

🚀 Built with passion. Designed for real-world collaboration.

</div>
