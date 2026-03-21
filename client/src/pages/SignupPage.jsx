/**
 * LoginPage.jsx
 *
 * Standalone login page. Part of the CollabCode design system.
 * #080a0f · #00E5FF · Bebas Neue + DM Mono + Outfit
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Terminal, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  bg:     '#080a0f',
  card:   '#0e1118',
  border: 'rgba(255,255,255,0.07)',
  accent: '#00E5FF',
  text:   '#ffffff',
  muted:  'rgba(255,255,255,0.45)',
  faint:  'rgba(255,255,255,0.04)',
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser } = useAuth();
  const navigate    = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', formData, { withCredentials: true });
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif", padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Glow */}
      <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: `radial-gradient(circle, ${C.accent}08 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={17} color={C.bg} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, color: C.text, letterSpacing: '0.1em' }}>COLLABCODE</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: C.accent }} /> Welcome back
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, margin: 0, lineHeight: 1, letterSpacing: '0.01em' }}>
            SIGN IN
          </h1>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5', borderRadius: 10, padding: '10px 14px',
                fontSize: 12, marginBottom: 20,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email" name="email" required value={formData.email} onChange={handleChange}
              placeholder="name@company.com"
              style={{
                background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '13px 16px', fontSize: 13, color: C.text, outline: 'none',
                fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '13px 44px 13px 16px', fontSize: 13, color: C.text, outline: 'none',
                  fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
            style={{
              width: '100%', padding: '15px 0', marginTop: 4,
              background: loading ? `${C.accent}80` : C.accent,
              color: C.bg, border: 'none', borderRadius: 10,
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 0 20px ${C.accent}25`,
            }}
          >
            {loading
              ? <span style={{ width: 16, height: 16, border: `2px solid ${C.bg}40`, borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : <> Enter Workspace <ArrowRight size={15} strokeWidth={2.5} /> </>
            }
          </motion.button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 28 }}>
          New here?{' '}
          <Link to="/signup" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}