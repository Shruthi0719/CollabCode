export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 font-bold ${sizes[size]}`}>
      <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-normal">
        {'<>'}
      </div>
      <span className="text-gray-900 dark:text-white hidden xs:inline font-bold text-lg tracking-tight">CodeFlow</span>
    </div>
  );
}
