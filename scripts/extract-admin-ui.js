const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ADMIN_UI_DIR = path.join(PROJECT_ROOT, 'packages', 'admin-ui');
const ADMIN_UI_SRC = path.join(ADMIN_UI_DIR, 'src');

// 1. Create directories
fs.mkdirSync(ADMIN_UI_DIR, { recursive: true });
fs.mkdirSync(ADMIN_UI_SRC, { recursive: true });
fs.mkdirSync(path.join(ADMIN_UI_SRC, 'components'), { recursive: true });
fs.mkdirSync(path.join(ADMIN_UI_SRC, 'shared'), { recursive: true });

// 2. Create package.json
const packageJson = {
  name: "@tecbunny/admin-ui",
  version: "1.0.0",
  main: "./src/index.tsx",
  types: "./src/index.tsx",
  dependencies: {
    "@tecbunny/core": "workspace:*",
    "@tecbunny/ui": "workspace:*",
    "lucide-react": "^0.477.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.1.7",
    "date-fns": "^4.1.0",
    "recharts": "^2.15.1"
  },
  devDependencies: {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0"
  }
};
fs.writeFileSync(path.join(ADMIN_UI_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

// 3. Create tsconfig.json
const tsconfig = {
  "compilerOptions": {
    "target": "es2015",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
};
fs.writeFileSync(path.join(ADMIN_UI_DIR, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

// 4. Copy files from mgmt/src/components/admin to packages/admin-ui/src/components
const mgmtAdminDir = path.join(PROJECT_ROOT, 'apps', 'mgmt', 'src', 'components', 'admin');
const destAdminDir = path.join(ADMIN_UI_SRC, 'components');
fs.cpSync(mgmtAdminDir, destAdminDir, { recursive: true });

// 5. Copy some shared files if they exist (like LoadingSpinner, UniversalSearch, etc.)
const mgmtSharedDir = path.join(PROJECT_ROOT, 'apps', 'mgmt', 'src', 'components', 'shared');
const destSharedDir = path.join(ADMIN_UI_SRC, 'shared');
if (fs.existsSync(mgmtSharedDir)) {
  fs.cpSync(mgmtSharedDir, destSharedDir, { recursive: true });
}

// 6. Fix aliases inside the copied files
function fixAliases(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fixAliases(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Replace @/components/shared with @/shared
      content = content.replace(/@\/components\/shared/g, '@/shared');
      
      // Replace @/components/admin with @/components
      content = content.replace(/@\/components\/admin/g, '@/components');
      
      fs.writeFileSync(filePath, content);
    }
  }
}
fixAliases(ADMIN_UI_SRC);

// 7. Create index.tsx exporting everything
let indexExports = '';
const adminFiles = fs.readdirSync(destAdminDir);
for (const file of adminFiles) {
  if (file.endsWith('.tsx')) {
    const name = file.replace('.tsx', '');
    indexExports += `export * from './components/${name}';\n`;
  }
}
const sharedFiles = fs.readdirSync(destSharedDir);
for (const file of sharedFiles) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const name = file.replace(/\.tsx?$/, '');
    indexExports += `export * from './shared/${name}';\n`;
  }
}
fs.writeFileSync(path.join(ADMIN_UI_SRC, 'index.tsx'), indexExports);

console.log('Successfully created @tecbunny/admin-ui package!');
