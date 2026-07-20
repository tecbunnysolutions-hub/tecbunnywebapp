const fs = require('fs');
const path = require('path');
const semver = require('semver');

function findPackageJsons(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findPackageJsons(filePath, fileList);
    } else if (file === 'package.json') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const packageJsons = findPackageJsons(path.join(__dirname, 'apps')).concat(findPackageJsons(path.join(__dirname, 'packages')));
const rootPackageJson = path.join(__dirname, 'package.json');
packageJsons.push(rootPackageJson);

const allDeps = {};

// Step 1: Collect all versions
for (const pkgPath of packageJsons) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) };
    for (const [dep, version] of Object.entries(deps)) {
      if (dep.startsWith('@tecbunny/')) continue; // Ignore workspace links
      if (!allDeps[dep]) allDeps[dep] = new Set();
      allDeps[dep].add(version);
    }
  } catch (e) {
    console.error(`Error reading/parsing ${pkgPath}:`, e);
  }
}

// Step 2: Compute max version
const maxVersions = {};
for (const [dep, versionsSet] of Object.entries(allDeps)) {
  const versions = Array.from(versionsSet);
  if (versions.length === 1) {
    maxVersions[dep] = versions[0];
    continue;
  }
  
  // Sort by semver
  let highest = versions[0];
  for (let i = 1; i < versions.length; i++) {
    const v1 = highest.replace(/^[^\d]/, ''); // remove ^ or ~
    const v2 = versions[i].replace(/^[^\d]/, '');
    try {
        if (semver.gt(v2, v1)) {
            highest = versions[i]; // keep the prefix from the higher version
        } else if (semver.eq(v2, v1)) {
             // If equal, prefer the one with ^
            if (versions[i].startsWith('^')) highest = versions[i];
        }
    } catch(e) {
        console.warn(`Semver check failed for ${dep} between ${v1} and ${v2}, falling back to string comparison:`, e.message);
        // Fallback to simple string comparison if semver fails
        if (versions[i] > highest) highest = versions[i];
    }
  }
  maxVersions[dep] = highest;
}

// Custom overrides explicitly requested by plan
maxVersions['react'] = '19.2.6';
maxVersions['react-dom'] = '19.2.6';
maxVersions['next'] = '16.2.10';
maxVersions['typescript'] = '5.9.2';
maxVersions['zod'] = '^4.1.5';
maxVersions['@supabase/ssr'] = '0.7.0';

// Step 3: Rewrite package.json files
for (const pkgPath of packageJsons) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let modified = false;

    if (pkg.dependencies) {
      for (const [dep, version] of Object.entries(pkg.dependencies)) {
        if (maxVersions[dep] && version !== maxVersions[dep]) {
          pkg.dependencies[dep] = maxVersions[dep];
          modified = true;
        }
      }
    }
    if (pkg.devDependencies) {
      for (const [dep, version] of Object.entries(pkg.devDependencies)) {
        if (maxVersions[dep] && version !== maxVersions[dep]) {
          pkg.devDependencies[dep] = maxVersions[dep];
          modified = true;
        }
      }
    }
    if (pkg.peerDependencies) {
      for (const [dep, version] of Object.entries(pkg.peerDependencies)) {
        if (maxVersions[dep] && version !== maxVersions[dep]) {
          pkg.peerDependencies[dep] = maxVersions[dep];
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Updated ${path.relative(__dirname, pkgPath)}`);
    }
  } catch (e) {
    console.error(`Error rewriting ${pkgPath}:`, e);
  }
}

console.log('Synchronization complete.');
