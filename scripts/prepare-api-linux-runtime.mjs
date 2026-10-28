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
const context = path.join(root,'scratch/local-release',`context-${revision.slice(0,12)}-${Date.now()}`);
const runtime = path.join(context,'runtime');
assert.ok(path.resolve(context).startsWith(path.resolve(root,'scratch/local-release')+path.sep));
assert.ok(!fs.existsSync(context),'Use a fresh artifact directory; never replace the workspace dependency tree');
fs.mkdirSync(runtime,{recursive:true});
const sourceTar = path.join(context,'source.tar');
execute('git',['archive','--format=tar','--output',sourceTar,'HEAD','package.json','package-lock.json','.npmrc',
  'apps/api/package.json','apps/api/next.config.mjs','apps/api/public','apps/mgmt/package.json',
  'apps/public/package.json','apps/superadmin/package.json','apps/waba/package.json','apps/webmail/package.json','packages']);
execute('tar',['-xf',sourceTar,'-C',runtime]);
const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
assert.ok(fs.existsSync(npmCli),'Locate the installed npm CLI before packaging');
execute(process.execPath,[npmCli,'ci','--omit=dev','--ignore-scripts','--os=linux','--cpu=x64','--libc=musl','--no-audit','--no-fund'],runtime);
const zodRoot=path.join(runtime,'node_modules/zod');
execute(process.execPath,['scripts/apply-zod-security-backport.mjs',`--package-root=${zodRoot}`]);
execute(process.execPath,['scripts/apply-zod-security-backport.mjs','--check',`--package-root=${zodRoot}`]);
for(const name of ['@img/sharp-linuxmusl-x64','@img/sharp-libvips-linuxmusl-x64','@next/swc-linux-x64-musl']) {
  assert.ok(fs.existsSync(path.join(runtime,'node_modules',name,'package.json')),`Linux runtime package missing: ${name}`);
}
const schemaPath = path.join(runtime,'packages/db/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath,'utf8');
schema = schema.replace(/binaryTargets\s*=\s*\[[^\]]*\]/,'binaryTargets = ["linux-musl-openssl-3.0.x"]');
schema = schema.replace(/provider\s*=\s*"prisma-client-js"/,'provider = "prisma-client-js"\n  output = "../../../node_modules/.prisma/client"');
fs.writeFileSync(schemaPath,schema);
execute(process.execPath,[require.resolve('prisma'),'generate','--schema',schemaPath],runtime,
  {...process.env,DATABASE_URL:'postgresql://build:build@127.0.0.1:9/build',DIRECT_URL:'postgresql://build:build@127.0.0.1:9/build',PRISMA_HIDE_UPDATE_MESSAGE:'true'});
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
