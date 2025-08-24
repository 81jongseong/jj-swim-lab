module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    'no-unused-vars': 'warn',
    'no-explicit-any': 'warn',
    'no-console': 'warn'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  }
};
