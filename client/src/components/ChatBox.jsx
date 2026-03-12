import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:4000');

export default function ChatBox({ roomId }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    socket.emit('join-room', roomId);
    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const data = { roomId, message, username: user?.username || 'Guest', time: new Date() };
    socket.emit('send-message', data);
    setMessages((prev) => [...prev, { ...data, isMe: true }]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-l border-white/5">
      <div className="p-4 border-b border-white/5 bg-slate-900/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Collaborators Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-1">{msg.username}</span>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-slate-900/50 border-t border-white/5">
        <div className="relative">
          <input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-sm outline-none focus:border-blue-500/50"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}