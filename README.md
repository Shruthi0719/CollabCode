# 🚀 CollabCode | Elite Real-Time Collaborative IDE

CollabCode is a premium, high-performance collaborative coding platform. It features a sophisticated "Elite Dark" glassmorphic interface, real-time code synchronization, team chat, and an integrated multi-language execution engine.



---

## ✨ Features

- **Real-Time Code Sync**: Seamless multi-user synchronization using optimized WebSockets to prevent cursor jumping.
- **Online Presence**: Dynamic navbar avatars showing exactly who is active in the workspace with live "Online" status indicators.
- **System Notifications**: Integrated "Join/Leave" system messages within the chat to track user activity.
- **Multi-Language Execution**: Run JavaScript, Python, C++, and Java code directly in the browser via a secure backend bridge.
- **Elite Dark UI**: A professional-grade, glassmorphic dashboard with deep slate tones and dimensional layering.
- **Interactive Terminal**: Custom terminal with ANSI color support (Emerald for success, Red for errors).
- **Team Chat**: Instant room-based messaging for seamless communication.

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
- **Piston API** (Backend code execution engine)

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/shruthii18/CollabCode.git](https://github.com/shruthii18/CollabCode.git)
   cd CollabCode
   ```
2. **Setup Backend**
   ```bash
   cd server
   npm install
   npm start
   ```
3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
Gemini said
Here is the comprehensive, single-file README.md for your project. I’ve updated it to reflect the specific features we just finished: Online User Avatars, Real-Time Code Sync, and System Join/Leave Notifications.

README.md
Markdown
# 🚀 CollabCode | Elite Real-Time Collaborative IDE

CollabCode is a premium, high-performance collaborative coding platform. It features a sophisticated "Elite Dark" glassmorphic interface, real-time code synchronization, team chat, and an integrated multi-language execution engine.



---

## ✨ Features

- **Real-Time Code Sync**: Seamless multi-user synchronization using optimized WebSockets to prevent cursor jumping.
- **Online Presence**: Dynamic navbar avatars showing exactly who is active in the workspace with live "Online" status indicators.
- **System Notifications**: Integrated "Join/Leave" system messages within the chat to track user activity.
- **Multi-Language Execution**: Run JavaScript, Python, C++, and Java code directly in the browser via a secure backend bridge.
- **Elite Dark UI**: A professional-grade, glassmorphic dashboard with deep slate tones and dimensional layering.
- **Interactive Terminal**: Custom terminal with ANSI color support (Emerald for success, Red for errors).
- **Team Chat**: Instant room-based messaging for seamless communication.

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
- **Piston API** (Backend code execution engine)

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Shruthi0719/CollabCode.git](https://github.com/Shruthi0719/CollabCode.git)
   cd CollabCode
Setup Backend

Bash
cd server
npm install
npm start
Setup Frontend

Bash
cd client
npm install
npm run dev
🔧 Socket Events Reference
Event	Direction	Description
join-room	Client -> Server	Joins a specific workspace and registers the username.
user-list	Server -> Client	Updates the navbar icons for all users in the room.
code-change	Client -> Server	Broadcasts code updates to other collaborators.
receive-message	Server -> Client	Delivers chat messages and system notifications.
👤 Author
Shruthi

GitHub: @shruthii18

Project: CollabCode

<div align="center">

Copyright © 2026 CollabCode. Inventing the future, one line of code at a time.

</div>
