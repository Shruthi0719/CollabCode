/**
 * Dashboard.jsx
 *
 * Unified design system with all other pages:
 *   Fonts   → Bebas Neue (display) · DM Mono (labels/code) · Outfit (body)
 *   Colors  → #080a0f base · #00E5FF accent · #0e1118 card
 *
 * Add to index.html:
 *   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Code2, LogOut, Rocket, Hash,
  LayoutGrid, Clock, User, Settings,
  Search, Bell, Sparkles, Loader2, Monitor, Database,
  Zap, Globe, Shield, ArrowUpRight, MoreHorizontal, Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:       '#080a0f',
  sidebar:  '#0a0c12',
  card:     '#0e1118',
  border:   'rgba(255,255,255,0.06)',
  accent:   '#00E5FF',
  accentBg: 'rgba(0,229,255,0.08)',
  text:     '#ffffff',
  muted:    'rgba(255,255,255,0.45)',
  faint:    'rgba(255,255,255,0.04)',
};

/* ── Font injection ─────────────────────────────────────────────── */
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap';
function useFonts() {
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: FONT_HREF });
      document.head.appendChild(l);
    }
    if (!document.getElementById('cc-fonts')) {
      const s = document.createElement('style');
      s.id = 'cc-fonts';
      s.textContent = `*, *::before, *::after { font-family: 'Outfit', sans-serif !important; }
        .mono, code, pre, [class*="mono"] { font-family: 'DM Mono', monospace !important; }
        .display { font-family: 'Bebas Neue', sans-serif !important; }`;
      document.head.appendChild(s);
    }
  }, []);
}

