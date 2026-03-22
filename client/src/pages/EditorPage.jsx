/**
 * EditorPage.jsx
 *
 * All socket / OT / editor logic is IDENTICAL to the original.
 * Only the visual shell (navbar, toolbar, layout) has been redesigned.
 *
 * Design System:
 *   #080a0f bg · #00E5FF accent · Bebas Neue + DM Mono + Outfit
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Loader2, LogOut, Copy, Check, Terminal as TerminalIcon, ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import ChatBox from '../components/ChatBox';
import Terminal from '../components/Terminal';
import { LANGUAGES } from '../constants/languages';
import { monacoChangeToOp, applyOp, transform } from '../utils/otEngine';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const C = {
  bg:      '#080a0f',
  nav:     '#0a0c12',
  card:    '#0e1118',
  border:  'rgba(255,255,255,0.07)',
  accent:  '#00E5FF',
  text:    '#ffffff',
  muted:   'rgba(255,255,255,0.45)',
  faint:   'rgba(255,255,255,0.04)',
};

const CURSOR_COLORS = [
  '#00E5FF', '#a855f7', '#ec4899', '#14b8a6',
  '#eab308', '#f97316', '#84cc16', '#f43f5e',
];

const CODE_TEMPLATES = {
  javascript: `console.log("Hello from JavaScript!");`,
  python3:    `print("Hello from Python!")`,
  java: `class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}`,
  typescript: `const greet = (name: string): string => {\n    return \`Hello from TypeScript, \${name}!\`;\n};\nconsole.log(greet("CollabCode"));`,
  rust: `fn main() {\n    println!("Hello from Rust!");\n}`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>CollabCode</title>\n</head>\n<body>\n  <h1>Hello from HTML!</h1>\n</body>\n</html>`,
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
  const [isChatOpen,     setIsChatOpen]     = useState(true);
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

  const injectCursorStyles = useCallback((cursorsMap) => {
    const css = Object.entries(cursorsMap).map(([sid, data]) => {
      const safeId = sid.replace(/[^a-zA-Z0-9]/g, '_');
      const color  = data.color || '#a855f7';
      const name   = (data.username || '').replace(/"/g, '\\"');
      return `
        .cc-cursor-${safeId} { border-left: 2px solid ${color} !important; margin-left: -1px; position: relative; }
        .cc-cursor-${safeId}::after {
          content: "${name}"; position: absolute; top: 18px; left: -1px;
          background: ${color}; color: #fff; font-size: 9px; font-weight: 600;
          font-family: 'DM Mono', monospace; padding: 0px 5px 1px 5px;
          border-radius: 0 3px 3px 3px; white-space: nowrap; pointer-events: none;
          z-index: 999; line-height: 16px; letter-spacing: 0.02em;
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
      const newDec = [{ range: new monaco.Range(line, col, line, col), options: { beforeContentClassName: `cc-cursor-${safeId}`, stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges } }];
      const prev   = decorationsRef.current[sid] || [];
      decorationsRef.current[sid] = editor.deltaDecorations(prev, newDec);
    });
  }, [injectCursorStyles]);

  const removeCursorDecoration = useCallback((sid) => {
    if (!editorRef.current) return;
    const prev = decorationsRef.current[sid] || [];
    decorationsRef.current[sid] = editorRef.current.deltaDecorations(prev, []);
    delete decorationsRef.current[sid];
  }, []);

  const broadcastOutput = useCallback((newOutput, executing = false) => {
    setOutput(newOutput);
    setIsExecuting(executing);
    if (executing) setIsTerminalOpen(true);
    socket.emit('output-update', { roomId, output: newOutput, isExecuting: executing });
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !username) return;
    if (!hasJoined.current) { socket.emit('join-room', { roomId, username }); hasJoined.current = true; }

    const handleInitVersion    = ({ version }) => { versionRef.current = version; };
    const handleOperation = ({ op, version }) => {
      versionRef.current = version;
      let transformedOp = op;
      for (const pending of pendingOps.current) transformedOp = transform(transformedOp, pending);

      // Apply directly to Monaco model to avoid full re-render + cursor reset
      if (editorRef.current && monacoRef.current) {
        const model  = editorRef.current.getModel();
        const monaco = monacoRef.current;
        if (model) {
          applyingRemote.current = true;
          if (transformedOp.type === 'insert') {
            const pos   = model.getPositionAt(transformedOp.position);
            const range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
            model.applyEdits([{ range, text: transformedOp.text, forceMoveMarkers: true }]);
          } else if (transformedOp.type === 'delete') {
            const startPos = model.getPositionAt(transformedOp.position);
            const endPos   = model.getPositionAt(transformedOp.position + transformedOp.length);
            const range    = new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);
            model.applyEdits([{ range, text: '', forceMoveMarkers: true }]);
          }
          codeRef.current        = model.getValue();
          applyingRemote.current = false;
          return; // skip setCode — model is already updated
        }
      }

      // Fallback if editor not mounted yet
      applyingRemote.current = true;
      const newCode = applyOp(codeRef.current, transformedOp);
      setCode(newCode); codeRef.current = newCode; applyingRemote.current = false;
    };
    const handleOperationAck   = ({ version }) => { versionRef.current = version; pendingOps.current = pendingOps.current.slice(1); };
    const handleCodeUpdate = (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model && model.getValue() !== newCode) {
            applyingRemote.current = true;
            model.setValue(newCode);
            applyingRemote.current = false;
          }
        } else {
          setCode(newCode);
        }
      }
    };
    const handleLanguageChange = (newLang) => {
      if (newLang !== languageRef.current) {
        setLanguage(newLang); versionRef.current = 0; pendingOps.current = [];
        if (codeRef.current === CODE_TEMPLATES[languageRef.current]) setCode(CODE_TEMPLATES[newLang] || '');
      }
    };
    const handleUserList = (list) => setOnlineUsers(list);
    const handleCursorUpdate = ({ socketId, cursor }) => {
      const users = onlineUsersRef.current;
      const idx   = users.findIndex(u => u.socketId === socketId);
      const color = CURSOR_COLORS[idx >= 0 ? idx % CURSOR_COLORS.length : 0];
      const uname = users.find(u => u.socketId === socketId)?.username || '';
      setCursors(prev => {
        const next = { ...prev, [socketId]: { ...cursor, username: uname, color } };
        drawCursorDecorations(next);
        return next;
      });
    };
    const handleCursorRemove = ({ socketId }) => {
      removeCursorDecoration(socketId);
      setCursors(prev => { const next = { ...prev }; delete next[socketId]; return next; });
    };
    const handleOutputUpdate = ({ output: o, isExecuting: e }) => {
      setOutput(o); setIsExecuting(e);
      if (o && o !== 'Running...') setIsTerminalOpen(true);
    };

    const events = [
      ['init-version', handleInitVersion], ['operation', handleOperation],
      ['operation-ack', handleOperationAck], ['code-update', handleCodeUpdate],
      ['language-change', handleLanguageChange], ['user-list', handleUserList],
      ['cursor-update', handleCursorUpdate], ['cursor-remove', handleCursorRemove],
      ['output-update', handleOutputUpdate],
    ];
    events.forEach(([e, h]) => { socket.off(e, h); socket.on(e, h); });
    return () => events.forEach(([e, h]) => socket.off(e, h));
  }, [roomId, username, drawCursorDecorations, removeCursorDecoration]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor; monacoRef.current = monaco;
    let cursorThrottle = null;
    editor.onDidChangeCursorPosition((e) => {
      if (cursorThrottle) clearTimeout(cursorThrottle);
      cursorThrottle = setTimeout(() => {
        socket.emit('cursor-move', { roomId, cursor: { lineNumber: e.position.lineNumber, column: e.position.column } });
      }, 50);
    });
  };

  const handleCodeChange = useCallback((value, event) => {
    if (applyingRemote.current) return;
    // Use model value as source of truth
    const currentCode = editorRef.current?.getModel()?.getValue() ?? value;
    setCode(currentCode);
    codeRef.current = currentCode;

    if (event?.changes) {
      for (const change of event.changes) {
        const ops    = monacoChangeToOp(change, versionRef.current, username);
        const opList = Array.isArray(ops) ? ops : ops ? [ops] : [];
        for (const op of opList) {
          pendingOps.current.push(op);
          socket.emit('operation', { roomId, op, baseVersion: versionRef.current });
        }
      }
    }
  }, [roomId, username]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newTemplate = CODE_TEMPLATES[newLang] || '';
    setCode(newTemplate); setOutput(''); setHtmlPreview('');
    versionRef.current = 0; pendingOps.current = [];
    socket.emit('language-change', { roomId, language: newLang });
    socket.emit('code-change', { roomId, code: newTemplate });
  };

  const runCode = async () => {
    if (isExecuting) return;
    if (language === 'html') { setHtmlPreview(code); setIsTerminalOpen(false); return; }
    broadcastOutput('Running...', true);
    try {
      const response = await axios.post(`${BACKEND}/api/code/execute`, { language, files: [{ content: code }] }, { timeout: 30000 });
      const { run } = response.data;
      const result  = (run.stderr && !run.output) ? `[stderr]\n${run.stderr}` : run.output || '(No output)';
      broadcastOutput(result, false);
    } catch (err) {
      let msg;
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') msg = 'Error: Cannot reach server.';
      else if (err.code === 'ECONNABORTED') msg = 'Error: Execution timed out.';
      else msg = `Error: ${err?.response?.data?.run?.stderr || err?.response?.data?.error || err.message}`;
      broadcastOutput(msg, false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav style={{
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: `1px solid ${C.border}`,
        background: C.nav,
        zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TerminalIcon size={16} color={C.bg} strokeWidth={2.5} />
          </div>

          {/* Room badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: C.faint, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '6px 14px',
          }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Room
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.accent, fontWeight: 500, letterSpacing: '0.05em' }}>
              {roomId}
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* User avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {onlineUsers.map((u, index) => {
                const color = u.username === username ? C.accent : CURSOR_COLORS[index % CURSOR_COLORS.length];
                return (
                  <div key={u.socketId || index} style={{ position: 'relative', marginLeft: index > 0 ? -8 : 0, zIndex: 10 - index }}>
                    <div
                      title={u.username}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: `2px solid ${C.nav}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: C.bg,
                        background: color, cursor: 'pointer',
                      }}
                    >
                      {u.username?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>

            {onlineUsers.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-flex', position: 'relative', width: 8, height: 8 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#4ade80', opacity: 0.6, animation: 'ping 1.2s infinite' }} />
                  <span style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: '#4ade80', display: 'block' }} />
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {onlineUsers.length} online
                </span>
              </div>
            )}
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 9,
              background: isChatOpen ? 'rgba(0,229,255,0.1)' : C.faint,
              border: `1px solid ${isChatOpen ? C.accent + '50' : C.border}`,
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              color: isChatOpen ? C.accent : C.muted, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <MessageSquare size={13} />
            Chat
          </button>

          {/* Copy ID */}
          <button
            onClick={copyRoomId}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 9,
              background: C.faint, border: `1px solid ${C.border}`,
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              color: copied ? '#4ade80' : C.muted, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>

          {/* Leave */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '7px 14px', borderRadius: 9,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* ── WORKSPACE ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Editor column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{
            height: 48, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: `1px solid ${C.border}`,
            background: C.card,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Language selector */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value)}
                  style={{
                    appearance: 'none', background: C.faint, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '6px 32px 6px 12px',
                    fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text,
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value} style={{ background: '#0e1118' }}>{l.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} style={{ position: 'absolute', right: 10, color: C.muted, pointerEvents: 'none' }} />
              </div>

              {/* Run button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={runCode}
                disabled={isExecuting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 18px', borderRadius: 8, border: 'none', cursor: isExecuting ? 'not-allowed' : 'pointer',
                  background: isExecuting ? 'rgba(74,222,128,0.4)' : '#4ade80',
                  color: '#080a0f',
                  fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                  opacity: isExecuting ? 0.7 : 1,
                  boxShadow: isExecuting ? 'none' : '0 0 14px rgba(74,222,128,0.25)',
                }}
              >
                {isExecuting
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Play size={13} fill="currentColor" />
                }
                {isExecuting ? 'Running…' : language === 'html' ? 'Preview' : 'Run'}
              </motion.button>
            </div>

            {/* Console toggle */}
            {language !== 'html' && (
              <button
                onClick={() => setIsTerminalOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em',
                  color: isTerminalOpen ? C.accent : C.muted, transition: 'color 0.15s',
                }}
              >
                <TerminalIcon size={13} /> CONSOLE
              </button>
            )}
          </div>

          {/* Monaco */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={MONACO_LANG[language] || language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, fontFamily: "'DM Mono', monospace", fontLigatures: true }}
            />
          </div>

          {/* HTML preview */}
          <AnimatePresence>
            {htmlPreview && language === 'html' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 280 }} exit={{ height: 0 }}
                style={{ borderTop: `1px solid ${C.border}`, background: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                <iframe srcDoc={htmlPreview} title="HTML Preview" style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal */}
          <AnimatePresence>
            {isTerminalOpen && language !== 'html' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 240 }} exit={{ height: 0 }}
                style={{ borderTop: `1px solid ${C.border}`, background: '#050709', overflow: 'hidden', flexShrink: 0 }}>
                <Terminal output={output} clearOutput={() => setOutput('')} isExecuting={isExecuting} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                flexShrink: 0, overflow: 'hidden',
                borderLeft: `1px solid ${C.border}`,
                background: C.card,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <ChatBox roomId={roomId} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
