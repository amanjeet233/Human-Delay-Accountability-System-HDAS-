import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#004D40',
        primary: '#00897B',
        accent: '#80CBC4',
        background: '#F3F4F6',
        card: '#FFFFFF',
        heading: '#1F2937',
        subtext: '#6B7280',
      },
      backdropBlur: {
        '25': '25px',
      },
    },
  },
  plugins: [],
}
export default config
