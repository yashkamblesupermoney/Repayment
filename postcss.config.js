// postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({
      config: './tailwind.config.js', // optional if you're using default location
    }),
    require('autoprefixer'),
  ],
}
