/**
 * LandingPage.jsx — full viewport, zero scroll.
 *
 * Fonts (add once to index.html):
 *   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Zap, Users, Link as LinkIcon, ArrowRight, Terminal, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = {
  bg:     '#080a0f',
  border: 'rgba(255,255,255,0.07)',
  accent: '#00E5FF',
  text:   '#ffffff',
  muted:  'rgba(255,255,255,0.42)',
  faint:  'rgba(255,255,255,0.06)',
};

/* ── Input field ─────────────────────────────────────────────────── */
function Field({ label, type = 'text', name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPass && show ? 'text' : type}
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} required
          style={{
            width: '100%', boxSizing: 'border-box',
            background: C.faint, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: isPass ? '11px 40px 11px 14px' : '11px 14px',
            color: C.text, fontFamily: "'Outfit', sans-serif",
            fontSize: 13, outline: 'none', transition: 'border-color 0.18s',
          }}
          onFocus={e => (e.target.style.borderColor = C.accent)}
          onBlur={e  => (e.target.style.borderColor = C.border)}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Feature row ─────────────────────────────────────────────────── */
function Feat({ icon, text }) {
  return (
    <motion.div whileHover={{ x: 4 }} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 14px',
      background: C.faint, border: `1px solid ${C.border}`,
      borderRadius: 999, width: 'fit-content',
    }}>
      <span style={{ color: C.accent, display: 'flex' }}>{icon}</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
        {text}
      </span>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isLogin, setIsLogin]   = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate   = useNavigate();
  const { setUser } = useAuth();

  /* Cursor glow */
  const containerRef = useRef(null);
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const glowX  = useTransform(mouseX, v => v - 180);
  const glowY  = useTransform(mouseY, v => v - 180);

  const handleMouse = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) { mouseX.set(e.clientX - rect.left); mouseY.set(e.clientY - rect.top); }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const ep = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const { data } = await axios.post(ep, formData, { withCredentials: true });
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const up = {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouse}
      style={{
        height: '100vh', overflow: 'hidden',
        background: C.bg,
        fontFamily: "'Outfit', sans-serif",
        position: 'relative',
      }}
    >
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Cursor glow */}
      <motion.div style={{
        position: 'absolute', width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.accent}0e 0%, transparent 68%)`,
        pointerEvents: 'none', zIndex: 1,
        x: glowX, y: glowY,
      }} />

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-8%', left: '-4%', width: 520, height: 520, background: `radial-gradient(circle, ${C.accent}07 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', right: '8%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* ══════════════════════════════════
          LEFT PANEL — fills the whole screen behind the card
      ══════════════════════════════════ */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 52px',
          maxWidth: '55%',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <motion.div variants={up} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 32, height: 32, background: C.accent, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Terminal size={16} color="#080a0f" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: C.text, letterSpacing: '0.12em' }}>
            COLLABCODE
          </span>
        </motion.div>

        {/* Label */}
        <motion.div variants={up} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: C.accent }} />
          Real-time collaboration
        </motion.div>

        {/* Headline — clamped so it never overflows vertically */}
        <motion.h1 variants={up} style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(48px, 6.5vw, 96px)',
          lineHeight: 0.9,
          color: C.text, margin: '0 0 20px',
          letterSpacing: '0.01em',
        }}>
          CODE<br />
          <span style={{ color: C.accent }}>TOGETHER.</span><br />
          SHIP FASTER.
        </motion.h1>

        {/* Tagline */}
        <motion.p variants={up} style={{
          fontSize: 14, color: C.muted, lineHeight: 1.65,
          maxWidth: 380, margin: '0 0 28px',
        }}>
          Join shared rooms, write code together, and debug faster — all in one place.
        </motion.p>

        {/* Feature pills */}
        <motion.div variants={up} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
          <Feat icon={<Zap      size={13} />} text="Real-time collaborative editing" />
          <Feat icon={<Users    size={13} />} text="Live cursor & user presence"     />
          <Feat icon={<LinkIcon size={13} />} text="Instant shareable room links"    />
        </motion.div>

        {/* Stats */}
        <motion.div variants={up} style={{ display: 'flex', gap: 32 }}>
          {[['7+', 'Languages'], ['10+', 'Collaborators'], ['Low', 'Sync Lag']].map(([num, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: C.text, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════
          AUTH CARD — absolutely centred in the viewport
      ══════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        top: '50%', right: '5%',
        transform: 'translateY(-50%)',
        width: 400,
        maxHeight: '90vh', overflowY: 'auto',
        padding: '32px 36px',
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: 'rgba(11,14,20,0.88)', backdropFilter: 'blur(32px)',
        zIndex: 20, boxSizing: 'border-box',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          style={{ width: '100%' }}
        >
          {/* Tab toggle */}
          <div style={{
            display: 'flex', background: C.faint,
            borderRadius: 12, padding: 3,
            border: `1px solid ${C.border}`, marginBottom: 28,
          }}>
            {['Sign In', 'Sign Up'].map((t, i) => {
              const active = (i === 0) === isLogin;
              return (
                <button key={t} onClick={() => { setIsLogin(i === 0); setError(''); }} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                  background: active ? C.accent : 'transparent',
                  color: active ? '#080a0f' : C.muted,
                  transition: 'all 0.18s',
                }}>
                  {t}
                </button>
              );
            })}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 38,
              color: C.text, margin: '0 0 4px', letterSpacing: '0.02em',
            }}>
              {isLogin ? 'WELCOME BACK' : 'JOIN THE TEAM'}
            </h2>
            <p style={{ fontSize: 12, color: C.muted }}>
              {isLogin ? 'Sign in to your workspace.' : 'Create your CollabCode account.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                  color: '#fca5a5', borderRadius: 9, padding: '9px 12px',
                  fontSize: 12, marginBottom: 16,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="uname"
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.22 }}
                >
                  <Field label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="your_username" />
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="Email Address" type="email"    name="email"    value={formData.email}    onChange={handleChange} placeholder="name@company.com" />
            <Field label="Password"      type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.985 }}
              style={{
                width: '100%', padding: '14px 0', marginTop: 4,
                background: loading ? `${C.accent}70` : C.accent,
                color: '#080a0f', border: 'none', borderRadius: 10,
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 0 22px ${C.accent}22`,
                transition: 'background 0.18s',
              }}
            >
              {loading ? (
                <span style={{
                  width: 15, height: 15, border: '2px solid rgba(8,10,15,0.3)',
                  borderTopColor: '#080a0f', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <>
                  {isLogin ? 'Enter Workspace' : 'Create Account'}
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, margin: 0 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.accent, fontWeight: 600, fontSize: 12,
                fontFamily: "'Outfit', sans-serif", padding: 0,
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}