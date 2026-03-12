import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Play, Loader2, LogOut, Copy, Check, 
  MessageSquare, Terminal as TerminalIcon, 
  ChevronDown, Rocket 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import ChatBox from '../components/ChatBox';
import Terminal from '../components/Terminal';
import { LANGUAGES } from '../constants/languages';

const socket = io('http://localhost:4000', { transports: ['websocket'] });

const CODE_TEMPLATES = {
  javascript: 'console.log("Hello from Javascript!");',
  python: 'print("Hello from Python!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
};

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !user) return;

    socket.emit('join-room', { roomId, username: user.username });

    // Force clear old listeners
    socket.off('user-list');
    socket.off('code-update');
    socket.off('language-change');

    socket.on('user-list', (userList) => setOnlineUsers(userList));
    socket.on('code-update', (newCode) => setCode(newCode));
    socket.on('language-change', (newLang) => setLanguage(newLang));

    return () => {
      socket.off('user-list');
      socket.off('code-update');
      socket.off('language-change');
    };
  }, [roomId, user]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  const runCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setOutput("Executing...");
    try {
      const langMap = { javascript: 'javascript', python: 'python3', java: 'java', cpp: 'cpp' };
      const response = await axios.post('http://localhost:4000/api/code/execute', {
        language: langMap[language] || language,
        version: "*",
        files: [{ content: code }]
      });
      setOutput(response.data.run.output || response.data.run.stderr || "Done.");
    } catch (err) {
      setOutput("Error: Backend bridge failed.");
    } finally { setIsExecuting(false); }
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-300 font-['Inter']">
      <nav className="h-14 border-b border-white/5 bg-[#0a0f1e] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gradient p-1.5 rounded-lg shadow-lg"><Rocket size={18} className="text-white" /></div>
          <div className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 flex gap-3">
             <span className="text-[10px] font-bold text-slate-500 uppercase">Room</span>
             <span className="text-sm font-mono font-bold text-blue-400 uppercase tracking-widest">{roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* UNIQUE AVATAR RENDERING */}
          <div className="flex -space-x-2 mr-2">
            {Array.from(new Set(onlineUsers.map(u => u.username))).map((uName) => (
              <div key={uName} className="group relative">
                <div className={`w-8 h-8 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-all hover:scale-110 ${uName === user?.username ? 'bg-blue-600' : 'bg-indigo-500'}`}>
                  {uName?.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-3 rounded shadow-2xl border border-white/10 z-[100] whitespace-nowrap">
                  {uName} {uName === user?.username ? '(You)' : ''}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg border border-red-500/20"><LogOut size={18} /></button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <select value={language} onChange={(e) => {
                const l = e.target.value; setLanguage(l); setCode(CODE_TEMPLATES[l]);
                socket.emit('language-change', { roomId, language: l });
                socket.emit('code-change', { roomId, code: CODE_TEMPLATES[l] });
              }} className="bg-white/5 border border-white/10 rounded-md px-4 py-1.5 text-xs font-bold uppercase cursor-pointer pr-8 outline-none">
                {LANGUAGES.map(lang => <option key={lang.value} value={lang.value} className="bg-[#0f172a]">{lang.name}</option>)}
              </select>
              <button onClick={runCode} disabled={isExecuting} className="bg-green-600 hover:bg-green-500 text-white px-6 py-1.5 rounded-md font-bold text-xs uppercase shadow-lg shadow-green-500/10 transition-all">
                {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />} Run
              </button>
            </div>
            <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className={`text-xs font-bold uppercase ${isTerminalOpen ? 'text-blue-400' : 'text-slate-500'}`}><TerminalIcon size={16} /></button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <Editor height="100%" theme="vs-dark" language={language} value={code} onChange={handleCodeChange} options={{ fontSize: 16, lineHeight: 26, minimap: { enabled: false }, padding: { top: 1 }, fontFamily: "'Fira Code', monospace", automaticLayout: true, scrollBeyondLastLine: false }} />
          </div>
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 260 }} exit={{ height: 0 }} className="border-t border-white/10 bg-[#020617] overflow-hidden shrink-0">
                <Terminal output={output} clearOutput={() => setOutput('')} isExecuting={isExecuting} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <aside className="w-80 bg-[#111827] border-l border-white/5 hidden lg:flex flex-col shadow-2xl">
          <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3 bg-slate-900/20"><MessageSquare size={16} className="text-blue-400" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Team Chat</span></div>
          <div className="flex-1 overflow-hidden"><ChatBox roomId={roomId} /></div>
        </aside>
      </div>
    </div>
  );
}