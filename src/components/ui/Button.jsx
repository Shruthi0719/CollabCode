import { forwardRef } from 'react';

const variants = {
  // Primary: Vibrant cyan action button
  primary: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg hover:shadow-cyan-500/30 active:bg-cyan-700 focus:ring-cyan-400/50',
  
  // Gradient: Cyan to purple for premium actions
  gradient: 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-cyan-500/20 active:opacity-95 focus:ring-cyan-400/50',
  
  // Secondary: Purple accent
  secondary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 active:bg-purple-800 focus:ring-purple-400/50',
  
  // Outline: Bordered with colorful accent
  outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-600 active:bg-cyan-500/20 focus:ring-cyan-400/30',
  
  // Ghost: Minimal, subtle
  ghost: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:ring-gray-300 dark:focus:ring-gray-600',
  
  // Subtle: Muted secondary option
  subtle: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-800 focus:ring-gray-400 dark:focus:ring-gray-500',
  
  // Danger: For destructive actions
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg hover:shadow-red-500/30 active:bg-red-800 focus:ring-red-400/50',
  
  // Danger outline
  'danger-outline': 'border-2 border-red-600 text-red-600 hover:bg-red-600/10 hover:border-red-700 active:bg-red-600/20 focus:ring-red-400/30',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs font-medium',
  sm: 'px-3 py-2 text-sm font-medium',
  md: 'px-4 py-2.5 text-base font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
  xl: 'px-8 py-4 text-lg font-semibold',
};

const Button = forwardRef(
  ({ 
    children, 
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg transition-all duration-normal
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950
          disabled:opacity-50 disabled:cursor-not-allowed
          whitespace-nowrap
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
