const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),ts=require('../node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {pickBalance:p}=require('../src/data/pick-balance.ts'),{pickGuidePartModes:m,pickGuideKitReferences:refs,pickGuideExtraReferences:extra}=require('../src/data/pick-rover-guide-kits.ts'),{projectPartPhotos}=require('../src/data/project-part-photos.ts');
assert.equal(p.parts.length,19);assert.equal(m.length,19);assert.equal(p.assembly.length,11);
for(const [name] of p.parts){const photos=projectPartPhotos(name);assert.ok(photos.length,name);for(const photo of photos)assert.ok(fs.existsSync('public/'+photo.path.replace(/^\.\//,'')),photo.path);}
for(const step of p.assembly)for(const i of step[3])assert.ok(Number.isInteger(i)&&i>=0&&i<p.parts.length);
const hashes=new Set();for(const ref of [...refs,...extra]){const b=fs.readFileSync('public/images/project-parts/pick-'+ref.id+'-reference.png');assert.equal(b.readUInt32BE(16),1600);assert.equal(b.readUInt32BE(20),1200);hashes.add(crypto.createHash('sha256').update(b).digest('hex'));}assert.equal(hashes.size,14);
console.log('19 imaged BOM entries / 11 valid assembly steps / 14 unique 1600x1200 matched references PASS');
