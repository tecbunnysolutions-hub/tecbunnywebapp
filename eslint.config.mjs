// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import jsxA11y from 'eslint-plugin-jsx-a11y';

import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appsDir = path.resolve(__dirname, './apps');
const apps = fs.existsSync(appsDir) ? fs.readdirSync(appsDir).filter(f => fs.statSync(path.resolve(appsDir, f)).isDirectory()) : [];

const baselinePath = path.resolve(__dirname, './quality/db-boundary-baseline.json');
const grandfathered = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')).files ?? [] : [];

const boundaryGrandfather = path.resolve(__dirname, './scripts/boundary-grandfather.json');
const globEscape = (file) => file.replace(/[[\]()!{}*?]/g, '\\$&');
const envGrandfathered = fs.existsSync(boundaryGrandfather)
  ? [...new Set(JSON.parse(fs.readFileSync(boundaryGrandfather, 'utf8')).violations.filter(v => v.rule === 'env-read').map(v => globEscape(v.file)))]
  : [];

const UI_PRIMITIVE_SELECTOR = {
  selector: 'VariableDeclarator[id.name=/^(Button|Card|Input|Badge|Dialog|Modal|Popover|Select|Switch|Tabs|Toast)$/]',
  message: 'Do not define local UI primitives. Import them from the @tecbunny/ui Design System instead.',
};
const ENV_ALLOWED = '^(NODE_ENV|NEXT_OUTPUT_MODE|DOCKER_BUILD|ANALYZE|CI|API_TARGET|VERCEL_.*)$';
const ENV_MESSAGE = 'UI code must not read process.env (tooling flags only). Use GET /api/v1/config/public via @tecbunny/api-client.';
const envSelectors = [
  { selector: `MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][computed=false][property.name!=/${ENV_ALLOWED}/]`, message: ENV_MESSAGE },
  { selector: `MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][computed=true]`, message: ENV_MESSAGE },
  { selector: `MemberExpression[object.type='MetaProperty'][property.name='env']`, message: ENV_MESSAGE },
];
const envRule = (level, withPrimitives) => [level, ...(withPrimitives ? [UI_PRIMITIVE_SELECTOR] : []), ...envSelectors];

const dbBoundaryRule = (level) => [level, {
  paths: [
    { name: '@prisma/client', message: 'Only apps/api may talk to the database. Call the API via @tecbunny/api-client.' },
    { name: '@tecbunny/db', message: 'Only apps/api may talk to the database. Call the API via @tecbunny/api-client.' },
    { name: '@supabase/supabase-js', allowTypeImports: true, message: 'Only apps/api may use the Supabase data client. Call the API via @tecbunny/api-client.' },
    { name: '@tecbunny/database/admin', message: 'The service-role client is API-only.' },
    { name: '@tecbunny/database/server', message: 'Server data clients are API-only.' },
  ],
}];

const zones = apps.map(app => ({
  target: `apps/${app}/**/*`,
  from: apps.filter(a => a !== app).map(a => `apps/${a}/**/*`),
  message: 'Apps cannot import from other apps. Only code residing in packages/ can be imported.'
}));

export default [{
  ignores: ['**/.next/**', '**/.turbo/**', '**/dist/**', '**/out/**', '**/build/**', '**/coverage/**', '**/storybook-static/**', '**/next-env.d.ts'],
}, {
  plugins: {
    import: importPlugin,
  },
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones
      }
    ]
  }
}, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    "tecbunny-jsx-a11y": jsxA11y,
  },
  rules: {
    'tecbunny-jsx-a11y/alt-text': 'error',
    'tecbunny-jsx-a11y/anchor-has-content': 'error',
    'tecbunny-jsx-a11y/aria-props': 'error',
    'tecbunny-jsx-a11y/aria-role': 'error',
    'tecbunny-jsx-a11y/click-events-have-key-events': 'warn',
    'tecbunny-jsx-a11y/heading-has-content': 'error',
    'tecbunny-jsx-a11y/interactive-supports-focus': 'warn',
    'tecbunny-jsx-a11y/label-has-associated-control': 'error',
    'tecbunny-jsx-a11y/no-autofocus': 'warn',
    'tecbunny-jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'tecbunny-jsx-a11y/no-static-element-interactions': 'warn',
    'tecbunny-jsx-a11y/role-has-required-aria-props': 'error',
  },
}, {
  files: ["apps/**/*.tsx", "apps/**/*.jsx"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "VariableDeclarator[id.name=/^(Button|Card|Input|Badge|Dialog|Modal|Popover|Select|Switch|Tabs|Toast)$/]",
        "message": "Do not define local UI primitives. Import them from the @tecbunny/ui Design System instead."
      }
    ]
  }
}, {
  files: ["**/*.ts", "**/*.tsx"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/exhaustive-deps": "off"
  }
}, {
  // Boundary: every app except apps/api is UI-only. Existing violations are grandfathered as warnings
  // via quality/db-boundary-baseline.json (see scripts/validate-api-boundary.mjs).
  files: ['apps/**/*.{ts,tsx,js,jsx,mjs}'],
  ignores: ['apps/api/**'],
  rules: { 'no-restricted-imports': dbBoundaryRule('error') },
}, ...(grandfathered.length ? [{
  files: grandfathered,
  rules: { 'no-restricted-imports': dbBoundaryRule('warn') },
}] : []), {
  // process.env outside the tooling allowlist is an error in UI apps; existing reads are warnings (scripts/boundary-grandfather.json).
  files: ['apps/**/*.{ts,js,mjs}'],
  ignores: ['apps/api/**', 'apps/worker/**'],
  rules: { 'no-restricted-syntax': envRule('error', false) },
}, {
  files: ['apps/**/*.{tsx,jsx}'],
  ignores: ['apps/api/**', 'apps/worker/**'],
  rules: { 'no-restricted-syntax': envRule('error', true) },
}, ...(envGrandfathered.length ? [{
  files: envGrandfathered,
  rules: { 'no-restricted-syntax': envRule('warn', true) },
}] : []), ...storybook.configs["flat/recommended"]];
