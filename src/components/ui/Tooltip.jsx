import { useState } from 'react';

export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 200,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    bottom: 'top-full mt-2 -translate-x-1/2 left-1/2',
    left: 'right-full mr-2 -translate-y-1/2 top-1/2',
    right: 'left-full ml-2 -translate-y-1/2 top-1/2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {visible && (
        <div
          className={`
            absolute ${positionClasses[position]}
            px-3 py-2 
            bg-gray-900 dark:bg-gray-950
            text-white dark:text-gray-100
            text-xs font-medium
            rounded-lg
            shadow-lg
            whitespace-nowrap
            pointer-events-none
            animate-fade-in
            z-50
            ${className}
          `}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 
              bg-gray-900 dark:bg-gray-950
              rounded-sm
              transform rotate-45
              ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
              ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              ${position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' : ''}
              ${position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
}
