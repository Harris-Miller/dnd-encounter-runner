import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import harrisConfig from 'eslint-config-harris';
import globals from 'eslint-config-harris/globals';

const eslintConfig = defineConfig([
  ...harrisConfig,
  globalIgnores(['dist', 'src/vite-env.d.ts', 'src/types/database.gen.ts', 'stuff']),
  ...pluginRouter.configs['flat/recommended'],
  {
    files: ['src/**'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['*.ts'],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
  {
    files: ['db/**'],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
    rules: {
      'no-await-in-loop': 'off',
    },
  },
  {
    rules: {
      'no-console': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
      },
    },
  },
]);

export default eslintConfig;
