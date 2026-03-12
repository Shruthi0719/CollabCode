import { motion } from 'framer-motion';

export const GradientButton = ({ children, onClick, loading, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={loading}
    className={`bg-brand-gradient text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 ${className}`}
  >
    {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" /> : children}
  </motion.button>
);