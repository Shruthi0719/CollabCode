import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Code2, LogOut, Rocket, Hash, Terminal, 
  LayoutGrid, Clock, User, Settings, Camera, Save, X, ChevronRight,
  Search, Bell, Sparkles, Loader2, Monitor, Database, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GradientButton } from '../components/ui/GradientButton';

// --- SIDEBAR ICON COMPONENT ---
function SidebarIcon({ icon, label, active, onClick }) {
  return (
    <div className="relative group flex items-center justify-center w-full px-2">
      <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all duration-300 relative w-full flex items-center justify-center ${
          active 
            ? 'text-blue-400 bg-blue-400/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        {icon}
        {active && (
          <motion.div 
            layoutId="activeBar"
            className="absolute left-[-10px] w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        )}
      </button>

      {/* Glassmorphic Tooltip */}
      <div className="absolute left-16 bg-[#1e293b]/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:left-20 transition-all duration-300 z-[100] border border-white/10 whitespace-nowrap shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-blue-400" />
          {label}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [roomId, setRoomId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || 'shruthii18',
    bio: user?.bio || 'Full-stack Developer | Open Source Contributor'
  });

  const recentProjects = [
    { id: 'L04S8F00', name: 'CollabCode_Project_1', time: '14 mins ago', lang: 'JavaScript' },
    { id: 'K92J1A33', name: 'CollabCode_Project_2', time: '1 hour ago', lang: 'Python' },
  ];

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
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
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 mb-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('overview')}>
          <Rocket size={20} className="text-white" />
        </div>
        
        <nav className="flex flex-col gap-6 w-full">
          <SidebarIcon icon={<LayoutGrid size={22} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarIcon icon={<Code2 size={22} />} label="Workspaces" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
          <SidebarIcon icon={<User size={22} />} label="Account Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarIcon icon={<Clock size={22} />} label="Activity History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>

        <div className="mt-auto flex flex-col gap-6 w-full">
           <SidebarIcon icon={<Settings size={22} />} label="App Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
           <button onClick={logout} className="flex items-center justify-center p-3 text-slate-600 hover:text-red-500 transition-colors group relative w-full">
             <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
             <div className="absolute left-16 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all group-hover:left-20 pointer-events-none">
                LOGOUT
             </div>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-8 lg:p-12 relative">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400" size={16} />
            <input type="text" placeholder="Search workspaces..." className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-6 text-sm outline-none focus:border-blue-500/50 w-64 transition-all" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white/5 border border-white/10 rounded-full text-slate-500 hover:text-white transition-all"><Bell size={18} /></button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
              <span className="text-xs font-bold text-white uppercase tracking-tight">{user?.username}</span>
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">{user?.username?.substring(0,1).toUpperCase()}</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Workspace Dashboard</h1>
                  <p className="text-slate-500 text-sm italic">Review your collaborative history and manage active sessions.</p>
                </div>
                <GradientButton onClick={handleCreateRoom} className="px-6 py-2.5 text-sm font-bold shadow-lg shadow-blue-500/10">
                  <Plus size={18} className="mr-2 inline" /> New Session
                </GradientButton>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-4">
                  <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-60 relative">
                       <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
                    </div>
                    <div className="px-10 pb-10 -mt-10 relative">
                      <div className="w-20 h-20 rounded-2xl bg-[#030816]/60 backdrop-blur-xl flex items-center justify-center text-3xl font-extrabold text-blue-400 shadow-xl border border-white/10 mb-6">
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </div>
                      <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">{formData.username}<Sparkles size={16} className="text-blue-500 opacity-70" /></h2>
                      <p className="text-slate-500 text-xs mb-4">{user?.email || 'shruthi18@example.com'}</p>
                      <p className="text-slate-400 text-sm leading-relaxed mb-8">{formData.bio}</p>
                      <button onClick={() => setActiveTab('profile')} className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center justify-center gap-2.5 shadow-inner">
                         <Settings size={16} /> Manage Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Projects Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-[#0a0f1e] border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Hash size={20} /></div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Join by ID</h3>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Enter room identifier</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="session-code" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none w-32 focus:w-48 transition-all" />
                      <button onClick={() => roomId && navigate(`/room/${roomId}`)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/5">Join</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 px-2">Active Workspaces</h3>
                    {recentProjects.map((project) => (
                      <div key={project.id} onClick={() => navigate(`/room/${project.id}`)} className="group bg-[#0a0f1e] border border-white/5 hover:border-blue-500/30 p-5 rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Code2 size={20} /></div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{project.name}</h4>
                            <p className="text-[10px] text-slate-600">ID: {project.id} • Last active {project.time}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROJECTS VIEW */}
          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">All Workspaces</h2>
                <span className="bg-blue-600/10 text-blue-400 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-600/20">2 Active Rooms</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recentProjects.map(p => (
                   <div key={p.id} className="bg-[#0a0f1e] border border-white/5 rounded-3xl p-6 hover:border-blue-500/20 transition-all group cursor-pointer" onClick={() => navigate(`/room/${p.id}`)}>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6"><Monitor size={20}/></div>
                      <h3 className="font-bold text-white mb-2">{p.name}</h3>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed">A collaborative environment for {p.lang} development.</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase">{p.lang}</span>
                        <ChevronRight size={14} className="text-slate-700" />
                      </div>
                   </div>
                 ))}
                 <div onClick={handleCreateRoom} className="border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-slate-600 hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs">Initialize New Room</span>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PROFILE VIEW */}
          {activeTab === 'profile' && (
             <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-10">
                <div className="text-center mb-10">
                   <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                     {user?.username?.substring(0,2).toUpperCase()}
                   </div>
                   <h2 className="text-3xl font-bold text-white">{user?.username}</h2>
                   <p className="text-slate-500">{user?.email}</p>
                </div>
                <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Profile Settings</h3>
                   <div className="grid gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Username</label>
                        <input type="text" value={formData.username} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Biography</label>
                        <textarea value={formData.bio} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none h-24 resize-none" />
                      </div>
                      <button className="py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Request Changes</button>
                   </div>
                </div>
             </motion.div>
          )}

          {/* TAB 4: HISTORY VIEW */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <Activity size={24} className="text-blue-500" />
                <h2 className="text-3xl font-bold text-white tracking-tight">Session History</h2>
              </div>
              <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-white/5">
                       <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <th className="px-8 py-4">Workspace</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4">Last Joined</th>
                          <th className="px-8 py-4">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {[1,2,3,4].map(i => (
                         <tr key={i} className="hover:bg-white/5 transition-all group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs"><Database size={14}/></div>
                                  <span className="text-sm font-bold text-slate-300">Archive_Session_{i}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6"><span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-bold uppercase">Completed</span></td>
                            <td className="px-8 py-6 text-xs text-slate-500">Mar {12-i}, 2026</td>
                            <td className="px-8 py-6"><button className="text-blue-400 text-xs font-bold hover:underline">Re-enter</button></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}