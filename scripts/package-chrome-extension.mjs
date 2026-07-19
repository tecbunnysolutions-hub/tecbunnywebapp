import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const extensionDir = path.join(root, 'extension');
const distDir = path.join(root, 'dist', 'chrome-extension');
const packageDir = path.join(distDir, 'tecbunny-product-extractor');
const zipPath = path.join(distDir, 'tecbunny-product-extractor.zip');

const packageFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'README.md',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

function copyFile(relativePath) {
  const source = path.join(extensionDir, relativePath);
  const target = path.join(packageDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    stdio: 'pipe',
    shell: false,
    windowsHide: true,
  });
}

fs.rmSync(packageDir, { recursive: true, force: true });
fs.rmSync(zipPath, { force: true });
fs.mkdirSync(packageDir, { recursive: true });

for (const file of packageFiles) {
  copyFile(file);
}

let zipped = false;

if (process.platform === 'win32') {
  const result = run('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path '${packageDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
  ]);
  zipped = result.status === 0;
  if (!zipped) {
    process.stderr.write(result.stderr.toString());
  }
}

if (!zipped) {
  const result = run('zip', ['-r', zipPath, '.']);
  zipped = result.status === 0;
  if (!zipped) {
    process.stderr.write(result.stderr.toString());
  }
}

if (!zipped || !fs.existsSync(zipPath)) {
  throw new Error('Could not create Chrome extension zip. Install PowerShell Compress-Archive or zip.');
}

console.log(`Chrome extension package staged at ${path.relative(root, packageDir)}`);
console.log(`Chrome extension zip created at ${path.relative(root, zipPath)}`);