import * as T from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile } from 'node:fs/promises';

// This model is an original reconstruction from the Atlas guide illustration.
// Front-plane coordinates were measured against the image; depth is illustrative.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(data => { this.result = data; this.onloadend?.(); }); }
};
const root = new T.Group();
root.name = 'Anatomy 58 · kinematic chain';
const metal = (color, metalness, roughness) => new T.MeshStandardMaterial({ color, metalness, roughness });
const aluminum = metal('#d4dae3', .64, .33);
const bright = metal('#e9edf4', .73, .27);
const black = metal('#292f38', .57, .34);
const rubber = metal('#15191e', .18, .58);
const blue = metal('#0868c4', .56, .29);
const red = metal('#c72527', .31, .35);
const m = (x,y,z=0) => [(x-535)/210,(785-y)/210,z];
function part(name) {
  const group = new T.Group();
  group.name = name;
  root.add(group);
  return group;
}
function mesh(parent, geometry, material, position, rotation) {
  const object = new T.Mesh(geometry, material);
  object.position.set(...position);
  if (rotation) object.rotation.set(...rotation);
  parent.add(object);
  return object;
}
function cylinder(parent, x, y, z, r, depth, mat, upright=false) {
  return mesh(parent,new T.CylinderGeometry(r,r,depth,64),mat,m(x,y,z),upright?undefined:[Math.PI/2,0,0]);
}
function torus(parent,x,y,z,r,t,mat,upright=false) {
  return mesh(parent,new T.TorusGeometry(r,t,12,72),mat,m(x,y,z),upright?[Math.PI/2,0,0]:undefined);
}
function screw(parent,x,y,z,r,upright=false) {
  const at=m(x,y,z);
  const tilt=upright?undefined:[Math.PI/2,0,0];
  mesh(parent,new T.CylinderGeometry(r,r,r*.68,24),bright,at,tilt);
  if(upright) at[1]+=r*.36; else at[2]+=r*.36;
  mesh(parent,new T.CylinderGeometry(r*.48,r*.48,.006,6),black,at,tilt);
}
function trace(path, points) {
  for (const [i,[x,y]] of points.entries()) {
    const [u,v]=m(x,y);
    if(i===0) path.moveTo(u,v); else path.lineTo(u,v);
  }
  path.closePath();
  return path;
}
function plate(parent, points, holes, depth, z, mat, bevel=.022) {
  const shape=trace(new T.Shape(),points);
  shape.holes=holes.map(p=>trace(new T.Path(),p));
  return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:24}),mat,[0,0,z-depth/2]);
}
function tube(parent,points,r,mat) {
  const curve=new T.CatmullRomCurve3(points.map(([x,y,z])=>new T.Vector3(...m(x,y,z))));
  return mesh(parent,new T.TubeGeometry(curve,110,r,12),mat,[0,0,0]);
}

const base=part('base');
const baseShape=new T.Shape();
const chamfer=[[-.92,-.55],[.82,-.55],[.99,-.37],[.99,.34],[.79,.55],[-.86,.55],[-1,.37],[-1,-.36]];
chamfer.forEach(([x,y],i)=>i?baseShape.lineTo(x,y):baseShape.moveTo(x,y));
baseShape.closePath();
mesh(base,new T.ExtrudeGeometry(baseShape,{depth:.105,bevelEnabled:true,bevelSize:.035,bevelThickness:.024,bevelSegments:4}),black,m(245,782),[-Math.PI/2,0,0]);
cylinder(base,251,727,0,.69,.39,black,true);
cylinder(base,251,679,0,.70,.11,aluminum,true);
torus(base,251,695,0,.687,.024,blue,true);
cylinder(base,251,656,0,.51,.13,black,true);
for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  screw(base,251+Math.cos(a)*131,665,Math.sin(a)*.62,.047,true);
}
for(const x of [72,420]) for(const z of [-.38,.38]) screw(base,x,744,z,.065,true);

