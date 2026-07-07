const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.{ts,tsx}': (filenames) => {
    const workspaces = new Set();
    const cwd = process.cwd();
    
    for (const file of filenames) {
      const relativePath = path.relative(cwd, file).replace(/\\/g, '/');
      const match = relativePath.match(/^(apps|packages)\/([^\/]+)/);
      if (match) {
        workspaces.add(`${match[1]}/${match[2]}`);
      }
    }
    
    if (workspaces.size === 0) return [];
    
    return Array.from(workspaces).map(dir => `npx tsc --noEmit --project ./${dir}/tsconfig.json`);
  }
};
