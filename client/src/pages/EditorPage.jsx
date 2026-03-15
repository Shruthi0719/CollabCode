import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Loader2, LogOut, Copy, Check, Terminal as TerminalIcon, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import ChatBox from '../components/ChatBox';
import Terminal from '../components/Terminal';
import { LANGUAGES } from '../constants/languages';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const CODE_TEMPLATES = {
  javascript: `console.log("Hello from JavaScript!");`,
  python3:    `print("Hello from Python!")`,
  java: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,
  typescript: `const greet = (name: string): string => {
    return \`Hello from TypeScript, \${name}!\`;
};

console.log(greet("CollabCode"));`,
  rust: `fn main() {
    println!("Hello from Rust!");
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CollabCode</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #e2e8f0;
           display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { color: #60a5fa; }
  </style>
</head>
<body>
  <h1>Hello from HTML!</h1>
</body>
</html>`,
};

const MONACO_LANG = {
  javascript: 'javascript',
  python3:    'python',
  java:       'java',
  cpp:        'cpp',
  typescript: 'typescript',
  rust:       'rust',
  html:       'html',
};

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [language,       setLanguage]       = useState('javascript');
  const [code,           setCode]           = useState(CODE_TEMPLATES.javascript);
  const [output,         setOutput]         = useState('');
  const [isExecuting,    setIsExecuting]    = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [onlineUsers,    setOnlineUsers]    = useState([]);
  const [htmlPreview,    setHtmlPreview]    = useState('');

  const codeRef     = useRef(code);
  const languageRef = useRef(language);
  const hasJoined   = useRef(false);

  codeRef.current     = code;
  languageRef.current = language;

  const username = user?.username;

  // ✅ Helper — updates output locally AND broadcasts to all room users
  const broadcastOutput = useCallback((newOutput, executing = false) => {
    setOutput(newOutput);
    setIsExecuting(executing);
    if (executing) setIsTerminalOpen(true);
    socket.emit('output-update', {
      roomId,
      output:      newOutput,
      isExecuting: executing,
    });
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !username) return;

    if (!hasJoined.current) {
      socket.emit('join-room', { roomId, username });
      hasJoined.current = true;
    }

    const handleCodeUpdate = (newCode) => {
      if (newCode !== codeRef.current) setCode(newCode);
    };

    const handleLanguageChange = (newLang) => {
      if (newLang !== languageRef.current) {
        setLanguage(newLang);
        if (codeRef.current === CODE_TEMPLATES[languageRef.current]) {
          setCode(CODE_TEMPLATES[newLang] || '');
        }
      }
    };

    const handleUserList = (list) => setOnlineUsers(list);

    // ✅ Receive output broadcast from another user who ran code
    const handleOutputUpdate = ({ output: remoteOutput, isExecuting: remoteExecuting }) => {
      setOutput(remoteOutput);
      setIsExecuting(remoteExecuting);
      if (remoteOutput && remoteOutput !== 'Running...') {
        setIsTerminalOpen(true);
      }
    };

    socket.off('code-update',     handleCodeUpdate);
    socket.off('language-change', handleLanguageChange);
    socket.off('user-list',       handleUserList);
    socket.off('output-update',   handleOutputUpdate);

    socket.on('code-update',     handleCodeUpdate);
    socket.on('language-change', handleLanguageChange);
    socket.on('user-list',       handleUserList);
    socket.on('output-update',   handleOutputUpdate);

    return () => {
      socket.off('code-update',     handleCodeUpdate);
      socket.off('language-change', handleLanguageChange);
      socket.off('user-list',       handleUserList);
      socket.off('output-update',   handleOutputUpdate);
    };
  }, [roomId, username]);

  const handleCodeChange = useCallback((value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  }, [roomId]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const newTemplate = CODE_TEMPLATES[newLang] || '';
    setCode(newTemplate);
    setOutput('');
    setHtmlPreview('');
    socket.emit('language-change', { roomId, language: newLang });
    socket.emit('code-change',     { roomId, code: newTemplate });
  };

  const runCode = async () => {
    if (isExecuting) return;

    if (language === 'html') {
      setHtmlPreview(code);
      setIsTerminalOpen(false);
      return;
    }

    // ✅ Broadcast "Running..." state to all users immediately
    broadcastOutput('Running...', true);

    try {
      const response = await axios.post(
        `${BACKEND}/api/code/execute`,
        { language, files: [{ content: code }] },
        { timeout: 30000 }
      );

      const { run } = response.data;
      let result;
      if (run.stderr && !run.output) {
        result = `[stderr]\n${run.stderr}`;
      } else if (run.output) {
        result = run.output;
      } else {
        result = '(No output)';
      }

      // ✅ Broadcast final result to all users
      broadcastOutput(result, false);

    } catch (err) {
      let msg;
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        msg = 'Error: Cannot reach server.\nMake sure your backend is running.';
      } else if (err.code === 'ECONNABORTED') {
        msg = 'Error: Execution timed out.\nYour code may contain an infinite loop.';
      } else {
        msg = `Error: ${err?.response?.data?.run?.stderr || err?.response?.data?.error || err.message}`;
      }
      broadcastOutput(msg, false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-300 font-['Inter']">

      {/* NAVBAR */}
      <nav className="h-14 border-b border-white/5 bg-[#0a0f1e] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Rocket size={18} className="text-white" />
          </div>
          <div className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 flex gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room</span>
            <span className="text-sm font-mono font-bold text-blue-400 uppercase">{roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-4">
            {onlineUsers.map((u, index) => (
              <div key={u.socketId || index} className="group relative z-10 hover:z-20">
                <div className={`w-9 h-9 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110 cursor-pointer ${
                  u.username === username ? 'bg-blue-600' : 'bg-indigo-500'
                }`}>
                  {u.username?.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-2xl border border-white/10 z-[100] whitespace-nowrap pointer-events-none">
                  {u.username} {u.username === username ? '(You)' : ''}
                </div>
              </div>
            ))}
            {onlineUsers.length > 0 && (
              <div className="ml-4 flex items-center">
                <span className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {onlineUsers.length} Online
                </span>
              </div>
            )}
          </div>

          <button onClick={copyRoomId} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg border border-red-500/20">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">

          {/* TOOLBAR */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-white/5 border border-white/10 rounded-md px-4 py-1.5 text-xs font-bold uppercase outline-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value} className="bg-[#0f172a]">
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={runCode}
                disabled={isExecuting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-1.5 rounded-md font-bold text-xs uppercase shadow-lg transition-all"
              >
                {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                {isExecuting ? 'Running...' : language === 'html' ? 'Preview' : 'Run Code'}
              </button>
            </div>
            {language !== 'html' && (
              <button
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isTerminalOpen ? 'text-blue-400' : 'text-slate-500'}`}
              >
                <TerminalIcon size={16} /> Console
              </button>
            )}
          </div>

          {/* EDITOR */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={MONACO_LANG[language] || language}
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* HTML PREVIEW */}
          <AnimatePresence>
            {htmlPreview && language === 'html' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 300 }}
                exit={{ height: 0 }}
                className="border-t border-white/10 bg-white overflow-hidden shrink-0"
              >
                <iframe
                  srcDoc={htmlPreview}
                  title="HTML Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* TERMINAL */}
          <AnimatePresence>
            {isTerminalOpen && language !== 'html' && (
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

        <aside className="w-80 bg-[#111827] border-l border-white/5 flex flex-col">
          <ChatBox roomId={roomId} />
        </aside>
      </div>
    </div>
  );
}