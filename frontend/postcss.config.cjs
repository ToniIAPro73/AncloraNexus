// postcss.config.js
export default {
  plugins: {
    tailwindcss: require('@tailwindcss/postcss7-compat')({}),
    autoprefixer: {},
  },
}

