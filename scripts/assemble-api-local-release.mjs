import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=fileURLToPath(new URL('..',import.meta.url));
const base=path.join(root,'scratch/local-release');
const build=JSON.parse(fs.readFileSync(path.join(base,'build-manifest.json'),'utf8'));
const prepared=JSON.parse(fs.readFileSync(path.join(base,'runtime-manifest.json'),'utf8'));
const dependencyChanges=spawnSync('git',['diff','--name-only',prepared.revision,build.revision,'--','package.json','package-lock.json',':(glob)apps/*/package.json',':(glob)packages/*/package.json'],{cwd:root,encoding:'utf8'});
assert.equal(dependencyChanges.status,0);
assert.ok(!dependencyChanges.stdout.trim(),'Runtime dependency manifests changed; install a fresh Linux dependency tree');
const deleted=spawnSync('git',['diff','--name-only','--diff-filter=D',prepared.revision,build.revision,'--','packages','apps/api'],{cwd:root,encoding:'utf8'});
assert.equal(deleted.status,0);assert.ok(!deleted.stdout.trim(),'Removed source files need a fresh runtime tree');
const {runtime,context}=prepared;
assert.ok(path.resolve(context).startsWith(path.resolve(base)+path.sep));
function execute(command,args){const r=spawnSync(command,args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,(r.stderr||'Command failed').slice(0,1000));return r.stdout.trim();}
const packagingRevision=execute('git',['rev-parse','HEAD']);
const changes=execute('git',['diff','--name-only',build.revision,packagingRevision,'--','apps/api','packages','package.json','package-lock.json']);
assert.ok(changes.split('\n').filter(Boolean).every(file=>file==='apps/api/Dockerfile.prebuilt'),'Application source changed after compilation');
const appTar=path.join(context,'application-source.tar');
execute('git',['archive','--format=tar','--output',appTar,build.revision,'apps/api','packages']);
execute('tar',['-xf',appTar,'-C',runtime]);
// Refresh materialized workspace packages without reinstalling unchanged third-party
// dependencies. Copy only versioned source, preserving installed nested dependencies.
const sourceFiles=execute('git',['ls-tree','-r','--name-only',build.revision,'--','packages']).split('\n');
for(const file of sourceFiles){
 const parts=file.split('/');if(parts.length<3)continue;
 const packageFile=path.join(runtime,'packages',parts[1],'package.json');if(!fs.existsSync(packageFile))continue;
 const name=JSON.parse(fs.readFileSync(packageFile,'utf8')).name;
 const installed=path.join(runtime,'node_modules',name);if(!fs.existsSync(installed))continue;
 const destination=path.join(installed,...parts.slice(2));fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(path.join(runtime,...parts),destination);
}
const sourceNext=path.join(root,'apps/api/.next');
const skipped=new Set(['cache','standalone','dev','trace','trace-build','diagnostics','types']);
fs.cpSync(sourceNext,path.join(runtime,'apps/api/.next'),{recursive:true,filter:source=>!skipped.has(path.relative(sourceNext,source).split(path.sep)[0])});
fs.copyFileSync(path.join(root,'apps/api/Dockerfile.prebuilt'),path.join(context,'Dockerfile'));
const require=createRequire(import.meta.url);
const privateEnv=require('dotenv').parse(fs.readFileSync(path.join(root,'.env.local')));
const privateValues=Object.entries(privateEnv).filter(([name,value])=>!name.startsWith('NEXT_PUBLIC_')&&/(SECRET|PASSWORD|PASS$|SERVICE_ROLE|ACCESS_TOKEN|API_KEY|MERCHANT_SALT|DATABASE_URL|DIRECT_URL|ENCRYPTION_KEY)/.test(name)&&value.length>=16);
let bytes=0, files=0, publicHostMatches=0;
function inspect(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
 const file=path.join(directory,entry.name);const stat=fs.lstatSync(file);
 assert.ok(!stat.isSymbolicLink(),`Nonportable link in artifact: ${file}`);
 if(stat.isDirectory()){inspect(file);continue;}
 bytes+=stat.size;files++;
 const compiled=file.startsWith(path.join(runtime,'apps/api/.next'));
 const firstParty=file.startsWith(path.join(runtime,'packages'))||file.startsWith(path.join(runtime,'node_modules/@tecbunny'));
 if((compiled||firstParty)&&/\.(js|cjs|mjs|ts|tsx|json|html|rsc|txt)$/.test(file)){
  const text=fs.readFileSync(file,'utf8');
  assert.ok(!text.includes(build.privateCompileCanary),`Compile-only server value serialized into ${file}`);
  for(const [name,value]of privateValues)assert.ok(!text.includes(value)&&!(name==='TURNSTILE_SECRET_KEY'&&text.includes(value.slice(-24))),`Private local setting ${name} was serialized; do not upload`);
  if(text.includes(build.publicHosts.NEXT_PUBLIC_SUPABASE_URL))publicHostMatches++;
 }
}}
inspect(runtime);
assert.ok(publicHostMatches>0,'Expected production public Supabase configuration in the compiled app');
for(const name of ['@img/sharp-linuxmusl-x64','@next/swc-linux-x64-musl']){
 const directory=path.join(runtime,'node_modules',name);const found=[];
 function nativeFiles(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())nativeFiles(p);else if(e.name.endsWith('.node'))found.push(p);}}
 nativeFiles(directory);assert.ok(found.length>0,`Native runtime missing: ${name}`);
 for(const file of found){const descriptor=fs.openSync(file,'r');const magic=Buffer.alloc(4);fs.readSync(descriptor,magic,0,4,0);fs.closeSync(descriptor);assert.equal(magic.toString('hex'),'7f454c46',`Expected Linux ELF addon: ${name}`);}
}
assert.ok(!fs.existsSync(path.join(runtime,'.env.local'))&&!fs.existsSync(path.join(runtime,'apps/api/.env.local')));
const manifest={applicationRevision:build.revision,dependencyPreparedRevision:prepared.revision,packagingRevision,buildId:build.buildId,nextVersion:build.nextVersion,
 target:prepared.target,clientEngine:'prisma-7-wasm',dependencyLockSha256:prepared.dependencyLockSha256,
 assembledAt:new Date().toISOString(),runtimeBytes:bytes,runtimeFiles:files,publicHosts:build.publicHosts,
 privateCompileCanaryAbsent:true,localServerSecretsAbsent:true,windowsLinksAbsent:true,linuxNativeHeadersVerified:true};
fs.writeFileSync(path.join(runtime,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const archive=path.join(base,`api-local-${build.revision.slice(0,12)}.tar.gz`);
execute('tar',['-czf',archive,'-C',context,'Dockerfile','runtime']);
const hash=createHash('sha256');for await(const chunk of fs.createReadStream(archive))hash.update(chunk);
const receipt={...manifest,archive,archiveBytes:fs.statSync(archive).size,archiveSha256:hash.digest('hex')};
fs.writeFileSync(path.join(base,'upload-manifest.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
