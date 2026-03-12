import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Code2, Play, Loader2, LogOut, Copy, Check, 
  MessageSquare, Terminal as TerminalIcon, 
  Share2, ChevronDown, Rocket 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';

import ChatBox from '../components/ChatBox';
import Terminal from '../components/Terminal';
import { LANGUAGES } from '../constants/languages';

const socket = io('http://localhost:4000');

const CODE_TEMPLATES = {
  javascript: 'console.log("Hello from Javascript!");',
  python: 'print("Hello from Python!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
};

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Users with hover names
  const [connectedUsers, setConnectedUsers] = useState([
    { initials: 'SY', name: 'Shruthi Yadav' },
    { initials: 'JD', name: 'John Doe' }
  ]);

  useEffect(() => {
    socket.emit('join-room', roomId);
    socket.on('language-change', (newLang) => setLanguage(newLang));
    socket.on('code-update', (newCode) => setCode(newCode));
    return () => socket.off();
  }, [roomId]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const newTemplate = CODE_TEMPLATES[newLang] || '';
    setCode(newTemplate);
    socket.emit('language-change', { roomId, language: newLang });
    socket.emit('code-change', { roomId, code: newTemplate });
  };

const runCode = async () => {
  if (isExecuting) return;
  setIsExecuting(true);
  setOutput("Compiling and executing...");
  
  try {
    const langMap = { javascript: 'javascript', python: 'python3', java: 'java', cpp: 'cpp' };
    
    // We use NATIVE FETCH here to ensure NO extra headers or cookies are sent
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langMap[language] || language,
        version: "*",
        files: [{ content: code }]
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    const result = data.run;
    setOutput(result.output || result.stderr || "Success (no output).");
  } catch (err) {
    console.error("Run Error:", err);
    setOutput(`Error: ${err.message}. Please try again or check your connection.`);
  } finally {
    setIsExecuting(false);
  }
};

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-300 font-['Inter']">
      {/* Navbar */}
      <nav className="h-14 border-b border-white/5 bg-[#0a0f1e] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gradient p-1.5 rounded-lg shadow-lg">
            <Rocket size={18} className="text-white" />
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-lg border border-white/10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Room</span>
            <span className="text-sm font-mono font-bold text-blue-400 tracking-widest uppercase leading-none">{roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AVATARS WITH TOOLTIPS */}
          <div className="flex -space-x-2 mr-2">
            {connectedUsers.map((u, i) => (
              <div 
                key={i} 
                className="group relative w-8 h-8 rounded-full border-2 border-[#0a0f1e] bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg cursor-default"
              >
                {u.initials}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-2xl whitespace-nowrap border border-white/10 z-[100]">
                  {u.name}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy ID"}
          </button>
          
          <button onClick={() => navigate('/dashboard')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg border border-red-500/20 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
          {/* Sub-Header Controls */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <select value={language} onChange={handleLanguageChange} className="appearance-none bg-white/5 border border-white/10 rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer pr-10">
                  {LANGUAGES.map(lang => <option key={lang.value} value={lang.value} className="bg-[#0f172a]">{lang.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
              <button onClick={runCode} disabled={isExecuting} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-1.5 rounded-md font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-500/10">
                {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                Run Code
              </button>
            </div>
            <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isTerminalOpen ? 'text-blue-400' : 'text-slate-500'}`}>
              <TerminalIcon size={16} /> Console
            </button>
          </div>

          {/* Editor - Set padding top to 0/1 to start at very top */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => { setCode(val); socket.emit('code-change', { roomId, code: val }); }}
              options={{
                fontSize: 16,
                lineHeight: 24,
                minimap: { enabled: false },
                padding: { top: 1 },
                fontFamily: "'Fira Code', monospace",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                cursorSmoothCaretAnimation: true,
              }}
            />
          </div>

          {/* Terminal Animation */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 260 }} 
                exit={{ height: 0 }} 
                className="border-t border-white/10 bg-[#020617] overflow-hidden shrink-0"
              >
                <Terminal output={output} clearOutput={() => setOutput('')} isExecuting={isExecuting} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-[#111827] border-l border-white/5 hidden lg:flex flex-col shadow-2xl">
          <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3 bg-slate-900/20">
            <MessageSquare size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 leading-none">Collaborators Chat</span>
          </div>
          <div className="flex-1 overflow-hidden">
             <ChatBox roomId={roomId} />
          </div>
        </aside>
      </div>
    </div>
  );
}