import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Terminal, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const C = {
  bg:     '#080a0f',
  border: 'rgba(255,255,255,0.07)',
  accent: '#00E5FF',
  text:   '#ffffff',
  muted:  'rgba(255,255,255,0.42)',
  faint:  'rgba(255,255,255,0.06)',
};

function Field({ label, type = 'text', name, value, onChange, placeholder, showToggle, show, onToggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={showToggle && show ? 'text' : type}
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} required
          style={{
            width: '100%', boxSizing: 'border-box',
            background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: showToggle ? '13px 44px 13px 16px' : '13px 16px',
            color: C.text, fontFamily: "'Outfit', sans-serif",
            fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e  => e.target.style.borderColor = C.border}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex',
          }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
    setError('');
    try {
      const { data } = await axios.post(`${BACKEND}/api/auth/signup`, formData, { withCredentials: true });
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex',
      fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Glows */}
      <div style={{ position: 'fixed', top: '-5%', right: '10%', width: 500, height: 500, background: `radial-gradient(circle, ${C.accent}07 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 72px', position: 'relative', zIndex: 10,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={17} color={C.bg} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, color: C.text, letterSpacing: '0.1em' }}>
            COLLABCODE
          </span>
        </div>

        {/* Headline */}
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: C.accent }} /> Get started free
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 6vw, 96px)',
          lineHeight: 0.92, color: C.text, margin: '0 0 20px',
          letterSpacing: '0.01em',
        }}>
          BUILD<br />
          <span style={{ color: C.accent }}>TOGETHER.</span>
        </h1>

        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
          Join developers writing, running, and debugging code in real-time shared sessions.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['01', 'Create your free account'],
            ['02', 'Open or join a workspace'],
            ['03', 'Write code with your team'],
          ].map(([num, text]) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: C.accent, lineHeight: 1, minWidth: 32 }}>{num}</span>
              <div style={{ width: 1, height: 20, background: C.border }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Right panel ── */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', zIndex: 10,
        background: 'rgba(14,17,24,0.5)', backdropFilter: 'blur(20px)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: C.text, margin: '0 0 6px', letterSpacing: '0.02em' }}>
              CREATE ACCOUNT
            </h2>
            <p style={{ fontSize: 13, color: C.muted }}>
              Already a member?{' '}
              <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Username"      name="username" value={formData.username} onChange={handleChange} placeholder="your_username" />
            <Field label="Email Address" name="email"    type="email"    value={formData.email}    onChange={handleChange} placeholder="name@company.com" />
            <Field label="Password"      name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" showToggle show={showPass} onToggle={() => setShowPass(s => !s)} />

            <p style={{ fontSize: 11, color: C.muted, margin: '-4px 0 0' }}>
              Use 8+ characters with a mix of letters and numbers.
            </p>

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
                boxShadow: `0 0 20px ${C.accent}20`,
              }}
            >
              {loading
                ? <span style={{ width: 16, height: 16, border: `2px solid ${C.bg}40`, borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <> Join CollabCode <ArrowRight size={15} strokeWidth={2.5} /> </>
              }
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <span style={{ color: C.accent, cursor: 'pointer' }}>Terms of Service</span>.
            </p>
          </form>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}