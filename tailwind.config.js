module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent colors (vibrant cyan + purple)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDEF',
          500: '#06B6D4', // Main cyan
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        accent: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          400: '#D8B4FE',
          500: '#A855F7', // Main purple
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        // Status colors (vibrant)
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#06B6D4',
        // Legacy (for compatibility)
        secondary: '#10B981',
        dark: '#1F2937',
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      backgroundColor: {
        DEFAULT: 'hsl(var(--background))',
      },
      textColor: {
        DEFAULT: 'hsl(var(--foreground))',
      },
      boxShadow: {
        'sm-dark': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'lg-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '2': '2px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '25px',
        xl: '40px',
      },
    },
  },
  plugins: [],
}
