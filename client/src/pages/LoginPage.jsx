import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Code2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      setUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#252526] p-8 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Code2 size={48} className="text-blue-500 mb-2" />
          <h2 className="text-3xl font-bold text-white">CollabCode</h2>
          <p className="text-gray-400 mt-1">Sign in to start coding</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-[#1e1e1e] border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full bg-[#1e1e1e] border border-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Login'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">New? <Link to="/signup" className="text-blue-500 hover:underline">Create Account</Link></p>
      </div>
    </div>
  );
}