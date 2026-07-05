const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const appsDirs = [
  'apps/public/src',
  'apps/mgmt/src',
  'apps/superadmin/src',
  'apps/api/src',
  'apps/waba/src',
  'apps/webmail/src'
];

let files = [];
appsDirs.forEach(dir => {
  files = files.concat(walk(dir));
});

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace @/lib/... with @tecbunny/core/...
  // Using global regex to match any import path starting with @/lib/
  const libRegex = /from\s+["']@\/lib\/(.*)["']/g;
  content = content.replace(libRegex, 'from "@tecbunny/core/$1"');
  
  const libRegex2 = /import\s+["']@\/lib\/(.*)["']/g;
  content = content.replace(libRegex2, 'import "@tecbunny/core/$1"');

  // Relative imports from lib, e.g. ../../lib/...
  const relLibRegex = /from\s+["'](?:\.\.\/)+lib\/(.*)["']/g;
  content = content.replace(relLibRegex, 'from "@tecbunny/core/$1"');

  // Replace @/store/...
  const storeRegex = /from\s+["']@\/store\/(.*)["']/g;
  content = content.replace(storeRegex, 'from "@tecbunny/core/store/$1"');
  
  const relStoreRegex = /from\s+["'](?:\.\.\/)+store\/(.*)["']/g;
  content = content.replace(relStoreRegex, 'from "@tecbunny/core/store/$1"');

  // Replace @/context/...
  const ctxRegex = /from\s+["']@\/context\/(.*)["']/g;
  content = content.replace(ctxRegex, 'from "@tecbunny/core/context/$1"');
  
  const relCtxRegex = /from\s+["'](?:\.\.\/)+context\/(.*)["']/g;
  content = content.replace(relCtxRegex, 'from "@tecbunny/core/context/$1"');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files with @tecbunny/core imports.`);
