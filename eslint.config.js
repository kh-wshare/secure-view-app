const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const prettier = require('eslint-config-prettier');

// RN/JS runtime globals not covered by eslint's base "recommended" env.
const rnGlobals = {
  __DEV__: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  require: 'readonly',
  module: 'writable',
  process: 'readonly',
  global: 'readonly',
};

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: rnGlobals,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      // Only the two hook rules that matter without opting into the React
      // Compiler. eslint-plugin-react-hooks v7's "recommended" preset also
      // bundles compiler-only diagnostics (refs, purity, set-state-in-effect,
      // immutability, etc.) that flag completely idiomatic React Native code
      // (e.g. `useRef(new Animated.Value(...)).current`, deriving mock data
      // with `Date.now()`). This project does not use the React Compiler, so
      // those are intentionally left off rather than fought on every screen.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Apostrophes/quotes in <Text> children are completely safe in React
      // Native (this rule exists for HTML/JSX-in-web escaping concerns).
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'off',
    },
  },
  {
    // React Navigation's official pattern for augmenting its root param list
    // (see reactnavigation.org/docs/typescript) requires a `declare global`
    // namespace with an empty extending interface — both flagged by rules
    // that otherwise make sense everywhere else in the app.
    files: ['src/app/navigation/types.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    // Root-level CommonJS config files (Node, not the RN runtime).
    files: ['*.config.js', '.prettierrc.js'],
    languageOptions: {
      globals: { module: 'writable', require: 'readonly', process: 'readonly', __dirname: 'readonly' },
    },
  },
  { ignores: ['node_modules/**', '.expo/**', 'dist/**'] },
  prettier,
];
