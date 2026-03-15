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
import { monacoChangeToOp, applyOp, transform } from '../utils/otEngine';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const CURSOR_COLORS = [
  '#f97316', '#a855f7', '#ec4899', '#14b8a6',
  '#eab308', '#06b6d4', '#84cc16', '#f43f5e',
];

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
  javascript: 'javascript', python3: 'python', java: 'java',
  cpp: 'cpp', typescript: 'typescript', rust: 'rust', html: 'html',
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
  const [cursors,        setCursors]        = useState({});

  const codeRef        = useRef(code);
  const languageRef    = useRef(language);
  const hasJoined      = useRef(false);
  const editorRef      = useRef(null);
  const monacoRef      = useRef(null);
  const decorationsRef = useRef({});
  const versionRef     = useRef(0);
  const pendingOps     = useRef([]);
  const applyingRemote = useRef(false);
  const onlineUsersRef = useRef([]);
  const styleTagRef    = useRef(null);

  codeRef.current        = code;
  languageRef.current    = language;
  onlineUsersRef.current = onlineUsers;

  const username = user?.username;

  // ── Cursor styles: thin line + name tag BELOW cursor ─────────────────────
  const injectCursorStyles = useCallback((cursorsMap) => {
    const css = Object.entries(cursorsMap).map(([sid, data]) => {
      const safeId = sid.replace(/[^a-zA-Z0-9]/g, '_');
      const color  = data.color || '#a855f7';
      // Escape username for CSS content
      const name   = (data.username || '').replace(/"/g, '\\"');
      return `
        /* Thin cursor line */
        .cc-cursor-${safeId} {
          border-left: 2px solid ${color} !important;
          margin-left: -1px;
          position: relative;
        }
        /* ✅ Name tag BELOW the cursor line */
        .cc-cursor-${safeId}::after {
          content: "${name}";
          position: absolute;
          top: 18px;
          left: -1px;
          background: ${color};
          color: #fff;
          font-size: 9px;
          font-weight: 600;
          font-family: 'Inter', monospace;
          padding: 0px 5px 1px 5px;
          border-radius: 0 3px 3px 3px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 999;
          line-height: 16px;
          letter-spacing: 0.02em;
        }
      `;
    }).join('\n');

    if (!styleTagRef.current) {
      styleTagRef.current    = document.createElement('style');
      styleTagRef.current.id = 'cc-cursor-styles';
      document.head.appendChild(styleTagRef.current);
    }
    styleTagRef.current.textContent = css;
  }, []);

  const drawCursorDecorations = useCallback((cursorsMap) => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    injectCursorStyles(cursorsMap);

    Object.entries(cursorsMap).forEach(([sid, data]) => {
      const safeId = sid.replace(/[^a-zA-Z0-9]/g, '_');
      const line   = data.lineNumber || 1;
      const col    = data.column     || 1;

      const newDec = [{
        range:   new monaco.Range(line, col, line, col),
        options: {
          // ✅ Use beforeContentClassName so cursor+label hang off the char position
          beforeContentClassName: `cc-cursor-${safeId}`,
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      }];

      const prev = decorationsRef.current[sid] || [];
      decorationsRef.current[sid] = editor.deltaDecorations(prev, newDec);
    });
  }, [injectCursorStyles]);

  const removeCursorDecoration = useCallback((sid) => {
    if (!editorRef.current) return;
    const prev = decorationsRef.current[sid] || [];
    decorationsRef.current[sid] = editorRef.current.deltaDecorations(prev, []);
    delete decorationsRef.current[sid];
  }, []);

  // ── Broadcast output ─────────────────────────────────────────────────────
  const broadcastOutput = useCallback((newOutput, executing = false) => {
    setOutput(newOutput);
    setIsExecuting(executing);
    if (executing) setIsTerminalOpen(true);
    socket.emit('output-update', { roomId, output: newOutput, isExecuting: executing });
  }, [roomId]);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !username) return;

    if (!hasJoined.current) {
      socket.emit('join-room', { roomId, username });
      hasJoined.current = true;
    }

    const handleInitVersion = ({ version }) => {
      versionRef.current = version;
    };

    // ✅ Tighter OT sync: apply op immediately, no setTimeout
    const handleOperation = ({ op, version }) => {
      versionRef.current = version;
      let transformedOp  = op;
      for (const pending of pendingOps.current) {
        transformedOp = transform(transformedOp, pending);
      }
      applyingRemote.current = true;
      const newCode = applyOp(codeRef.current, transformedOp);
      setCode(newCode);
      // Update ref immediately so next op transforms against latest
      codeRef.current        = newCode;
      applyingRemote.current = false;
    };

    const handleOperationAck = ({ version }) => {
      versionRef.current     = version;
      pendingOps.current     = pendingOps.current.slice(1);
    };

    const handleCodeUpdate = (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        setCode(newCode);
      }
    };

    const handleLanguageChange = (newLang) => {
      if (newLang !== languageRef.current) {
        setLanguage(newLang);
        versionRef.current = 0;
        pendingOps.current = [];
        if (codeRef.current === CODE_TEMPLATES[languageRef.current]) {
          setCode(CODE_TEMPLATES[newLang] || '');
        }
      }
    };

    const handleUserList = (list) => setOnlineUsers(list);

    // ✅ Draw cursor immediately on receipt — no state batching delay
    const handleCursorUpdate = ({ socketId, cursor }) => {
      const users  = onlineUsersRef.current;
      const idx    = users.findIndex(u => u.socketId === socketId);
      const color  = CURSOR_COLORS[idx >= 0 ? idx % CURSOR_COLORS.length : 0];
      const uname  = users.find(u => u.socketId === socketId)?.username || '';

      setCursors(prev => {
        const next = { ...prev, [socketId]: { ...cursor, username: uname, color } };
        // Draw cursor inline — no setTimeout to avoid 1-frame lag
        drawCursorDecorations(next);
        return next;
      });
    };

    const handleCursorRemove = ({ socketId }) => {
      removeCursorDecoration(socketId);
      setCursors(prev => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const handleOutputUpdate = ({ output: o, isExecuting: e }) => {
      setOutput(o);
      setIsExecuting(e);
      if (o && o !== 'Running...') setIsTerminalOpen(true);
    };

    socket.off('init-version',    handleInitVersion);
    socket.off('operation',       handleOperation);
    socket.off('operation-ack',   handleOperationAck);
    socket.off('code-update',     handleCodeUpdate);
    socket.off('language-change', handleLanguageChange);
    socket.off('user-list',       handleUserList);
    socket.off('cursor-update',   handleCursorUpdate);
    socket.off('cursor-remove',   handleCursorRemove);
    socket.off('output-update',   handleOutputUpdate);

    socket.on('init-version',    handleInitVersion);
    socket.on('operation',       handleOperation);
    socket.on('operation-ack',   handleOperationAck);
    socket.on('code-update',     handleCodeUpdate);
    socket.on('language-change', handleLanguageChange);
    socket.on('user-list',       handleUserList);
    socket.on('cursor-update',   handleCursorUpdate);
    socket.on('cursor-remove',   handleCursorRemove);
    socket.on('output-update',   handleOutputUpdate);

    return () => {
      socket.off('init-version',    handleInitVersion);
      socket.off('operation',       handleOperation);
      socket.off('operation-ack',   handleOperationAck);
      socket.off('code-update',     handleCodeUpdate);
      socket.off('language-change', handleLanguageChange);
      socket.off('user-list',       handleUserList);
      socket.off('cursor-update',   handleCursorUpdate);
      socket.off('cursor-remove',   handleCursorRemove);
      socket.off('output-update',   handleOutputUpdate);
    };
  }, [roomId, username, drawCursorDecorations, removeCursorDecoration]);

  // ── Monaco mount ──────────────────────────────────────────────────────────
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // ✅ Throttle cursor emit to max once per 50ms to reduce socket noise
    let cursorThrottle = null;
    editor.onDidChangeCursorPosition((e) => {
      if (cursorThrottle) clearTimeout(cursorThrottle);
      cursorThrottle = setTimeout(() => {
        socket.emit('cursor-move', {
          roomId,
          cursor: {
            lineNumber: e.position.lineNumber,
            column:     e.position.column,
          },
        });
      }, 50);
    });
  };

  // ── Code change with OT ───────────────────────────────────────────────────
  const handleCodeChange = useCallback((value, event) => {
    if (applyingRemote.current) return;
    setCode(value);

    if (event?.changes) {
      for (const change of event.changes) {
        const ops    = monacoChangeToOp(change, versionRef.current, username);
        const opList = Array.isArray(ops) ? ops : ops ? [ops] : [];
        for (const op of opList) {
          pendingOps.current.push(op);
          socket.emit('operation', {
            roomId,
            op,
            baseVersion: versionRef.current,
          });
        }
      }
    }
  }, [roomId, username]);

  // ── Language change ───────────────────────────────────────────────────────
  const handleLanguageChange = (e) => {
    const newLang     = e.target.value;
    setLanguage(newLang);
    const newTemplate = CODE_TEMPLATES[newLang] || '';
    setCode(newTemplate);
    setOutput('');
    setHtmlPreview('');
    versionRef.current = 0;
    pendingOps.current = [];
    socket.emit('language-change', { roomId, language: newLang });
    socket.emit('code-change',     { roomId, code: newTemplate });
  };

  // ── Run code ──────────────────────────────────────────────────────────────
  const runCode = async () => {
    if (isExecuting) return;
    if (language === 'html') { setHtmlPreview(code); setIsTerminalOpen(false); return; }

    broadcastOutput('Running...', true);
    try {
      const response = await axios.post(
        `${BACKEND}/api/code/execute`,
        { language, files: [{ content: code }] },
        { timeout: 30000 }
      );
      const { run } = response.data;
      let result;
      if (run.stderr && !run.output)   result = `[stderr]\n${run.stderr}`;
      else if (run.output)             result = run.output;
      else                             result = '(No output)';
      broadcastOutput(result, false);
    } catch (err) {
      let msg;
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK')
        msg = 'Error: Cannot reach server.\nMake sure your backend is running.';
      else if (err.code === 'ECONNABORTED')
        msg = 'Error: Execution timed out.';
      else
        msg = `Error: ${err?.response?.data?.run?.stderr || err?.response?.data?.error || err.message}`;
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
            {onlineUsers.map((u, index) => {
              const color = u.username === username
                ? '#2563eb'
                : CURSOR_COLORS[index % CURSOR_COLORS.length];
              return (
                <div key={u.socketId || index} className="group relative z-10 hover:z-20">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: color }}
                  >
                    {u.username?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1.5 px-2.5 rounded shadow-2xl border border-white/10 z-[100] whitespace-nowrap pointer-events-none">
                    <div className="font-bold" style={{ color }}>
                      {u.username} {u.username === username ? '(You)' : ''}
                    </div>
                    {cursors[u.socketId] && (
                      <div className="text-slate-400 mt-0.5">
                        Line {cursors[u.socketId].lineNumber}, Col {cursors[u.socketId].column}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
              <select value={language} onChange={handleLanguageChange}
                className="bg-white/5 border border-white/10 rounded-md px-4 py-1.5 text-xs font-bold uppercase outline-none cursor-pointer">
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value} className="bg-[#0f172a]">{lang.name}</option>
                ))}
              </select>
              <button onClick={runCode} disabled={isExecuting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-1.5 rounded-md font-bold text-xs uppercase shadow-lg transition-all">
                {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                {isExecuting ? 'Running...' : language === 'html' ? 'Preview' : 'Run Code'}
              </button>
            </div>
            {language !== 'html' && (
              <button onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isTerminalOpen ? 'text-blue-400' : 'text-slate-500'}`}>
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
              onMount={handleEditorDidMount}
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
              <motion.div initial={{ height: 0 }} animate={{ height: 300 }} exit={{ height: 0 }}
                className="border-t border-white/10 bg-white overflow-hidden shrink-0">
                <iframe srcDoc={htmlPreview} title="HTML Preview"
                  className="w-full h-full border-0" sandbox="allow-scripts" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* TERMINAL */}
          <AnimatePresence>
            {isTerminalOpen && language !== 'html' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 260 }} exit={{ height: 0 }}
                className="border-t border-white/10 bg-[#020617] overflow-hidden shrink-0">
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