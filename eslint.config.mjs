import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// eslint-config-next already registers the jsx-a11y plugin, so we must NOT
// redefine it — only (re)configure its rules. Enable the full recommended set
// at "warn" level: informational a11y signals without breaking CI across the
// 191 existing tool pages.
const jsxA11yWarn = {
  rules: Object.fromEntries(
    Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [rule, 'warn'])
  ),
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  jsxA11yWarn,
  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'scripts/**']),
  // react-hooks/set-state-in-effect is a new React 19 rule that flags setState
  // inside useEffect. The codebase uses this valid pattern extensively (localStorage
  // reads, URL param syncs). Downgrade to warn to unblock CI.
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler advisory rules (eslint-plugin-react-hooks v7). Il compiler
      // NON e abilitato in next.config.ts, quindi non hanno impatto runtime/build.
      // Declassate a warn per sbloccare la CI, coerente con set-state-in-effect.
      // Restano visibili come warning = tech-debt tracciato, non nascosto.
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]);

export default eslintConfig;
