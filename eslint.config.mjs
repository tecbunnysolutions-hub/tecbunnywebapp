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
}, ...storybook.configs["flat/recommended"]];
