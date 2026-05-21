/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        "base-white": "var(--base-white)",
        "colors-accents-blue": "var(--colors-accents-blue)",
        "colors-accents-red": "var(--colors-accents-red)",
        "colorsbrandprimary-500": "var(--colorsbrandprimary-500)",
        "colorsgraygray-700": "var(--colorsgraygray-700)",
        "foundations-general-white": "var(--foundations-general-white)",
        "foundations-grayscale-200": "var(--foundations-grayscale-200)",
        "foundations-grayscale-600": "var(--foundations-grayscale-600)",
        "foundations-grayscale-900": "var(--foundations-grayscale-900)",
        "foundations-yellow-50": "var(--foundations-yellow-50)",
        "gray-200": "var(--gray-200)",
        "gray-300": "var(--gray-300)",
        "gray-600": "var(--gray-600)",
        "gray-700": "var(--gray-700)",
        "gray-900": "var(--gray-900)",
        "tokens-background-bg-secondary":
            "var(--tokens-background-bg-secondary)",
        "tokens-border-border-primary": "var(--tokens-border-border-primary)",
        "tokens-button-primary": "var(--tokens-button-primary)",
        "tokens-text-primary": "var(--tokens-text-primary)",
        "tokens-text-secondary": "var(--tokens-text-secondary)",
        white: "var(--white)",
      },
      fontFamily: {
        "text-sm-medium": "var(--text-sm-medium-font-family)",
        "text-xl-24": "var(--text-xl-24-font-family)",
      },
      boxShadow: {
        "shadow-xs": "var(--shadow-xs)",
      },
    },
  },
  plugins: [],
};
