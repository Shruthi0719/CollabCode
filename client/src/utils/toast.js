// client/src/utils/toast.js
// Lightweight toast system — no external library needed

let _container = null;

function getContainer() {
  if (_container) return _container;
  _container = document.createElement('div');
  _container.id = 'cc-toast-container';
  Object.assign(_container.style, {
    position: 'fixed', top: '20px', right: '20px',
    zIndex: '99999', display: 'flex', flexDirection: 'column', gap: '10px',
    pointerEvents: 'none',
  });
  document.body.appendChild(_container);
  return _container;
}

const ICONS = { success: '✓', error: '✕', info: '◎', warn: '⚠' };
const COLORS = {
  success: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)',  text: '#4ade80' },
  error:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
  info:    { bg: 'rgba(0,229,255,0.10)',   border: 'rgba(0,229,255,0.3)',   text: '#00E5FF' },
  warn:    { bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.3)',  text: '#facc15' },
};

function show(message, type = 'info', duration = 4000) {
  const container = getContainer();
  const c = COLORS[type] || COLORS.info;

  const el = document.createElement('div');
  Object.assign(el.style, {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 16px',
    background: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: '#ffffff',
    maxWidth: '340px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    pointerEvents: 'all',
    opacity: '0',
    transform: 'translateX(20px)',
    transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
    cursor: 'pointer',
  });

  el.innerHTML = `
    <span style="color:${c.text};font-weight:700;font-size:14px;flex-shrink:0;margin-top:1px">${ICONS[type]}</span>
    <span style="line-height:1.5;color:rgba(255,255,255,0.85)">${message}</span>
  `;

  el.onclick = () => dismiss(el);
  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });

  const timer = setTimeout(() => dismiss(el), duration);
  el._timer = timer;
}

function dismiss(el) {
  clearTimeout(el._timer);
  el.style.opacity = '0';
  el.style.transform = 'translateX(20px)';
  setTimeout(() => el.remove(), 250);
}

// Friendly error message mapper
export function friendlyError(err) {
  const msg = err?.response?.data?.message || err?.message || '';
  if (msg.includes('ECONNREFUSED') || msg.includes('ERR_NETWORK') || msg.includes('Network Error'))
    return 'Server is waking up — try again in a few seconds';
  if (msg.includes('ECONNABORTED') || msg.includes('timeout'))
    return 'Request timed out — check your connection';
  if (msg.includes('401') || msg.toLowerCase().includes('not authenticated'))
    return 'Session expired — please log in again';
  if (msg.includes('404'))
    return 'Resource not found';
  if (msg.includes('500'))
    return 'Something went wrong on the server';
  if (msg.includes('already taken') || msg.includes('already exists'))
    return msg; // these are already user-friendly
  if (msg) return msg;
  return 'Something went wrong — please try again';
}

export const toast = {
  success: (msg, d) => show(msg, 'success', d),
  error:   (msg, d) => show(msg, 'error', d),
  info:    (msg, d) => show(msg, 'info', d),
  warn:    (msg, d) => show(msg, 'warn', d),
};
