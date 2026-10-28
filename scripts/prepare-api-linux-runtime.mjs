import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
function execute(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${path.basename(command)} failed`);
}
const revisionResult = spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
assert.equal(revisionResult.status,0);
const revision = revisionResult.stdout.trim();
const resume = process.argv.find(value=>value.startsWith('--resume='));
const context = resume ? path.resolve(root,resume.slice('--resume='.length))
  : path.join(root,'scratch/local-release',`context-${revision.slice(0,12)}-${Date.now()}`);
const runtime = path.join(context,'runtime');
assert.ok(path.resolve(context).startsWith(path.resolve(root,'scratch/local-release')+path.sep));
assert.ok(path.basename(context).startsWith(`context-${revision.slice(0,12)}-`),'Runtime must match the application revision');
if(!resume)assert.ok(!fs.existsSync(context),'Use a fresh artifact directory; never replace the workspace dependency tree');
fs.mkdirSync(runtime,{recursive:true});
const sourceTar = path.join(context,'source.tar');
if(!resume) {
execute('git',['archive','--format=tar','--output',sourceTar,'HEAD','package.json','package-lock.json','.npmrc',
  'apps/api/package.json','apps/api/next.config.mjs','apps/api/public','apps/mgmt/package.json',
  'apps/public/package.json','apps/superadmin/package.json','apps/waba/package.json','apps/webmail/package.json','packages']);
execute('tar',['-xf',sourceTar,'-C',runtime]);
const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
assert.ok(fs.existsSync(npmCli),'Locate the installed npm CLI before packaging');
execute(process.execPath,[npmCli,'ci','--omit=dev','--ignore-scripts','--os=linux','--cpu=x64','--libc=musl','--no-audit','--no-fund'],runtime);
} else {
  assert.ok(JSON.stringify(JSON.parse(fs.readFileSync(path.join(runtime,'package-lock.json'),'utf8')))===JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'))),'Resume dependency lock must match the application lock');
}
const zodRoot=path.join(runtime,'node_modules/zod');
execute(process.execPath,['scripts/apply-zod-security-backport.mjs',`--package-root=${zodRoot}`]);
execute(process.execPath,['scripts/apply-zod-security-backport.mjs','--check',`--package-root=${zodRoot}`]);
for(const name of ['@img/sharp-linuxmusl-x64','@img/sharp-libvips-linuxmusl-x64','@next/swc-linux-x64-musl']) {
  assert.ok(fs.existsSync(path.join(runtime,'node_modules',name,'package.json')),`Linux runtime package missing: ${name}`);
}
// Prisma 7's generated query compiler is WebAssembly. Reuse the exact client used
// by this build, only after verifying its schema and version; no Windows engine is
// shipped. The real Linux adapter/query is separately checked on the VPS.
const generated=path.join(root,'node_modules/.prisma/client');
assert.ok(fs.readFileSync(path.join(generated,'index.js'),'utf8').includes('config.compilerWasm ='),'A portable Prisma WASM client is required');
const normalize=value=>JSON.stringify((value.match(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\s+|./g)||[])
  .filter(token=>!/^\s+$/.test(token)&&!token.startsWith('//')&&!token.startsWith('/*')));
assert.ok(normalize(fs.readFileSync(path.join(generated,'schema.prisma'),'utf8'))===normalize(fs.readFileSync(path.join(root,'packages/db/prisma/schema.prisma'),'utf8')),'Generated client schema must match the release source');
assert.equal(JSON.parse(fs.readFileSync(path.join(runtime,'node_modules/@prisma/client/package.json'),'utf8')).version,require('@prisma/client/package.json').version);
fs.copyFileSync(path.join(root,'packages/db/prisma/schema.prisma'),path.join(runtime,'packages/db/prisma/schema.prisma'));
fs.mkdirSync(path.join(runtime,'node_modules/.prisma'),{recursive:true});
fs.cpSync(generated,path.join(runtime,'node_modules/.prisma/client'),{recursive:true,filter:source=>!source.endsWith('.node')&&!source.endsWith('.dll')});
assert.ok(fs.existsSync(path.join(runtime,'node_modules/.prisma/client/default.js')),'Generated Prisma runtime missing');

// Windows workspace junctions are absolute. Materialize only links whose targets
// stay inside this fresh artifact; the resulting archive has no Windows links.
const runtimePrefix=fs.realpathSync(runtime)+path.sep;
function materialize(directory) {
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const target=path.join(directory,entry.name);
    const info=fs.lstatSync(target);
    if(info.isSymbolicLink()) {
      const source=fs.realpathSync(target);
      assert.ok(source.startsWith(runtimePrefix),`Artifact link escapes its root: ${target}`);
      const sourceIsDirectory=fs.statSync(source).isDirectory();
      // unlink/rmdir without recursive deletion removes the link, never its target.
      try{fs.unlinkSync(target);}catch(error){if(sourceIsDirectory && ['EPERM','EISDIR'].includes(error.code))fs.rmdirSync(target);else throw error;}
      fs.cpSync(source,target,{recursive:sourceIsDirectory,dereference:true});
    }
    if(fs.lstatSync(target).isDirectory())materialize(target);
  }
}
materialize(path.join(runtime,'node_modules'));
fs.copyFileSync(path.join(root,'apps/api/Dockerfile.prebuilt'),path.join(context,'Dockerfile'));
const manifest={revision,context,runtime,target:'linux-x64-musl',preparedAt:new Date().toISOString(),
  dependencyLockSha256: (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(path.join(runtime,'package-lock.json'))).digest('hex')};
fs.writeFileSync(path.join(root,'scratch/local-release/runtime-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared an isolated Linux production dependency tree; workspace dependencies were not changed');
