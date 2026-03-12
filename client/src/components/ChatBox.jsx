import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// IMPORTANT: Use the same URL as your editor
const socket = io('http://localhost:4000');

export default function ChatBox({ roomId }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    // Join the room for chat
    socket.emit('join-room', { roomId, username: user?.username });

    // Listen for incoming messages
    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off('receive-message');
  }, [roomId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      roomId,
      message,
      username: user?.username || 'Guest',
      time: new Date()
    };

    // 1. Send to server
    socket.emit('send-message', msgData);

    // 2. Add to my own UI
    setMessages((prev) => [...prev, { ...msgData, isMe: true }]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-[#111827]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.username}</span>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
              msg.isMe 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-900/40 border-t border-white/5">
        <div className="relative flex items-center">
          <input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm outline-none focus:border-blue-500/50 transition-all"
          />
          <button type="submit" className="absolute right-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}