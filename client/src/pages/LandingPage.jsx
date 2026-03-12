import { useState } from 'react';
// ADD AnimatePresence HERE:
import { motion, AnimatePresence } from 'framer-motion'; 
import { Zap, Users, Link as LinkIcon, Rocket, Github } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure Axios sends cookies for the session
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await axios.post(endpoint, formData, { withCredentials: true });
      
      setUser(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 selection:bg-purple-500/30">
      {/* LEFT SIDE: Branding & Features */}
      <div className="lg:w-1/2 p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Animated Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#3b82f61a_0,transparent_50%)]" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 max-w-xl"
        >
          <div className="flex items-center gap-2 mb-8 group cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="bg-brand-gradient p-2 rounded-lg"
            >
              <Rocket size={24} className="text-white" />
            </motion.div>
            <span className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-white">
              CollabCode
            </span>
          </div>

          {/* Premium Glow Headline */}
          <motion.h1 
  whileHover={{ 
    filter: "drop-shadow(0 0 15px rgba(168, 85, 247, 0.8))",
    scale: 1.01
  }}
  className="text-6xl font-extrabold mb-6 font-['Space_Grotesk'] leading-tight text-white cursor-default transition-all duration-300"
>
  Code Together. <br />
  <motion.span 
    whileHover={{ 
      filter: "drop-shadow(0 0 20px rgba(99, 102, 241, 1))",
    }}
    className="bg-brand-gradient bg-clip-text text-transparent inline-block"
  >
    Instantly.
  </motion.span>
</motion.h1>

          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            CollabCode is a real-time collaborative coding platform where developers can join shared rooms, write code together, and debug faster.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <Feature icon={<Zap size={18}/>} text="Real-time collaboration" />
            <Feature icon={<Users size={18}/>} text="Live user presence" />
            <Feature icon={<LinkIcon size={18}/>} text="Instant room sharing" />
            <Feature icon={<Github size={18}/>} text="Open source power" />
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Auth Card */}
      <div className="lg:w-1/2 p-12 flex items-center justify-center bg-slate-900/50 backdrop-blur-3xl border-l border-white/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 border-white/10 shadow-2xl">
            {/* Toggle Tabs */}
            <div className="flex mb-8 bg-white/5 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-2 rounded-lg transition-all font-medium text-sm ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-2 rounded-lg transition-all font-medium text-sm ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600" 
                    placeholder="shruthi_dev" 
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600" 
                  placeholder="name@company.com" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600" 
                  placeholder="••••••••" 
                />
              </div>

              <GradientButton 
                type="submit" 
                loading={loading}
                className="w-full py-4 mt-2 font-bold tracking-wider text-sm uppercase"
              >
                {isLogin ? 'Sign In to Workspace' : 'Create Account'}
              </GradientButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

const Feature = ({ icon, text }) => (
  <motion.div 
    whileHover={{ x: 5 }}
    className="flex items-center gap-3 text-gray-300"
  >
    <div className="text-purple-500 bg-purple-500/10 p-1.5 rounded-md">{icon}</div>
    <span className="text-sm font-medium">{text}</span>
  </motion.div>
);