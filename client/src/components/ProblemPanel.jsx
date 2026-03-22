// client/src/components/ProblemPanel.jsx

import { useState } from 'react';
import { ChevronDown, BookOpen, Circle } from 'lucide-react';
import { PROBLEMS } from '../data/problems';

const C = {
  bg:     '#080a0f',
  card:   '#0e1118',
  border: 'rgba(255,255,255,0.07)',
  accent: '#00E5FF',
  text:   '#ffffff',
  muted:  'rgba(255,255,255,0.45)',
  faint:  'rgba(255,255,255,0.04)',
};

const DIFF_COLOR = { Easy: '#4ade80', Medium: '#facc15', Hard: '#f87171' };

export default function ProblemPanel({ language, onLoadProblem }) {
  const [selected,  setSelected]  = useState(null);
  const [open,      setOpen]      = useState(false);   // dropdown open

  const handleSelect = (problem) => {
    setSelected(problem);
    setOpen(false);
    const starter = problem.starterCode[language] || problem.starterCode.javascript;
    onLoadProblem(starter, problem);
  };

  return (
    <div style={{
      width: '100%', height: '100%', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Outfit', sans-serif",
      background: C.card,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <BookOpen size={14} style={{ color: C.accent }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Practice
        </span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Problem selector dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: C.faint, border: `1px solid ${C.border}`,
              color: selected ? C.text : C.muted, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: 13,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <span>{selected ? selected.title : 'Select a problem…'}</span>
            <ChevronDown size={14} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: '#0e1118', border: `1px solid ${C.border}`,
              borderRadius: 10, marginTop: 4, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {PROBLEMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'none', border: 'none',
                    color: C.text, cursor: 'pointer', textAlign: 'left',
                    fontFamily: "'Outfit', sans-serif", fontSize: 13,
                    borderBottom: `1px solid ${C.border}`, transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.faint}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{p.title}</span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700,
                    color: DIFF_COLOR[p.difficulty], background: `${DIFF_COLOR[p.difficulty]}15`,
                    border: `1px solid ${DIFF_COLOR[p.difficulty]}30`,
                    padding: '2px 8px', borderRadius: 999,
                  }}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Problem details */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title + difficulty */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.text, margin: 0 }}>
                  {selected.title}
                </h2>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700,
                  color: DIFF_COLOR[selected.difficulty],
                  background: `${DIFF_COLOR[selected.difficulty]}15`,
                  border: `1px solid ${DIFF_COLOR[selected.difficulty]}30`,
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  {selected.difficulty}
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                {selected.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                Examples
              </div>
              {selected.examples.map((ex, i) => (
                <div key={i} style={{
                  background: C.faint, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                  fontSize: 11, fontFamily: "'DM Mono', monospace",
                }}>
                  <div style={{ color: C.muted, marginBottom: 4 }}>
                    <span style={{ color: C.text }}>Input:</span> {ex.input}
                  </div>
                  <div style={{ color: C.muted, marginBottom: ex.explanation ? 4 : 0 }}>
                    <span style={{ color: C.text }}>Output:</span> {ex.output}
                  </div>
                  {ex.explanation && (
                    <div style={{ color: C.muted }}>
                      <span style={{ color: C.text }}>Why:</span> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                Constraints
              </div>
              {selected.constraints.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <Circle size={4} style={{ color: C.accent, marginTop: 5, flexShrink: 0, fill: C.accent }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Reload starter code button */}
            <button
              onClick={() => {
                const starter = selected.starterCode[language] || selected.starterCode.javascript;
                onLoadProblem(starter, selected);
              }}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 10, border: `1px solid ${C.accent}40`,
                background: 'rgba(0,229,255,0.06)', color: C.accent, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,255,0.06)'}
            >
              ↺ Reload Starter Code
            </button>
          </div>
        )}

        {!selected && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <BookOpen size={28} style={{ color: C.muted, opacity: 0.3, marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: C.muted }}>Select a problem to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
