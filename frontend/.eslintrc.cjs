module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'src/components/UI/**',
    'tests/**',
    'src/AncloraNexus.ts',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-case-declarations': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/components/UI/*', '**/components/ui-components', '**/components/ui-components/*'],
            message: "Usa el barrel unificado: components/ui",
          },
        ],
      },
    ],
  },
};

