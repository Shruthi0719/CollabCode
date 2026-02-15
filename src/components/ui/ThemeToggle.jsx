import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        w-10 h-10
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        text-gray-900 dark:text-gray-100
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-normal
        focus:outline-none focus:ring-2 focus:ring-cyan-500/30
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        // Sun icon
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 1 1 .12-11.39 1 1 0 1 0 1.09-1.63 10 10 0 1 0 .27 13.16 1 1 0 0 0-.35-1.84z" />
        </svg>
      )}
    </button>
  );
}
