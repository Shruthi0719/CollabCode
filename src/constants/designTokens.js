/**
 * Design Tokens
 * Centralized design system for premium, consistent UI
 */

export const COLORS = {
  neutral: {
    50: '#FAFAFE',
    100: '#F5F4F9',
    200: '#E8E7F3',
    300: '#D4D2E3',
    400: '#A8A4BC',
    500: '#7C7893',
    600: '#5A5670',
    700: '#423D53',
    800: '#2D2839',
    900: '#1A1623',
  },
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    900: '#082F49',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(14, 165, 233, 0.3)',
};

export const TRANSITIONS = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
};
