const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
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

const files = walk('apps/public/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const regex = /import\s+{([^}]+)}\s+from\s+["'](?:\.\.\/)+((?:components\/)?ui\/[^"']+)["']/g;
  content = content.replace(regex, (match, p1) => {
    return `import {${p1}} from "@tecbunny/ui"`;
  });

  const aliasRegex = /import\s+{([^}]+)}\s+from\s+["']@\/components\/ui\/[^"']+["']/g;
  content = content.replace(aliasRegex, (match, p1) => {
    return `import {${p1}} from "@tecbunny/ui"`;
  });

  const toastRegex = /import\s+{\s*useToast\s*}\s+from\s+["'](?:\.\.\/)+(?:hooks\/)?use-toast["']/g;
  content = content.replace(toastRegex, 'import { useToast } from "@tecbunny/ui"');
  
  const toastAliasRegex = /import\s+{\s*useToast\s*}\s+from\s+["']@\/hooks\/use-toast["']/g;
  content = content.replace(toastAliasRegex, 'import { useToast } from "@tecbunny/ui"');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files with fixed UI imports.`);
