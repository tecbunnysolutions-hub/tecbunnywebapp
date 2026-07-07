import importPlugin from 'eslint-plugin-import';
import fs from 'fs';
import path from 'path';

const apps = fs.readdirSync(path.resolve('./apps')).filter(f => fs.statSync(path.resolve('./apps', f)).isDirectory());

const zones = apps.map(app => ({
  target: `apps/${app}/**/*`,
  from: `apps/!(${app})/**/*`,
  message: 'Apps cannot import from other apps. Share code via packages/.'
}));

export default [
  {
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
  }
];
