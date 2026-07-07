const fs = require('fs');
const apps = ['api', 'mgmt', 'public', 'superadmin', 'waba', 'webmail'];
apps.forEach(app => {
  const file = `apps/${app}/eslint.config.mjs`;
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('rootConfig')) {
      content = content.replace('import nextTs from "eslint-config-next/typescript";', 'import nextTs from "eslint-config-next/typescript";\nimport rootConfig from "../../eslint.config.mjs";');
      content = content.replace('const eslintConfig = defineConfig([', 'const eslintConfig = defineConfig([\n  ...rootConfig,');
      fs.writeFileSync(file, content);
    }
  }
});
