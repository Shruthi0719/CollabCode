import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// ✅ Uses the same shared singleton as EditorPage — critical for user-list events
import socket from '../socket';

export default function ChatBox({ roomId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    socket.off('receive-message');

    socket.on('receive-message', (data) => {
      // ✅ FIX: Server already sets isMe: false for recipients.
      // Explicitly force it here too so system messages render correctly.
      setMessages((prev) => [...prev, { ...data, isMe: false }]);
    });

    return () => socket.off('receive-message');
  }, []);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgData = { 
      roomId, 
      username: user.username, 
      message: input, 
      time: new Date() 
    };
    
    socket.emit('send-message', msgData);
    setMessages((prev) => [...prev, { ...msgData, isMe: true }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#111827]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            {msg.isSystem ? (
              <div className="w-full flex justify-center my-2">
                <span className="text-[10px] bg-white/5 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                  {msg.message}
                </span>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-slate-500 mb-1">{msg.username}</span>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                  msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                }`}>
                  {msg.message}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={chatRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-[#0a0f1e]">
        <div className="relative">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500/50 transition-all" 
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}