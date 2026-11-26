

import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  if(url.pathname.endsWith('.json'))return 'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+(match[1].endsWith('.json')?'':'.ts'),url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
import {CatmullRomCurve3,Vector3} from 'three';
const m=await import(await load(new URL('../src/data/mq2-wires.ts',import.meta.url)));
for(const mode of ['dial','sensor']){
 const wires=m.mq2Wires(mode),points=wires.map((w,n)=>new CatmullRomCurve3(m.mq2WireRoute(w,n).map(p=>new Vector3(...p))).getPoints(1200));
 const overlaps=[];let minimum=Infinity;
 for(let a=0;a<wires.length;a++)for(let b=a+1;b<wires.length;b++){
 let best=Infinity;for(const p of points[a])for(const q of points[b])best=Math.min(best,p.distanceToSquared(q));
 best=Math.sqrt(best);minimum=Math.min(minimum,best);
 if(best<.9)overlaps.push({a:wires[a].id,b:wires[b].id,jacketGapMm:best-.9});
 }
 console.log(JSON.stringify({mode,samplesPerWire:1201,minimumJacketGapMm:minimum-.9,overlaps}));if(overlaps.length)throw new Error('Sampled cable-jacket overlap in '+mode);
}
