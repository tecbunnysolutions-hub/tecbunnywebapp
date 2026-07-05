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
  'apps/waba/src',
  'apps/webmail/src'
];

let files = [];
appsDirs.forEach(dir => {
  files = files.concat(walk(dir));
});

let changedFiles = 0;

const targetRegexes = [
  /(?:['"]@tecbunny\/database['"])/,
  /(?:['"]@tecbunny\/core\/supabase-server['"])/,
  /(?:['"](?:\.\.\/)+logger['"])/,
  /(?:['"](?:\.\.\/)+supabase['"])/,
  /(?:['"](?:\.\.\/)+supabase-server['"])/,
  /(?:['"](?:\.\.\/)+supabase-storage['"])/,
  // Match '@tecbunny/core' too so we can consolidate
  /(?:['"]@tecbunny\/core['"])/
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const importRegex = /^import\s+(.*?)\s+from\s+(['"].+?['"]);?/gm;
  let match;
  
  const allImports = [];
  while ((match = importRegex.exec(content)) !== null) {
    allImports.push({
      full: match[0],
      specifiers: match[1],
      path: match[2],
      index: match.index,
      length: match[0].length
    });
  }

  let itemsToExtract = new Set();
  let defaultImports = new Set();
  let needsChange = false;

  allImports.forEach(imp => {
    let isTarget = false;
    for (let r of targetRegexes) {
      if (r.test(imp.path)) {
        isTarget = true;
        break;
      }
    }

    if (isTarget) {
      needsChange = true;
      let specStr = imp.specifiers.trim();
      
      content = content.replace(imp.full + '\n', '');
      content = content.replace(imp.full, ''); 
      
      if (specStr.startsWith('{') && specStr.endsWith('}')) {
        let items = specStr.slice(1, -1).split(',').map(s => s.trim()).filter(s => s);
        items.forEach(i => itemsToExtract.add(i));
      } else {
        let parts = specStr.split(',');
        if (parts[0] && !parts[0].includes('{')) {
          defaultImports.add(parts[0].trim());
        }
        if (parts[1] && parts[1].includes('{')) {
          let items = parts[1].trim().slice(1, -1).split(',').map(s => s.trim()).filter(s => s);
          items.forEach(i => itemsToExtract.add(i));
        }
      }
    }
  });

  if (needsChange) {
    let newImportStr = '';
    let named = Array.from(itemsToExtract).sort();
    let def = Array.from(defaultImports).sort();
    
    if (named.length > 0 || def.length > 0) {
      let specParts = [];
      if (def.length > 0) {
        specParts.push(def.join(', '));
      }
      if (named.length > 0) {
        specParts.push(`{ ${named.join(', ')} }`);
      }
      
      newImportStr = `import ${specParts.join(', ')} from "@tecbunny/core";\n`;
      
      if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
        let lines = content.split('\n');
        lines.splice(1, 0, newImportStr);
        content = lines.join('\n');
      } else if (content.startsWith('// export const dynamic')) {
        let lines = content.split('\n');
        lines.splice(1, 0, newImportStr);
        content = lines.join('\n');
      } else {
        content = newImportStr + content;
      }
      
      fs.writeFileSync(file, content);
      changedFiles++;
    }
  }
});

console.log(`Relinked WABA/Webmail imports in ${changedFiles} files.`);