function drive(name,x,y,r,depth) {
  const g=part(name);
  cylinder(g,x,y,0,r,depth,black);
  cylinder(g,x,y,depth/2-.006,r*.95,.065,aluminum);
  cylinder(g,x,y,depth/2+.032,r*.9,.051,black);
  torus(g,x,y,depth/2+.063,r*.72,.022,blue);
  cylinder(g,x,y,depth/2+.064,r*.695,.055,bright);
  cylinder(g,x,y,-depth/2-.012,r*.83,.045,aluminum);
  for(let i=0;i<8;i++){
    const a=(i+.14)*Math.PI/4;
    screw(g,x+Math.cos(a)*r*174,y+Math.sin(a)*r*174,depth/2+.062,r*.061);
    screw(g,x+Math.cos(a+.19)*r*124,y+Math.sin(a+.19)*r*124,depth/2+.10,r*.048);
  }
  return g;
}
drive('shoulder',204,560,.47,.51);
drive('elbow',380,133,.44,.42);
drive('wrist',799,327,.32,.35);

const shoulderLink=part('shoulder-link');
plate(shoulderLink,[[132,511],[280,186],[344,149],[418,189],[301,506],[251,559]],[
  [[192,449],[276,242],[303,233],[326,253],[259,416],[220,454]],
],.32,0,aluminum);
const forearm=part('forearm');
plate(forearm,[[409,102],[763,258],[826,307],[780,355],[727,337],[415,207],[365,174]],[
  [[463,153],[576,201],[571,223],[507,212],[459,183]],
  [[598,222],[735,277],[746,301],[718,318],[590,267],[581,249]],
],.30,0,aluminum);
const wristLink=part('wrist-link');
plate(wristLink,[[783,345],[835,333],[935,481],[880,516],[849,488]],[
  [[831,384],[850,379],[902,458],[879,477],[864,462]],
],.25,0,aluminum);

const cable=part('harness');
for (const z of [.105,.15]) {
  tube(cable,[[181,619,z],[106,586,z],[108,498,z],[143,413,z],[206,293,z],[261,161,z],[292,69,z],[360,36,z],[424,49,z],[554,119,z],[678,182,z],[782,252,z],[850,340,z],[883,388,z],[956,437,z],[971,504,z]],.026,rubber);
}
const clips=part('harness-clips');
for(const [x,y,a] of [[134,442,-.54],[206,323,-.53],[267,162,-.14],[347,43,.51],[593,142,-.4],[709,198,-.4],[957,445,.6]]) {
  mesh(clips,new T.BoxGeometry(.056,.15,.12),blue,m(x,y,.132),[0,0,a]);
}

const collar=part('tool-collar');
cylinder(collar,933,521,0,.29,.21,black,true);
cylinder(collar,933,548,0,.25,.055,bright,true);
torus(collar,933,556,0,.235,.018,blue,true);
for (const x of [898,969]) screw(collar,x,503,.17,.039,true);

const grip=part('gripper-body');
plate(grip,[[890,577],[965,565],[990,581],[990,609],[909,624],[890,609]],[],.26,0,black,.016);
for(const x of [908,971]) for(const y of [588,608]) screw(grip,x,y,.144,.024);
const left=part('left-jaw');
plate(left,[[899,606],[923,612],[930,645],[905,660],[886,643]],[],.18,0,black,.01);
plate(left,[[888,650],[912,644],[956,727],[935,738]],[],.14,0,aluminum,.013);
screw(left,908,659,.086,.025);
const right=part('right-jaw');
plate(right,[[981,598],[1005,592],[1025,628],[1020,646],[997,647]],[],.18,0,black,.01);
plate(right,[[998,641],[1024,638],[1021,721],[1003,729],[994,713]],[],.14,0,aluminum,.011);
screw(right,1010,653,.086,.025);

const target=part('target');
cylinder(target,979,779,0,.38,.065,aluminum,true);
cylinder(target,979,771,0,.345,.018,red,true);
cylinder(target,979,768,0,.17,.013,blue,true);

const destination=new URL('../public/models/hardware/',import.meta.url);
await mkdir(destination,{recursive:true});
const buffer=await new GLTFExporter().parseAsync(root,{binary:true});
await writeFile(new URL('anatomy-58.glb',destination),Buffer.from(buffer));