/* ── Shared motion ──────────────────────────────────────────────── */
const PAGE = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22,1,0.36,1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ── Nav ────────────────────────────────────────────────────────── */
const NAV = [
  { id: 'overview', Icon: LayoutGrid, label: 'Overview'   },
  { id: 'projects', Icon: Code2,      label: 'Workspaces' },
  { id: 'profile',  Icon: User,       label: 'Profile'    },
  { id: 'history',  Icon: Clock,      label: 'History'    },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div className="relative group" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <button
        onClick={onClick}
        title={label}
        style={{
          width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? C.accentBg : 'transparent',
          color: active ? C.accent : C.muted,
          transition: 'all 0.18s',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.faint; e.currentTarget.style.color = '#fff'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
      >
        {active && (
          <motion.div layoutId="navPill"
            style={{ position: 'absolute', inset: 0, borderRadius: 12, background: C.accentBg, zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <Icon size={17} strokeWidth={active ? 2.2 : 1.75} />
      </button>
      {/* Tooltip */}
      <div style={{
        position: 'absolute', left: 'calc(100% + 14px)', top: '50%', transform: 'translateY(-50%)',
        background: C.card, border: `1px solid ${C.border}`,
        color: '#fff', fontFamily: "'DM Mono', monospace",
        fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
        padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 100,
        opacity: 0, pointerEvents: 'none', transition: 'opacity 0.15s',
      }} className="cc-tooltip">
        {label}
      </div>
      <style>{`.group:hover .cc-tooltip { opacity: 1 !important; }`}</style>
    </div>
  );
}

/* ── Stat chip ──────────────────────────────────────────────────── */
function Stat({ icon: Icon, label, value, accent = C.accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: C.faint, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '12px 18px', minWidth: 160,
    }}>
      <div style={{ padding: 8, borderRadius: 10, background: `${accent}14` }}>
        <Icon size={14} style={{ color: accent }} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.text, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

/* ── Project row ────────────────────────────────────────────────── */
const LANG_C = { JavaScript: '#f0db4f', Python: '#4b8bbe', TypeScript: '#3178c6', Rust: '#ce412b' };

function ProjectRow({ project, onClick }) {
  const col = LANG_C[project.lang] ?? C.accent;
  return (
    <motion.div whileHover={{ x: 4 }} onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 12,
        border: '1px solid transparent', cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = C.faint; e.currentTarget.style.borderColor = C.border; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.faint, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, flexShrink: 0,
        }}>
          <Code2 size={14} strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{project.name}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted }}>
            #{project.id} · {project.time}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700,
          padding: '3px 10px', borderRadius: 999,
          color: col, background: `${col}12`, border: `1px solid ${col}28`,
        }}>
          {project.lang}
        </span>
        <ArrowUpRight size={13} style={{ color: C.muted }} />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  useFonts();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [roomId, setRoomId]       = useState('');

  /* ── Real data from MongoDB ───────────────────────────────────── */
  const [stats, setStats]           = useState({ activeRooms: 0, collaborators: 0, status: 'Loading…' });
  const [recentProjects, setRecent] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const safeFetch = (url) =>
      fetch(url, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

    Promise.all([
      safeFetch(`${BACKEND}/api/rooms/user`),
      safeFetch(`${BACKEND}/api/rooms/stats`),
    ])
      .then(([rooms, statsData]) => {
        const roomList = Array.isArray(rooms) ? rooms : [];
        setRecent(roomList);
        setStats({
          activeRooms:   statsData?.activeRooms   ?? roomList.length,
          collaborators: statsData?.collaborators ?? 0,
          status:        statsData?.status        ?? 'Online',
        });
      })
      .catch(() => {
        setRecent([]);
        setStats({ activeRooms: 0, collaborators: 0, status: 'Online' });
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  const formData = {
    username: user?.username ?? '',
    bio:      user?.bio      ?? '',
  };

  /* ── Profile editing ──────────────────────────────────────────── */
  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const [editProfile, setEditProfile] = useState({ username: formData.username, bio: formData.bio });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState('');

  const saveProfile = async () => {
    setProfileSaving(true); setProfileMsg('');
    try {
      const res = await fetch(`${BACKEND}/api/auth/profile`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editProfile.username, bio: editProfile.bio }),
      });
      if (!res.ok) throw new Error('Failed');
      setProfileMsg('✓ Saved successfully');
    } catch {
      setProfileMsg('✗ Could not save. Try again.');
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  /* ── Settings state ───────────────────────────────────────────── */
  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]     = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const savePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { setPwMsg('✗ Passwords do not match'); return; }
    if (pwForm.next.length < 8)         { setPwMsg('✗ Password must be 8+ characters'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      const res = await fetch(`${BACKEND}/api/auth/password`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d?.message || 'Failed'); }
      setPwMsg('✓ Password updated');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwMsg(`✗ ${e.message}`);
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg(''), 4000);
    }
  };

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    navigate(`/room/${id}`);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={28} style={{ color: C.accent }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>

      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${C.faint} 1px, transparent 1px), linear-gradient(90deg, ${C.faint} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        position: 'relative', zIndex: 20, width: 68, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 0', borderRight: `1px solid ${C.border}`,
        background: C.sidebar, gap: 0,
      }}>
        {/* Logo */}
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 40, boxShadow: `0 0 20px ${C.accent}30`, transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Terminal size={18} color={C.bg} strokeWidth={2.5} />
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', padding: '0 12px' }}>
          {NAV.map(({ id, Icon, label }) => (
            <NavItem key={id} icon={Icon} label={label} active={activeTab === id} onClick={() => setActiveTab(id)} />
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, width: '100%', padding: '0 12px' }}>
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <button
            onClick={logout}
            title="Sign out"
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', color: C.muted, transition: 'all 0.15s', margin: '0 auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 10 }}>

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 40px',
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(8,10,15,0.85)', backdropFilter: 'blur(16px)',
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input
              placeholder="Search workspaces…"
              style={{
                background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '8px 16px 8px 32px', fontSize: 12, color: C.text,
                outline: 'none', width: 220, transition: 'border-color 0.2s',
                fontFamily: "'Outfit', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.faint, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.muted, cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >
              <Bell size={14} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.faint, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '6px 12px',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 8, background: C.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: C.bg,
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '40px', maxWidth: 1280, margin: '0 auto' }}>
          <AnimatePresence mode="wait">

            {/* ─ OVERVIEW ──────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={PAGE} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-block', width: 20, height: 1, background: C.accent }} /> Command Center
                    </div>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.text, margin: 0, lineHeight: 1, letterSpacing: '0.01em' }}>
                      Hello, <span style={{ color: C.accent }}>{formData.username}</span>
                    </h1>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCreateRoom}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: C.accent, color: C.bg,
                      fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                      boxShadow: `0 0 20px ${C.accent}30`,
                    }}
                  >
                    <Plus size={15} strokeWidth={2.5} /> New Session
                  </motion.button>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Stat icon={Zap}    label="Active Rooms"  value={dataLoading ? '…' : String(stats.activeRooms)}   accent={C.accent}  />
                  <Stat icon={Globe}  label="Collaborators" value={dataLoading ? '…' : String(stats.collaborators)} accent="#4ade80"   />
                  <Stat icon={Shield} label="Status"        value={dataLoading ? '…' : stats.status}                accent="#facc15"   />
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

                  {/* Profile card */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden' }}>
                    {/* Banner */}
                    <div style={{ height: 80, background: `linear-gradient(135deg, ${C.accent}18 0%, rgba(99,102,241,0.12) 100%)`, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.faint} 1px, transparent 1px), linear-gradient(90deg, ${C.faint} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                    </div>
                    <div style={{ padding: '0 24px 24px' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: C.card, border: `2px solid ${C.bg}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.accent,
                        marginTop: -28, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      }}>
                        {formData.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {formData.username}
                        <Sparkles size={12} style={{ color: C.accent, opacity: 0.7 }} />
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, marginBottom: 12 }}>{user?.email}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>{formData.bio}</div>
                      <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                          width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                          background: C.faint, border: `1px solid ${C.border}`,
                          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                      >
                        <Settings size={12} /> Manage Profile
                      </button>
                    </div>
                  </div>

                  {/* Right col */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Join by ID */}
                    <div style={{
                      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
                      padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ padding: 10, borderRadius: 12, background: C.accentBg }}>
                          <Hash size={15} style={{ color: C.accent }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Join by Room ID</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enter session code</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={roomId}
                          onChange={e => setRoomId(e.target.value)}
                          placeholder="SESSION-CODE"
                          style={{
                            background: C.faint, border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: '8px 14px',
                            fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text,
                            outline: 'none', width: 150, transition: 'border-color 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = C.accent}
                          onBlur={e  => e.target.style.borderColor = C.border}
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => roomId && navigate(`/room/${roomId}`)}
                          style={{
                            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: C.accent, color: C.bg,
                            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                          }}
                        >
                          Join →
                        </motion.button>
                      </div>
                    </div>

                    {/* Workspace list */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', flex: 1 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                      }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                          Active Workspaces
                        </div>
                        <button
                          onClick={() => setActiveTab('projects')}
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          View all →
                        </button>
                      </div>
                      <div style={{ padding: 10 }}>
                        {dataLoading ? (
                          <div style={{ padding: '20px', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.12em' }}>
                            LOADING…
                          </div>
                        ) : recentProjects.length === 0 ? (
                          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>No active workspaces yet.</div>
                            <button onClick={handleCreateRoom} style={{
                              background: C.accentBg, border: `1px solid ${C.accent}30`,
                              color: C.accent, borderRadius: 8, padding: '7px 16px',
                              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}>
                              Create your first room →
                            </button>
                          </div>
                        ) : (
                          recentProjects.slice(0, 5).map(p => (
                            <ProjectRow key={p.id || p._id} project={{ id: p.id || p._id, name: p.name, time: p.lastActive ?? p.time ?? '—', lang: p.language ?? p.lang ?? 'Code' }} onClick={() => navigate(`/room/${p.id || p._id}`)} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─ WORKSPACES ──────────────────────────────── */}
            {activeTab === 'projects' && (
              <motion.div key="projects" variants={PAGE} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 20, height: 1, background: C.accent, display: 'inline-block' }} /> Your Rooms
                    </div>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, margin: 0, letterSpacing: '0.01em' }}>Workspaces</h2>
                  </div>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}30`,
                    padding: '6px 14px', borderRadius: 999,
                  }}>
                    {dataLoading ? '…' : `${recentProjects.length} Active`}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {dataLoading ? (
                    <div style={{ gridColumn: '1/-1', padding: 32, textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.12em' }}>LOADING…</div>
                  ) : recentProjects.map(p => {
                    const id  = p.id || p._id;
                    const lang = p.language ?? p.lang ?? 'Code';
                    const col  = LANG_C[lang] ?? C.accent;
                    return (
                      <motion.div key={id} whileHover={{ y: -3 }}
                        onClick={() => navigate(`/room/${id}`)}
                        style={{
                          background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
                          padding: 24, cursor: 'pointer', transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${C.accent}40`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.faint, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}>
                            <Monitor size={16} strokeWidth={1.75} />
                          </div>
                          <button style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 20 }}>
                          {lang} workspace · {p.lastActive ?? p.time ?? '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: col, background: `${col}10`, border: `1px solid ${col}25`, padding: '3px 10px', borderRadius: 999 }}>
                            {lang}
                          </span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted }}>#{id}</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  <motion.div whileHover={{ y: -3 }} onClick={handleCreateRoom}
                    style={{
                      border: `2px dashed ${C.border}`, borderRadius: 20,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 24, cursor: 'pointer', minHeight: 180, transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}50`; e.currentTarget.style.background = C.accentBg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.faint, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, marginBottom: 10 }}>
                      <Plus size={17} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>New Room</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ─ PROFILE ──────────────────────────────── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={PAGE} initial="hidden" animate="visible" exit="exit"
                style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: C.accent, display: 'inline-block' }} /> Account
                  </div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, margin: 0 }}>Profile</h2>
                </div>

                {/* Avatar card */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden' }}>
                  <div style={{ height: 76, background: `linear-gradient(135deg, ${C.accent}15, rgba(99,102,241,0.1))`, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.faint} 1px, transparent 1px), linear-gradient(90deg, ${C.faint} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                  </div>
                  <div style={{ padding: '0 24px 24px' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14, marginTop: -28, marginBottom: 14,
                      background: C.card, border: `2px solid ${C.bg}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.accent,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    }}>
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.text, marginBottom: 3 }}>{user?.username}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted }}>{user?.email}</div>
                  </div>
                </div>

                {/* Editable fields */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Edit Profile</div>

                  {/* Username */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Username</label>
                    <input
                      value={editProfile.username}
                      onChange={e => setEditProfile(p => ({ ...p, username: e.target.value }))}
                      style={{
                        background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                        padding: '12px 16px', fontSize: 13, color: C.text,
                        fontFamily: "'DM Mono', monospace", outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                  </div>

                  {/* Email — read-only */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Email</label>
                    <input readOnly value={user?.email ?? '—'} style={{
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 10,
                      padding: '12px 16px', fontSize: 13, color: C.muted,
                      fontFamily: "'DM Mono', monospace", outline: 'none', cursor: 'not-allowed',
                    }} />
                    <span style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Email cannot be changed.</span>
                  </div>

                  {/* Bio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Bio</label>
                    <textarea
                      rows={3}
                      value={editProfile.bio}
                      onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell your collaborators about yourself…"
                      style={{
                        background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                        padding: '12px 16px', fontSize: 13, color: C.text,
                        fontFamily: "'Outfit', sans-serif", outline: 'none', resize: 'vertical',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                  </div>

                  {/* Feedback */}
                  {profileMsg && (
                    <div style={{
                      fontSize: 12, padding: '8px 14px', borderRadius: 8,
                      color: profileMsg.startsWith('✓') ? '#4ade80' : '#f87171',
                      background: profileMsg.startsWith('✓') ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                      border: `1px solid ${profileMsg.startsWith('✓') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    }}>
                      {profileMsg}
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={saveProfile}
                    disabled={profileSaving}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: profileSaving ? 'not-allowed' : 'pointer',
                      background: profileSaving ? `${C.accent}60` : C.accent,
                      color: C.bg, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: `0 0 18px ${C.accent}20`,
                    }}
                  >
                    {profileSaving
                      ? <><span style={{ width: 14, height: 14, border: `2px solid ${C.bg}40`, borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                      : 'Save Changes'
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ─ SETTINGS ─────────────────────────────── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={PAGE} initial="hidden" animate="visible" exit="exit"
                style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: C.accent, display: 'inline-block' }} /> App
                  </div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, margin: 0 }}>Settings</h2>
                </div>

                {/* Change password */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Change Password</div>

                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password',     key: 'next'    },
                    { label: 'Confirm Password', key: 'confirm' },
                  ].map(({ label, key }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</label>
                      <input
                        type="password"
                        value={pwForm[key]}
                        onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder="••••••••"
                        style={{
                          background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10,
                          padding: '12px 16px', fontSize: 13, color: C.text,
                          fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e  => e.target.style.borderColor = C.border}
                      />
                    </div>
                  ))}

                  {pwMsg && (
                    <div style={{
                      fontSize: 12, padding: '8px 14px', borderRadius: 8,
                      color: pwMsg.startsWith('✓') ? '#4ade80' : '#f87171',
                      background: pwMsg.startsWith('✓') ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                      border: `1px solid ${pwMsg.startsWith('✓') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    }}>
                      {pwMsg}
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={savePassword}
                    disabled={pwSaving}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: pwSaving ? 'not-allowed' : 'pointer',
                      background: pwSaving ? `${C.accent}60` : C.accent,
                      color: C.bg, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: `0 0 18px ${C.accent}20`,
                    }}
                  >
                    {pwSaving
                      ? <><span style={{ width: 14, height: 14, border: `2px solid ${C.bg}40`, borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Updating…</>
                      : 'Update Password'
                    }
                  </motion.button>
                </div>

                {/* Danger zone */}
                <div style={{ background: C.card, border: '1px solid rgba(248,113,113,0.15)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#f87171', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Danger Zone</div>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                    Signing out will end your current session. Deleting your account is permanent and cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      onClick={logout}
                      style={{
                        padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(248,113,113,0.08)', color: '#f87171',
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.16)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─ HISTORY ──────────────────────────────── */}
            {activeTab === 'history' && (
              <motion.div key="history" variants={PAGE} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: C.accent, display: 'inline-block' }} /> Logs
                  </div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, margin: 0 }}>Session History</h2>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Workspace', 'Language', 'Last Active', ''].map(h => (
                          <th key={h} style={{ padding: '14px 28px', textAlign: 'left', fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataLoading ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '32px', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.12em' }}>
                            LOADING…
                          </td>
                        </tr>
                      ) : recentProjects.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: C.muted }}>No session history yet.</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 6, opacity: 0.6 }}>Sessions you join will appear here.</div>
                          </td>
                        </tr>
                      ) : (
                        recentProjects.map((p, i) => {
                          const id   = p.id || p._id;
                          const name = p.name || id;
                          const lang = p.language ?? p.lang ?? '—';
                          const date = p.lastActive
                            ? new Date(p.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : p.time ?? '—';
                          return (
                            <tr key={id} style={{ borderBottom: i < recentProjects.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = C.faint}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '18px 28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 9, background: C.faint, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, flexShrink: 0 }}>
                                    <Database size={13} strokeWidth={1.75} />
                                  </div>
                                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.text, fontWeight: 500 }}>{name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '18px 28px' }}>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: LANG_C[lang] ?? C.muted }}>{lang}</span>
                              </td>
                              <td style={{ padding: '18px 28px', fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.muted }}>{date}</td>
                              <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                                <button
                                  onClick={() => navigate(`/room/${id}`)}
                                  style={{
                                    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent,
                                    background: 'none', border: `1px solid ${C.accent}30`, borderRadius: 8,
                                    padding: '6px 14px', cursor: 'pointer', transition: 'background 0.15s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = C.accentBg}
                                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                  Re-enter →
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
