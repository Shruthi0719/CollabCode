export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    primary: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    outline: 'border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
    lg: 'px-4 py-2 text-base font-medium',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1
        rounded-full
        ${variants[variant]}
        ${sizes[size]}
        transition-colors duration-normal
        ${className}
      `}
    >
      {children}
    </span>
  );
}
