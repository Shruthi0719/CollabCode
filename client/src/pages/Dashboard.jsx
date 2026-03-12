import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Code2, LogOut, Rocket, Hash, Terminal, 
  LayoutGrid, Clock, User, Settings, Camera, Save, X, ChevronRight,
  Search, Bell, Sparkles, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Workspace States
  const [roomId, setRoomId] = useState('');
  
  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || 'shruthii18',
    bio: user?.bio || 'Full-stack Developer | Open Source Contributor'
  });

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/30 font-['Inter']">
      
      {/* SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-[#030816] flex flex-col items-center py-8 z-50">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 mb-10 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <Rocket size={20} className="text-white" />
        </div>
        
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <LayoutGrid size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'projects' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <Code2 size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <User size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <Clock size={22} />
          </button>
        </nav>

        <button 
          onClick={logout}
          className="mt-auto p-3 text-slate-600 hover:text-red-500 transition-colors group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-8 lg:p-12">
        
        {/* Top Utility Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400" size={16} />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-6 text-sm outline-none focus:border-blue-500/50 w-64 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white/5 border border-white/10 rounded-full text-slate-500 hover:text-white transition-all">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
              <span className="text-xs font-bold text-white uppercase tracking-tight">{user?.username}</span>
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                {user?.username?.substring(0,1).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Switcher */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Workspace Dashboard</h1>
                  <p className="text-slate-500 text-sm">Review your collaborative history and manage active sessions.</p>
                </div>
                <GradientButton onClick={handleCreateRoom} className="px-6 py-2.5 text-sm font-bold shadow-lg shadow-blue-500/10">
                  <Plus size={18} className="mr-2 inline" /> New Session
                </GradientButton>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ELITE DARK PROFILE CARD - REBUILT & LAYERED
                  Matches: image_6.png (refinement)
                */}
                <div className="lg:col-span-4">
                  <motion.div 
                    layout 
                    className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group"
                  >
                    {/* Layer 1: Premium Gradient Header (60% opacity) */}
                    <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-60 relative">
                       {/* Subtle inner shadow where header meets body */}
                       <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
                    </div>

                    <div className="px-10 pb-10 -mt-10 relative">
                      {/* Layer 2: Glassmorphic Avatar - Semi-transparent Dark Glass */}
                      <div className="relative inline-block mb-6 z-10">
                        <div className="w-20 h-20 rounded-2xl bg-[#030816]/60 backdrop-blur-xl flex items-center justify-center text-3xl font-extrabold text-blue-400 shadow-xl border border-white/10 shadow-[inset_0_4px_10px_rgba(255,255,255,0.05)]">
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                        {isEditing && (
                           <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-lg border-2 border-[#0a0f1e] text-white">
                              <Camera size={12} />
                           </button>
                        )}
                      </div>
                      
                      {/* View / Edit State Transition */}
                      <AnimatePresence mode="wait">
                         {!isEditing ? (
                           <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                              <div>
                                 {/* Bolded Typography */}
                                 <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                    {formData.username}
                                    <Sparkles size={16} className="text-blue-500 opacity-70" />
                                 </h2>
                                 <p className="text-slate-500 text-xs mt-1">{user?.email}</p>
                              </div>

                              {/* Bio Text with refined slate colors */}
                              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                 {formData.bio}
                              </p>

                              {/* Premium Profile Settings Button - with 1px border and glow on hover */}
                              <button 
                                 onClick={() => setIsEditing(true)} 
                                 className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-100 border border-white/10 transition-all flex items-center justify-center gap-2.5 shadow-inner hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/20"
                              >
                                 <Settings size={16} /> Profile Settings
                              </button>
                           </motion.div>
                         ) : (
                           // Edit Mode Form...
                           <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
                              <input 
                                 value={formData.username} 
                                 onChange={(e) => setFormData({...formData, username: e.target.value})}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50"
                                 placeholder="Username"
                              />
                              <textarea 
                                 value={formData.bio} 
                                 onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 resize-none"
                                 placeholder="Bio"
                                 rows="3"
                              />
                              <div className="flex gap-2.5 pt-2">
                                 <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                                    <Save size={14} /> Save Changes
                                 </button>
                                 <button onClick={() => setIsEditing(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-500">
                                    <X size={18} />
                                 </button>
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Right Side Cards */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Join Card */}
                  <div className="bg-[#0a0f1e] border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                        <Hash size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Join by ID</h3>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Enter room identifier</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={roomId} onChange={(e) => setRoomId(e.target.value)}
                        placeholder="session-code" 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none w-32 focus:w-48 transition-all"
                      />
                      <button onClick={() => roomId && navigate(`/room/${roomId}`)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Join</button>
                    </div>
                  </div>

                  {/* Recent List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 px-2">Active Projects</h3>
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="group bg-[#0a0f1e] border border-white/5 hover:border-blue-500/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Code2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">CollabCode_Project_{i+1}</h4>
                            <p className="text-[10px] text-slate-600">Modified 14 mins ago • Private</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ... (Other tabs: projects, profile, history) ... */}
        </AnimatePresence>

      </main>
    </div>
  );
}