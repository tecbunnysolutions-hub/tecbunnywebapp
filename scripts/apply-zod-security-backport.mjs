import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifestPath = `${root}/patches/zod/manifest.json`;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const target = process.argv.find(value => value.startsWith('--package-root='));
const packageRoot = target ? target.slice('--package-root='.length) : `${root}/node_modules/zod`;
assert.equal(JSON.parse(readFileSync(`${packageRoot}/package.json`, 'utf8')).name, 'zod', 'Backport target must be the Zod package');
const digest = data => createHash('sha256').update(data).digest('hex');
const patch = readFileSync(`${root}/patches/zod/upstream-a0ebf97.patch`);
assert.equal(digest(patch), manifest.patchSha256, 'Upstream patch checksum changed');
assert.equal(JSON.parse(readFileSync(`${packageRoot}/package.json`, 'utf8')).version, manifest.version,
  'Review/remove this backport when upgrading Zod; an unknown version must not be patched');

const check = process.argv.includes('--check');
const prepare = process.argv.includes('--prepare');
if (check) {
  assert.ok(manifest.runtime && manifest.patchedSources, 'Missing approved backport hashes');
  for (const [name, hash] of Object.entries({ ...manifest.patchedSources, ...manifest.runtime })) {
    assert.equal(digest(readFileSync(`${packageRoot}/${name}`)), hash, `Zod backport missing or modified: ${name}`);
  }
  console.log('PASS: pinned Zod upstream security backport source and ESM/CommonJS hashes');
} else {
  const blocks = patch.toString('utf8').split(/^diff --git /m).slice(1);
  const outputs = {};
  for (const [name, originalHash] of Object.entries(manifest.sources)) {
    const bytes = readFileSync(`${packageRoot}/${name}`);
    const currentHash = digest(bytes);
    let source = bytes.toString('utf8');
    if (currentHash !== manifest.patchedSources?.[name]) {
      assert.equal(currentHash, originalHash, `Unrecognized Zod source: ${name}`);
      const block = blocks.find(value => value.startsWith(`a/packages/zod/${name} b/packages/zod/${name}\n`));
      assert.ok(block, `Missing upstream diff for ${name}`);
      for (const hunk of block.split(/^@@ .* @@.*\n/m).slice(1)) {
        const lines = hunk.split('\n');
        const oldText = lines.filter(line => line.startsWith(' ') || line.startsWith('-')).map(line => line.slice(1)).join('\n');
        const newText = lines.filter(line => line.startsWith(' ') || line.startsWith('+')).map(line => line.slice(1)).join('\n');
        const offset = source.indexOf(oldText);
        assert.ok(oldText && offset >= 0 && offset === source.lastIndexOf(oldText), `Upstream context mismatch in ${name}`);
        source = source.slice(0, offset) + newText + source.slice(offset + oldText.length);
      }
    }
    outputs[name] = source;
    for (const [extension, module] of [['js', ts.ModuleKind.ESNext], ['cjs', ts.ModuleKind.CommonJS]]) {
      const result = ts.transpileModule(source, {
        fileName: name,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module, newLine: ts.NewLineKind.LineFeed },
        reportDiagnostics: true,
      });
      assert.ok(!result.diagnostics?.some(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error), `Transpilation failed: ${name}`);
      const runtime = name.replace(/^src\//, '').replace(/\.ts$/, `.${extension}`);
      outputs[runtime] = extension === 'cjs'
        ? result.outputText.replace(/require\("(\.\.?\/[^"\n]+)\.js"\)/g, 'require("$1.cjs")')
        : result.outputText;
    }
  }
  if (prepare) {
    manifest.patchedSources = Object.fromEntries(Object.entries(outputs).filter(([name]) => name.startsWith('src/')).map(([name, text]) => [name, digest(text)]));
    manifest.runtime = Object.fromEntries(Object.entries(outputs).filter(([name]) => !name.startsWith('src/')).map(([name, text]) => [name, digest(text)]));
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }
  assert.ok(manifest.runtime && manifest.patchedSources, 'Backport must be reviewed and pinned first');
  for (const [name, text] of Object.entries(outputs)) {
    assert.equal(digest(text), (name.startsWith('src/') ? manifest.patchedSources : manifest.runtime)[name], `Unexpected generated backport: ${name}`);
  }
  // Validate every output before changing any installed file. Nothing fetches code at install time.
  for (const [name, text] of Object.entries(outputs)) writeFileSync(`${packageRoot}/${name}`, text);
  console.log('Applied the pinned maintainer Zod security fix to source and both runtime module formats');
}
