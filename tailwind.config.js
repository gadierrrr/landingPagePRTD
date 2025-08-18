/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: 'var(--color-brand-blue)',
          red: 'var(--color-brand-red)',
          navy: 'var(--color-brand-navy)',
          sand: 'var(--color-brand-sand)'
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        focus: 'var(--shadow-focus)'
      },
      fontFamily: {
        sans: 'var(--font-sans)'
      },
      maxWidth: {
        content: 'var(--layout-content-max)'
      },
      lineHeight: {
        tight: 'var(--line-tight)',
        normal: 'var(--line-normal)',
        relaxed: 'var(--line-relaxed)'
      }
    }
  },
  plugins: []
};
