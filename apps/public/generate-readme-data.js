const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'generated_docs.md');

const ignoreDirs = new Set(['node_modules', '.next', '.git', '.vercel', 'public', 'scratch']);
const targetRootFiles = new Set([
  'package.json',
  'next.config.mjs',
  'tailwind.config.ts',
  'middleware.ts',
  'eslint.config.js',
  'postcss.config.mjs',
  'tsconfig.json',
]);

const fileData = [];

function walkDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.has(item)) {
        walkDir(fullPath);
      }
    } else {
      // Process if it's in src/ or is a targeted root file
      const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
      if (relativePath.startsWith('src/') || relativePath.startsWith('supabase/') || targetRootFiles.has(relativePath)) {
        processFile(fullPath, relativePath);
      }
    }
  }
}

function processFile(fullPath, relativePath) {
  try {
    const ext = path.extname(fullPath);
    // Only process text files
    if (!['.js', '.ts', '.tsx', '.jsx', '.json', '.mjs', '.md', '.css', '.yaml', '.yml', '.sql'].includes(ext)) {
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    // Extract Exports
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+([a-zA-Z0-9_]+)/g;
    const exportsSet = new Set();
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exportsSet.add(match[1]);
    }
    // Also catch 'export { A, B }'
    const exportBracketRegex = /export\s+\{\s*([^}]+)\s*\}/g;
    while ((match = exportBracketRegex.exec(content)) !== null) {
      const parts = match[1].split(',').map(s => s.trim().split(/\s+/)[0]);
      parts.forEach(p => { if (p) exportsSet.add(p); });
    }
    
    // Default export without name
    if (content.includes('export default function(') || content.includes('export default function (')) {
        exportsSet.add('default');
    }

    // Extract Imports
    const importRegex = /import\s+(?:[^"']+)\s+from\s+['"]([^'"]+)['"]/g;
    const importsSet = new Set();
    while ((match = importRegex.exec(content)) !== null) {
      importsSet.add(match[1]);
    }
    // Dynamic imports
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      importsSet.add(match[1]);
    }

    // Guess purpose
    let purpose = 'General component/module';
    if (relativePath.startsWith('src/app/api')) purpose = 'API Route Handler';
    else if (relativePath.startsWith('src/app')) purpose = 'Next.js App Route/Layout';
    else if (relativePath.startsWith('src/components/ui')) purpose = 'Reusable UI Component';
    else if (relativePath.startsWith('src/components')) purpose = 'Feature Component';
    else if (relativePath.startsWith('src/hooks')) purpose = 'Custom React Hook';
    else if (relativePath.startsWith('src/lib')) purpose = 'Utility/Library code';
    else if (relativePath.startsWith('src/context')) purpose = 'React Context Provider';
    else if (relativePath.startsWith('supabase/')) purpose = 'Supabase DB config/migration';
    else if (ext === '.json') purpose = 'Configuration/Data';
    else if (ext === '.css') purpose = 'Global/Module Styles';

    fileData.push({
      path: relativePath,
      purpose,
      exports: Array.from(exportsSet).slice(0, 5).join(', ') + (exportsSet.size > 5 ? '...' : '') || 'None',
      imports: Array.from(importsSet).slice(0, 5).join(', ') + (importsSet.size > 5 ? '...' : '') || 'None'
    });
  } catch (err) {
    console.error(`Failed to process ${relativePath}:`, err);
  }
}

// Build Markdown
function generateMarkdown() {
  let md = '### File Architecture Tree\n\n```text\n';
  
  const tree = {};
  fileData.forEach(f => {
    const parts = f.path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = i === parts.length - 1 ? null : {};
      }
      current = current[part];
    }
  });

  function printTree(node, indent = '') {
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const marker = isLast ? '└── ' : '├── ';
      md += `${indent}${marker}${key}\n`;
      if (node[key]) {
        printTree(node[key], indent + (isLast ? '    ' : '│   '));
      }
    });
  }
  
  printTree(tree);
  md += '```\n\n';

  md += '### Exhaustive File Mapping\n\n';
  md += '| File Path | Primary Purpose | Key Exports | Relationships |\n';
  md += '|---|---|---|---|\n';

  fileData.sort((a, b) => a.path.localeCompare(b.path));
  fileData.forEach(f => {
    md += `| \`${f.path}\` | ${f.purpose} | ${f.exports || '-'} | ${f.imports || '-'} |\n`;
  });

  fs.writeFileSync(outputFile, md, 'utf8');
  console.log(`Generated docs for ${fileData.length} files at ${outputFile}`);
}

walkDir(projectRoot);
generateMarkdown();
