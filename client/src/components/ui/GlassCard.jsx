export const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);