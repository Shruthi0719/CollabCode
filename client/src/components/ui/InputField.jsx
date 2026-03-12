export const InputField = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-2 group">
    <label className="block text-sm font-medium text-gray-400 group-focus-within:text-purple-400 transition-colors font-['Space_Grotesk'] tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white 
                 placeholder:text-gray-600 outline-none transition-all
                 input-glow border-white/5 hover:border-white/20"
    />
  </div>
);