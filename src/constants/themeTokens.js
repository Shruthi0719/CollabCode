// Theme tokens for dark and light modes
// Used by ThemeContext to apply CSS custom properties

export const themeTokens = {
  light: {
    // Backgrounds
    background: '0 0% 100%', // White
    'background-secondary': '0 0% 97%', // Light gray
    'background-tertiary': '0 0% 93%', // Medium light gray
    
    // Foreground text
    foreground: '222 84% 5%', // Near black
    'foreground-secondary': '222 12% 27%', // Dark gray
    'foreground-tertiary': '220 13% 48%', // Medium gray
    'foreground-muted': '220 8% 64%', // Light gray
    
    // Borders
    border: '220 13% 91%', // Light gray border
    'border-subtle': '220 13% 95%', // Very light border
    
    // Primary accent (cyan)
    primary: '188 100% 53%', // #06B6D4
    'primary-light': '200 100% 70%',
    'primary-dark': '200 100% 35%',
    
    // Secondary accent (purple)
    accent: '280 85% 67%', // #A855F7
    'accent-light': '280 85% 80%',
    'accent-dark': '280 85% 50%',
    
    // Status colors
    success: '142 71% 45%', // #10B981
    warning: '38 92% 50%',  // #F59E0B
    danger: '0 84% 60%',    // #EF4444
    info: '188 100% 50%',   // #06B6D4
    
    // Component-specific
    'card-background': '0 0% 100%',
    'card-border': '220 13% 91%',
    'input-background': '0 0% 100%',
    'input-border': '220 13% 81%',
    'input-focus-border': '188 100% 53%',
    'button-hover': '0 0% 93%',
  },
  
  dark: {
    // Backgrounds
    background: '222 84% 4%', // Very dark (almost black)
    'background-secondary': '222 84% 8%',
    'background-tertiary': '222 84% 12%',
    
    // Foreground text
    foreground: '0 0% 98%', // Almost white
    'foreground-secondary': '220 13% 91%', // Light gray
    'foreground-tertiary': '220 13% 76%', // Medium gray
    'foreground-muted': '220 13% 57%', // Dimmed gray
    
    // Borders
    border: '222 84% 20%', // Dark gray border
    'border-subtle': '222 84% 16%', // Darker border
    
    // Primary accent (cyan)
    primary: '188 100% 50%', // #06B6D4
    'primary-light': '188 100% 65%',
    'primary-dark': '188 100% 32%',
    
    // Secondary accent (purple)
    accent: '270 85% 60%', // #A855F7 adjusted for dark
    'accent-light': '270 85% 75%',
    'accent-dark': '270 85% 45%',
    
    // Status colors
    success: '142 71% 45%', // #10B981
    warning: '38 92% 50%',  // #F59E0B
    danger: '0 84% 60%',    // #EF4444
    info: '188 100% 50%',   // #06B6D4
    
    // Component-specific
    'card-background': '222 84% 8%',
    'card-border': '222 84% 20%',
    'input-background': '222 84% 8%',
    'input-border': '222 84% 20%',
    'input-focus-border': '188 100% 50%',
    'button-hover': '222 84% 16%',
  },
};

// Spacing tokens (12-step scale)
export const spacingTokens = {
  0: '0',
  2: '2px',
  4: '4px',
  6: '6px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  40: '40px',
  48: '48px',
  64: '64px',
};

// Typography tokens
export const typographyTokens = {
  // Heading styles
  'heading-xs': {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '20px',
    letterSpacing: '0.5px',
  },
  'heading-sm': {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '24px',
    letterSpacing: '0.3px',
  },
  'heading-md': {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '28px',
    letterSpacing: '0.2px',
  },
  'heading-lg': {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '36px',
    letterSpacing: '-0.3px',
  },
  'heading-xl': {
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: '44px',
    letterSpacing: '-0.5px',
  },
  
  // Body text
  'body-sm': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '22px',
  },
  'body-md': {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
  },
  'body-lg': {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '28px',
  },
  
  // Label
  'label-sm': {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  'label-md': {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    letterSpacing: '0.3px',
  },
};

// Shadow tokens
export const shadowTokens = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(6 182 212 / 0.3)',
  'glow-purple': '0 0 20px rgb(168 85 247 / 0.3)',
};

// Transition tokens
export const transitionTokens = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};
