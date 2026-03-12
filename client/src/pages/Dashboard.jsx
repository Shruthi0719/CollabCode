import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Code2, LogOut, Rocket, Hash, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) navigate(`/room/${roomId.trim()}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] bg-gradient-to-b from-[#020617] to-[#0f172a] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-brand-gradient p-2 rounded-lg shadow-lg shadow-blue-500/10 transition-transform group-hover:rotate-12">
            <Rocket size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-['Inter']">CollabCode</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="flex items-center justify-center bg-purple-500/20 w-7 h-7 rounded-full text-xs">
              👤
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Developer</span>
              <span className="text-xs font-semibold text-white leading-none">
                {user?.username} <span className="ml-1">✨</span>
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all group"
            title="Sign Out"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-20">
        {/* Professional Header Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <Terminal size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400/80">Console</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-3 font-['Inter'] tracking-tight"
          >
            Workspace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm max-w-lg leading-relaxed"
          >
            Create a new collaborative coding session or join an existing one to start building with your team.
          </motion.p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Create */}
          <motion.div whileHover={{ y: -6 }}>
            <GlassCard className="p-10 h-full flex flex-col justify-between border-white/5 hover:border-blue-500/30 transition-colors shadow-2xl">
              <div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 shadow-inner">
                  <Plus size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Create Workspace</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  Start a new real-time collaborative coding room with a unique environment.
                </p>
              </div>
              <GradientButton onClick={handleCreateRoom} className="w-full py-4 font-bold tracking-wide text-sm">
                Initialize Session
              </GradientButton>
            </GlassCard>
          </motion.div>

          {/* Card 2: Join */}
          <motion.div whileHover={{ y: -6 }}>
            <GlassCard className="p-10 h-full flex flex-col justify-between border-white/5 hover:border-purple-500/30 transition-colors shadow-2xl">
              <div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 shadow-inner">
                  <Code2 size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Join Workspace</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Access an existing session by providing the shared room identifier.
                </p>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={14} />
                  <input 
                    type="text" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="session-id" 
                    className="w-full bg-white/5 border border-white/10 p-3.5 pl-10 rounded-xl outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all font-mono text-sm text-purple-300" 
                  />
                </div>
              </div>
              <button 
                onClick={handleJoinRoom}
                className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Join Session
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}