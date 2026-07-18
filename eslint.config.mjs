// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

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
