import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import harrisConfig from 'eslint-config-harris';
import globals from 'eslint-config-harris/globals';

const eslintConfig = defineConfig([
  ...harrisConfig,
  globalIgnores(['dist', 'src/vite-env.d.ts', 'src/types/database.types.ts', 'stuff']),
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
    rules: {
      'no-console': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
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
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);

export default eslintConfig;
