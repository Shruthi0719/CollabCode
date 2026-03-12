import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-4"
      >
        <GlassCard className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-400">Join the elite network of collaborative developers.</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" placeholder="shruthi_dev" />
            </div>
            {/* Repeat for Email and Password */}
            <GradientButton className="w-full mt-4">Sign Up to CollabCode</GradientButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}