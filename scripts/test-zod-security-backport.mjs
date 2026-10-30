import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const target = process.argv.find(value => value.startsWith('--package-root='));
const packageRoot = target ? path.resolve(target.slice('--package-root='.length)) : fileURLToPath(new URL('../node_modules/zod', import.meta.url));
for (const [format, z] of [['CommonJS', require(path.join(packageRoot, 'index.cjs'))], ['ESM', await import(pathToFileURL(path.join(packageRoot, 'index.js')).href)]]) {
  let visited = 0;
  const element = z.string().transform(value => { visited++; return value; });
  const schema = z.array(element).max(2);
  const oversized = Array(10_000).fill('valid');
  for (const validator of [schema, z.compile(schema)]) {
    const result = validator.safeParse(oversized);
    assert.equal(result.success, false);
    assert.equal(result.error.issues.length, 1);
    assert.equal(result.error.issues[0].code, 'too_big');
    assert.equal(visited, 0, 'An oversized collection must not visit its elements');
    assert.deepEqual(validator.parse(['allowed']), ['allowed']);
    visited = 0;
  }
  const exact = z.array(element).length(2).safeParse(oversized);
  assert.equal(exact.success, false);
  assert.equal(exact.error.issues.length, 1);
  assert.equal(visited, 0);
  for (const collection of [z.map(z.string(), z.string()).max(1), z.set(z.string()).max(1)]) {
    const input = collection instanceof z.ZodMap ? new Map([[1, 1], [2, 2]]) : new Set([1, 2]);
    for (const validator of [collection, z.compile(collection)]) {
      const result = validator.safeParse(input);
      assert.equal(result.success, false);
      assert.equal(result.error.issues.length, 1);
      assert.equal(result.error.issues[0].code, 'too_big');
    }
  }
  // A transformation before a size check must retain its original semantics.
  assert.deepEqual(z.array(z.number()).overwrite(value => value.slice(0, 2)).max(2).parse([1, 2, 3]), [1, 2]);
  const nested = z.object({ items: z.array(z.string()).max(1) }).safeParse({ items: [1, 2] });
  assert.deepEqual(nested.error.issues[0].path, ['items']);
  const asynchronous = await schema.safeParseAsync(oversized);
  assert.equal(asynchronous.success, false);
  assert.equal(visited, 0);
  console.log(`PASS: ${format} interpreted/compiled/async collection bounds reject before parsing elements`);
}
