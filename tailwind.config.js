/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uncommon: { DEFAULT: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
        rare: { DEFAULT: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
        epic: { DEFAULT: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
        legendary: { DEFAULT: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' },
      },
      boxShadow: {
        'glow-uncommon': '0 0 15px rgba(34, 197, 94, 0.5)',
        'glow-rare': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-epic': '0 0 15px rgba(168, 85, 247, 0.5)',
        'glow-legendary': '0 0 20px rgba(234, 179, 8, 0.6)',
        'glow-duplicate': '0 0 20px rgba(234, 179, 8, 0.5)',
        'missing': '0 0 0 2px rgba(239, 68, 68, 0.8)',
      },
    },
  },
  plugins: [],
}
