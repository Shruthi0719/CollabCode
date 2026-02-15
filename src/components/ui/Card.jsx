export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  interactive = false,
  hoverable = true,
}) {
  const variants = {
    // Clean card with subtle background
    default: `
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      transition-all duration-normal
      ${hoverable && interactive ? 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-none' : ''}
    `,
    
    // Elevated card with stronger shadow and border
    elevated: `
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      shadow-md dark:shadow-none
      transition-all duration-normal
      ${hoverable && interactive ? 'hover:shadow-lg dark:hover:border-gray-700' : ''}
    `,
    
    // Glass morphism effect with blur
    glass: `
      bg-white/50 dark:bg-gray-900/40
      backdrop-blur-md
      border border-gray-200/50 dark:border-gray-800/50
      transition-all duration-normal
      ${hoverable && interactive ? 'hover:bg-white/70 dark:hover:bg-gray-900/60 hover:border-gray-300/50 dark:hover:border-gray-700/50' : ''}
    `,
    
    // Gradient border card
    gradient: `
      bg-white dark:bg-gray-900
      border-2 border-transparent bg-clip-padding
      shadow-sm dark:shadow-none
      transition-all duration-normal
      relative
      ${hoverable && interactive ? 'hover:shadow-md' : ''}
    `,
    
    // Subtle card - minimal styling
    subtle: `
      bg-gray-50 dark:bg-gray-800/30
      border border-gray-100 dark:border-gray-700/30
      transition-all duration-normal
      ${hoverable && interactive ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50' : ''}
    `,
  };

  return (
    <div 
      className={`
        rounded-xl p-6
        ${variants[variant]}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
