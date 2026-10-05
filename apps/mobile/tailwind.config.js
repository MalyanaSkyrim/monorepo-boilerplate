const sharedConfig = require('@app/mobile-ui/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig,
  content: [
    ...(sharedConfig.content || []),
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
    '../../packages/mobile-ui/src/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
};
