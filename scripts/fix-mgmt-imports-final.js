const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const mgmtDir = path.join(PROJECT_ROOT, 'apps', 'mgmt', 'src', 'app', 'mgmt');

function fixMgmtImports(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fixMgmtImports(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let changed = false;
      
      // Fix default imports: import X from '@tecbunny/admin-ui' -> import { X } from '@tecbunny/admin-ui'
      const defaultImportRegex = /import\s+([A-Z]\w+)\s+from\s+['"]@tecbunny\/admin-ui['"]/g;
      if (defaultImportRegex.test(content)) {
        content = content.replace(defaultImportRegex, "import { $1 } from '@tecbunny/admin-ui'");
        changed = true;
      }
      
      // Fix Adminusers to AdminUsers
      if (content.includes('Adminusers')) {
        content = content.replace(/Adminusers/g, 'AdminUsers');
        changed = true;
      }
      // Fix Adminservices to AdminServices
      if (content.includes('Adminservices')) {
        content = content.replace(/Adminservices/g, 'AdminServices');
        changed = true;
      }
      // Fix Adminproducts to AdminProductsNew or AdminProducts
      if (content.includes('Adminproducts')) {
        content = content.replace(/Adminproducts-new/g, 'AdminProductsNew');
        content = content.replace(/Adminproducts/g, 'AdminProductsNew');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

fixMgmtImports(mgmtDir);
console.log('Fixed default imports and casing in mgmt!');
