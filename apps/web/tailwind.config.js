/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}

module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark Romantic Theme - Love heart red with void black
                background: 'rgb(var(--color-background) / <alpha-value>)',
                'background-secondary': 'rgb(var(--color-background-secondary) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                accent: 'rgb(var(--color-accent) / <alpha-value>)',
                'text-primary': 'rgb(var(--color-text) / <alpha-value>)',
                'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
                'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
                'bubble-sent': 'rgb(var(--color-bubble-sent) / <alpha-value>)',
                'bubble-sent-text': 'rgb(var(--color-bubble-sent-text) / <alpha-value>)',
                'bubble-received': 'rgb(var(--color-bubble-received) / <alpha-value>)',
                'bubble-received-text': 'rgb(var(--color-bubble-received-text) / <alpha-value>)',
                'flag-positive': 'rgb(var(--color-flag-positive) / <alpha-value>)',
                'flag-negative': 'rgb(var(--color-flag-negative) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                error: 'rgb(var(--color-error) / <alpha-value>)',
                hearts: 'rgb(var(--color-hearts) / <alpha-value>)',
                trust: 'rgb(var(--color-trust) / <alpha-value>)',
                streak: 'rgb(var(--color-streak) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'shake': 'shake 0.5s ease-in-out',
                'heart-beat': 'heartbeat 1s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgb(var(--color-primary)), 0 0 10px rgb(var(--color-primary))' },
                    '100%': { boxShadow: '0 0 20px rgb(var(--color-primary)), 0 0 30px rgb(var(--color-primary))' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
