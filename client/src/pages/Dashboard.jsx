import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Code2, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export default function Dashboard() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const createRoom = () => {
    // In production, call your API: axios.post('/api/rooms')
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) navigate(`/room/${roomId.trim()}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-20">
        <div className="flex items-center gap-2">
          <Rocket className="text-purple-500" />
          <span className="text-xl font-bold font-['Space_Grotesk']">Dashboard</span>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 font-medium">
          <LogOut size={18}/> Sign Out
        </button>
      </header>

      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold font-['Space_Grotesk'] mb-2">Welcome back, {user?.username}</h2>
        <p className="text-gray-500">Pick up where you left off or start a new collaborative session.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <GlassCard className="p-10 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
            <Plus size={32}/>
          </div>
          <h3 className="text-xl font-bold mb-2">Create New Session</h3>
          <p className="text-gray-500 text-sm mb-8">Generate a unique room ID and invite others to code with you instantly.</p>
          <GradientButton onClick={createRoom} className="w-full">Create Workspace</GradientButton>
        </GlassCard>

        <GlassCard className="p-10 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
            <Code2 size={32}/>
          </div>
          <h3 className="text-xl font-bold mb-2">Join Existing Room</h3>
          <form onSubmit={joinRoom} className="w-full space-y-4">
            <input 
              type="text" 
              placeholder="Enter Room ID (e.g. x4k2m9)" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 transition-all text-center font-mono"
            />
            <button type="submit" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-xl transition-all font-bold">
              Join Workspace
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}