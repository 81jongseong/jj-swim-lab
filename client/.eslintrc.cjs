module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-case-declarations': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'import/no-anonymous-default-export': 'off',
    '@next/next/no-img-element': 'off'
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  globals: {
    React: 'readonly',
    HeadersInit: 'readonly',
    RequestInit: 'readonly',
    NodeJS: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly'
  }
};
