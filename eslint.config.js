import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import harrisConfig from 'eslint-config-harris';
import globals from 'eslint-config-harris/globals';
import harrisUnicornConfig from 'eslint-config-harris/unicorn';
import harrisVitestConfig from 'eslint-config-harris/vitest';

const eslintConfig = defineConfig([
  ...harrisConfig,
  ...harrisUnicornConfig,
  ...harrisVitestConfig,
  globalIgnores([
    'dist',
    'src/vite-env.d.ts',
    'src/types/database.gen.ts',
    'src/routeTree.gen.ts',
    'stuff',
    'coverage',
  ]),
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
    files: ['src/components/ui/**'],
    rules: {
      'react/no-unused-prop-types': 'off',
      'react/require-default-props': 'off',
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
