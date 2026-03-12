import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Code2, Users, Copy, LogOut, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import { LANGUAGES } from '../constants/languages';

const socket = io('http://localhost:4000');

export default function EditorPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Start coding together...');

    useEffect(() => {
        socket.emit('join-room', roomId);

        // Listen for language changes from others
        socket.on('language-change', (newLang) => {
            setLanguage(newLang);
        });

        // Listen for code changes
        socket.on('code-update', (newCode) => {
            setCode(newCode);
        });

        return () => socket.off();
    }, [roomId]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        socket.emit('language-change', { roomId, language: newLang });
    };

    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit('code-change', { roomId, code: value });
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert("Room ID Copied!");
    };

    return (
        <div className="h-screen flex flex-col bg-[#020617] text-white">
            {/* Premium Header */}
            <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-gradient p-1.5 rounded-lg">
                        <Code2 size={20} />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Language</span>
                        <select 
                            value={language} 
                            onChange={handleLanguageChange}
                            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value} className="bg-slate-900">{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={copyRoomId} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm transition-all">
                        <Copy size={16} /> <span className="hidden md:inline">ID: {roomId}</span>
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm transition-all border border-red-500/20">
                        <LogOut size={16} /> Leave
                    </button>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Container */}
                <main className="flex-1 relative">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            padding: { top: 20 },
                            fontFamily: "'Fira Code', monospace",
                            cursorSmoothCaretAnimation: true,
                        }}
                    />
                </main>
            </div>
        </div>
    );
}