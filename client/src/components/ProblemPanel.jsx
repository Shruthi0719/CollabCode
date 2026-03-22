// client/src/components/ProblemPanel.jsx
import { useState } from 'react';
import { BookOpen, Circle, ArrowLeft } from 'lucide-react';
import { PROBLEMS } from '../data/problems';

const C = {
  bg:     '#080a0f',
  card:   '#0e1118',
  border: 'rgba(255,255,255,0.07)',
  accent: '#00E5FF',
  text:   '#ffffff',
  muted:  'rgba(255,255,255,0.45)',
  faint:  'rgba(255,255,255,0.05)',
};

const DIFF_COLOR = { Easy: '#4ade80', Medium: '#facc15', Hard: '#f87171' };

export default function ProblemPanel({ language, onLoadProblem }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (problem) => {
    setSelected(problem);
    const starter = problem.starterCode[language] || problem.starterCode.javascript;
    onLoadProblem(starter, problem);
  };

  // ── Problem detail view ──────────────────────────────────────────
  if (selected) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.card, fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: "'Outfit', sans-serif", fontSize: 12 }}
          onMouseEnter={e => e.currentTarget.style.color = C.accent}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}>
          <ArrowLeft size={14} /> Problems
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: C.text, margin: 0 }}>{selected.title}</h2>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: DIFF_COLOR[selected.difficulty], background: `${DIFF_COLOR[selected.difficulty]}18`, border: `1px solid ${DIFF_COLOR[selected.difficulty]}35`, padding: '4px 12px', borderRadius: 999 }}>
            {selected.difficulty}
          </span>
        </div>

        {/* Description */}
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 24, whiteSpace: 'pre-line' }}>
          {selected.description}
        </p>

        {/* Examples */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Examples</div>
          {selected.examples.map((ex, i) => (
            <div key={i} style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.muted, marginBottom: 6 }}>
                <span style={{ color: C.text }}>Input: </span>{ex.input}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.muted, marginBottom: ex.explanation ? 6 : 0 }}>
                <span style={{ color: C.text }}>Output: </span>{ex.output}
              </div>
              {ex.explanation && (
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.muted }}>
                  <span style={{ color: C.text }}>Why: </span>{ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Constraints</div>
          {selected.constraints.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <Circle size={5} style={{ color: C.accent, marginTop: 7, flexShrink: 0, fill: C.accent }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.muted }}>{c}</span>
            </div>
          ))}
        </div>

        {/* Reload button */}
        <button
          onClick={() => { const s = selected.starterCode[language] || selected.starterCode.javascript; onLoadProblem(s, selected); }}
          style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1px solid ${C.accent}40`, background: 'rgba(0,229,255,0.07)', color: C.accent, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,255,0.07)'}
        >
          ↺ Reload Starter Code
        </button>
      </div>
    </div>
  );

  // ── Problem list view ────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.card, fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <BookOpen size={14} style={{ color: C.accent }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Practice · {PROBLEMS.length} problems
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {PROBLEMS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 16px', background: 'none', border: 'none',
              borderBottom: `1px solid ${C.border}`,
              cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.faint}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.muted, minWidth: 26 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.title}</span>
            </div>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
              color: DIFF_COLOR[p.difficulty], background: `${DIFF_COLOR[p.difficulty]}18`,
              border: `1px solid ${DIFF_COLOR[p.difficulty]}35`,
              padding: '3px 10px', borderRadius: 999, flexShrink: 0,
            }}>
              {p.difficulty}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
