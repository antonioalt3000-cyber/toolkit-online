import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      'e2e/**',
      '**/.claude/**',
      'pins/**',
    ],
    environment: 'node',
  },
  resolve: {
    // Mirrors the "@/*" -> "./*" path alias from tsconfig.json.
    alias: { '@': root },
  },
});
