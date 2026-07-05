const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const mgmtComponentsDir = path.join(PROJECT_ROOT, 'apps', 'mgmt', 'src', 'components');

function replaceMgmtMobileNavImports(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceMgmtMobileNavImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let changed = false;
      if (content.includes("@/components/mgmt/MgmtMobileNav")) {
        content = content.replace(/@\/components\/mgmt\/MgmtMobileNav/g, "@tecbunny/admin-ui");
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content);
      }
    }
  }
}
replaceMgmtMobileNavImports(mgmtComponentsDir);
console.log('Fixed MgmtMobileNav imports in mgmt!');
