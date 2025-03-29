// @ts-check

import eslint from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import canonicalPlugin from 'eslint-plugin-canonical';
import nPlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import promisePlugin from 'eslint-plugin-promise';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import github from 'eslint-plugin-github';

const githubFlatConfig = github.getFlatConfigs();

export default tseslint.config(
  // Define all plugins once at the top level
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@stylistic': stylisticPlugin,
      canonical: canonicalPlugin,
      n: nPlugin,
      sonarjs: sonarjsPlugin,
      promise: promisePlugin,
      import: importPlugin, // Define import plugin here once
      unicorn: unicornPlugin,
      github: github,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json', // Use project instead of projectService
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: true, // Enable TypeScript resolver for import plugin
      },
    },
    rules: {
      // Base ESLint recommended rules
      ...eslint.configs.recommended.rules,

      // Promise plugin rules
      ...promisePlugin.configs['flat/recommended'].rules,

      // Simple import sort rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Stylistic rules
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
      '@stylistic/keyword-spacing': 'error',
      '@stylistic/type-annotation-spacing': 'error',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      '@stylistic/semi': ['error', 'always'],

      // Import plugin rules (merged from recommended and typescript)
      'import/extensions': ['error', 'always', { ignorePackages: true }],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',

      // GitHub plugin rules
      ...githubFlatConfig.recommended.rules,
      'eslintComments/no-use': 'off',
      ...githubFlatConfig.typescript.map(config => config.rules).reduce((acc, rules) => ({ ...acc, ...rules }), {}),

      // Unicorn plugin rules
      ...unicornPlugin.configs['flat/all'].rules,
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/expiring-todo-comments': 'off',

      // Canonical plugin rules
      ...canonicalPlugin.configs['flat/recommended'].rules,
      'canonical/filename-match-exported': 'error',
      'canonical/import-specifier-newline': 'off',
      'canonical/destructuring-property-newline': 'off',
      'canonical/no-restricted-strings': 'error',
      'canonical/no-use-extend-native': 'error',
      'canonical/prefer-inline-type-import': 'off',

      // SonarJS plugin rules
      ...sonarjsPlugin.configs.recommended.rules,
      'sonarjs/no-duplicate-string': 'off',

      // Prettier plugin rules
      ...prettierPlugin.rules,
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          bracketSpacing: true,
        },
      ],

      // N plugin rules
      ...nPlugin.configs['flat/recommended'].rules,
      'n/no-extraneous-import': 'off',
      'n/no-missing-import': 'off',

      // TypeScript rules
      ...tseslint.configs.strictTypeChecked[0].rules,
      ...tseslint.configs.eslintRecommended.rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      'max-params': ['error', 7],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-restricted-types': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['off', { overrides: { constructors: 'off' } }],
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'], filter: { regex: '^_.*$', match: false } },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'memberLike', modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'forbid' },
        { selector: 'variable', types: ['boolean'], format: ['PascalCase'], prefix: ['is', 'should', 'has', 'can', 'did', 'will'] },
      ],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-expressions': ['error'],
      'no-await-in-loop': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'try' },
        { blankLine: 'always', prev: 'try', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'throw' },
        { blankLine: 'always', prev: 'var', next: '*' },
      ],
      'arrow-body-style': 'error',
      'arrow-parens': ['error', 'always'],
      complexity: 'off',
      'no-restricted-imports': ['error', { paths: [{ name: 'rxjs/Rx', message: "Please import directly from 'rxjs' instead" }] }],
      'object-curly-spacing': ['error', 'always'],
      'no-multi-spaces': 'error',
      'no-useless-return': 'error',
      'no-else-return': 'error',
      'no-implicit-coercion': 'error',
      'constructor-super': 'error',
      yoda: 'error',
      strict: ['error', 'never'],
      curly: 'error',
      'dot-notation': 'error',
      'eol-last': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'id-match': 'error',
      'max-classes-per-file': 'off',
      'max-len': ['error', { code: 150 }],
      'new-parens': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'error',
      'no-constant-condition': 'error',
      'no-dupe-else-if': 'error',
      'lines-between-class-members': ['error', 'always'],
      'no-console': [
        'error',
        {
          allow: [
            'info', 'dirxml', 'warn', 'error', 'dir', 'timeLog', 'assert', 'clear', 'count',
            'countReset', 'group', 'groupCollapsed', 'groupEnd', 'table', 'Console',
            'markTimeline', 'profile', 'profileEnd', 'timeline', 'timelineEnd', 'timeStamp', 'context',
          ],
        },
      ],
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-fallthrough': 'error',
      'no-invalid-this': 'error',
      'no-irregular-whitespace': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-return-await': 'error',
      'no-sequences': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-shadow': 'off',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'quote-props': ['error', 'consistent-as-needed'],
      radix: 'error',
      'use-isnan': 'error',
      'valid-typeof': 'off',
      'space-before-function-paren': 'off',
    },
  },
);