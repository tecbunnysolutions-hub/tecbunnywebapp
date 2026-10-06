import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const mode = process.argv[2] ?? '--manifest';
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));

const referencedFiles = () => [
  manifest.background?.service_worker,
  manifest.options_page,
  manifest.action?.default_popup,
  ...Object.values(manifest.icons ?? {}),
  ...(manifest.content_scripts ?? []).flatMap((entry) => [...(entry.js ?? []), ...(entry.css ?? [])]),
].filter(Boolean);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (mode === '--manifest') {
  if (manifest.manifest_version !== 3) fail('Extension manifest must use manifest_version 3.');
  const missing = referencedFiles().filter((file) => !existsSync(join(root, file)));
  if (missing.length) fail(`Manifest references missing files: ${missing.join(', ')}`);
  console.log('Extension manifest is valid.');
}

if (mode === '--syntax') {
  const scripts = readdirSync(root).filter((file) => file.endsWith('.js'));
  for (const file of scripts) {
    const result = spawnSync(process.execPath, ['--check', join(root, file)], { encoding: 'utf8' });
    if (result.status !== 0) fail(`Syntax error in ${file}\n${result.stderr}`);
  }
  console.log(`Checked syntax of ${scripts.length} extension scripts.`);
}

if (mode === '--bundle') {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  const entries = readdirSync(root).filter((file) => /\.(js|html|json)$/.test(file) && file !== 'package.json');
  for (const file of entries) cpSync(join(root, file), join(dist, file));
  cpSync(join(root, 'icons'), join(dist, 'icons'), { recursive: true });
  console.log(`Extension bundle written to ${dist}`);
}
