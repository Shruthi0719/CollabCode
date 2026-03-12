import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <div className="bg-surface/30 border border-white/5 rounded-2xl p-6 h-40 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="h-10 w-10 bg-white/5 rounded-lg" />
      <div className="h-5 w-16 bg-white/5 rounded-full" />
    </div>
    <div className="h-6 w-3/4 bg-white/5 rounded-md mb-2" />
    <div className="h-4 w-1/2 bg-white/5 rounded-md" />
    
    {/* Shimmer Effect */}
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
    />
  </div>
);