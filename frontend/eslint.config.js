/* eslint-disable sort-keys-fix/sort-keys-fix */
import harrisConfig from 'eslint-config-harris';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...harrisConfig,
  {
    ignores: ['node_modules/', 'src/database.types.ts', 'src/vite-env.d.ts'],
  },
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      // remove once consume next eslint-config-harris
      '@typescript-eslint/switch-exhaustiveness-check': ['error', { requireDefaultForNonUnion: true }],
    },
  },
  {
    files: ['src/**'],
    languageOptions: {
      globals: globals.browser,
    },
  },
];

export default eslintConfig;
