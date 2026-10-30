#!/bin/sh
# Run only in a disposable Alpine build container, without application credentials.
set -eu
if [ -n "${DATABASE_URL:-}${SUPABASE_SERVICE_ROLE_KEY:-}${TURNSTILE_SECRET_KEY:-}" ]; then
  echo 'Native compilation must not receive production credentials' >&2
  exit 1
fi
apk add --no-cache vips-dev build-base python3 pkgconf meson ninja
mkdir -p /src
python3 - <<'PY'
import urllib.request,pathlib,hashlib,tarfile
p=pathlib.Path('/src/vips-8.18.7.tar.xz')
urllib.request.urlretrieve('https://github.com/libvips/libvips/releases/download/v8.18.7/vips-8.18.7.tar.xz',p)
assert hashlib.sha256(p.read_bytes()).hexdigest()=='5baaead3b0bb20ffdb9e9ff09aa9fda08620923df77b63b436654cb5e0b3bf94'
with tarfile.open(p) as archive:archive.extractall('/src',filter='data')
PY
cd /src/vips-8.18.7
export CFLAGS="-O2 -march=x86-64 -mtune=generic"
export CXXFLAGS="-O2 -march=x86-64 -mtune=generic"
meson setup build --prefix=/opt/tecbunny-vips-v1 --libdir=lib --buildtype=release -Doptimization=2 -Dintrospection=disabled -Dexamples=false -Ddocs=false -Dcpp-docs=false -Dhighway=disabled -Dorc=disabled
meson compile -C build -j 1
meson test -C build --no-rebuild --num-processes 1 --timeout-multiplier 4 --print-errorlogs
meson install -C build --no-rebuild
export PKG_CONFIG_PATH=/opt/tecbunny-vips-v1/lib/pkgconfig
export LD_LIBRARY_PATH=/opt/tecbunny-vips-v1/lib
pkg-config --modversion vips-cpp
pkg-config --atleast-version=8.18.7 vips-cpp
mkdir -p /build
cd /build
printf '{"private":true}' > package.json
npm install --ignore-scripts --omit=optional --no-audit --no-fund sharp@0.35.5 node-addon-api@8.5.0 node-gyp@11.4.2
# Sharp prepends the system pkg-config search path. Explicit include/link flags
# keep the source build on the checksum-verified prefix rather than distro 8.18.2.
SHARP_FORCE_GLOBAL_LIBVIPS=1 npm_config_jobs=1 CFLAGS="-O2 -march=x86-64 -mtune=generic -I/opt/tecbunny-vips-v1/include" CXXFLAGS="-O2 -march=x86-64 -mtune=generic -I/opt/tecbunny-vips-v1/include" LDFLAGS="-L/opt/tecbunny-vips-v1/lib -Wl,-rpath,/opt/tecbunny-vips-v1/lib" npm explore sharp -- npm run build
node -e '(async()=>{const assert=require("node:assert/strict");const s=require("sharp");assert(s.versions.vips==="8.18.7");const png=await s({create:{width:2,height:2,channels:4,background:"#123456"}}).png().toBuffer();const jpg=await s(png).jpeg().toBuffer();const webp=await s(jpg).webp({quality:80,effort:4}).toBuffer();const m=await s(webp).metadata();assert(m.width===2&&m.height===2&&m.format==="webp");console.log(JSON.stringify({sourceBuiltSharp:true,png:true,jpeg:true,webp:true,vips:s.versions.vips}))})().catch(e=>{console.error(e);process.exitCode=1})'
python3 - <<'PY'
import pathlib,subprocess,glob,re,shutil,json
out=pathlib.Path('/native-runtime');out.mkdir()
addons=list(pathlib.Path('/build/node_modules/sharp/src/build/Release').glob('sharp-*.node'));assert len(addons)==1
roots=addons+[pathlib.Path(p) for p in glob.glob('/opt/tecbunny-vips-v1/lib/vips-modules-*/*.so')]
files=set()
for root in roots:
 result=subprocess.run(['ldd',str(root)],capture_output=True,text=True)
 for dependency in re.findall(r'=> (/[^\s]+)',result.stdout+'\n'+result.stderr):
  p=pathlib.Path(dependency)
  assert p.is_file() and (str(p).startswith('/usr/lib/') or str(p).startswith('/lib/') or str(p).startswith('/opt/tecbunny-vips-v1/'))
  files.add(p)
for p in files.union(set(roots[1:])):
 dest=out/str(p).lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest);dest.chmod(0o755)
dest=out/'app/node_modules/sharp/src/build/Release'/addons[0].name;dest.parent.mkdir(parents=True);shutil.copyfile(addons[0],dest);dest.chmod(0o644)
for p in ['/etc/fonts','/usr/share/fontconfig','/opt/tecbunny-vips-v1/share']:
 if pathlib.Path(p).exists():shutil.copytree(p,out/p.lstrip('/'),symlinks=False,dirs_exist_ok=True)
manifest={'sharp':'0.35.5','baseline':'x86-64 v1','libvips':subprocess.check_output(['pkg-config','--modversion','vips-cpp'],text=True).strip(),'addon':str(dest.relative_to(out)),'libraries':[str(p) for p in sorted(files)],'apkPackages':subprocess.check_output(['apk','info','-v'],text=True).splitlines(),'sourceDependencies':json.loads(pathlib.Path('/build/package-lock.json').read_text())}
(out/'native-binding-manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps({'native_compatibility_artifact_ready':True,'library_count':len(files),'vips':manifest['libvips']}))
PY
