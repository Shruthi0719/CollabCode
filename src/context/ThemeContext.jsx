import { createContext, useContext, useEffect, useState } from 'react';
import { themeTokens } from '../constants/themeTokens';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  // Apply theme to DOM
  const applyTheme = (themeName) => {
    const root = document.documentElement;
    const tokens = themeTokens[themeName];
    
    // Set CSS custom properties for all theme tokens
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply data-theme attribute for styling
    root.setAttribute('data-theme', themeName);
    
    // Update body class for Tailwind
    if (themeName === 'light') {
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return children;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
