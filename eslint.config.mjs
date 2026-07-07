// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import importPlugin from 'eslint-plugin-import';
import fs from 'fs';
import path from 'path';

const apps = fs.readdirSync(path.resolve('./apps')).filter(f => fs.statSync(path.resolve('./apps', f)).isDirectory());

const zones = apps.map(app => ({
  target: `apps/${app}/**/*`,
  from: `apps/!(${app})/**/*`,
  message: 'Apps cannot import from other apps. Share code via packages/.'
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
  files: ["apps/**/*.tsx", "apps/**/*.jsx"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "VariableDeclarator[id.name=/^(Button|Card|Input|Badge|Dialog|Modal|Popover|Select|Switch|Tabs|Toast)$/]",
        "message": "Do not define local UI primitives. Import them from the @tecbunny/ui Design System instead."
      },
      {
        "selector": "FunctionDeclaration[id.name=/^(Button|Card|Input|Badge|Dialog|Modal|Popover|Select|Switch|Tabs|Toast)$/]",
        "message": "Do not define local UI primitives. Import them from the @tecbunny/ui Design System instead."
      }
    ]
  }
}, ...storybook.configs["flat/recommended"]];
