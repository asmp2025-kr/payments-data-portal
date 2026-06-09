import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        // Brand palette
        primary: { DEFAULT: '#2563EB', foreground: '#FFFFFF', hover: '#1D4ED8' },
        success: { DEFAULT: '#10B981', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', foreground: '#000000' },
        danger:  { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        info:    { DEFAULT: '#06B6D4', foreground: '#FFFFFF' },
        purple:  { DEFAULT: '#8B5CF6', foreground: '#FFFFFF' },
        // Background system
        background: '#020617',
        card: { DEFAULT: '#0F172A', foreground: '#F1F5F9' },
        elevated: '#1E293B',
        border: '#334155',
        // Text
        foreground: '#F1F5F9',
        muted: { DEFAULT: '#94A3B8', foreground: '#64748B' },
        // Semantic aliases
        destructive: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#1E293B', foreground: '#F1F5F9' },
        popover: { DEFAULT: '#0F172A', foreground: '#F1F5F9' },
        input: '#1E293B',
        ring: '#2563EB',
        secondary: { DEFAULT: '#1E293B', foreground: '#F1F5F9' },
      },
      borderRadius: { lg: '0.5rem', md: '0.375rem', sm: '0.25rem' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'count-up': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'count-up': 'count-up 0.5s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #1e40af 0px, transparent 50%), radial-gradient(at 80% 0%, #1d4ed8 0px, transparent 50%)',
        shimmer: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.04) 50%, transparent 75%)',
      },
    },
  },
  plugins: [animate],
};

export default config;
