import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

/**
 * Flat config (ESLint v9). Order matters:
 *   1. Next.js Core Web Vitals + TypeScript rule sets
 *   2. eslint-config-prettier last, so it disables every rule that would
 *      conflict with Prettier formatting
 *   3. globalIgnores overrides
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'node_modules/**',
    'public/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
