module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: ['**/*'], // 모든 파일 무시
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    // Client (Next.js) 설정
    {
      files: ['client/**/*.{ts,tsx,js,jsx}'],
      extends: [
        'next/core-web-vitals'
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      rules: {
        // Next.js 관련 규칙
        '@next/next/no-img-element': 'off',
        '@next/next/no-html-link-for-pages': 'off',
        // React 관련 규칙
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': 'warn',
        'no-explicit-any': 'warn',
        'react/jsx-key': 'warn',
      },
    },
    // Server 설정
    {
      files: ['server/**/*.{ts,js}'],
      extends: [
        'eslint:recommended'
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      env: {
        node: true,
        es6: true,
      },
      rules: {
        // 서버에서는 console.log 허용
        'no-console': 'off',
        'no-unused-vars': 'warn',
      },
    },
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-explicit-any': 'warn',
    'react/jsx-key': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
