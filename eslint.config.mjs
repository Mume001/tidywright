// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Project rules that are not style. Each one exists because breaking it caused,
 * or would cause, a real incident. See docs/22-security.md.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/.turbo/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // Rule 1: every third-party URL goes through safeFetch. Nowhere else.
  // docs/22-security.md, section 1.
  {
    files: ['apps/worker/**/*.ts', 'packages/crawler/**/*.ts', 'packages/checks/**/*.ts'],
    ignores: ['packages/crawler/src/safe-fetch.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Never fetch a third-party URL directly. Use safeFetch from @tw/crawler, which does SSRF checks, IP pinning and manual redirects. See docs/22-security.md.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'undici',
              importNames: ['request', 'fetch'],
              message: 'Use safeFetch from @tw/crawler instead of calling undici directly.',
            },
          ],
        },
      ],
    },
  },

  // Rule 2: the Supabase service key never reaches anything the browser can load.
  // docs/16-access-control.md, "Kako se sprovodi".
  {
    files: ['apps/web/app/**/*.{ts,tsx}', 'apps/web/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/server-only/**', '@tw/shared/server-only'],
              message:
                'This module holds the service key and bypasses RLS. It belongs to the worker and to webhook routes only, never to app code.',
            },
          ],
        },
      ],
    },
  },

  // Rule 3: no raw HTML injection. Third-party page content is rendered everywhere
  // in the report. docs/22-security.md, section 7.
  {
    files: ['apps/web/**/*.tsx', 'packages/ui/**/*.tsx'],
    ignores: ['**/json-ld-view.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            'The report renders text taken from other people’s websites. Let React escape it. The single exception is json-ld-view.tsx, which stringifies into a <pre>.',
        },
      ],
    },
  },

  // Tests may do what they like.
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/vitest.setup.ts', '**/*.stories.tsx'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
    },
  },
)
