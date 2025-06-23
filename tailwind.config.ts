import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'app-gradient': 'linear-gradient(135deg, rgb(var(--background-gradient-start)), rgb(var(--background-gradient-middle)), rgb(var(--background-gradient-end)))',
        'btn-primary': 'linear-gradient(135deg, rgb(var(--button-primary)), rgb(var(--button-accent)))',
        'btn-emerald': 'linear-gradient(135deg, rgb(var(--button-primary)), rgb(var(--button-secondary)))',
        'btn-indigo': 'linear-gradient(135deg, rgb(var(--button-indigo)), rgb(var(--button-secondary)))',
        'achievement-workout': 'linear-gradient(135deg, rgb(var(--achievement-workout)), rgb(5 150 105))',
        'achievement-consecutive': 'linear-gradient(135deg, rgb(var(--achievement-consecutive)), rgb(22 163 74))',
        'achievement-weight': 'linear-gradient(135deg, rgb(var(--achievement-weight)), rgb(15 118 110))',
        'achievement-exercise': 'linear-gradient(135deg, rgb(var(--achievement-exercise)), rgb(79 70 229))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Cores customizadas do app
        app: {
          'bg-primary': 'rgb(var(--background-primary))',
          'bg-secondary': 'rgb(var(--background-secondary))',
          'bg-accent': 'rgb(var(--background-accent))',
          'bg-card': 'rgb(var(--background-card))',
          'bg-overlay': 'rgb(var(--background-overlay))',
          'text-primary': 'rgb(var(--text-primary))',
          'text-secondary': 'rgb(var(--text-secondary))',
          'text-muted': 'rgb(var(--text-muted))',
          'text-accent': 'rgb(var(--text-accent))',
          'text-heading': 'rgb(var(--text-heading))',
          'border-default': 'rgb(var(--border-default))',
          'border-muted': 'rgb(var(--border-muted))',
          'border-accent': 'rgb(var(--border-accent))',
          'btn-primary': 'rgb(var(--button-primary))',
          'btn-primary-hover': 'rgb(var(--button-primary-hover))',
          'btn-secondary': 'rgb(var(--button-secondary))',
          'btn-secondary-hover': 'rgb(var(--button-secondary-hover))',
          'btn-accent': 'rgb(var(--button-accent))',
          'btn-accent-hover': 'rgb(var(--button-accent-hover))',
          'btn-indigo': 'rgb(var(--button-indigo))',
          'btn-indigo-hover': 'rgb(var(--button-indigo-hover))',
          'achievement-workout': 'rgb(var(--achievement-workout))',
          'achievement-consecutive': 'rgb(var(--achievement-consecutive))',
          'achievement-weight': 'rgb(var(--achievement-weight))',
          'achievement-exercise': 'rgb(var(--achievement-exercise))',
        }
      },
      boxShadow: {
        'app-light': 'var(--shadow-light)',
        'app-medium': 'var(--shadow-medium)',
        'app-large': 'var(--shadow-large)',
        'app-xl': 'var(--shadow-xl)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;