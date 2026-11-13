import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir,writeFile } from 'node:fs/promises';

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.()}); }
};
const material=(color,metalness,roughness)=>new T.MeshStandardMaterial({color,metalness,roughness});
const silver=material('#c2bcb4',.92,.31);
const bright=material('#d7dde1',.94,.25);
const dark=material('#25262b',.24,.54);
const white=material('#f4efe2',.05,.49);
const make=(parent,geometry,mat,x=0,y=0,z=0)=>{
  const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
};
const boxes = new Map();
function box(parent,w,h,d,r,finish,x,y,z) {
  const key = [w,h,d,r].join(',');
  if (!boxes.has(key)) boxes.set(key,new RoundedBoxGeometry(w,h,d,4,r));
  return make(parent,boxes.get(key),finish,x,y,z);
}
const cylinders = new Map();
function cylinder(parent,r,h,finish,x,y,z) {
  const key = [r,h].join(',');
  if (!cylinders.has(key)) cylinders.set(key,new T.CylinderGeometry(r,r,h,72));
  return make(parent,cylinders.get(key),finish,x,y,z);
}
const group=(root,name)=>{const p=new T.Group();p.name=name;root.add(p);return p;};

function fuse() {
  const model=new T.Group();
  const body=group(model,'body');
  box(body,2.06,.195,1.17,.04,dark,0,.10,0);
  box(body,2.61,.065,1.15,.015,material('#918376',.37,.56),0,.025,0);
  const mark=group(model,'mark');
  box(mark,.087,.002,.42,.001,white,-.14,.202,0);
  box(mark,.32,.002,.075,.001,white,-.02,.202,-.18);
  box(mark,.255,.002,.063,.001,white,-.045,.202,-.015);
  for(const [sign,name] of [[-1,'left'],[1,'right']]) {
    const terminal=group(model,name);
    const contact=new T.Shape().moveTo(-.226,-.58).lineTo(.222,-.58).lineTo(.222,-.15)
      .quadraticCurveTo(.044,0,.222,.15).lineTo(.222,.58).lineTo(-.226,.58).closePath();
    const finish=make(terminal,new T.ExtrudeGeometry(contact,{depth:.188,bevelSize:.013,bevelThickness:.010,bevelSegments:2}),
      silver,sign*1.205,.010,0);
    finish.rotation.set(-Math.PI/2,0,sign===1?0:Math.PI);
    for(const z of [-.37,.37]) box(terminal,.025,.198,.305,.008,bright,sign*1.429,.104,z);
    box(terminal,.44,.022,1.14,.008,bright,sign*1.21,.016,0);
  }
  return model;
}

function capacitorSleeveMarking(parent) {
  const glyphs = {
    '0':['111','101','101','101','111'], '1':['010','110','010','010','111'],
    '4':['101','101','111','001','001'], '7':['111','001','010','010','010'],
    'µ':['000','101','101','111','100'], F:['111','100','110','100','100'],
    V:['101','101','101','101','010'], ' ':[],
  };
  const positions = [];
  const addPixel = (x, angle) => {
    const point = (dx, da) => [x+dx,.514*Math.cos(angle+da),.514*Math.sin(angle+da)];
    const corners = [point(0,0),point(.029,0),point(.029,.057),point(0,.057)];
    for (const i of [0,1,2,0,2,3]) positions.push(...corners[i]);
  };
  for (const [value, startX, angle] of [['4700µF',-.33,-.12],['10 V',-.26,.21]]) {
    for (const [column, character] of Array.from(value).entries()) {
      for (const [row, pixels] of glyphs[character].entries()) {
        for (const [pixel, filled] of Array.from(pixels).entries()) {
          if (filled === '1') addPixel(startX + column*.132 + pixel*.033, angle + row*.062);
        }
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.computeVertexNormals();
  const ink=material('#e1dca0',.07,.57);
  ink.side=T.DoubleSide;
  make(parent,geometry,ink);
}

function capacitor() {
  const model=new T.Group();
  const jacket=group(model,'jacket');
  const green=material('#047d68',.25,.37);
  const sleeveProfile=[[.462,-.902],[.497,-.902],[.507,-.887],[.511,-.845],
    [.511,.843],[.506,.882],[.492,.898],[.456,.899]];
  const wrap=make(jacket,new T.LatheGeometry(sleeveProfile.map(([r,y])=>new T.Vector2(r,y)),96),green,-.22,0,0);
  wrap.rotation.z=Math.PI/2;
  // Printed stripes on the sleeve are thin, conforming surface geometry.
  const stripe=group(model,'stripe');
  capacitorSleeveMarking(group(model,'rating'));
  const ink=material('#c8c279',.11,.58);
  const stripeMesh=make(stripe,new T.CylinderGeometry(.515,.515,1.49,18,1,true,.45,.45),ink,-.22,0,0);
  stripeMesh.rotation.z=Math.PI/2;
  for(let i=0;i<4;i++){
    const dash=make(stripe,new T.CylinderGeometry(.518,.518,.075,8,1,true,.55,.22),green,-.76+i*.32,0,0);
    dash.rotation.z=Math.PI/2;
  }
  const rim=group(model,'cap');
  for(const x of [-1.12,.68]) {
    const lid=cylinder(rim,.484,.04,silver,x,0,0);lid.rotation.z=Math.PI/2;
    const edge=make(rim,new T.TorusGeometry(.48,.023,12,72),bright,x,0,0);edge.rotation.y=Math.PI/2;
  }
  const seal=group(model,'seal');
  cylinder(seal,.442,.029,dark,.704,0,0).rotation.z=Math.PI/2;
  make(seal,new T.TorusGeometry(.428,.013,9,64),material('#252727',.04,.75),.718,0,0).rotation.y=Math.PI/2;
  for(const z of [-.168,.168]){
    make(seal,new T.TorusGeometry(.037,.009,9,32),silver,.721,0,z).rotation.y=Math.PI/2;
  }
  for(const angle of [0,2*Math.PI/3,4*Math.PI/3]){
    box(rim,.008,.228,.012,.003,dark,-1.143,.115*Math.cos(angle),.115*Math.sin(angle)).rotation.x=angle;
  }
  for(const [name,z,len] of [['lead-a',-.168,1.33],['lead-b',.168,1.13]]){
    const leads=group(model,name);
    const wire=cylinder(leads,.028,len,bright,.716+len/2,0,z);
    wire.rotation.z=Math.PI/2;
  }
  return model;
}

const axial = (parent, radius, length, material, x) => {
  const mesh = cylinder(parent, radius, length, material, x, 0, 0);
  mesh.rotation.z = Math.PI / 2;
  return mesh;
};

function resistor() {
  const model = new T.Group();
  const body = group(model, 'body');
  const bands = group(model, 'bands');
  const left = group(model, 'left');
  const right = group(model, 'right');
  const profile = [[.021,-.31],[.082,-.29],[.106,-.23],[.107,-.16],[.092,-.10],[.092,.10],[.107,.16],[.106,.23],[.082,.29],[.021,.31]];
  const ceramicGeometry = new T.LatheGeometry(profile.map(point => new T.Vector2(...point)), 64);
  const ceramic = material('#cdb78e', .11, .47);
  const radiusAt = x => {
    const index=profile.findIndex(([,height])=>height>=x);
    const [r0,h0]=profile[index-1], [r1,h1]=profile[index];
    return r0+(r1-r0)*(x-h0)/(h1-h0);
  };
  const inks=[[-.204,'#653529'],[-.124,'#29211f'],[-.034,'#9b3e25'],[.193,'#b3964b']]
    .map(([x,color])=>{
      const lower=-x-.017,upper=-x+.017;
      const levels=[lower,...profile.map(([,height])=>height).filter(height=>height>lower&&height<upper),upper];
      const geometry=new T.LatheGeometry(levels.map(height=>new T.Vector2(radiusAt(height)+.0014,height)),64);
      return {geometry,finish:material(color,color==='#b3964b'?.55:.08,.42)};
    });
  const lead = new T.CylinderGeometry(.016,.90,12);
  for (const x of [-.92,.92]) {
    for (let i=0;i<12;i++) {
      const z=(i-5.5)*.182+(x>0?-.148:.148);
      make(body,ceramicGeometry,ceramic,x,.119,z).rotation.z=Math.PI/2;
      for (const ink of inks) make(bands,ink.geometry,ink.finish,x,.119,z).rotation.z=Math.PI/2;
      make(left,lead,bright,x-.755,.119,z).rotation.z=Math.PI/2;
      make(right,lead,bright,x+.755,.119,z).rotation.z=Math.PI/2;
    }
  }
  model.rotation.y=.28;
  return model;
}

function diode() {
  const model = new T.Group();
  const body = group(model, 'body');
  const band = group(model, 'band');
  const left = group(model, 'left');
  const right = group(model, 'right');
  const resin = material('#34383b', .22, .36);
  const ink = material('#b8bec2', .32, .49);
  const profile = [[.042,-.25],[.073,-.235],[.094,-.186],[.097,-.14],[.097,.14],[.094,.186],[.073,.235],[.042,.25]];
  const housing = new T.LatheGeometry(profile.map(point=>new T.Vector2(...point)),64);
  const bandProfile=[[.098,.123],[.098,.151],[.096,.173],[.094,.184]];
  const bandGeometry=new T.LatheGeometry(bandProfile.map(([r,y])=>new T.Vector2(r,y)),64);
  for (let i=0;i<10;i++) {
    const z=(i-4.5)*.234;
    make(body,housing,resin,0,.102,z).rotation.z=Math.PI/2;
    make(band,bandGeometry,ink,0,.102,z).rotation.z=Math.PI/2;
    for(const [part,x] of [[left,-.252],[right,.252]]){
      axial(part,.025,.057,silver,x).position.set(x,.102,z);
    }
    axial(left,.017,1.40,bright,-.93).position.set(-.93,.102,z);
    axial(right,.017,1.40,bright,.93).position.set(.93,.102,z);
  }
  return model;
}

function stepper() {
  const model = new T.Group();
  const endPlates = group(model, 'frame');
  box(endPlates,1.60,.38,1.60,.075,bright,0,-.48,0);
  box(endPlates,1.60,.22,1.60,.065,bright,0,.40,0);
  const front = new T.Shape().moveTo(-.72,-.80).lineTo(.72,-.80)
    .lineTo(.80,-.72).lineTo(.80,.72).lineTo(.72,.80)
    .lineTo(-.72,.80).lineTo(-.80,.72).lineTo(-.80,-.72).closePath();
  for (const x of [-.63,.63]) for (const z of [-.63,.63]) {
    const bore = new T.Path();
    bore.absarc(x,-z,.068,0,Math.PI*2,true);
    front.holes.push(bore);
  }
  make(endPlates,new T.ExtrudeGeometry(front,{depth:.16,bevelEnabled:false,curveSegments:28}),bright,0,.51,0).rotation.x=-Math.PI/2;
  const stack = group(model, 'stack');
  for (let i=0;i<19;i++) {
    box(stack,1.51,.032,1.51,.037,i%4===0?dark:material('#33383e',.65,.43),0,(i-9)*.034,0);
  }
  const mount = group(model,'mount');
  const boreFinish = dark.clone();
  boreFinish.side = T.DoubleSide;
  for (const x of [-.63,.63]) for (const z of [-.63,.63]) {
    make(mount,new T.CylinderGeometry(.068,.068,.151,28,1,true),boreFinish,x,.591,z);
    make(mount,new T.TorusGeometry(.074,.011,8,24),silver,x,.678,z).rotation.x=Math.PI/2;
  }
  const boss = group(model,'boss');
  cylinder(boss,.34,.098,bright,0,.702,0);
  cylinder(boss,.134,.013,dark,0,.757,0);
  const shaft = group(model,'shaft');
  cylinder(shaft,.077,.71,bright,0,1.08,0);
  box(shaft,.063,.57,.01,.004,silver,.01,1.10,.07);
  const leads = group(model,'leads');
  const grommet=group(model,'grommet');
  box(grommet,.113,.315,.512,.026,dark,.762,.174,.266);
  for(let i=0;i<4;i++) box(grommet,.058,.046,.069,.013,material('#35383b',.07,.64),.826,.26-i*.057,.48-i*.13);
  for (const [i,color] of ['#e4b62b','#c6252d','#d5d5d3','#207d57'].entries()) {
    const y=.26-i*.057, z=.48-i*.13;
    const curve = new T.CatmullRomCurve3([[.77,y,z],[1.34,y,z],[2.15,y-.16,z+.21],[2.44,-.2,z+.72],[2.01,-.51,z+1.08],[1.29,-.5,z+.97]].map(point=>new T.Vector3(...point)));
    make(leads,new T.TubeGeometry(curve,60,.024,10,false),material(color,.10,.43));
    const tip = new T.CatmullRomCurve3([[1.29,-.5,z+.97],[1.11,-.49,z+.94]].map(point=>new T.Vector3(...point)));
    make(leads,new T.TubeGeometry(tip,4,.011,8,false),bright);
  }
  return model;
}

function ultrasonic() {
  const model=new T.Group();
  const pcb=group(model,'pcb');
  const outline=new T.Shape().moveTo(-1.48,-.58).lineTo(1.48,-.58).lineTo(1.48,.58).lineTo(-1.48,.58).closePath();
  const mounting=group(model,'mounting');
  for (const x of [-1.36,1.36]) for (const z of [-.46,.46]) {
    const hole=new T.Path();hole.absarc(x,z,.052,0,Math.PI*2,true);outline.holes.push(hole);
    make(mounting,new T.TorusGeometry(.054,.015,10,32),bright,x,.054,-z).rotation.x=Math.PI/2;
  }
  make(pcb,new T.ExtrudeGeometry(outline,{depth:.06,bevelEnabled:false,curveSegments:24}),material('#0265a5',.25,.46),0,-.015,0).rotation.x=-Math.PI/2;
  const brushedAluminum=material('#bec7cd',.58,.32);
  for (const [id,x] of [['transmit',-.79],['receive',.79]]) {
    const can=group(model,id);
    cylinder(can,.50,.045,bright,x,.065,0);
    make(can,new T.CylinderGeometry(.467,.467,.53,72,1,true),brushedAluminum,x,.331,0);
    make(can,new T.CylinderGeometry(.438,.438,.52,72,1,true),dark,x,.326,0);
    make(can,new T.TorusGeometry(.454,.024,12,72),bright,x,.597,0).rotation.x=Math.PI/2;
    cylinder(can,.439,.02,dark,x,.497,0);
    for (let i=-8;i<=8;i++) {
      const v=i*.049, length=2*Math.sqrt(.435**2-v**2);
      cylinder(can,.0065,length,silver,x+v,.521,0).rotation.x=Math.PI/2;
      cylinder(can,.0065,length,silver,x,.535,v).rotation.z=Math.PI/2;
    }
  }
  const header=group(model,'header');
  box(header,.69,.18,.18,.014,dark,0,-.1,.47);
  for (let i=0;i<4;i++) {
    const x=-.265+i*.176;
    box(header,.035,.036,.57,.007,bright,x,-.11,.64);
    cylinder(header,.051,.025,silver,x,.054,.44);
  }
  const timing=group(model,'timing');
  box(timing,.31,.14,.16,.035,silver,0,.125,-.34);
  printedHardwareMarking(pcb,'HC-SR04',0,.048,-.49,.017,white);
  for(const [x,label] of [[-.265,'VCC'],[-.089,'TRIG'],[.087,'ECHO'],[.263,'GND']]) {
    printedHardwareMarking(pcb,label,x,.048,.34,.009,white);
  }
  return model;
}

function wire(parent, points, radius, finish) {
  const curve = new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point)));
  return make(parent, new T.TubeGeometry(curve, 56, radius, 10, false), finish);
}

function ribbonCable() {
  const model = new T.Group();
  const conductors = group(model, 'conductors');
  const housings = group(model, 'housings');
  const contacts = group(model, 'contacts');
  const colors = ['#252729','#a94631','#d47930','#e3b641','#599258','#447dab','#78519b','#939391','#e9e3cc','#594033'];
  const mouth=new T.Shape().moveTo(-.034,-.055).lineTo(.034,-.055)
    .lineTo(.034,.055).lineTo(-.034,.055).closePath();
  const bore=new T.Path().moveTo(-.015,-.024).lineTo(-.015,.024)
    .lineTo(.015,.024).lineTo(.015,-.024).closePath();
  mouth.holes.push(bore);
  const sleeve=new T.ExtrudeGeometry(mouth,{depth:.08,bevelSize:.003,bevelThickness:.002,bevelSegments:1});
  for (let index = 0; index < 20; index++) {
    const z = (index - 9.5) * .064;
    const flare = z*1.43;
    const arc=.34*(1-(z/.608)**2);
    wire(conductors, [[-1.70-arc,.17,flare-.20],[-1.18,.20,z*1.1-.07],[-.32,.13,z],[.62,.08,z+.03],[1.32,.13,z*1.12+.16],[1.70+arc,.17,flare+.33]], .031, material(colors[index % colors.length], .08, .45));
    for (const [side,shift] of [[-1,-.20],[1,.33]]) {
      const connector=new T.Group();
      connector.position.set(side*(1.82+arc),.17,flare+shift);
      connector.rotation.y=side*z*.52;
      const terminals=connector.clone();
      housings.add(connector);
      contacts.add(terminals);
      box(connector,.172,.12,.071,.012,dark,-side*.039,0,0);
      make(connector,sleeve,dark,side*.047,0,0).rotation.y=side*Math.PI/2;
      for(const y of [-.017,.017]) box(terminals,.041,.008,.022,.002,silver,side*.106,y,0);
    }
  }
  return model;
}

function headers() {
  const model = new T.Group();
  const pins = group(model,'pins');
  const spacers = group(model,'spacers');
  const tails = group(model,'tails');
  const pinFinish=material('#c2b78d',.75,.37);
  const squarePin=(part,x,z,length,direction)=>{
    const shoulder=.020, tip=.013;
    const shape=new T.Shape().moveTo(-shoulder,0).lineTo(shoulder,0)
      .lineTo(shoulder,length-.029).lineTo(tip,length).lineTo(-tip,length).lineTo(-shoulder,length-.029).closePath();
    const mesh=make(part,new T.ExtrudeGeometry(shape,{depth:.033,bevelSize:.003,bevelThickness:.003,bevelSegments:1}),
      pinFinish,x,direction>0?.101:-.021,z-.016);
    if(direction<0) mesh.rotation.z=Math.PI;
  };
  for (const [z,shift,count] of [[-.33,-.35,12],[.33,.30,16]]) {
    for (let i = 0; i < count; i++) {
      const x = (i-(count-1)/2)*.143 + shift;
      box(spacers,.142,.127,.15,.017,dark,x,.04,z);
      squarePin(pins,x,z,.26,1);
      squarePin(tails,x,z,.145,-1);
    }
  }
  return model;
}

function solderReel() {
  const model = new T.Group();
  const hub = group(model,'hub');
  const lower = group(model,'lower');
  const upper = group(model,'upper');
  const solder = group(model,'solder');
  const tip = group(model,'tip');
  const green = material('#56c85b',.07,.42);
  const ring = (parent,inner,outer,y,height) => {
    const points = [[inner,-height/2],[outer-.025,-height/2],[outer,-height*.25],[outer,height*.25],[outer-.025,height/2],[inner,height/2],[inner,-height/2]];
    return make(parent,new T.LatheGeometry(points.map(point => new T.Vector2(...point)),96),green,0,y,0);
  };
  ring(hub,.32,.50,.37,.70);
  ring(lower,.31,.92,.065,.12);
  ring(upper,.31,.92,.70,.12);
  const label=machinedRing(upper,0,.764,0,.868,.397,.005,material('#bdda72',.05,.71));
  label.rotation.x=-Math.PI/2;
  for(let mark=0;mark<44;mark++){
    const angle=mark*Math.PI/22;
    box(upper,.037,.006,.015,.002,dark,.421*Math.cos(angle),.777,.421*Math.sin(angle)).rotation.y=-angle;
  }
  printedHardwareMarking(upper,'SOLDER',0,.777,.625,.022,white);

  const turnsPerLayer=15, samplesPerTurn=26, layers=5, pitch=.032;
  const windingPoints=[];
  for(let layer=0;layer<layers;layer++){
    for(let sample=0;sample<=turnsPerLayer*samplesPerTurn;sample++){
      const turn=sample/samplesPerTurn, angle=2*Math.PI*turn+2.19;
      const radius=.518+layer*.052;
      const height=.147+pitch*(layer%2 ? turn : turnsPerLayer-turn);
      windingPoints.push(new T.Vector3(radius*Math.cos(angle),height,radius*Math.sin(angle)));
    }
  }
  const windingCurve=new T.CatmullRomCurve3(windingPoints);
  make(solder,new T.TubeGeometry(windingCurve,windingPoints.length-1,.016,8,false),silver);
  const [x,y,z]=windingPoints.at(-1).toArray();
  wire(tip,[[x,y,z],[x-.15,y-.017,z+.07],[-.68,.105,.92],[-.78,.055,1.13],[-.70,.048,1.29]],.016,silver);
  return model;
}

function pouchBattery() {
  const model = new T.Group();
  const pouch = group(model,'pouch');
  const tabs = group(model,'tabs');
  const leads = group(model,'leads');
  const plug = group(model,'plug');
  const rating = group(model,'rating');
  const foil = material('#bec1c1',.65,.34);
  const amber = material('#bd8515',.35,.39);
  box(pouch,1.65,.05,1.26,.023,silver,.54,.045,0);
  box(pouch,1.56,.155,1.19,.058,foil,.54,.113,0);
  box(tabs,.29,.16,1.17,.025,amber,-.13,.123,0);
  for(const z of [-.572,.572]){
    box(pouch,1.57,.025,.042,.008,bright,.55,.108,z);
  }
  box(pouch,.041,.025,1.16,.008,bright,1.33,.109,0);
  for(const z of [-.247,.247]) box(tabs,.218,.029,.081,.009,material('#d2a335',.50,.43),-.153,.212,z);
  printedHardwareMarking(rating, '3.7V 500MAH', .55,.192,.06,.024,dark);
  for (const [z,color] of [[-.084,'#a9232e'],[.084,'#24252a']]) {
    wire(leads,[[-.23,.16,z],[-.68,.16,z],[-1.30,.13,z-.22],[-1.74,.14,z-.12],[-1.84,.12,z+.28],[-1.63,.105,z+.50],[-1.43,.11,z+.59]],.028,material(color,.07,.45));
  }
  box(plug,.33,.22,.31,.025,white,-1.29,.115,.59);
  box(plug,.16,.045,.21,.012,white,-1.25,.238,.59);
  for (const z of [.52,.66]) box(plug,.014,.085,.068,.006,dark,-1.119,.13,z);
  return model;
}

function breadboard() {
  const model = new T.Group();
  const base = group(model,'base');
  const channel = group(model,'channel');
  const clips=group(model,'clips');
  const plastic = material('#f2f2ec',.03,.53);
  box(base,3.27,.19,2.36,.055,white,0,.10,0);
  box(channel,3.22,.056,.29,.022,plastic,0,.216,0);
  for(const z of [-1.175,1.175]) box(base,3.15,.019,.015,.004,material('#c8c8bf',.02,.66),0,.128,z);
  for (const [id,center] of [['front',.625],['rear',-.625]]) {
    const bank = group(model,id);
    const shape = new T.Shape();
    shape.moveTo(-1.62,-.53).lineTo(1.62,-.53).lineTo(1.62,.53).lineTo(-1.62,.53).closePath();
    for (let column=0;column<17;column++) for(let row=0;row<5;row++) {
      const x=(column-8)*.181, z=(row-2)*.178;
      const hole = new T.Path();
      hole.moveTo(x-.048,z-.048).lineTo(x-.048,z+.048).lineTo(x+.048,z+.048).lineTo(x+.048,z-.048).closePath();
      shape.holes.push(hole);
      box(bank,.079,.016,.079,.004,dark,x,.206,center-z);
      for(const side of [-1,1]) {
        const jaw=box(clips,.019,.052,.058,.004,silver,x+side*.030,.249,center-z);
        jaw.rotation.z=side*.16;
      }
    }
    const panel = new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSize:.012,bevelThickness:.013,bevelSegments:2});
    make(bank,panel,plastic,0,.213,center).rotation.x=-Math.PI/2;
  }
  return model;
}

function trimmer() {
  const model = new T.Group();
  const housing = group(model,'housing');
  const knob = group(model,'knob');
  const pins = group(model,'pins');
  const blue = material('#0b7dc8',.09,.41);
  const lightBlue = material('#248fd3',.1,.40);
  box(housing,1.19,.32,1.05,.06,blue,0,.11,0);
  box(housing,.92,.42,.83,.065,blue,-.10,.39,-.05);
  const collarProfile=[[0,-.119],[.358,-.119],[.375,-.105],[.375,.083],[.362,.112],[.343,.122],[0,.122]];
  make(knob,new T.LatheGeometry(collarProfile.map(([r,y])=>new T.Vector2(r,y)),64),lightBlue,-.12,.67,-.08);
  make(knob,new T.TorusGeometry(.338,.011,8,48),blue,-.12,.794,-.08).rotation.x=Math.PI/2;
  for(let i=0;i<48;i++){
    const angle=i*Math.PI/24;
    const rib=box(knob,.025,.194,.025,.004,lightBlue,-.12+.374*Math.cos(angle),.672,-.08+.374*Math.sin(angle));
    rib.rotation.y=-angle;
  }
  for(const z of [-.255,0,.255]) box(housing,.106,.219,.141,.017,lightBlue,.585,.170,z);
  const recess=material('#135a8c',.12,.45);
  box(knob,.47,.013,.056,.006,recess,-.12,.797,-.08);
  box(knob,.055,.013,.35,.006,recess,-.12,.797,-.08);
  for(const z of [-.26,0,.26]) {
    wire(pins,[[.52,.105,z],[.71,.104,z],[.93,.018,z],[1.19,-.025,z]],.030,silver);
  }
  return model;
}

function coinVibrationMotor() {
  const model = new T.Group();
  const disc = group(model,'disc');
  const bond = group(model,'bond');
  const leads = group(model,'leads');
  cylinder(disc,.584,.196,material('#595b56',.63,.51),-.33,.125,0);
  make(disc,new T.TorusGeometry(.565,.024,10,56),bright,-.33,.218,0).rotation.x=Math.PI/2;
  cylinder(disc,.544,.035,material('#484948',.13,.85),-.33,.229,0);
  const flex=group(model,'flex');
  box(flex,.268,.022,.273,.018,material('#d3b993',.08,.62),.255,.132,.043);
  for(const z of [-.066,.111]) box(flex,.158,.007,.032,.005,boardGold,.279,.148,z);
  box(bond,.15,.035,.095,.015,bright,.23,.176,.11);
  box(bond,.14,.029,.095,.013,silver,.28,.151,-.075);
  wire(leads,[[.26,.176,.11],[.65,.16,.18],[1.03,.12,.53],[1.16,.09,1.07]],.025,material('#235ca4',.10,.45));
  wire(leads,[[.29,.151,-.075],[.79,.15,.02],[1.20,.12,.37],[1.40,.08,.92]],.025,material('#c74f2c',.11,.45));
  wire(leads,[[1.16,.09,1.07],[1.19,.08,1.22]],.012,bright);
  wire(leads,[[1.40,.08,.92],[1.45,.07,1.07]],.012,bright);
  return model;
}

function powerMosfet() {
  const model = new T.Group();
  const housing = group(model,'housing');
  const tab = group(model,'tab');
  const leads = group(model,'leads');
  const moldFinish=material('#212227',.10,.60);
  box(housing,1.14,.34,1.22,.051,moldFinish,0,.22,0);
  box(housing,1.03,.012,1.10,.012,material('#25262a',.12,.57),0,.391,-.009);
  cylinder(housing,.090,.009,dark,-.32,.392,-.34);
  const profile = new T.Shape().moveTo(-.57,-.55).lineTo(.57,-.55).lineTo(.57,1.11).lineTo(.47,1.21).lineTo(-.57,1.21).closePath();
  const mountingHole = new T.Path();
  mountingHole.absarc(0,.89,.175,0,Math.PI*2,true);
  profile.holes.push(mountingHole);
  const tabGeometry = new T.ExtrudeGeometry(profile,{depth:.072,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2,curveSegments:40});
  make(tab,tabGeometry,silver,0,.04,0).rotation.x=-Math.PI/2;
  for(const x of [-.326,0,.326]) {
    const shoulder=new T.Shape().moveTo(-.082,.55).lineTo(.082,.55)
      .lineTo(.082,.778).lineTo(.044,.872).lineTo(-.044,.872).lineTo(-.082,.778).closePath();
    const geometry=new T.ExtrudeGeometry(shoulder,{depth:.05,bevelSize:.008,bevelThickness:.006,bevelSegments:2});
    const pin=make(leads,geometry,bright,x,.117,0);
    pin.rotation.x=Math.PI/2;
    box(leads,.082,.053,.83,.009,bright,x,.105,1.233);
  }
  return model;
}

function redLed() {
  const model = new T.Group();
  const lens = group(model,'lens');
  const pins = group(model,'pins');
  const die = group(model,'die');
  const red = new T.MeshPhysicalMaterial({color:'#bb0416',roughness:.15,metalness:.06,transparent:true,opacity:.69,clearcoat:.95});
  const silhouette = [[.001,-.30],[.22,-.30],[.223,-.255],[.188,-.247],[.188,.019],[.179,.083],[.151,.144],[.104,.188],[.051,.209],[.001,.216]];
  make(lens,new T.LatheGeometry(silhouette.map(point=>new T.Vector2(...point)),64),red).userData.cycleThrough=true;
  for(const [x,length] of [[-.073,.85],[.073,1.03]]) {
    box(pins,.032,length,.036,.005,silver,x,-.28-length/2,0);
  }
  box(die,.055,.26,.055,.006,silver,-.073,-.16,0);
  box(die,.114,.035,.11,.007,bright,-.072,-.019,0);
  box(die,.045,.15,.044,.005,bright,.073,-.20,0);
  box(die,.037,.020,.034,.004,material('#de822b',.45,.30),-.073,.011,0);
  wire(die,[[-.073,.019,0],[-.023,.066,0],[.041,.01,0],[.073,-.12,0]],.005,bright);
  const layout=[
    [-1.75,-1.31,-1.42],[-.73,-1.42,-1.77],[.27,-1.51,2.44],[1.04,-1.35,2.13],
    [-1.59,-.59,1.05],[-.54,-.93,2.44],[.21,-.86,-.42],[.81,-.78,2.18],[1.63,-.65,1.24],
    [-1.70,.04,1.30],[-.74,-.04,.03],[-.15,.04,2.07],[.57,.06,-.15],[1.48,-.18,1.26],
    [-1.73,.62,1.98],[-1.07,.53,2.32],[-.46,.73,2.53],[.58,.55,-1.50],[1.47,.61,-.56],
    [-1.63,1.22,2.05],[-.75,1.25,1.21],[.17,1.23,-1.70],[.97,1.25,-1.31],[1.69,1.18,-1.70],
  ];
  for(const part of [lens,pins,die]){
    const originals=[...part.children];
    part.clear();
    for(const [x,z,angle] of layout){
      const placement=new T.Group();
      placement.position.set(x,.105,z);
      placement.rotation.set(Math.PI/2,angle,0,'YXZ');
      placement.scale.setScalar(.39);
      for(const mesh of originals) placement.add(mesh.clone());
      part.add(placement);
    }
  }
  return model;
}

function pinBuzzer() {
  const model = new T.Group();
  const housing = group(model,'housing');
  const port = group(model,'port');
  const leads = group(model,'leads');
  const shell = material('#686969',.64,.48);
  cylinder(housing,.62,.60,shell,0,.15,0);
  make(housing,new T.TorusGeometry(.597,.017,9,56),silver,0,.437,0).rotation.x=Math.PI/2;
  for(const a of [.82,2.56,4.49]) {
    const slot=box(housing,.112,.056,.014,.005,dark,.616*Math.cos(a),.31,.616*Math.sin(a));
    slot.rotation.y=Math.PI/2-a;
  }
  const face = [[.115,-.037],[.59,-.037],[.62,-.016],[.61,.019],[.57,.035],[.115,.035],[.115,-.037]];
  make(housing,new T.LatheGeometry(face.map(point=>new T.Vector2(...point)),80),shell,0,.49,0);
  make(port,new T.CylinderGeometry(.114,.114,.055,48,1,true),dark,0,.489,0);
  cylinder(port,.109,.014,material('#0d1014',.03,.72),0,.462,0);
  for(const x of [-.237,.237]){
    make(housing,new T.TorusGeometry(.052,.010,8,28),silver,x,.527,.005).rotation.x=Math.PI/2;
    cylinder(housing,.039,.006,material('#4c4e4f',.46,.61),x,.526,.005);
  }
  for (const [x,len] of [[-.27,.76],[.27,.87]]) {
    box(leads,.053,len,.045,.01,bright,x,-.155-len/2,0);
    cylinder(leads,.084,.027,dark,x,-.159,0);
  }
  return model;
}

function tactileSwitch() {
  const model = new T.Group();
  const frame = group(model, 'frame');
  const cap = group(model, 'cap');
  const terminals = group(model, 'terminals');
  box(frame, 1.13, .37, 1.12, .035, dark, 0, .22, 0);
  const face = new T.Shape().moveTo(-.51,-.55).lineTo(.51,-.55).lineTo(.57,-.48)
    .lineTo(.57,.48).lineTo(.51,.55).lineTo(-.51,.55).lineTo(-.57,.48).lineTo(-.57,-.48).closePath();
  const clearance = new T.Path();
  clearance.absarc(0,0,.266,0,Math.PI*2,true);
  face.holes.push(clearance);
  const cover = new T.ExtrudeGeometry(face,{depth:.054,bevelEnabled:false,curveSegments:36});
  make(frame,cover,bright,0,.405,0).rotation.x=-Math.PI/2;
  for (const x of [-.42,.42]) for (const z of [-.42,.42]) {
    cylinder(frame,.084,.022,dark,x,.461,z);
    cylinder(frame,.051,.014,silver,x,.474,z);
  }
  for(const x of [-.524,.524]) for(const z of [-.345,.345]){
    box(frame,.076,.221,.098,.013,silver,x,.347,z);
  }
  cylinder(cap,.247,.26,dark,0,.495,0);
  const buttonProfile=[[0,0],[.211,0],[.235,.012],[.229,.036],[.194,.052],[0,.054]];
  make(cap,new T.LatheGeometry(buttonProfile.map(([r,y])=>new T.Vector2(r,y)),40),material('#35363a',.12,.52),0,.61,0);
  for (const sign of [-1,1]) for (const z of [-.355,.355]) {
    wire(terminals,[[sign*.55,.25,z],[sign*.64,.21,z],[sign*.67,.03,z],[sign*.72,-.035,z],[sign*.67,-.21,z]],.028,bright);
  }
  // The reference shows loose switches staggered on the work surface.
  const layout = [
    [-.78,-2.83],[.48,-2.88],[1.75,-2.76],
    [-1.71,-1.79],[-.43,-1.75],[.96,-1.72],[2.26,-1.49],
    [-2.40,-.66],[-1.10,-.51],[.20,-.47],[1.53,-.42],[2.81,-.23],
    [-2.09,.64],[-.80,.79],[.52,.79],[1.81,.81],[3.06,1.08],
    [-1.53,1.92],[-.19,2.06],[1.15,2.07],[2.45,2.23],
  ];
  for(const part of [frame,cap,terminals]){
    const originals=[...part.children];
    part.clear();
    for(const [i,[x,z]] of layout.entries()){
      const copy=new T.Group();
      copy.position.set(x,.23,z);
      copy.rotation.y=(i%5-2)*.088;
      for(const piece of originals) copy.add(piece.clone());
      part.add(copy);
    }
  }
  return model;
}

const hardwareGlyphs = {
  A:[2,5,7,5,5], C:[7,4,4,4,7], D:[6,5,5,5,6], E:[7,4,6,4,7], F:[7,4,6,4,4],
  H:[5,5,7,5,5], I:[7,2,2,2,7], K:[5,5,6,5,5], W:[5,5,7,7,5], L:[4,4,4,4,7], M:[5,7,7,5,5], N:[5,7,7,7,5],
  P:[6,5,6,4,4], R:[6,5,6,5,5], S:[7,4,7,1,7], T:[7,2,2,2,2], U:[5,5,5,5,7], O:[7,5,5,5,7], V:[5,5,5,5,2],
  '0':[7,5,5,5,7], '1':[2,6,2,2,7], '2':[7,1,7,4,7], '3':[7,1,7,1,7],
  '4':[5,5,7,1,1], '5':[7,4,7,1,7], '6':[7,4,7,5,7], '7':[7,1,2,2,2],
  '8':[7,5,7,5,7], '9':[7,5,7,1,7], '-':[0,0,7,0,0], '+':[0,2,7,2,0], '.':[0,0,0,0,2],
};

function printedHardwareMarking(parent, text, x, y, z, size, finish) {
  const positions=[];
  const origin=x-text.length*size*2+size*.5;
  for(const [character,glyph] of Array.from(text).entries()){
    for(const [row,bits] of (hardwareGlyphs[glyph]??[]).entries()) for(let column=0;column<3;column++){
      if(!(bits & (4>>column))) continue;
      const x0=origin+(character*4+column)*size, x1=x0+size*.94;
      const z0=z+(row-2.5)*size, z1=z0+size*.94;
      positions.push(x0,y,z0,x0,y,z1,x1,y,z1,x0,y,z0,x1,y,z1,x1,y,z0);
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.computeVertexNormals();
  make(parent,geometry,finish);
}

function throughHoleIc({timer=false, shiftRegister=false}) {
  const model = new T.Group();
  const housing = group(model,'housing');
  const leads = group(model,'leads');
  const marker = group(model,'marker');
  const markings = group(model,'markings');
  const length = shiftRegister ? 3.67 : timer ? 1.91 : 1.74;
  const width = timer ? 1.26 : 1.19;
  const finish = material(timer?'#18181c':'#2d2c2c',.14,timer?.5:.57);
  box(housing,length,.29,width,.047,finish,0,.29,0);
  const face = new T.Shape().moveTo(-length/2,-width/2).lineTo(length/2,-width/2)
    .lineTo(length/2,width/2).lineTo(-length/2,width/2);
  if(shiftRegister) {
    face.lineTo(-length/2,.197).quadraticCurveTo(-length/2+.32,0,-length/2,-.197);
  }
  face.closePath();
  const [markerX,markerZ] = shiftRegister ? [-1.63,.005] : timer ? [-.78,.015] : [-.59,.31];
  const radius = timer ? .126 : .086;
  const hole = new T.Path();
  hole.absarc(markerX,-markerZ,radius,0,Math.PI*2,true);
  face.holes.push(hole);
  make(housing,new T.ExtrudeGeometry(face,{depth:.102,bevelEnabled:true,bevelSize:.009,bevelThickness:.008,bevelSegments:2,curveSegments:32}),finish,0,.433,0).rotation.x=-Math.PI/2;
  cylinder(marker,radius-.009,.025,dark,markerX,.444,markerZ);
  if(timer) cylinder(housing,.107,.014,dark,.65,.545,.20);
  const pinCount = shiftRegister ? 8 : 4;
  for (const sign of [-1,1]) for (let i=0;i<pinCount;i++) {
    const x=(i-(pinCount-1)/2)*(shiftRegister?.435:timer?.442:.415);
    const profile=new T.Shape().moveTo(-.077,.325).lineTo(.077,.325)
      .lineTo(.066,.172).lineTo(.038,.107).lineTo(.033,-.232)
      .quadraticCurveTo(0,-.265,-.031,-.232).lineTo(-.038,.108).lineTo(-.066,.175).closePath();
    const leg=make(leads,new T.ExtrudeGeometry(profile,{depth:.031,bevelSize:.008,bevelThickness:.006,bevelSegments:2}),
      bright,x,0,sign*(width/2+.129));
    leg.rotation.x=sign*(timer?.040:.065);
    box(leads,.139,.046,.163,.011,silver,x,.321,sign*(width/2+.050));
  }
  const label=shiftRegister?'74HC595':timer?'NE555N':'TLV2462CP';
  const ink=material(timer?'#a7aaa4':'#8d8e86',.09,.65);
  printedHardwareMarking(markings,label,.13,.546,-.126,shiftRegister?.067:.047,ink);
  if(timer) printedHardwareMarking(markings,'7828',.19,.546,.225,.045,ink);
  if(shiftRegister){
    // Three parallel packages arranged diagonally in the source photograph.
    for(const part of [housing, leads, marker, markings]){
      const originals=[...part.children];
      part.clear();
      for(const [x,z] of [[-.39,-1.72],[0,0],[.39,1.72]]){
        const chip=new T.Group();
        chip.position.set(x,0,z);
        for(const piece of originals) chip.add(piece.clone());
        part.add(chip);
      }
    }
  }
  return model;
}

function ferriteInductor() {
  const model = new T.Group();
  const core = group(model,'core');
  const winding = group(model,'winding');
  const ends = group(model,'ends');
  const rod = group(model,'rod');
  const toroid = group(model,'toroid');
  const molded = group(model,'molded');
  const ferrite = material('#35352c',.30,.62);
  const insulation = material('#1378aa',.05,.42);
  const copper = material('#b87637',.78,.32);
  const section = [[.48,-.23],[.68,-.28],[.91,-.25],[.96,-.18],[.96,.17],[.90,.25],[.57,.25],[.48,.19],[.48,-.23]];
  const coreGeometry=new T.LatheGeometry(section.map(point=>new T.Vector2(...point)),96);
  const positions=coreGeometry.getAttribute('position');
  const shades=[];
  for(let i=0;i<positions.count;i++){
    const shade=.94+.05*Math.sin(positions.getX(i)*93+positions.getZ(i)*137)*Math.cos(positions.getY(i)*109);
    shades.push(shade,shade,shade);
  }
  coreGeometry.setAttribute('color',new T.Float32BufferAttribute(shades,3));
  const coreFinish=ferrite.clone();
  coreFinish.vertexColors=true;
  make(core,coreGeometry,coreFinish);
  const turns = Array.from({length:81},(_,index)=>{
    const fraction=index/80;
    const angle=fraction*Math.PI*4;
    const spread=-.50+fraction*.95;
    const radius=.72-.37*Math.cos(angle);
    return [radius*Math.sin(spread),.355*Math.sin(angle),radius*Math.cos(spread)];
  });
  wire(winding,[[-1.55,.04,-.78],[-1.04,-.28,-.58],[-.65,-.40,-.27],[-.27,-.37,.06],[-.15,-.19,.22],...turns,[.16,.23,.27],[.30,.36,.29],[.81,.38,.35],[1.54,.10,.46]],.061,insulation);
  for(let strand=0;strand<8;strand++) {
    const delta=(strand-3.5)*.012;
    wire(ends,[[1.52,.10+delta,.46],[1.66,.105+delta,.48],[1.83,.14+delta,.47+delta]],.008,copper);
    wire(ends,[[-1.53,.04+delta,-.77],[-1.66,.08+delta,-.86],[-1.79,.09+delta,-.92]],.008,copper);
  }
  const examplesZ=1.70;
  cylinder(rod,.177,.67,ferrite,-1.31,.23,examplesZ);
  const rodCoil=axialHelix(rod,-.144,.144,.182,8,.019,copper);
  rodCoil.position.set(-1.31,.235,examplesZ);
  rodCoil.rotation.z=Math.PI/2;
  for(const x of [-1.54,-1.08]) wire(rod,[[x,.216,examplesZ],[x,.119,examplesZ+.16],[x,.054,examplesZ+.29]],.016,bright);
  const toroidX=-.057;
  make(toroid,new T.TorusGeometry(.214,.084,16,48),material('#c3a73a',.12,.62),toroidX,.13,examplesZ).rotation.x=Math.PI/2;
  const coil=Array.from({length:577},(_,i)=>{
    const a=i*Math.PI*2/576, turn=a*24, r=.214+.095*Math.cos(turn);
    return new T.Vector3(toroidX+r*Math.cos(a),.13+.095*Math.sin(turn),examplesZ+r*Math.sin(a));
  });
  make(toroid,new T.TubeGeometry(new T.CatmullRomCurve3(coil),576,.012,7,false),copper);
  wire(toroid,[[.092,.128,examplesZ+.22],[.12,.083,examplesZ+.36],[.12,.053,examplesZ+.43]],.012,bright);
  box(molded,.377,.294,.313,.060,material('#36713d',.13,.52),.943,.228,examplesZ);
  for(const x of [.822,1.064]) wire(molded,[[x,.127,examplesZ+.01],[x+.032,.073,examplesZ+.17],[x,.055,examplesZ+.29]],.013,bright);
  return model;
}

function dualWinding() {
  const model = new T.Group();
  const frame = group(model,'frame');
  const bobbin = group(model,'bobbin');
  const terminals = group(model,'terminals');
  const copper = material('#aa5f30',.80,.33);
  const ferrite = material('#24272c',.38,.58);
  for(const x of [-.97,.97]) box(frame,.20,1.58,.87,.045,ferrite,x,.02,0);
  for(const y of [-.73,.77]) box(frame,2.13,.20,.87,.045,ferrite,0,y,0);
  axial(frame,.27,1.90,ferrite,0);
  axial(bobbin,.39,1.81,white,0);
  for(const x of [-.86,-.10,.10,.86]) axial(bobbin,.59,.078,white,x);
  for(const [id,sign] of [['primary',-1],['secondary',1]]) {
    const coil = group(model,id);
    const start=sign*.80,end=sign*.142,turns=22;
    axialHelix(coil,start,end,.505,turns,.016,copper);
    wire(coil,[[end,.505,0],[end,.43,.27],[sign*.24,-.12,.493],[sign*.34,-.57,.469],[sign*.50,-.93,.429]],.016,copper);
  }
  box(terminals,2.30,.23,.94,.033,dark,0,-.91,0);
  for(const x of [-.84,-.52,.52,.84]){
    box(terminals,.122,.088,.142,.014,ferrite,x,-1.012,.366);
    wire(terminals,[[x,-1.011,.41],[x,-1.14,.424],[x+Math.sign(x)*.023,-1.224,.459],[x+Math.sign(x)*.023,-1.33,.459]],.025,bright);
  }
  return model;
}

function characterLcd() {
  const model = new T.Group();
  const pcb = group(model,'pcb');
  const frame = group(model,'frame');
  const display = group(model,'display');
  const header = group(model,'header');
  const green = material('#05815d',.20,.44);
  const gold = material('#c5a655',.81,.35);
  const outline = new T.Shape().moveTo(-1.80,-.80).lineTo(1.80,-.80).lineTo(1.80,.80).lineTo(-1.80,.80).closePath();
  for(const x of [-1.68,1.68]) for(const z of [-.68,.68]) {
    const hole = new T.Path();
    hole.absarc(x,z,.058,0,Math.PI*2,true);
    outline.holes.push(hole);
    make(pcb,new T.TorusGeometry(.062,.013,10,28),gold,x,.071,-z).rotation.x=Math.PI/2;
  }
  for(let i=0;i<16;i++) {
    const x=-1.34+i*.136;
    const hole = new T.Path();
    hole.absarc(x,.678,.026,0,Math.PI*2,true);
    outline.holes.push(hole);
    make(header,new T.TorusGeometry(.034,.012,8,24),gold,x,.073,-.678).rotation.x=Math.PI/2;
  }
  make(pcb,new T.ExtrudeGeometry(outline,{depth:.058,bevelEnabled:false,curveSegments:24}),green,0,.005,0).rotation.x=-Math.PI/2;
  for(const z of [-.496,.496]) box(frame,3.18,.26,.19,.019,dark,0,.19,z);
  for(const x of [-1.50,1.50]) box(frame,.19,.26,.84,.022,dark,x,.19,0);
  box(display,2.89,.064,.87,.020,material('#10244b',.16,.45),0,.263,0);
  const polarizer=new T.PlaneGeometry(2.814,.795,18,10);
  const vertices=polarizer.getAttribute('position');
  const colors=[];
  const deep=new T.Color('#0e285a'),blue=new T.Color('#194d9d'),shade=new T.Color();
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i)/1.407,y=vertices.getY(i)/.398;
    shade.copy(deep).lerp(blue,.44*(1-x*x)*(1-.24*y*y));
    colors.push(shade.r,shade.g,shade.b);
  }
  polarizer.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  make(display,polarizer,new T.MeshPhysicalMaterial({vertexColors:true,roughness:.25,clearcoat:.45}),0,.301,0).rotation.x=-Math.PI/2;
  for(const z of [-.425,.425]) box(frame,2.99,.024,.054,.007,dark,0,.314,z);
  for(const x of [-1.45,1.45]) box(frame,.056,.024,.823,.007,dark,x,.314,0);
  return model;
}

function relay() {
  const model = new T.Group();
  const frame = group(model,'frame');
  const coil = group(model,'coil');
  const contacts = group(model,'contacts');
  const terminals = group(model,'terminals');
  const copper = material('#9c5833',.80,.36);
  const brass = material('#9d8a5b',.78,.40);
  box(frame,1.18,.19,.81,.024,dark,0,-.33,0);
  for(const x of [-.48,.48]) box(frame,.12,1.11,.58,.015,silver,x,.29,-.05);
  box(frame,1.08,.13,.61,.02,silver,0,.88,-.05);
  cylinder(coil,.304,.83,dark,0,.28,0).rotation.z=Math.PI/2;
  const winding=axialHelix(coil,-.389,.389,.313,29,.014,copper);
  winding.position.y=.28;
  for(const x of [-.41,.41]) {
    const flange=cylinder(coil,.35,.045,dark,x,.28,0);
    flange.rotation.z=Math.PI/2;
  }
  const armature=group(model,'armature');
  box(armature,.91,.068,.355,.016,silver,.007,.955,.019).rotation.z=-.065;
  cylinder(armature,.058,.264,bright,-.421,.959,.019).rotation.x=Math.PI/2;
  box(contacts,.65,.05,.23,.015,silver,.135,-.094,.35).rotation.z=.16;
  cylinder(contacts,.092,.059,bright,.364,-.114,.36);
  box(contacts,.23,.072,.21,.015,brass,.39,-.181,.36);
  const springPoints=Array.from({length:113},(_,i)=>{
    const a=i*Math.PI/4;
    return [-.39+i*.007,1.01+Math.cos(a)*.047,Math.sin(a)*.047];
  });
  make(contacts,new T.TubeGeometry(new T.CatmullRomCurve3(springPoints.map(v=>new T.Vector3(...v))),128,.013,8,false),bright);
  for(const x of [-.36,.02]){
    const blade=new T.Shape().moveTo(-.096,-.32).lineTo(.096,-.32).lineTo(.106,.35).lineTo(-.106,.35).closePath();
    const hole=new T.Path();hole.absarc(0,-.215,.044,0,Math.PI*2,true);blade.holes.push(hole);
    make(terminals,new T.ExtrudeGeometry(blade,{depth:.051,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:2}),brass,x,-.74,.085);
  }
  box(terminals,.057,.66,.053,.012,silver,.40,-.741,.11);
  return model;
}

const boardBlue = material('#0368af',.21,.47);
const boardGold = material('#cba95a',.76,.38);
function boardPlate(parent,width,depth,holes=[],finish=boardBlue) {
  const shape=new T.Shape().moveTo(-width/2,-depth/2).lineTo(width/2,-depth/2)
    .lineTo(width/2,depth/2).lineTo(-width/2,depth/2).closePath();
  for(const [x,z,radius] of holes) {
    const hole=new T.Path();
    hole.absarc(x,-z,radius,0,Math.PI*2,true);
    shape.holes.push(hole);
  }
  make(parent,new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false,curveSegments:32}),finish,0,0,0).rotation.x=-Math.PI/2;
}
function platedHole(parent,x,z,radius) {
  make(parent,new T.TorusGeometry(radius,.019,8,28),boardGold,x,.074,z).rotation.x=Math.PI/2;
}

function thumbJoystick() {
  const model=new T.Group();
  const board=group(model,'board');
  const pads=group(model,'pads');
  const cap=group(model,'cap');
  const assembly=group(model,'assembly');
  const mounting=[[-.89,-.89,.078],[.89,-.89,.078],[-.89,.89,.078],[.89,.89,.078]];
  const signals=Array.from({length:5},(_,i)=>[-.72+i*.168,.69,.033]);
  boardPlate(board,2.09,2.09,[...mounting,...signals]);
  for(const [x,z,r] of signals) platedHole(pads,x,z,r+.009);
  box(assembly,.91,.42,.91,.035,silver,0,.29,0);
  box(assembly,.29,.36,.61,.025,white,.52,.27,.01);
  box(assembly,.55,.36,.28,.026,dark,.01,.28,-.54);
  cylinder(assembly,.12,.46,silver,0,.62,0);
  const boot=group(model,'boot');
  const bootOutline=[[.105,0],[.52,0],[.61,.055],[.64,.17],[.59,.29],[.48,.41],[.29,.49],[.18,.51],[.14,.52],[.105,.49]];
  make(boot,new T.LatheGeometry(bootOutline.map(v=>new T.Vector2(...v)),96),material('#222326',.10,.33),0,.54,0);
  const gripOutline=[[.01,.495],[.17,.495],[.29,.516],[.405,.553],[.457,.606],[.473,.663],
    [.468,.719],[.429,.775],[.367,.823],[.274,.855],[.16,.873],[0,.881]];
  const grip=new T.LatheGeometry(gripOutline.map(v=>new T.Vector2(...v)),128);
  const vertices=grip.getAttribute('position');
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
    if(y<.61) continue;
    const grain=Math.sin(x*183+z*151)*Math.sin(z*211+y*137);
    vertices.setY(i,y+grain*.004);
  }
  grip.computeVertexNormals();
  make(cap,grip,material('#47494c',.02,.88),0,.54,0);
  return model;
}

function serialAdapter() {
  const model=new T.Group();
  const board=group(model,'board');
  const chip=group(model,'chip');
  const usb=group(model,'usb');
  const header=group(model,'header');
  boardPlate(board,2.61,1.64,[[1.01,.61,.055],[-.32,-.61,.045]]);
  platedHole(board,1.01,.61,.063);
  platedHole(board,-.32,-.61,.053);
  box(chip,.85,.14,.60,.024,dark,.02,.16,.013);
  for(let i=0;i<14;i++) for(const sign of [-1,1]) {
    const x=(i-6.5)*.052;
    box(chip,.024,.027,.128,.006,bright,x,.086,sign*.342);
  }
  for(let i=0;i<7;i++) {
    const x=-.58+i*.195;
    box(chip,.098,.07,.070,.010,white,x,.103,i<4?-.57:.57);
  }
  for(const z of [-.275,.275]) box(usb,.55,.176,.043,.012,silver,1.126,.16,z);
  box(usb,.54,.036,.54,.012,bright,1.126,.258,0);
  box(usb,.55,.036,.55,.012,silver,1.126,.065,0);
  box(usb,.39,.051,.40,.010,dark,1.04,.13,0);
  for(let i=0;i<5;i++) box(usb,.21,.009,.022,.003,boardGold,1.14,.158,(i-2)*.063);
  box(header,.55,.22,1.48,.023,dark,-1.45,.20,0);
  for(let i=0;i<6;i++) {
    const z=(i-2.5)*.228;
    box(header,.015,.107,.126,.012,material('#121316',.14,.65),-1.728,.205,z);
    wire(header,[[-1.21,.22,z],[-1.08,.22,z],[-.995,.08,z]],.030,bright);
  }
  printedHardwareMarking(board,'FTDI FRIEND',.15,.070,-.659,.024,white);
  for(const [i,label] of ['GND','CTS','VCC','TX','RX','RTS'].entries()){
    printedHardwareMarking(board,label,-.767,.070,(i-2.5)*.228,.014,white);
  }
  for(const z of [-.181,.181]){
    box(usb,.090,.007,.072,.006,dark,1.202,.278,z);
    box(usb,.072,.075,.014,.004,bright,1.29,.104,z*1.46);
  }
  return model;
}

function motorDriver() {
  const model=new T.Group();
  const board=group(model,'board');
  const motor=group(model,'motor');
  const supply=group(model,'supply');
  const limit=group(model,'limit');
  const chip=group(model,'chip');
  const cap=group(model,'capacitor');
  const pads=group(model,'pads');
  const mounting=[[-.90,.73,.10],[.90,.73,.10]];
  const signals=Array.from({length:4},(_,i)=>[-.48+i*.31,.67,.048]);
  boardPlate(board,2.11,1.77,[...mounting,...signals]);
  for(const [x,z,r] of mounting) platedHole(board,x,z,r+.009);
  for(const [x,z,r] of signals) platedHole(pads,x,z,r+.009);
  const plastic=material('#3aab79',.08,.44);
  for(const [x,terminals] of [[-.54,motor],[.54,supply]]) {
    box(terminals,.91,.44,.66,.035,plastic,x,.32,-.49);
    const top=new T.Shape().moveTo(-.45,-.32).lineTo(.45,-.32).lineTo(.45,.32).lineTo(-.45,.32).closePath();
    for(const dx of [-.23,.23]) {
      const hole=new T.Path();
      hole.absarc(dx,0,.134,0,Math.PI*2,true);
      top.holes.push(hole);
      cylinder(terminals,.117,.049,bright,x+dx,.548,-.49);
      box(terminals,.151,.009,.026,.004,dark,x+dx,.576,-.49).rotation.y=.45;
      box(terminals,.166,.14,.012,.013,dark,x+dx,.29,-.824);
    }
    make(terminals,new T.ExtrudeGeometry(top,{depth:.108,bevelEnabled:false,curveSegments:26}),plastic,x,.54,-.49).rotation.x=-Math.PI/2;
  }
  box(chip,.50,.135,.43,.018,dark,-.46,.145,.24);
  for(let i=0;i<4;i++) for(const sign of [-1,1]) {
    box(chip,.05,.034,.14,.005,bright,-.46+(i-1.5)*.10,.082,.24+sign*.254);
  }
  box(cap,.57,.084,.56,.026,dark,.48,.11,.13);
  cylinder(cap,.25,.43,silver,.48,.35,.13);
  cylinder(cap,.23,.02,bright,.48,.574,.13);
  box(limit,.24,.047,.12,.007,dark,.34,.092,.48);
  for (const x of [.218,.462]) box(limit,.062,.045,.122,.004,silver,x,.092,.48);
  printedHardwareMarking(cap, '22', .48,.585,.056,.033,dark);
  printedHardwareMarking(cap, '63V', .48,.585,.225,.031,dark);
  printedHardwareMarking(board,'MOTOR',-.62,.070,-.065,.019,white);
  printedHardwareMarking(board,'POWER',.63,.070,-.085,.019,white);
  printedHardwareMarking(board,'GND',.735,.070,.611,.012,white);
  for(const z of [-.018,.278]) box(cap,.038,.181,.022,.005,material('#6c7074',.28,.53),.677,.354,z);
  return model;
}

function inlineBuck() {
  const model=new T.Group();
  const converter=group(model,'converter');
  const input=group(model,'input');
  const output=group(model,'output');
  const plug=group(model,'plug');
  const red=material('#d04627',.08,.42);
  const sleeve=new T.MeshPhysicalMaterial({color:'#dfe7e7',transparent:true,opacity:.36,roughness:.28,metalness:.08});
  box(converter,.84,.046,.31,.018,material('#158166',.19,.48),0,.105,0);
  box(converter,.25,.085,.23,.021,dark,-.14,.176,0);
  box(converter,.18,.082,.24,.023,white,-.36,.170,0);
  cylinder(converter,.094,.27,material('#7f3c45',.35,.38),.215,.202,0).rotation.z=Math.PI/2;
  const wrap=group(model,'wrap');
  box(wrap,.92,.223,.36,.105,sleeve,0,.160,0).userData.cycleThrough=true;
  for(const x of [-.362,.362]){
    const edge=make(wrap,new T.TorusGeometry(.158,.008,8,36),sleeve,x,.166,0);
    edge.rotation.y=Math.PI/2;
    edge.scale.x=.75;
    edge.userData.cycleThrough=true;
  }
  for(const x of [-.306,-.208,.085]){
    box(converter,.063,.021,.041,.004,boardGold,x,.143,.116);
  }
  for(const [z,finish] of [[-.066,red],[.066,dark]]) {
    wire(output,[[-.40,.134,z],[-.84,.11,z-.12],[-1.24,.11,z-.48],[-1.85,.12,z-.48],[-1.95,.08,z-.12],[-1.63,.08,z+.03],[-1.52,.12,z-.42],[-1.99,.11,z-.58],[-2.32,.13,z-.42]],.023,finish);
    wire(input,[[.39,.134,z],[.65,.12,z+.07],[1.25,.09,z+.28],[2.01,.07,z+.46]],.024,finish);
    wire(input,[[2.01,.07,z+.46],[2.12,.068,z+.49]],.012,bright);
  }
  box(plug,.24,.102,.23,.012,dark,-2.38,.115,-.42);
  for (const y of [.073,.157]) box(plug,.105,.018,.23,.005,dark,-2.55,y,-.42);
  for (const z of [-.528,-.456,-.384,-.312]) {
    box(plug,.105,.07,.014,.004,dark,-2.55,.115,z);
  }
  for (const z of [-.492,-.348]) {
    box(plug,.012,.026,.028,.004,silver,-2.506,.115,z);
  }
  return model;
}

function wirelessBreakout() {
  const model=new T.Group();
  const board=group(model,'board');
  const radio=group(model,'radio');
  const antenna=group(model,'antenna');
  const pads=group(model,'pads');
  const reset=group(model,'reset');
  const boot=group(model,'boot');
  const serial=group(model,'serial');
  const power=group(model,'power');
  const mounts=[[-1.32,-.64,.081],[-1.32,.64,.081],[1.32,-.64,.081],[1.32,.64,.081]];
  const interfaces=[-1,1].flatMap(sign=>Array.from({length:10},(_,i)=>[-1.09+i*.224,sign*.64,.040]));
  const serialPins=Array.from({length:6},(_,i)=>[1.32,(i-2.5)*.196,.040]);
  boardPlate(board,2.88,1.57,[...mounts,...interfaces,...serialPins]);
  for(const pin of serialPins) platedHole(serial,...pin);
  for(const [x,z,radius] of mounts) platedHole(board,x,z,radius);
  for(const [x,z,radius] of interfaces) platedHole(pads,x,z,radius);
  box(radio,1.21,.094,.96,.026,material('#223228',.22,.51),-.115,.12,0);
  box(radio,1.08,.154,.865,.021,silver,-.075,.225,0);
  for(const sign of [-1,1]) for(let i=0;i<8;i++) box(radio,.063,.023,.10,.006,boardGold,-.64+i*.146,.092,sign*.497);
  box(antenna,.665,.075,.96,.017,dark,-.995,.115,0);
  const trace=[[-.66,.40],[-1.27,.40],[-1.27,.18],[-.89,.18],[-.89,.02],[-1.28,.02],[-1.28,-.17],[-.89,-.17],[-.89,-.33],[-1.28,-.33],[-1.28,-.42],[-.69,-.42]];
  for(let i=1;i<trace.length;i++) {
    const [x,z]=trace[i-1], [u,v]=trace[i];
    box(antenna,Math.abs(u-x)+.034,.010,Math.abs(v-z)+.034,.002,boardGold,(x+u)/2,.157,(z+v)/2);
  }
  printedHardwareMarking(radio,'ESP-12F',-.075,.304,-.083,.031,white);
  printedHardwareMarking(radio,'WIFI',-.075,.304,.101,.025,white);
  printedHardwareMarking(board,'RST',.94,.069,.462,.018,white);
  printedHardwareMarking(board,'BOOT',.95,.069,-.449,.017,white);
  for(const z of [-.423,.423]) box(radio,1.026,.012,.022,.004,bright,-.075,.303,z);
  for(const [z,controls] of [[-.24,boot],[.24,reset]]) {
    box(controls,.29,.103,.26,.017,silver,.99,.126,z);
    cylinder(controls,.082,.052,dark,.99,.205,z);
  }
  box(power,.21,.070,.17,.012,dark,.69,.10,.15);
  for (const z of [-.13,.31,.45]) {
    box(power,.15,.066,.091,.006,dark,.66,.10,z);
    for (const x of [.58,.74]) box(power,.037,.040,.095,.004,silver,x,.094,z);
  }
  return model;
}

function singleTransducer() {
  const model=new T.Group();
  const board=group(model,'board');
  const housing=group(model,'housing');
  const mounting=group(model,'mounting');
  const grille=group(model,'grille');
  const pads=group(model,'pads');
  const electronics=group(model,'electronics');
  const mount=[.78,.68,.117];
  const signal=Array.from({length:7},(_,i)=>[-.83+i*.233,.68,.047]);
  boardPlate(board,2.01,1.68,[mount,...signal],material('#128651',.18,.47));
  platedHole(mounting,...mount);
  for(const pad of signal) platedHole(pads,...pad);
  const shell=material('#202325',.18,.42);
  cylinder(housing,.66,.67,shell,0,.402,-.093);
  cylinder(grille,.58,.018,silver,0,.744,-.093);
  const cover=new T.Shape();
  cover.absarc(0,0,.64,0,Math.PI*2,false);
  const center=new T.Path();
  center.absarc(0,0,.097,0,Math.PI*2,true);
  cover.holes.push(center);
  for(const [radius,count,offset] of [[.205,3,0],[.354,3,.6],[.502,4,0]]) {
    for(let i=0;i<count;i++) {
      const start=i*Math.PI*2/count+offset;
      const end=start+(Math.PI*2/count)*.70;
      const slot=new T.Path();
      slot.absarc(0,0,radius+.033,end,start,true);
      slot.absarc(0,0,radius-.033,start,end,false);
      slot.closePath();
      cover.holes.push(slot);
    }
  }
  make(grille,new T.ExtrudeGeometry(cover,{depth:.032,bevelEnabled:false,curveSegments:32}),shell,0,.764,-.093).rotation.x=-Math.PI/2;
  make(housing,new T.TorusGeometry(.635,.021,10,64),shell,0,.733,-.093).rotation.x=Math.PI/2;
  for(const angle of [0,2*Math.PI/3,4*Math.PI/3]){
    const foot=box(housing,.091,.125,.058,.009,dark,.631*Math.cos(angle),.112,-.093+.631*Math.sin(angle));
    foot.rotation.y=-angle;
  }
  for(const x of [-.77,.76]) {
    box(electronics,.29,.102,.34,.015,dark,x,.125,-.28);
    for(let i=0;i<4;i++) box(electronics,.055,.030,.055,.005,bright,x-.104+i*.066,.083,-.10);
  }
  return model;
}

function gpsPatch() {
  const model=new T.Group();
  const board=group(model,'board');
  const antenna=group(model,'antenna');
  const receiver=group(model,'receiver');
  const pads=group(model,'pads');
  const mountsGroup=group(model,'mounting');
  const external=group(model,'external');
  const fix=group(model,'fix');
  const mounts=[[-1.00,-.69,.095],[-1.00,.69,.095]];
  const signal=Array.from({length:9},(_,i)=>[1.02,-.68+i*.17,.040]);
  boardPlate(board,2.29,1.68,[...mounts,...signal]);
  for(const mount of mounts) platedHole(mountsGroup,...mount);
  for(const pad of signal) platedHole(pads,...pad);
  box(receiver,1.41,.074,1.22,.018,material('#205744',.19,.48),-.06,.112,0);
  box(receiver,1.34,.070,1.17,.021,silver,-.06,.16,0);
  for(const sign of [-1,1]) for(let i=0;i<8;i++) box(receiver,.073,.035,.10,.007,bright,-.66+i*.171,.095,sign*.60);
  box(antenna,1.27,.252,1.11,.041,material('#cf9b59',.08,.52),-.06,.315,0);
  box(antenna,1.00,.019,.88,.015,white,-.06,.447,0);
  cylinder(antenna,.049,.010,dark,.245,.458,.26);
  printedHardwareMarking(antenna,'PA1616S',-.06,.459,-.19,.024,dark);
  printedHardwareMarking(board,'GPS',-.75,.070,.472,.018,white);
  for(const z of [-.51,.51]) box(antenna,1.125,.010,.030,.004,material('#e2b982',.08,.59),-.06,.432,z);
  box(external,.19,.065,.19,.009,white,-.79,.099,-.42);
  make(external,new T.TorusGeometry(.060,.014,8,24),silver,-.79,.144,-.42).rotation.x=Math.PI/2;
  cylinder(external,.014,.035,boardGold,-.79,.13,-.42);
  box(fix,.17,.060,.098,.010,white,-.50,.102,.685);
  box(fix,.075,.010,.056,.004,material('#f2cfaf',.04,.35),-.50,.138,.685);
  for(const [x,z] of [[-.52,-.66],[-.24,-.66],[.05,-.66],[.63,-.66],[.08,.67],[.47,.67]]) {
    box(board,.14,.052,.081,.007,dark,x,.095,z);
    for(const dx of [-.073,.073]) box(board,.042,.040,.082,.005,silver,x+dx,.089,z);
  }
  return model;
}

function touchBreakout() {
  const model = new T.Group();
  const board = group(model,'board');
  const electrode = group(model,'electrode');
  const pads = group(model,'pads');
  const chip = group(model,'chip');
  const mounts = group(model,'mounts');
  const led = group(model,'led');
  const mounting = [-1,1].flatMap(x=>[-1,1].map(z=>[x*.88,z*.64,.10]));
  const connections = Array.from({length:4},(_,i)=>[.57,-.38+i*.235,.041]);
  boardPlate(board,2.07,1.60,[...mounting,...connections]);
  for (const hole of mounting) platedHole(mounts,...hole);
  for (const hole of connections) platedHole(pads,...hole);
  box(electrode,.91,.009,.78,.025,material('#07528a',.18,.56),-.31,.069,0);
  const mask=material('#3f91c4',.18,.52);
  for(let i=0;i<12;i++) {
    box(electrode,.88,.004,.008,.001,mask,-.31,.075,(i-5.5)*.059);
    box(electrode,.008,.004,.74,.001,mask,-.31+(i-5.5)*.072,.075,0);
  }
  box(chip,.24,.083,.17,.016,dark,.34,.123,.38);
  for(let i=0;i<3;i++) for(const sign of [-1,1]) box(chip,.039,.026,.077,.006,silver,.34+(i-1)*.074,.080,.38+sign*.105);
  box(led,.175,.090,.161,.014,white,-.75,.120,-.35);
  box(led,.081,.011,.064,.005,material('#cf9986',.04,.45),-.75,.171,-.35);
  for(const x of [-.823,-.677]) box(led,.043,.023,.126,.005,silver,x,.079,-.35);
  for(const [x,z] of [[.27,-.45],[.33,-.23],[.11,.52]]){
    box(chip,.14,.044,.076,.009,material('#baa989',.10,.57),x,.088,z);
    for(const side of [-1,1]) box(chip,.034,.046,.079,.004,silver,x+side*.053,.089,z);
  }
  printedHardwareMarking(board,'AT42QT1010',-.27,.080,-.25,.022,white);
  printedHardwareMarking(board,'MOMENTARY',-.27,.080,-.09,.021,white);
  printedHardwareMarking(board,'CAP SWITCH',-.27,.080,.065,.020,white);
  const jumpers=group(model,'jumpers');
  for(const [x,z] of [[.28,.18],[.28,.63]]){
    box(jumpers,.155,.008,.095,.006,white,x,.070,z);
    for(const side of [-1,1]) box(jumpers,.057,.009,.072,.004,boardGold,x+side*.036,.078,z);
  }
  return model;
}

function rtcBreakout() {
  const model = new T.Group();
  const board = group(model,'board');
  const chip = group(model,'chip');
  const pads = group(model,'pads');
  const mounts = group(model,'mounts');
  const backup = group(model,'backup');
  const mounting=[[-.94,-.49,.115],[.94,-.49,.115]];
  const connections=Array.from({length:8},(_,i)=>[-.89+i*.253,.54,.045]);
  boardPlate(board,2.27,1.42,[...mounting,...connections]);
  for(const hole of mounting) platedHole(mounts,...hole);
  for(const hole of connections) platedHole(pads,...hole);
  box(chip,1.29,.18,.75,.028,dark,-.04,.184,-.10);
  cylinder(chip,.049,.008,material('#141519',.12,.52),.48,.277,.13);
  for(let i=0;i<8;i++) for(const sign of [-1,1]) {
    const x=-.04+(i-3.5)*.151;
    wire(chip,[[x,.176,-.10+sign*.359],[x,.150,-.10+sign*.417],[x,.084,-.10+sign*.454],[x,.083,-.10+sign*.501]],.026,bright);
  }
  for(const [x,z] of [[-.82,.23],[-.68,.38],[.83,-.29]]) box(board,.13,.065,.085,.009,white,x,.102,z);
  printedHardwareMarking(board,'RTC',.805,.070,-.208,.021,white);
  printedHardwareMarking(board,'DS3231',.50,.070,-.618,.017,white);
  printedHardwareMarking(chip,'DS3231',-.04,.276,-.14,.037,material('#626163',.21,.48));
  cylinder(backup,.552,.012,boardGold,0,-.007,-.13);
  for(const x of [-.65,.65]) box(backup,.25,.055,.27,.016,silver,x,-.039,-.13);
  for(const x of [-.51,.51]) box(backup,.067,.135,.62,.014,silver,x,-.102,-.11);
  const clip = new T.Shape().moveTo(-.52,-.32).lineTo(-.30,-.55).lineTo(.30,-.55)
    .lineTo(.52,-.32).lineTo(.52,.43).quadraticCurveTo(0,.22,-.52,.43).closePath();
  for(const x of [-.24,.24]) {
    const opening = new T.Path();
    opening.absarc(x,-.17,.143,0,Math.PI*2,true);
    clip.holes.push(opening);
    box(backup,.088,.033,.40,.009,bright,x,-.176,.06).rotation.x=.13;
  }
  make(backup,new T.ExtrudeGeometry(clip,{depth:.037,bevelEnabled:false,curveSegments:24}),silver,0,-.147,-.13).rotation.x=Math.PI/2;
  return model;
}

function crickitBoard() {
  const model = new T.Group();
  const board = group(model,'board');
  const control = group(model,'control');
  const motors = group(model,'motors');
  const drive = group(model,'drive');
  const pixels = group(model,'pixels');
  const speaker = group(model,'speaker');
  const servos = group(model,'servos');
  const seesaw = group(model,'seesaw');
  const debug = group(model,'debug');
  const signal = group(model,'signal');
  const power = group(model,'power');
  const touch = group(model,'touch');
  const outline = new T.Shape().moveTo(-.71,-1.23).lineTo(.71,-1.23).lineTo(1.25,-.68)
    .lineTo(1.25,.68).lineTo(.71,1.23).lineTo(-.71,1.23).lineTo(-1.25,.68).lineTo(-1.25,-.68).closePath();
  const mounting=[[-.53,-1.12],[.53,-1.12],[-1.12,-.58],[1.12,-.58],[-1.12,.58],[1.12,.58],[-.53,1.12],[.53,1.12]];
  const touchPoints=Array.from({length:4},(_,i)=>[-.98+i*.15,.67+i*.151]);
  for(const [x,z] of [...mounting,...touchPoints]) {
    const hole=new T.Path();
    hole.absarc(x,-z,.059,0,Math.PI*2,true);
    outline.holes.push(hole);
  }
  make(board,new T.ExtrudeGeometry(outline,{depth:.065,bevelEnabled:false,curveSegments:24}),material('#138955',.18,.47)).rotation.x=-Math.PI/2;
  for(const point of mounting) platedHole(board,...point,.061);
  for(const point of touchPoints) platedHole(touch,...point,.069);
  cylinder(control,.757,.066,material('#252729',.15,.49),0,.101,0);
  box(control,.25,.11,.25,.021,dark,0,.186,-.22);
  for(let i=0;i<10;i++) {
    const angle=(i+.5)*Math.PI/5;
    const x=.66*Math.cos(angle), z=.66*Math.sin(angle);
    cylinder(control,.062,.017,boardGold,x,.144,z);
    box(control,.072,.054,.068,.013,white,x*.81,.168,z*.81);
  }
  for(const [parent,x,z,angle,count] of [
    [motors,1.01,-.02,0,4], [drive,.77,-.82,-.77,4],
    [pixels,.57,.99,.78,3], [speaker,.96,.66,.78,2],
  ]) {
    const block=new T.Group();
    block.position.set(x,.068,z);
    block.rotation.y=angle;
    parent.add(block);
    box(block,.237,.192,count*.136,.012,dark,0,.096,0);
    for(let i=0;i<count;i++) {
      const position=(i-(count-1)/2)*.136;
      cylinder(block,.043,.024,silver,0,.198,position);
      box(block,.066,.006,.013,.003,dark,0,.211,position);
    }
  }
  box(signal,.277,.173,.70,.015,dark,-.997,.153,0);
  for(let i=0;i<8;i++) for(const x of [-1.063,-.974,-.885]) box(signal,.053,.010,.050,.003,boardGold,x,.245,(i-3.5)*.081);
  const servoHeader = new T.Group();
  servos.add(servoHeader);
  servoHeader.position.set(-.77,.068,-.78);
  servoHeader.rotation.y=.79;
  box(servoHeader,.42,.135,.30,.014,dark,0,.075,0);
  for(let i=0;i<4;i++) for(let j=0;j<3;j++) {
    box(servoHeader,.029,.091,.029,.004,boardGold,(i-1.5)*.098,.17,(j-1)*.090);
  }
  for(const x of [-.28,.28]) {
    box(control,.153,.073,.153,.009,silver,x,.169,0);
    cylinder(control,.046,.045,dark,x,.222,0);
  }
  box(control,.28,.108,.17,.010,silver,0,.177,-.72);
  box(control,.19,.102,.22,.020,dark,0,.176,.67);
  box(seesaw,.15,.065,.15,.010,dark,.20,.106,1.02);
  for(const dx of [-1,1]) for(const dz of [-1,1]) {
    box(seesaw,.026,.011,.13,.003,bright,.20+dx*.076,.078,1.02+dz*.008);
  }
  box(power,.14,.09,.16,.010,silver,.29,.111,-1.06);
  cylinder(power,.041,.031,dark,.29,.166,-1.06);
  box(power,.278,.29,.396,.025,dark,0,.199,-1.09);
  cylinder(power,.088,.015,silver,0,.207,-1.295).rotation.x=Math.PI/2;
  cylinder(power,.053,.022,dark,0,.207,-1.308).rotation.x=Math.PI/2;
  box(debug,.26,.094,.18,.019,silver,0,.116,1.18);
  box(debug,.18,.050,.014,.006,dark,0,.116,1.276);
  printedHardwareMarking(board,'SIGNAL',-.958,.070,.424,.016,white);
  printedHardwareMarking(board,'MOTOR',.96,.070,.354,.016,white);
  printedHardwareMarking(board,'TOUCH',-.665,.070,.975,.016,white);
  for(const x of [-.157,.157]) box(debug,.043,.081,.18,.008,bright,x,.116,1.18);
  return model;
}

function currentSenseBoard() {
  const model=new T.Group();
  const board=group(model,'board');
  const terminal=group(model,'terminal');
  const sense=group(model,'sense');
  const shunt=group(model,'shunt');
  const frontSocket=group(model,'front-socket');
  const rearSocket=group(model,'rear-socket');
  const pads=group(model,'pads');
  const mounting=[-1,1].flatMap(x=>[-1,1].map(z=>[x*.84,z*.70,.099]));
  const signals=Array.from({length:6},(_,i)=>[.62,-.49+i*.196,.041]);
  boardPlate(board,2.02,1.72,[...mounting,...signals],material('#222427',.18,.52));
  for(const hole of mounting) platedHole(board,...hole);
  for(const hole of signals) platedHole(pads,...hole);
  const green=material('#54a96f',.05,.44);
  box(terminal,.83,.52,.54,.041,green,-.60,.33,-.18);
  const collar=new T.Shape().moveTo(-.405,-.26).lineTo(.405,-.26).lineTo(.405,.26).lineTo(-.405,.26).closePath();
  for(const x of [-.20,.20]){
    const bore=new T.Path();
    bore.absarc(x,0,.133,0,Math.PI*2,true);
    collar.holes.push(bore);
  }
  make(terminal,new T.ExtrudeGeometry(collar,{depth:.112,bevelSize:.012,bevelThickness:.011,bevelSegments:2,curveSegments:28}),
    green,-.60,.59,-.18).rotation.x=-Math.PI/2;
  for(const x of [-.80,-.40]) {
    cylinder(terminal,.113,.031,silver,x,.685,-.18);
    box(terminal,.141,.008,.020,.004,dark,x,.705,-.18).rotation.y=.37;
    box(terminal,.144,.120,.016,.008,dark,x,.34,-.455);
  }
  box(shunt,.28,.075,.20,.012,dark,-.27,.108,.06);
  printedHardwareMarking(shunt, 'R100', -.27,.147,.06,.014,white);
  for(const x of [-.408,-.132]) box(shunt,.065,.072,.20,.006,bright,x,.109,.06);
  box(sense,.32,.103,.28,.019,dark,.04,.126,.12);
  for(let i=0;i<4;i++) for(const sign of [-1,1]) box(sense,.034,.024,.099,.006,bright,.04+(i-1.5)*.075,.082,.12+sign*.172);
  for(const [z,sockets] of [[-.61,rearSocket],[.61,frontSocket]]) {
    box(sockets,.55,.21,.26,.023,white,.12,.177,z);
    box(sockets,.425,.099,.014,.010,dark,.12,.179,z+Math.sign(z)*.134);
    for(let i=0;i<4;i++) box(sockets,.037,.018,.11,.005,boardGold,.12+(i-1.5)*.094,.14,z);
  }
  return model;
}

function noirCamera() {
  const model=new T.Group();
  const board=group(model,'board');
  const electronics=group(model,'electronics');
  const connector=group(model,'connector');
  const ribbon=group(model,'ribbon');
  const optics=group(model,'optics');
  const mounts=group(model,'mounting');
  const mounting=[-1,1].flatMap(x=>[-.22,.62].map(z=>[x*.81,z,.105]));
  boardPlate(board,1.95,1.64,mounting,material('#191d22',.19,.52));
  for(const [x,z,r] of mounting) make(mounts,new T.TorusGeometry(r,.035,10,32),boardGold,x,.075,z).rotation.x=Math.PI/2;
  box(connector,1.55,.122,.27,.018,dark,0,.121,-.60);
  for(const x of [-.755,.755]) box(connector,.104,.113,.225,.012,silver,x,.144,-.60);
  const latch=group(model,'latch');
  box(latch,1.36,.044,.19,.009,material('#a49883',.64,.37),0,.201,-.59);
  for(const x of [-.624,.624]) box(latch,.069,.035,.080,.008,silver,x,.225,-.594);
  for(let i=0;i<15;i++) box(connector,.029,.030,.13,.005,silver,(i-7)*.086,.082,-.435);
  box(ribbon,1.15,.031,1.37,.011,white,0,.119,-1.425);
  box(ribbon,1.15,.026,.35,.008,material('#098acf',.07,.43),0,.146,-.943);
  for(let pin=0;pin<15;pin++){
    box(ribbon,.027,.003,.97,.001,material('#d4d9dd',.12,.59),(pin-7)*.073,.136,-1.609);
  }
  for(const [x,z,w,d] of [[-.27,-.09,.24,.19],[.03,.13,.15,.13],[.34,.22,.24,.16],[-.66,.29,.19,.19]]) {
    box(electronics,w,.058,d,.012,dark,x,.105,z);
    for(let i=0;i<4;i++) for(const side of [-1,1]) box(electronics,w*.12,.020,.055,.004,bright,x+(i-1.5)*w*.22,.082,z+side*(d/2+.018));
  }
  for(const [x,z] of [[-.58,-.27],[.54,-.26],[-.60,.06],[-.43,.44],[.56,.51],[.30,.58]]) box(electronics,.107,.051,.074,.009,white,x,.098,z);
  box(optics,.70,.217,.72,.042,dark,0,-.11,.09);
  cylinder(optics,.255,.17,dark,0,-.26,.09);
  make(optics,new T.TorusGeometry(.174,.027,12,56),silver,0,-.35,.09).rotation.x=Math.PI/2;
  cylinder(optics,.15,.026,material('#173339',.26,.18),0,-.357,.09);
  return model;
}

function linearRegulator() {
  const model=new T.Group();
  const body=group(model,'body');
  const tab=group(model,'tab');
  const leads=group(model,'leads');
  const outline=new T.Shape().moveTo(-.52,-.54).lineTo(.52,-.54).lineTo(.52,1.02)
    .lineTo(.41,1.16).lineTo(-.38,1.16).lineTo(-.52,1.04).closePath();
  const hole=new T.Path();
  hole.absarc(0,.88,.168,0,Math.PI*2,true);
  outline.holes.push(hole);
  make(tab,new T.ExtrudeGeometry(outline,{depth:.079,bevelEnabled:true,bevelSegments:2,bevelThickness:.012,bevelSize:.010,curveSegments:40}),bright,0,.04,0).rotation.x=-Math.PI/2;
  const housing=new T.Shape().moveTo(-.52,-.50).lineTo(.52,-.50).lineTo(.52,-.26)
    .lineTo(.46,-.18).lineTo(.46,.17).lineTo(.52,.24).lineTo(.52,.56)
    .lineTo(-.52,.56).lineTo(-.52,.24).lineTo(-.46,.17).lineTo(-.46,-.18).lineTo(-.52,-.26).closePath();
  make(body,new T.ExtrudeGeometry(housing,{depth:.29,bevelEnabled:true,bevelSegments:2,bevelThickness:.018,bevelSize:.018}),material('#303134',.13,.52),0,.09,0).rotation.x=-Math.PI/2;
  cylinder(body,.058,.011,silver,.24,.403,.24);
  for(const x of [-.285,0,.285]) {
    const pinProfile=new T.Shape().moveTo(-.071,.52).lineTo(.071,.52)
      .lineTo(.071,.739).lineTo(.036,.820).lineTo(.036,1.53)
      .quadraticCurveTo(.034,1.574,0,1.574).quadraticCurveTo(-.034,1.574,-.036,1.53)
      .lineTo(-.036,.820).lineTo(-.071,.739).closePath();
    make(leads,new T.ExtrudeGeometry(pinProfile,{depth:.047,bevelSize:.006,bevelThickness:.005,bevelSegments:2}),
      bright,x,.174,0).rotation.x=Math.PI/2;
  }
  return model;
}

function studThyristor() {
  const model=new T.Group();
  const stud=group(model,'stud');
  const cable=group(model,'cable');
  const lug=group(model,'lug');
  const gate=group(model,'gate');
  const sink=group(model,'sink');
  const red=material('#a91620',.10,.45);
  const [x,z]=[-.79,.15];
  box(sink,2.10,.17,1.40,.032,material('#a79a65',.66,.48),.05,.084,0);
  const extrusion=material('#89846e',.64,.44);
  box(sink,.23,.59,1.24,.015,extrusion,.36,.37,0);
  for(const [angle,length] of [[.09,.96],[.33,.95],[.60,.91],[.87,.83],[1.18,.73]]){
    const fin=box(sink,length,.065,1.24,.008,extrusion,.36+Math.cos(angle)*length*.47,.19+Math.sin(angle)*length*.47,0);
    fin.rotation.z=angle;
  }
  make(stud,new T.CylinderGeometry(.32,.32,.24,6),silver,x,.28,z);
  cylinder(stud,.29,.25,bright,x,.49,z);
  cylinder(stud,.265,.29,white,x,.72,z);
  for(const y of [.581,.845]) make(stud,new T.TorusGeometry(.252,.018,9,48),silver,x,y,z).rotation.x=Math.PI/2;
  cylinder(stud,.205,.052,silver,x,.89,z);
  wire(cable,[[x,.89,z],[x+.03,1.29,z],[x+.12,1.77,z],[x+.40,2.12,z],[x+.77,2.26,z],[x+1.13,2.25,z]],.095,red);
  const face=new T.Shape().moveTo(-.22,-.099).lineTo(.23,-.13).quadraticCurveTo(.276,-.13,.278,-.09)
    .lineTo(.278,.088).quadraticCurveTo(.274,.13,.23,.13).lineTo(-.22,.096).closePath();
  const crimp=cylinder(lug,.098,.215,silver,x+1.085,2.25,z+.021);
  crimp.rotation.z=Math.PI/2;
  for(const offset of [-.067,.063]){
    make(lug,new T.TorusGeometry(.096,.010,8,32),bright,x+1.085+offset,2.25,z+.021).rotation.y=Math.PI/2;
  }
  const hole=new T.Path();
  hole.absarc(.146,0,.069,0,Math.PI*2,true);face.holes.push(hole);
  make(lug,new T.ExtrudeGeometry(face,{depth:.047,bevelEnabled:false,curveSegments:26}),silver,x+1.27,2.25,z);
  for(const [color,phase] of [[red,0],[white,Math.PI]]) {
    const route=Array.from({length:121},(_,i)=>{
      const f=i/120, a=f*5.75+2.6;
      const twist=f*16*Math.PI+phase;
      return [x+.41+.47*Math.cos(a)+.030*Math.cos(twist),1.31+.42*Math.sin(a)+.030*Math.sin(twist),z+.18];
    });
    wire(gate,[[x+.16,.80,z+.14],[x+.09,.97,z+.17],...route],.021,color);
    const end=route.at(-1);
    box(gate,.104,.052,.056,.010,silver,end[0]-.036,end[1],end[2]);
  }
  return model;
}

function sideSocket(parent,x,z,direction,{finish=white,pins=4,width=.43,depth=.30,height=.21}={}) {
  const socket=new T.Group();
  socket.position.set(x,.068,z);
  socket.rotation.y=direction;
  parent.add(socket);
  for(const side of [-1,1]) box(socket,.056,height,depth,.011,finish,side*(width/2-.025),height/2,0);
  box(socket,width,.053,depth,.012,finish,0,height-.024,0);
  box(socket,width,.049,depth,.010,finish,0,.025,0);
  box(socket,width-.073,height-.077,.050,.007,finish,0,height/2,-depth/2+.025);
  for(let i=0;i<pins;i++) {
    const offset=(i-(pins-1)/2)*(width-.12)/pins;
    box(socket,.031,.024,depth-.017,.004,boardGold,offset,.061,.012);
    box(socket,.031,.023,.09,.004,bright,offset,.012,-depth/2-.028);
  }
}

function surfaceChip(parent,x,z,width,depth,pins) {
  box(parent,width,.085,depth,.014,dark,x,.135,z);
  for(let i=0;i<pins;i++) for(const sign of [-1,1]) {
    const offset=(i-(pins-1)/2)*width/(pins+.6);
    box(parent,width/(pins*2),.026,.100,.005,bright,x+offset,.080,z+sign*(depth/2+.037));
  }
}

function fourCornerMounts(width,depth,radius) {
  return [-1,1].flatMap(x=>[-1,1].map(z=>[x*(width/2-.16),z*(depth/2-.16),radius]));
}

function eepromBreakout() {
  const model=new T.Group();
  const board=group(model,'board');
  const mounts=group(model,'mounts');
  const chip=group(model,'chip');
  const ports=group(model,'ports');
  const pins=group(model,'pins');
  const mounting=fourCornerMounts(1.94,1.37,.088);
  const signals=[...Array.from({length:6},(_,i)=>[-.59+i*.207,.49,.033]),...Array.from({length:3},(_,i)=>[-.19+i*.193,-.49,.034])];
  boardPlate(board,1.94,1.37,[...mounting,...signals],material('#353639',.18,.53));
  for(const point of mounting) platedHole(mounts,...point);
  for(const point of signals) platedHole(pins,...point);
  surfaceChip(chip,.032,-.027,.47,.37,4);
  surfaceChip(chip,-.40,-.12,.18,.15,3);
  for(const [x,z] of [[-.47,.19],[.57,-.33],[.35,.27]]) box(chip,.116,.056,.072,.009,white,x,.098,z);
  const graphite=material('#393b3e',.22,.50);
  sideSocket(ports,-.76,0,-Math.PI/2,{finish:graphite,width:.45});
  sideSocket(ports,.76,0,Math.PI/2,{finish:graphite,width:.45});
  printedHardwareMarking(board,'I2C MEMORY',0,.070,-.29,.028,white);
  for(const [i,label] of ['VIN','3V','GND','SCL','SDA','WP'].entries()){
    printedHardwareMarking(board,label,-.59+i*.207,.070,.604,.012,white);
  }
  for(const [i,label] of ['A0','A1','A2'].entries()){
    printedHardwareMarking(board,label,-.19+i*.193,.070,-.398,.013,white);
  }
  return model;
}

function adcBreakout() {
  const model=new T.Group();
  const board=group(model,'board');
  const mounts=group(model,'mounts');
  const chip=group(model,'chip');
  const analog=group(model,'analog');
  const host=group(model,'host');
  const left=group(model,'left');
  const right=group(model,'right');
  const mounting=fourCornerMounts(2.27,1.60,.105);
  const inputs=Array.from({length:6},(_,i)=>[-.77+i*.273,-.62,.041]);
  const connections=Array.from({length:6},(_,i)=>[-.77+i*.273,.62,.041]);
  boardPlate(board,2.27,1.60,[...mounting,...inputs,...connections],material('#292a2d',.16,.52));
  for(const point of mounting) platedHole(mounts,...point);
  for(const point of inputs) platedHole(analog,...point);
  for(const point of connections) platedHole(host,...point);
  surfaceChip(chip,.06,.007,.39,.29,5);
  for(const [x,z] of [[-.38,-.29],[-.33,-.11],[-.39,.10],[.52,-.14],[.47,.34]]) box(chip,.16,.061,.079,.011,white,x,.104,z);
  sideSocket(left,-.91,0,-Math.PI/2,{width:.56,depth:.37,height:.28});
  sideSocket(right,.91,0,Math.PI/2,{width:.56,depth:.37,height:.28});
  printedHardwareMarking(board,'ADS1115',0,.070,-.257,.030,white);
  printedHardwareMarking(board,'16 BIT ADC',.03,.070,-.146,.018,white);
  for(const [i,label] of ['A+','A3','A2','A1','A0','A-'].entries()){
    printedHardwareMarking(board,label,-.77+i*.273,.070,-.735,.014,white);
  }
  for(const [i,label] of ['VIN','GND','SCL','SDA','ADDR','ALRT'].entries()){
    printedHardwareMarking(board,label,-.77+i*.273,.070,.732,.013,white);
  }
  return model;
}

function chargeBreakout() {
  const model=new T.Group();
  const board=group(model,'board');
  const mounts=group(model,'mounts');
  const chip=group(model,'chip');
  const usb=group(model,'usb');
  const battery=group(model,'battery');
  const load=group(model,'load');
  const pads=group(model,'pads');
  const mounting=fourCornerMounts(2.39,2.08,.088);
  const auxiliary=Array.from({length:6},(_,i)=>[-.38+i*.185,-.74,.036]);
  boardPlate(board,2.39,2.08,[...mounting,...auxiliary]);
  for(const point of mounting) platedHole(mounts,...point);
  for(const point of auxiliary) platedHole(pads,...point);
  surfaceChip(chip,-.12,-.31,.26,.24,4);
  for(const [x,z] of [[-.45,-.50],[-.48,-.12],[-.29,.36],[.18,.41],[.30,.06]]) box(chip,.126,.051,.091,.009,white,x,.099,z);
  box(usb,.53,.043,.53,.012,silver,-.93,.087,-.35);
  for(const z of [-.592,-.108]) box(usb,.53,.176,.044,.011,boardGold,-.93,.171,z);
  box(usb,.53,.040,.53,.011,boardGold,-.93,.273,-.35);
  box(usb,.41,.054,.42,.012,dark,-.92,.153,-.35);
  for(let i=0;i<5;i++) box(usb,.25,.009,.028,.002,bright,-.96,.183,-.35+(i-2)*.062);
  const cream=material('#e4d5ad',.05,.47);
  sideSocket(battery,.90,.42,Math.PI/2,{finish:cream,pins:2,width:.52,depth:.39,height:.32});
  sideSocket(load,.90,-.43,Math.PI/2,{finish:cream,pins:2,width:.52,depth:.39,height:.32});
  printedHardwareMarking(board,'BAT',.48,.070,.438,.020,white);
  printedHardwareMarking(board,'LOAD',.47,.070,-.421,.019,white);
  printedHardwareMarking(board,'DCIN',-.65,.070,-.684,.016,white);
  printedHardwareMarking(board,'PWR',-.68,.070,.238,.018,white);
  for(const shift of [-.049,0,.049]){
    wire(board,[[-.40,.069,-.219+shift],[-.26,.069,-.207+shift],[-.125,.069,-.093+shift],
      [.112,.069,-.093+shift],[.235,.069,.02+shift]],.007,material('#2d8fbc',.12,.51));
  }
  return model;
}

function controllerBoard(parent, outline, holes, finish) {
  const shape = new T.Shape();
  outline.forEach(([x,z],i)=>i ? shape.lineTo(x,-z) : shape.moveTo(x,-z));
  shape.closePath();
  for(const [x,z,radius] of holes) {
    const opening = new T.Path();
    opening.absarc(x,-z,radius,0,Math.PI*2,true);
    shape.holes.push(opening);
  }
  make(parent,new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false,curveSegments:24}),finish).rotation.x=-Math.PI/2;
}

function femaleHeader(parent,x,z,count,spacing=.135) {
  for(let i=0;i<count;i++) {
    const position=x+i*spacing;
    box(parent,spacing,.175,.155,.010,dark,position,.153,z);
    box(parent,.082,.012,.080,.006,material('#111215',.10,.62),position,.243,z);
    box(parent,.047,.012,.046,.004,boardGold,position,.247,z);
    box(parent,.031,.012,.031,.003,dark,position,.254,z);
  }
}

function controllerUsb(parent,x,z,width,style) {
  const depth=style==='c'?.45:.35;
  const height=style==='c'?.145:.115;
  for(const side of [-1,1]) box(parent,depth,height,.032,.007,silver,x,.145,z+side*width/2);
  box(parent,depth,.030,width,.012,bright,x,.145+height/2,z);
  box(parent,depth,.032,width,.012,silver,x,.145-height/2,z);
  box(parent,depth*.89,.042,width*.84,.010,dark,x+.055,.139,z);
  for(let i=0;i<6;i++) box(parent,.114,.012,.022,.004,boardGold,x-.092,.166,z+(i-2.5)*width*.12);
}

function tactileCap(parent,x,z,size) {
  box(parent,size,.098,size,.013,silver,x,.119,z);
  cylinder(parent,size*.29,.058,dark,x,.195,z);
  for(const a of [-1,1]) for(const b of [-1,1]) cylinder(parent,size*.07,.013,bright,x+a*size*.35,.175,z+b*size*.35);
}

function unoMinima() {
  const model=new T.Group();
  const board=group(model,'board');
  const usb=group(model,'usb');
  const controller=group(model,'controller');
  const digital=group(model,'digital');
  const power=group(model,'power');
  const analog=group(model,'analog');
  const barrel=group(model,'barrel');
  const reset=group(model,'reset');
  const spi=group(model,'spi');
  const swd=group(model,'swd');
  const outline=[[-1.84,-1.42],[1.69,-1.42],[1.72,-.80],[1.84,-.65],[1.84,1.12],[1.70,1.24],[1.70,1.42],[-1.84,1.42]];
  const mounting=[[-1.02,-1.28,.098],[1.70,-.44,.102],[-1.09,1.27,.105],[1.70,1.00,.101]];
  controllerBoard(board,outline,mounting,material('#104365',.23,.47));
  for(const point of mounting) platedHole(board,...point);
  const copperMask=material('#2d6d89',.16,.50);
  for(let i=0;i<11;i++){
    const x=-1.54+i*.102;
    wire(board,[[x,.065,-1.19],[x,.065,-.80],[x+.20,.065,-.60],[x+.44,.065,-.60],
      [x+.59,.065,-.45],[x+.85,.065,-.45]],.006,copperMask);
    wire(board,[[x,.065,1.16],[x,.065,.86],[x+.16,.065,.70],[x+.16,.065,.38],
      [x+.31,.065,.23]],.006,copperMask);
  }
  controllerUsb(usb,-1.79,-.61,.45,'c');
  box(controller,.59,.128,.57,.019,dark,.56,.157,-.26);
  for(let i=0;i<12;i++) for(const sign of [-1,1]) {
    const offset=(i-5.5)*.047;
    box(controller,.020,.020,.112,.003,silver,.56+offset,.078,-.26+sign*.318);
    box(controller,.112,.020,.020,.003,silver,.56+sign*.333,.078,-.26+offset);
  }
  for(const [x,z] of [[.23,-.62],[.93,-.53],[-1.30,.31],[-1.43,.57],[-1.16,.57]]) box(board,.105,.065,.090,.009,white,x,.10,z);
  femaleHeader(digital,-.85,-1.30,10);
  femaleHeader(digital,.56,-1.30,8);
  femaleHeader(power,-.36,1.29,8);
  femaleHeader(analog,.90,1.29,6);
  box(barrel,.71,.40,.49,.028,dark,-1.66,.258,1.01);
  make(barrel,new T.CylinderGeometry(.161,.161,.025,48,1,true),silver,-2.02,.276,1.01).rotation.z=Math.PI/2;
  cylinder(barrel,.149,.018,material('#111319',.13,.65),-2.027,.276,1.01).rotation.z=Math.PI/2;
  cylinder(barrel,.042,.053,silver,-2.044,.276,1.01).rotation.z=Math.PI/2;
  tactileCap(reset,-1.52,-1.25,.33);
  box(spi,.23,.092,.34,.012,dark,1.64,.111,.19);
  for(const x of [1.585,1.695]) for(const z of [.075,.19,.305]) {
    box(spi,.039,.17,.039,.004,boardGold,x,.238,z);
  }
  box(swd,.21,.091,.36,.013,dark,1.54,.112,-.83);
  for(const x of [1.492,1.588]) for(let i=0;i<5;i++) {
    box(swd,.028,.040,.027,.003,boardGold,x,.167,-.966+i*.068);
  }
  printedHardwareMarking(board,'ARDUINO',.03,.067,.69,.024,white);
  printedHardwareMarking(board,'RESET',-1.55,.067,-.997,.016,white);
  printedHardwareMarking(board,'POWER',-.36,.067,1.099,.019,white);
  printedHardwareMarking(board,'ANALOG IN',.90,.067,1.099,.016,white);
  printedHardwareMarking(board,'UNO R4',1.02,.067,.44,.026,white);
  printedHardwareMarking(board,'MINIMA',1.02,.067,.65,.023,white);
  return model;
}

function picoTwo() {
  const model=new T.Group();
  const board=group(model,'board');
  const usb=group(model,'usb');
  const chip=group(model,'chip');
  const pads=group(model,'pads');
  const boot=group(model,'boot');
  const debug=group(model,'debug');
  const flash=group(model,'flash');
  const regulator=group(model,'regulator');
  const crystal=group(model,'crystal');
  const mounting=[-1,1].flatMap(x=>[-1,1].map(z=>[x*1.43,z*.405,.074]));
  const signals=[-1,1].flatMap(side=>Array.from({length:20},(_,i)=>[-1.44+i*.151,side*.58,.035]));
  const debugPoints=Array.from({length:3},(_,i)=>[1.50,(i-1)*.16,.031]);
  boardPlate(board,3.26,1.31,[...signals,...debugPoints,...mounting],material('#029268',.20,.47));
  for(const point of mounting) platedHole(board,...point);
  for(const point of signals) platedHole(pads,...point);
  for(const point of debugPoints) platedHole(debug,...point);
  controllerUsb(usb,-1.56,0,.50,'micro');
  box(chip,.49,.105,.49,.018,dark,-.02,.148,0);
  for(let i=0;i<11;i++) for(const side of [-1,1]) {
    const offset=(i-5)*.038;
    box(chip,.018,.020,.064,.003,silver,-.02+offset,.077,side*.249);
    box(chip,.064,.020,.018,.003,silver,-.02+side*.249,.077,offset);
  }
  tactileCap(boot,-1.10,.33,.235);
  surfaceChip(flash,-.58,.29,.23,.17,4);
  surfaceChip(regulator,-.91,-.27,.23,.16,4);
  box(regulator,.18,.082,.18,.016,dark,-1.02,.112,-.45);
  for(const x of [-1.09,-.76]) box(regulator,.11,.058,.085,.009,white,x,.102,-.28);
  box(crystal,.243,.062,.17,.016,silver,.41,.102,.20);
  printedHardwareMarking(chip,'RP2350',-.02,.202,.05,.018,material('#929091',.16,.53));
  printedHardwareMarking(board,'PICO 2',.77,.067,-.15,.027,white);
  printedHardwareMarking(board,'BOOTSEL',-1.06,.067,.49,.012,white);
  printedHardwareMarking(board,'DEBUG',1.24,.067,-.325,.013,white);
  const traceMask=material('#1a9e79',.12,.53);
  for(let i=0;i<7;i++){
    const x=-.42+i*.128;
    for(const side of [-1,1]) wire(board,[[x,.066,side*.522],[x,.066,side*.433],
      [x-.09,.066,side*.341],[x-.09,.066,side*.263]],.0045,traceMask);
  }
  box(board,.15,.070,.13,.012,dark,-.48,.10,.32);
  return model;
}

function microBit() {
  const model=new T.Group();
  const board=group(model,'board');
  const rings=group(model,'rings');
  const matrix=group(model,'matrix');
  const a=group(model,'a');
  const b=group(model,'b');
  const touch=group(model,'touch');
  const microphone=group(model,'microphone');
  const edge=[-1.01,-.50,0,.50,1.01].map(x=>[x,.707,.112]);
  const outline=[[-1.21,-.82],[-1.12,-.915],[1.12,-.915],[1.21,-.82],[1.21,.88]];
  for(const [x] of [...edge].reverse()) {
    outline.push([x+.15,.915],[x+.10,.872],[x-.10,.872],[x-.15,.915]);
  }
  outline.push([-1.21,.88]);
  controllerBoard(board,outline,[...edge,[.40,-.51,.027]],material('#37393a',.17,.48));
  const turquoise=material('#48c8bb',.08,.48);
  for(const [x,w,d] of [[-1.09,.29,.54],[-.80,.22,.31],[-.57,.13,.16],[.91,.16,.15]]) {
    const flag=new T.Shape().moveTo(-w/2,0).lineTo(w/2,0).lineTo(0,-d).closePath();
    make(board,new T.ShapeGeometry(flag),turquoise,x,.066,-.88).rotation.x=-Math.PI/2;
  }
  make(microphone,new T.TorusGeometry(.035,.011,8,24),boardGold,.40,.071,-.51).rotation.x=Math.PI/2;
  box(microphone,.124,.048,.093,.008,silver,.40,-.025,-.51);
  box(microphone,.057,.020,.047,.006,white,.50,.077,-.49);
  for(const [x,z,radius] of edge) {
    make(rings,new T.TorusGeometry(radius+.016,.026,10,32),boardGold,x,.077,z).rotation.x=Math.PI/2;
    box(rings,.24,.019,.080,.005,boardGold,x,.074,.867);
  }
  for(let i=0;i<19;i++) {
    const x=(i-9)*.122;
    if(edge.every(([ringX])=>Math.abs(ringX-x)>.145)) box(rings,.082,.014,.235,.004,boardGold,x,.074,.785);
  }
  for(let row=0;row<5;row++) for(let column=0;column<5;column++) {
    const x=(column-2)*.195,z=(row-2)*.177+.105;
    box(matrix,.067,.039,.094,.008,white,x,.089,z);
    box(matrix,.046,.009,.050,.005,material('#e8c58d',.07,.39),x,.112,z);
  }
  tactileCap(a,-.923,.04,.285);
  tactileCap(b,.923,.04,.285);
  const badge=new T.Shape().absarc(0,0,.112,0,Math.PI*2,false);
  const opening=new T.Path().absarc(0,0,.074,0,Math.PI*2,true);
  badge.holes.push(opening);
  const badgeMesh=make(touch,new T.ShapeGeometry(badge,48),boardGold,0,.072,-.533);
  badgeMesh.rotation.x=-Math.PI/2;
  badgeMesh.scale.x=1.73;
  const traceFinish=material('#51585a',.10,.62);
  for(let i=0;i<7;i++){
    const x=-.59+i*.195;
    wire(board,[[x,.065,-.77],[x,.065,-.65],[x+.12,.065,-.53],[x+.12,.065,-.34]],.004,traceFinish);
  }
  for(const x of [-.086,.086]) cylinder(touch,.023,.008,boardGold,x,.094,-.533);
  return model;
}

function squareChip(parent,x,z,size,pinCount) {
  box(parent,size,.087,size,.014,dark,x,.135,z);
  for(let i=0;i<pinCount;i++) for(const side of [-1,1]) {
    const offset=(i-(pinCount-1)/2)*size/(pinCount+.55);
    box(parent,.018,.021,.073,.004,bright,x+offset,.076,z+side*(size/2+.025));
    box(parent,.073,.021,.018,.004,bright,x+side*(size/2+.025),.076,z+offset);
  }
}

function espH2DevKit() {
  const model=new T.Group();
  const board=group(model,'board');
  const radio=group(model,'radio');
  const antenna=group(model,'antenna');
  const headers=group(model,'headers');
  const nativeUsb=group(model,'native-usb');
  const uartUsb=group(model,'uart-usb');
  const bridge=group(model,'bridge');
  const boot=group(model,'boot');
  const reset=group(model,'reset');
  const points=[-1,1].flatMap(side=>Array.from({length:15},(_,i)=>[-1.23+i*.173,side*.68,.026]));
  boardPlate(board,2.92,1.56,points,material('#303035',.19,.49));
  for(const [x,z,r] of points) {
    platedHole(headers,x,z,r+.006);
    box(headers,.147,.106,.143,.012,dark,x,-.067,z);
    box(headers,.040,.36,.040,.006,bright,x,-.195,z);
  }
  controllerUsb(nativeUsb,-1.38,.38,.49,'c');
  controllerUsb(uartUsb,-1.38,-.38,.49,'c');
  box(radio,.81,.065,.77,.015,material('#263c2d',.2,.47),.92,.101,0);
  box(radio,.74,.125,.70,.019,silver,.92,.192,0);
  box(antenna,.43,.062,.77,.013,material('#303334',.18,.50),1.51,.10,0);
  for(let i=0;i<5;i++) box(antenna,.011,.004,.55,.001,material('#404243',.15,.49),1.36+i*.075,.133,.02);
  squareChip(bridge,-.30,0,.39,8);
  tactileCap(boot,-.84,.37,.24);
  tactileCap(reset,-.84,-.36,.24);
  printedHardwareMarking(board,'BOOT',-.72,.067,.578,.016,white);
  printedHardwareMarking(board,'RESET',-.72,.067,-.578,.015,white);
  for(const z of [-.69,.69]) for(let i=0;i<15;i++){
    box(headers,.046,.090,.044,.003,silver,-1.23+i*.173,.103,z);
  }
  printedHardwareMarking(radio,'ESP32-H2',.92,.256,-.08,.020,material('#666769',.18,.46));
  box(board,.30,.17,.25,.017,dark,.13,.155,-.39);
  box(board,.25,.065,.22,.019,white,-.40,.11,-.46);
  for(const [x,z] of [[.36,.31],[.42,-.22],[-.45,.43],[-.20,-.40],[.44,-.49],[-.48,-.23]]) box(board,.111,.048,.080,.008,white,x,.094,z);
  return model;
}

function qtPyS3() {
  const model=new T.Group();
  const board=group(model,'board');
  const usb=group(model,'usb');
  const chip=group(model,'chip');
  const pads=group(model,'pads');
  const connector=group(model,'connector');
  const boot=group(model,'boot');
  const reset=group(model,'reset');
  const led=group(model,'led');
  const processor=group(model,'processor');
  const points=[-1,1].flatMap(side=>Array.from({length:7},(_,i)=>[-.64+i*.198,side*.53,.045]));
  controllerBoard(board,[[-.75,-.63],[.67,-.63],[.76,-.52],[.76,.51],[.65,.63],[-.75,.63],[-.80,.55],[-.80,-.55]],points,material('#833b90',.20,.49));
  for(const [x,z,r] of points) {
    platedHole(pads,x,z,r+.007);
    box(pads,.099,.047,.020,.005,boardGold,x,.037,Math.sign(z)*.623);
  }
  controllerUsb(usb,-.65,0,.56,'c');
  surfaceChip(chip,-.04,-.16,.23,.20,3);
  sideSocket(connector,.50,-.05,Math.PI/2,{finish:dark,width:.48,depth:.34,height:.22,pins:4});
  tactileCap(boot,-.25,.267,.217);
  tactileCap(reset,.08,.267,.217);
  box(led,.191,.081,.181,.013,white,.51,.108,.388);
  box(led,.11,.010,.099,.006,material('#e8a775',.07,.47),.51,.154,.388);
  for(const [x,z] of [[-.28,-.34],[.23,-.33],[.24,.11]]){
    box(board,.105,.068,.081,.010,white,x,.103,z);
    for(const side of [-1,1]) box(board,.022,.044,.084,.004,silver,x+side*.054,.099,z);
  }
  printedHardwareMarking(board,'QT PY',.20,.069,-.430,.016,white);
  const underside=new T.Group();
  underside.rotation.x=Math.PI;
  processor.add(underside);
  squareChip(underside,.05,0,.48,9);
  printedHardwareMarking(underside,'ESP32-S3',.05,.180,0,.014,material('#a8a6a4',.14,.53));
  return model;
}

function trinket85() {
  const model=new T.Group();
  const board=group(model,'board');
  const chip=group(model,'chip');
  const usb=group(model,'usb');
  const pads=group(model,'pads');
  const mounts=group(model,'mounts');
  const support=group(model,'support');
  const reset=group(model,'reset');
  const status=group(model,'status');
  const powerLed=group(model,'power-led');
  const mounting=[[.93,-.48,.136],[.93,.48,.136]];
  const points=[-1,1].flatMap(side=>Array.from({length:5},(_,i)=>[-.48+i*.236,side*.505,.061]));
  controllerBoard(board,[[-1.22,-.63],[1.06,-.63],[1.14,-.33],[1.28,-.24],[1.28,.31],[1.11,.45],[1.05,.63],[-1.22,.63]], [...points,...mounting,[-.715,-.505,.103],[-.715,.505,.103]],boardBlue);
  for(const [x,z,r] of points) platedHole(pads,x,z,r+.007);
  for(const [x,z,r] of mounting) platedHole(mounts,x,z,r+.010);
  controllerUsb(usb,-1.105,0,.58,'micro');
  squareChip(chip,.47,.025,.385,5);
  surfaceChip(support,-.09,.13,.25,.19,3);
  for(const [x,z] of [[-.52,-.23],[-.55,.08],[-.51,.25],[.18,-.33],[.52,-.33]]) box(support,.157,.050,.088,.008,white,x,.093,z);
  tactileCap(reset,.98,.025,.255);
  printedHardwareMarking(chip,'85',.47,.180,.02,.029,material('#8b8988',.20,.48));
  for(const [z,labels] of [[-.335,['USB','0','1','2','5V']],[.335,['BAT','GND','4','3','RST']]]){
    for(const [i,label] of labels.entries()) printedHardwareMarking(board,label,-.48+i*.236,.070,z,.014,white);
  }
  for(const [parent,z,tint] of [[status,-.47,'#ed9b98'],[powerLed,.47,'#9ccbb0']]) {
    box(parent,.177,.050,.082,.006,white,-.99,.091,z);
    box(parent,.082,.009,.056,.004,material(tint,.07,.44),-.99,.120,z);
    for(const x of [-1.067,-.913]) box(parent,.026,.043,.086,.004,silver,x,.089,z);
  }
  return model;
}

function featherM0() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), usb=group(model,'usb');
  const battery=group(model,'battery'), pads=group(model,'pads'), proto=group(model,'proto');
  const flash=group(model,'flash'), reset=group(model,'reset');
  const pixel=group(model,'pixel');
  const mounts=[-1,1].flatMap(x=>[-1,1].map(z=>[x*1.64,z*.56,.075]));
  const edge=[
    ...Array.from({length:16},(_,i)=>[-1.45+i*.179,.57,.037]),
    ...Array.from({length:12},(_,i)=>[-.71+i*.179,-.57,.037]),
  ];
  const field=Array.from({length:20},(_,i)=>[.85+(i%5)*.155,-.35+Math.floor(i/5)*.215,.033]);
  boardPlate(board,3.58,1.41,[...mounts,...edge,...field],material('#25282a',.18,.51));
  for(const point of mounts) platedHole(board,...point);
  for(const point of edge) platedHole(pads,...point);
  for(const point of field) platedHole(proto,...point);
  squareChip(cpu,-.25,.12,.56,12);
  surfaceChip(flash,.43,.22,.31,.25,4);
  controllerUsb(usb,-1.69,.27,.49,'micro');
  sideSocket(battery,-1.46,-.26,-Math.PI/2,{finish:material('#dbc187',.07,.45),width:.48,pins:2,height:.27,depth:.35});
  tactileCap(reset,-1.16,.31,.205);
  box(pixel,.20,.082,.19,.013,white,.55,.102,-.30);
  cylinder(pixel,.060,.012,material('#e8d0ad',.05,.45),.55,.148,-.30);
  printedHardwareMarking(board,'FEATHER M0',.44,.067,-.13,.016,white);
  printedHardwareMarking(board,'RST',-1.13,.067,.449,.014,white);
  for(const [x,z] of [[-.95,-.39],[-.82,.39],[-.55,-.26],[.14,.385],[.64,.356]]){
    box(board,.095,.049,.065,.007,material('#c7b58d',.07,.52),x,.094,z);
    for(const side of [-1,1]) box(board,.021,.039,.063,.003,silver,x+side*.048,.092,z);
  }
  for(const [x,z] of [[-.91,-.19],[-.75,.26],[-.68,-.25],[-1.04,-.37],[.21,-.34]]) box(board,.124,.048,.080,.009,silver,x,.092,z);
  return model;
}

function c3RustKit() {
  const model=new T.Group();
  const board=group(model,'board'), radio=group(model,'radio'), antenna=group(model,'antenna');
  const usb=group(model,'usb'), pads=group(model,'pads'), boot=group(model,'boot'), reset=group(model,'reset'), led=group(model,'led');
  const imu=group(model,'imu'), climate=group(model,'climate'), regulator=group(model,'regulator');
  const mounts=[-1,1].flatMap(x=>[-1,1].map(z=>[x*1.67,z*.57,.083]));
  const edge=[[-.57,16],[.57,13]].flatMap(([z,count])=>
    Array.from({length:count},(_,i)=>[-1.36+i*.170,z,.035]));
  boardPlate(board,3.60,1.40,[...mounts,...edge],material('#3a3c3f',.20,.49));
  for(const point of mounts) platedHole(board,...point);
  for(const point of edge) platedHole(pads,...point);
  controllerUsb(usb,-1.72,0,.56,'c');
  box(radio,.78,.067,.79,.014,material('#25382e',.17,.48),1.03,.104,0);
  box(radio,.74,.137,.73,.017,silver,1.03,.20,0);
  box(antenna,.35,.065,.79,.012,dark,1.56,.103,0);
  for(let i=0;i<4;i++) box(antenna,.012,.004,.57,.002,material('#44484b',.14,.54),1.43+i*.068,.138,.026);
  tactileCap(reset,-.27,-.34,.235);
  tactileCap(boot,-.27,.34,.235);
  box(led,.20,.088,.20,.016,white,-.26,.113,0);
  box(led,.10,.009,.10,.005,material('#e5b69d',.07,.47),-.26,.162,0);
  squareChip(imu,.39,.22,.21,4);
  box(climate,.13,.060,.11,.009,dark,.10,.098,.31);
  cylinder(climate,.020,.008,silver,.10,.132,.31);
  box(regulator,.23,.133,.23,.023,dark,-.73,.139,-.24);
  const shieldRim=material('#a7adae',.70,.39);
  for(const z of [-.344,.344]) box(radio,.721,.014,.024,.004,shieldRim,1.03,.268,z);
  printedHardwareMarking(board,'RST',-.34,.069,-.473,.015,white);
  printedHardwareMarking(board,'BOOT',-.34,.069,.474,.015,white);
  printedHardwareMarking(radio,'ESP32-C3',1.03,.270,-.055,.023,material('#666769',.12,.53));
  for(const [x,z] of [[-.88,.31],[-.71,-.29],[.36,-.27],[.27,.34],[.56,-.40],[-1.14,.22]]) box(board,.106,.054,.075,.008,silver,x,.094,z);
  return model;
}

function kalam8051() {
  const model=new T.Group();
  const board=group(model,'board'), processor=group(model,'processor'), pads=group(model,'pads');
  const barrel=group(model,'barrel'), usb=group(model,'usb'), reset=group(model,'reset'), supply=group(model,'supply');
  const programmer=group(model,'programmer'), isp=group(model,'isp'), uart=group(model,'uart');
  const mounts=[[-1.54,-1.18,.076],[1.07,-1.18,.076],[-1.54,.47,.076],[1.07,1.18,.076]];
  boardPlate(board,3.35,2.64,mounts,material('#049374',.23,.48));
  for(const point of mounts) platedHole(board,...point);
  box(processor,2.55,.147,.79,.024,dark,-.41,.152,-.36);
  const mold=new T.Shape().moveTo(-1.27,-.392).lineTo(1.27,-.392).lineTo(1.27,.392)
    .lineTo(-1.27,.392).lineTo(-1.27,.126).quadraticCurveTo(-1.08,0,-1.27,-.126).closePath();
  make(processor,new T.ExtrudeGeometry(mold,{depth:.068,bevelSize:.007,bevelThickness:.007,bevelSegments:2}),
    material('#252629',.10,.61),-.41,.228,-.36).rotation.x=-Math.PI/2;
  for(let i=0;i<20;i++) for(const side of [-1,1]) {
    const x=-1.61+i*.126;
    wire(processor,[[x,.18,-.36+side*.390],[x,.157,-.36+side*.427],[x,.084,-.36+side*.461]],.025,bright);
  }
  for(const z of [-1.28,1.28]) for(let i=0;i<18;i++) {
    const x=-1.38+i*.127;
    box(pads,.108,.083,.112,.008,dark,x,.106,z);
    box(pads,.034,.106,.035,.004,boardGold,x,.178,z);
  }
  box(barrel,.62,.37,.41,.029,dark,1.50,.249,-.95);
  cylinder(barrel,.14,.030,dark,1.819,.259,-.95).rotation.z=Math.PI/2;
  cylinder(barrel,.041,.049,silver,1.842,.259,-.95).rotation.z=Math.PI/2;
  const usbMount=new T.Group();
  usbMount.rotation.y=Math.PI;
  usb.add(usbMount);
  controllerUsb(usbMount,-1.61,-.57,.49,'c');
  tactileCap(reset,1.39,1.06,.276);
  for(const [z,r] of [[-.51,.153],[-.24,.116]]) {
    cylinder(supply,r,.225,silver,1.42,.179,z);
    cylinder(supply,r*.91,.012,bright,1.42,.300,z);
  }
  squareChip(programmer,.61,.49,.36,8);
  maleHeader(isp,-.43,.42,3,{rows:2,alongZ:true,pitch:.105});
  maleHeader(uart,-.15,.49,2,{alongZ:true,pitch:.12});
  maleHeader(supply,-1.26,.38,4,{alongZ:true,pitch:.119});
  printedHardwareMarking(processor,'AT89S52',-.41,.301,-.36,.049,material('#858484',.15,.50));
  printedHardwareMarking(board,'KALAM',-1.04,.067,.63,.025,white);
  for(const [x,z] of [[1.15,.12],[.87,.51],[.66,.85],[-.16,.68]]) box(board,.145,.063,.091,.010,white,x,.102,z);
  return model;
}

function maleHeader(parent,x,z,count,{rows=1,pitch=.12,alongZ=false}={}) {
  for(let row=0;row<rows;row++) for(let index=0;index<count;index++) {
    const first=index*pitch, second=row*pitch;
    const u=x+(alongZ?second:first), v=z+(alongZ?first:second);
    box(parent,pitch*.99,.12,pitch*.99,.007,dark,u,.12,v);
    box(parent,.031,.235,.031,.004,boardGold,u,.265,v);
  }
}

function metalPort(parent,x,z,width,depth,height) {
  const y=.071+height/2;
  for(const side of [-1,1]) box(parent,.035,height,depth,.008,silver,x+side*width/2,y,z);
  box(parent,width,.040,depth,.01,bright,x,y+height/2,z);
  box(parent,width,.043,depth,.01,silver,x,.081,z);
  box(parent,width-.07,height-.070,.025,.007,dark,x,y,z-depth*.32);
  for(let i=0;i<8;i++) box(parent,.027,.013,.10,.004,boardGold,x+(i-3.5)*width*.10,.115,z+depth*.21);
}

function nucleo64() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), debug=group(model,'debug');
  const arduino=group(model,'arduino'), morpho=group(model,'morpho');
  const user=group(model,'user'), reset=group(model,'reset');
  const usb=group(model,'usb'), swd=group(model,'swd');
  const mounts=[[-.95,-1.56,.061],[.95,-1.56,.061],[-.96,1.55,.07],[.96,1.55,.07]];
  boardPlate(board,2.23,3.40,mounts,material('#e5e6e1',.08,.48));
  box(board,2.20,.007,.018,.002,material('#9a9c99',.08,.61),0,.071,-.67);
  squareChip(cpu,.02,.49,.59,12);
  box(cpu,.31,.085,.15,.016,silver,-.08,.108,1.04);
  squareChip(debug,.10,-1.12,.36,8);
  metalPort(usb,.60,-1.62,.43,.36,.16);
  maleHeader(debug,-.91,-1.48,2,{rows:2,alongZ:true,pitch:.105});
  maleHeader(swd,-.91,-1.13,6,{alongZ:true,pitch:.087});
  for(const [x,z,count] of [[-.72,-.43,8],[.66,-.43,10],[-.72,.83,6],[.66,.68,8]]) {
    const row=new T.Group();
    row.position.set(x,0,z);
    row.rotation.y=-Math.PI/2;
    arduino.add(row);
    femaleHeader(row,0,0,count,.105);
  }
  for(const x of [-1.035,.94]) maleHeader(morpho,x,-.57,19,{rows:2,alongZ:true,pitch:.115});
  tactileCap(user,-.31,-.39,.249);
  cylinder(user,.084,.042,material('#154ccc',.10,.42),-.31,.235,-.39);
  tactileCap(reset,.33,-.37,.239);
  for(const [x,z] of [[-.47,.85],[.37,.84],[.42,.26],[-.30,.21],[-.44,-1.18],[.64,-1.12],[.49,-1.39]]) box(board,.095,.045,.068,.008,silver,x,.092,z);
  const print=material('#285192',.13,.49);
  printedHardwareMarking(board,'NUCLEO',0,.068,1.43,.035,print);
  printedHardwareMarking(board,'ST LINK',.24,.069,-.825,.018,print);
  printedHardwareMarking(board,'USER',-.38,.069,-.17,.016,print);
  printedHardwareMarking(board,'RESET',.35,.069,-.16,.016,print);
  for(const x of [-.91,.90]) for(let i=0;i<16;i++){
    box(board,.038,.005,.031,.001,print,x,.068,-.52+i*.115);
  }
  return model;
}

function rt1060Kit() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), ethernet=group(model,'ethernet');
  const headers=group(model,'headers'), usb=group(model,'usb'), storage=group(model,'storage'), power=group(model,'power');
  const debug=group(model,'debug');
  const memory=group(model,'memory');
  const mounts=fourCornerMounts(4.12,2.76,.081);
  boardPlate(board,4.12,2.76,mounts,material('#12633d',.18,.49));
  for(const point of mounts) platedHole(board,...point);
  box(cpu,.48,.113,.48,.016,dark,-.38,.144,.13);
  box(memory,.33,.088,.31,.015,dark,-1.12,.115,.06);
  squareChip(debug,1.46,-.61,.31,6);
  for(const [x,z,count] of [[-1.99,-.88,15],[-1.82,.50,11]]) femaleHeader(headers,x,z,count);
  box(headers,.93,.21,.30,.013,dark,-1.15,.176,-1.23);
  maleHeader(headers,-1.50,-1.25,10,{rows:2,pitch:.101});
  for(const x of [.71,1.18]) maleHeader(headers,x,-1.24,3,{rows:2,pitch:.10});
  metalPort(ethernet,.94,1.16,.48,.68,.40);
  for(const x of [.24,.51]) metalPort(usb,x,1.32,.22,.28,.12);
  const side=new T.Group();side.position.set(2.02,0,-.64);side.rotation.y=Math.PI/2;usb.add(side);
  metalPort(side,0,0,.22,.26,.13);
  box(storage,.41,.049,.38,.012,silver,-1.62,.121,-.10);
  box(storage,.43,.033,.33,.011,bright,-1.62,.158,-.10);
  box(power,.43,.29,.30,.023,dark,-1.97,.213,1.19);
  cylinder(power,.079,.030,bright,-2.20,.214,1.19).rotation.z=Math.PI/2;
  for(const [x,z] of [[-.80,-.62],[-1.18,1.21],[-.68,1.21],[1.60,-1.26]]) tactileCap(board,x,z,.151);
  for(const [x,z,w] of [[-.23,-.72,.20],[.26,-.78,.27],[.11,.12,.21],[.93,-.17,.20],[1.44,.37,.25],[-.78,.35,.27],[-.61,.65,.22],[.08,.76,.23],[1.72,1.0,.22],[-1.40,.91,.18]]) surfaceChip(board,x,z,w,w*.82,4);
  printedHardwareMarking(board,'MIMXRT1060',.51,.067,-.19,.021,white);
  const traceMask=material('#268355',.12,.57);
  for(let i=0;i<9;i++){
    const z=-.080+i*.061;
    wire(board,[[-.65,.065,z],[-.83,.065,z],[-.94,.065,z+.11],[-1.26,.065,z+.11]],.0045,traceMask);
    wire(board,[[-.13,.065,z],[.14,.065,z],[.28,.065,z+.14],[.55,.065,z+.14]],.0045,traceMask);
  }
  for(const [x,z] of [[-.50,-.86],[-.44,-.86],[-.18,.43],[.44,.46],[1.65,-.26],[1.68,-.17],[-1.19,.42],[-1.31,.52]]){
    box(board,.073,.042,.048,.006,material('#c6b68c',.12,.56),x,.086,z);
  }
  return model;
}

function c2000LaunchPad() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), headers=group(model,'headers');
  const debug=group(model,'debug'), clocks=group(model,'clocks'), jumpers=group(model,'jumpers');
  const usb=group(model,'usb'), reset=group(model,'reset'), boot=group(model,'boot');
  const mounts=fourCornerMounts(4.30,1.87,.066);
  boardPlate(board,4.30,1.87,mounts,material('#842730',.18,.51));
  for(const point of mounts) platedHole(board,...point);
  box(cpu,.67,.092,.65,.017,dark,-.37,.129,.19);
  for(const [x,z] of [[-1.95,-.78],[-1.95,.64],[.21,-.78],[.21,.64]]) maleHeader(headers,x,z,10,{rows:2,pitch:.106});
  metalPort(usb,1.96,-.78,.27,.30,.13);
  surfaceChip(debug,1.41,-.36,.31,.40,8);
  surfaceChip(debug,1.55,.02,.34,.36,8);
  for(const [x,z] of [[-.85,.38],[1.89,.19]]) box(clocks,.12,.062,.27,.022,silver,x,.104,z);
  for(const [x,z] of [[-1.04,-.71],[1.28,.57],[1.11,-.71]]) {
    maleHeader(jumpers,x,z,2,{rows:2,pitch:.10});
    box(jumpers,.14,.10,.16,.014,dark,x+.05,.32,z+.05);
  }
  for(const [x,z,w] of [[-1.60,-.21,.19],[-1.37,.31,.25],[.49,-.37,.22],[1.07,.27,.23],[1.65,.59,.28]]) surfaceChip(board,x,z,w,w,5);
  box(boot,.28,.108,.23,.016,material('#bc8a40',.29,.47),.65,.132,-.20);
  for(let i=0;i<3;i++) box(boot,.035,.035,.077,.005,white,.58+i*.071,.199,-.21);
  tactileCap(reset,.04,.63,.19);
  cylinder(reset,.052,.036,material('#e4ad46',.10,.44),.04,.225,.63);
  printedHardwareMarking(board,'C2000',-.38,.067,-.385,.027,white);
  printedHardwareMarking(board,'RESET',.04,.067,.772,.014,white);
  for(const [x,z] of [[-.97,-.285],[-.86,-.285],[-.70,-.285],[.23,.31],[.38,.35],[1.09,-.37],[1.25,.31]]){
    box(board,.062,.035,.044,.006,material('#b6a087',.10,.55),x,.084,z);
    for(const side of [-1,1]) box(board,.013,.033,.044,.003,silver,x+side*.031,.083,z);
  }
  printedHardwareMarking(cpu,'F28379D',-.37,.177,.18,.023,material('#777578',.11,.53));
  return model;
}

function msp430LaunchPad() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), debug=group(model,'debug');
  const headers=group(model,'headers'), isolation=group(model,'isolation'), controls=group(model,'controls');
  const usb=group(model,'usb'), capacitor=group(model,'capacitor');
  const mounts=fourCornerMounts(3.20,2.40,.075);
  boardPlate(board,3.20,2.40,mounts,material('#b52e34',.18,.50));
  for(const point of mounts) platedHole(board,...point);
  squareChip(cpu,-.43,.03,.36,6);
  for(const z of [-.99,.98]) maleHeader(headers,-1.35,z,11,{pitch:.15});
  for(const z of [-.83,.59]) maleHeader(headers,-1.40,z,2,{rows:2,pitch:.104});
  const debugRow=new T.Group();
  debugRow.position.set(.57,0,-.77);
  debugRow.rotation.y=-Math.PI/2;
  isolation.add(debugRow);
  femaleHeader(debugRow,0,0,8);
  femaleHeader(debugRow,0,.153,8);
  squareChip(debug,1.06,-.15,.48,10);
  const usbMount=new T.Group();
  usbMount.position.set(1.50,-.012,-.83);
  usbMount.rotation.y=Math.PI;
  usb.add(usbMount);
  controllerUsb(usbMount,0,0,.43,'micro');
  make(capacitor,new T.TorusGeometry(.36,.009,8,48),white,-1.00,.073,.14).rotation.x=Math.PI/2;
  for(const z of [-.13,.41]) {
    cylinder(capacitor,.044,.012,boardGold,-1.0,.070,z);
  }
  surfaceChip(debug,1.18,.35,.27,.24,4);
  for(const [x,z] of [[-.31,.91],[1.36,.69],[-.36,-1.01]]) tactileCap(controls,x,z,.16);
  for(const [x,z] of [[-.53,.32],[-.69,-.30],[1.24,.56],[1.27,-.55],[.86,.55]]) box(board,.121,.051,.084,.009,white,x,.094,z);
  printedHardwareMarking(board,'MSP430',-.43,.068,.49,.020,white);
  const traceMask=material('#ce5151',.13,.57);
  for(let i=0;i<7;i++){
    const x=-1.24+i*.116;
    for(const side of [-1,1]) wire(board,[[x,.066,side*.896],[x,.066,side*.669],
      [x+.20,.066,side*.469],[x+.20,.066,side*.295]],.005,traceMask);
  }
  for(const [x,z] of [[.89,-.65],[1.18,-.65],[.90,.24],[1.18,.56]]){
    box(board,.071,.034,.046,.004,material('#c9b5a1',.12,.55),x,.087,z);
  }
  return model;
}

function nordicDk() {
  const model=new T.Group();
  const board=group(model,'board'), radio=group(model,'radio'), debug=group(model,'debug');
  const usb=group(model,'usb'), headers=group(model,'headers'), buttons=group(model,'buttons'), antenna=group(model,'antenna');
  const nativeUsb=group(model,'native-usb'), nfc=group(model,'nfc');
  const outline=[[-2.18,-1.03],[2.09,-1.03],[2.09,-.60],[2.18,-.48],[2.18,1.02],[-2.18,1.02]];
  const mounts=[[-1.87,-.89,.063],[-1.89,.84,.065],[.76,-.89,.062],[.76,.84,.062]];
  controllerBoard(board,outline,mounts,material('#155274',.20,.50));
  for(const point of mounts) platedHole(board,...point);
  box(debug,.53,.105,.53,.023,silver,-.84,.14,.25);
  box(debug,.471,.009,.471,.017,material('#d4d6d3',.27,.57),-.84,.195,.25);
  for(const z of [-.036,.536]) for(let i=0;i<10;i++){
    box(debug,.019,.022,.073,.003,bright,-1.05+i*.046,.077,z);
  }
  squareChip(radio,.59,.05,.28,6);
  squareChip(board,-.18,.016,.29,6);
  for(const z of [-.91,.89]) for(const [x,count] of [[-1.63,8],[-.48,8],[.67,5]]) femaleHeader(headers,x,z,count);
  maleHeader(headers,.91,-.58,6,{rows:2,pitch:.10,alongZ:true});
  for(const [x,z] of [[1.35,.65],[1.69,.65],[1.35,.93],[1.69,.93]]) tactileCap(buttons,x,z,.207);
  controllerUsb(usb,-2.12,.03,.37,'micro');
  const nativeMount=new T.Group();
  nativeMount.position.set(.53,0,.98);
  nativeMount.rotation.y=Math.PI/2;
  nativeUsb.add(nativeMount);
  controllerUsb(nativeMount,0,0,.29,'micro');
  sideSocket(nfc,1.97,.63,Math.PI/2,{width:.22,depth:.17,height:.12,pins:2});
  printedHardwareMarking(board,'NRF52840',1.37,.067,.14,.018,white);
  printedHardwareMarking(board,'DEBUG',-1.61,.067,.258,.014,white);
  printedHardwareMarking(board,'NFC',1.972,.067,.435,.012,white);
  box(antenna,.55,.013,.43,.006,material('#1d6688',.17,.51),1.63,.074,-.35);
  for(let i=0;i<5;i++) box(antenna,.016,.005,.33,.001,boardGold,1.43+i*.099,.084,-.35+(i%2)*.034);
  for(const [x,z] of [[-1.73,-.48],[-1.22,.52],[.40,-.32],[.29,.52],[1.63,.17],[.11,.70],[-1.69,.61]]) surfaceChip(board,x,z,.15,.12,3);
  return model;
}

function s32k144Evb() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), debug=group(model,'debug');
  const headers=group(model,'headers'), touch=group(model,'touch'), controls=group(model,'controls'), pot=group(model,'pot');
  const bus=group(model,'bus'), power=group(model,'power');
  const outline=[[-2.20,-.78],[-2.02,-.99],[2.02,-.99],[2.20,-.79],[2.20,.79],[2.01,.99],[-2.02,.99],[-2.20,.79]];
  const mounts=[[-1.69,-.83,.065],[1.19,-.83,.065],[-1.88,.83,.065],[1.39,.83,.065]];
  controllerBoard(board,outline,mounts,material('#c18a2f',.32,.48));
  for(const point of mounts) platedHole(board,...point);
  squareChip(cpu,.46,.013,.55,16);
  squareChip(debug,-1.32,-.39,.28,7);
  controllerUsb(debug,-2.14,-.54,.39,'micro');
  for(const z of [-.87,.87]) for(const [x,count] of [[-1.63,7],[-.60,6],[.28,7]]) femaleHeader(headers,x,z,count);
  for(const z of [-.24,.31]){
    box(touch,.545,.009,.500,.006,material('#9b6c29',.32,.55),1.55,.069,z);
    box(touch,.512,.009,.467,.005,material('#dfb65d',.59,.47),1.55,.077,z);
  }
  printedHardwareMarking(board,'S32K144',.64,.068,-.62,.022,white);
  printedHardwareMarking(board,'NXP',-.23,.068,.529,.028,white);
  for(const z of [-.19,.17]) tactileCap(controls,2.05,z,.148);
  tactileCap(controls,-1.88,-.80,.125);
  cylinder(pot,.154,.20,dark,2.06,.167,-.57);
  for(let i=0;i<12;i++) {
    const angle=i*Math.PI/6;
    cylinder(pot,.013,.14,dark,2.06+.152*Math.cos(angle),.18,-.57+.152*Math.sin(angle));
  }
  box(pot,.145,.009,.024,.004,silver,2.06,.271,-.57);
  for(const z of [-.26,.15]) maleHeader(bus,-2.12,z,3,{alongZ:true,pitch:.093});
  portAtEdge(power,-1.65,.91,.29,.33,.21,0);
  printedHardwareMarking(cpu,'S32K144',.46,.180,.01,.021,material('#8b8886',.15,.47));
  for(const [x,z] of [[-.83,.26],[-.62,-.23],[-.99,.54],[.93,-.52],[1.06,.42],[-1.67,.20]]) surfaceChip(board,x,z,.20,.15,4);
  return model;
}

function portAtEdge(parent,x,z,width,depth,height,direction) {
  const local=new T.Group();
  local.position.set(x,0,z);
  local.rotation.y=direction;
  parent.add(local);
  metalPort(local,0,0,width,depth,height);
}

function pi5() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), memory=group(model,'memory');
  const gpio=group(model,'gpio'), ethernet=group(model,'ethernet'), usb2=group(model,'usb2'), usb3=group(model,'usb3');
  const power=group(model,'power'), hdmi=group(model,'hdmi'), ribbon=group(model,'ribbon');
  const io=group(model,'io'), pcie=group(model,'pcie'), sd=group(model,'sd');
  const mounting=fourCornerMounts(3.41,2.24,.082);
  boardPlate(board,3.41,2.24,mounting,material('#049678',.18,.47));
  for(const point of mounting) platedHole(board,...point);
  box(cpu,.71,.098,.69,.020,dark,-.39,.123,.22);
  box(cpu,.64,.057,.61,.018,bright,-.39,.197,.22);
  box(memory,.65,.087,.43,.014,dark,-.46,.121,-.48);
  maleHeader(gpio,-1.41,-.97,20,{rows:2,pitch:.126});
  portAtEdge(ethernet,1.34,.75,.61,.65,.57,-Math.PI/2);
  for(let i=0;i<8;i++){
    const z=.75+(i-3.5)*.047;
    box(ethernet,.123,.012,.018,.003,boardGold,1.601,.365,z).rotation.z=-.14;
  }
  for(const z of [.512,.988]) box(ethernet,.104,.053,.057,.008,silver,1.667,.153,z);
  for(const [z,usb,color] of [[-.69,usb2,'#171a20'],[-.02,usb3,'#11549d']]) {
    portAtEdge(usb,1.34,z,.49,.67,.50,-Math.PI/2);
    for(const y of [.23,.43]) box(usb,.019,.052,.32,.006,material(color,.08,.51),1.672,y,z);
  }
  const powerLocal=new T.Group();
  powerLocal.position.set(-1.25,0,1.08);
  powerLocal.rotation.y=Math.PI/2;
  power.add(powerLocal);
  controllerUsb(powerLocal,0,0,.37,'c');
  for(const x of [-.72,-.20]) portAtEdge(hdmi,x,1.075,.30,.24,.14,Math.PI);
  for(const x of [.48,.82]) sideSocket(ribbon,x,.56,Math.PI/2,{width:.53,depth:.14,height:.10,pins:22});
  sideSocket(pcie,-1.57,.30,Math.PI/2,{width:.51,depth:.15,height:.10,pins:16});
  const underside=new T.Group();
  underside.position.set(-1.53,0,.15);
  underside.rotation.x=Math.PI;
  sd.add(underside);
  box(underside,.40,.066,.51,.012,silver,0,.035,0);
  box(underside,.024,.040,.37,.004,dark,-.197,.035,0);
  box(io,.49,.090,.47,.015,dark,.55,.111,-.34);
  printedHardwareMarking(io,'RP1',.55,.157,-.34,.025,material('#a1a29b',.14,.49));
  box(board,.40,.073,.39,.015,silver,-1.39,.103,-.35);
  printedHardwareMarking(board,'HDMI',-.46,.067,.872,.017,white);
  printedHardwareMarking(board,'PCIE',-1.29,.067,.35,.016,white);
  for(const [x,z] of [[-.84,.73],[-.87,.61],[.83,-.52],[.61,.09],[-.98,-.47]]) box(board,.097,.043,.072,.007,white,x,.089,z);
  return model;
}

function beagleboneBlack() {
  const model=new T.Group();
  const board=group(model,'board'), cpu=group(model,'cpu'), memory=group(model,'memory'), headers=group(model,'headers');
  const ethernet=group(model,'ethernet'), usb=group(model,'usb'), power=group(model,'power'), display=group(model,'display');
  const storage=group(model,'storage'), usbDevice=group(model,'usb-device'), card=group(model,'card');
  const outline=[[-1.80,-.65],[-1.57,-.94],[1.56,-.94],[1.80,-.68],[1.80,.68],[1.57,.94],[-1.56,.94],[-1.80,.68]];
  const mounting=[[-1.54,-.69,.073],[-1.54,.69,.073],[1.55,-.69,.073],[1.55,.69,.073]];
  controllerBoard(board,outline,mounting,material('#22252a',.16,.52));
  for(const point of mounting) platedHole(board,...point);
  for(const z of [-.81,.81]) {
    femaleHeader(headers,-1.43,z,23);
    femaleHeader(headers,-1.43,z-Math.sign(z)*.128,23);
  }
  box(cpu,.63,.096,.56,.016,dark,-.10,.126,-.02);
  for(const [x,z,w,d] of [[-.78,.20,.46,.53]]) box(memory,w,.086,d,.014,dark,x,.116,z);
  box(storage,.55,.086,.36,.014,dark,.61,.116,.32);
  portAtEdge(usbDevice,1.62,-.02,.29,.28,.15,-Math.PI/2);
  box(card,.44,.076,.58,.012,silver,-1.54,-.045,.02);
  box(card,.021,.040,.44,.004,dark,-1.77,-.052,.02);
  printedHardwareMarking(cpu,'AM3358',-.10,.175,-.02,.024,material('#77777a',.15,.49));
  portAtEdge(ethernet,1.38,.43,.53,.60,.55,-Math.PI/2);
  for(let i=0;i<8;i++) box(ethernet,.092,.012,.016,.003,boardGold,1.631,.381,.43+(i-3.5)*.043);
  printedHardwareMarking(board,'P8',-.995,.068,-.56,.018,white);
  printedHardwareMarking(board,'P9',-.995,.068,.54,.018,white);
  portAtEdge(usb,-1.55,-.47,.47,.53,.29,Math.PI/2);
  box(power,.42,.30,.39,.028,dark,1.55,.221,-.41);
  cylinder(power,.105,.024,silver,1.766,.224,-.41).rotation.z=Math.PI/2;
  cylinder(power,.074,.026,dark,1.778,.224,-.41).rotation.z=Math.PI/2;
  portAtEdge(display,-1.61,.47,.29,.22,.135,Math.PI/2);
  cylinder(board,.102,.14,silver,-.93,.138,-.38);
  for(const [x,z] of [[1.19,.65],[1.19,-.68],[-1.14,.45]]) tactileCap(board,x,z,.13);
  for(const [x,z,w] of [[.54,-.35,.30],[.96,-.04,.20],[-.39,.47,.27],[-.83,-.15,.20]]) surfaceChip(board,x,z,w,w*.75,4);
  return model;
}

function lattePandaDelta() {
  const model=new T.Group();
  const board=group(model,'board'), cooling=group(model,'cooling'), fan=group(model,'fan');
  const usb=group(model,'usb'), hdmi=group(model,'hdmi'), network=group(model,'network'), typeC=group(model,'type-c'), audio=group(model,'audio'), headers=group(model,'headers');
  const cable=group(model,'cable');
  const mounting=fourCornerMounts(3.82,2.39,.091);
  boardPlate(board,3.82,2.39,mounting,material('#24262a',.17,.53));
  for(const point of mounting) platedHole(board,...point);
  const shroud=new T.Shape().moveTo(-1.30,-.44).lineTo(-1.10,-.76).lineTo(.44,-.83)
    .quadraticCurveTo(1.22,-.82,1.25,-.05).quadraticCurveTo(1.27,.74,.52,.80)
    .lineTo(-.93,.71).lineTo(-1.27,.52).closePath();
  const intake=new T.Path();intake.absarc(.49,.01,.47,0,Math.PI*2,true);shroud.holes.push(intake);
  make(cooling,new T.ExtrudeGeometry(shroud,{depth:.13,bevelEnabled:true,bevelThickness:.019,bevelSize:.016,bevelSegments:2,curveSegments:32}),dark,0,.32,0).rotation.x=-Math.PI/2;
  for(let i=0;i<18;i++) box(cooling,.35,.25,.025,.003,dark,-1.11,.206,(i-8.5)*.051);
  cylinder(fan,.251,.068,dark,.49,.334,-.01);
  const blade=new T.Shape().moveTo(.238,-.024).quadraticCurveTo(.35,-.019,.455,.045)
    .lineTo(.451,.082).quadraticCurveTo(.32,.028,.239,.016).closePath();
  const bladeGeometry=new T.ExtrudeGeometry(blade,{depth:.040,bevelSize:.004,bevelThickness:.004,bevelSegments:2});
  const bladeFinish=material('#373b42',.14,.49);
  for(let i=0;i<19;i++){
    make(fan,bladeGeometry,bladeFinish,.49,.301,-.01).rotation.set(-Math.PI/2,0,i*Math.PI*2/19,'YXZ');
  }
  make(cooling,new T.TorusGeometry(.483,.013,9,72),material('#373a3d',.17,.57),.49,.457,-.01).rotation.x=Math.PI/2;
  for(const z of [-.72,0,.72]) {
    portAtEdge(usb,-1.67,z,.44,.45,.26,Math.PI/2);
    box(usb,.018,.050,.29,.006,material('#1454a2',.08,.50),-1.90,.187,z);
  }
  portAtEdge(hdmi,1.72,-.80,.46,.34,.24,-Math.PI/2);
  portAtEdge(network,1.72,-.25,.48,.34,.35,-Math.PI/2);
  portAtEdge(typeC,1.72,.27,.26,.34,.17,-Math.PI/2);
  box(audio,.24,.18,.23,.014,dark,1.72,.15,.75);
  cylinder(audio,.062,.021,silver,1.846,.153,.75).rotation.z=Math.PI/2;
  for(const [i,color] of ['#efc952','#b85232','#23252c'].entries()) {
    wire(cable,[[1.09,.27,-.52+i*.027],[1.28,.26,-.68+i*.027],[1.56,.21,-.69+i*.027],[1.55,.12,-.48+i*.027]],.010,material(color,.08,.44));
  }
  box(cable,.16,.07,.12,.007,white,1.55,.108,-.45);
  for(const z of [-1.02,1.02]) {
    femaleHeader(headers,-1.07,z,19);
    femaleHeader(headers,-1.07,z-Math.sign(z)*.128,19);
  }
  for(const [color,z] of [[material('#eab22c',.12,.43),-.74],[material('#c82930',.11,.44),-.69]]) wire(fan,[[.94,.30,z],[1.17,.23,z],[1.42,.17,z-.11]],.013,color);
  return model;
}

function computeModuleFour() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), cpu=group(model,'cpu'), memory=group(model,'memory');
  const storage=group(model,'storage'), radio=group(model,'radio'), connectors=group(model,'connectors');
  const antenna=group(model,'antenna');
  const mounts=fourCornerMounts(2.77,2.06,.111);
  boardPlate(pcb,2.77,2.06,mounts,material('#14956f',.19,.50));
  for(const [x,z,r] of mounts) make(pcb,new T.TorusGeometry(r,.039,10,40),boardGold,x,.071,z).rotation.x=Math.PI/2;
  box(cpu,.77,.116,.75,.023,dark,.22,.132,.21);
  box(cpu,.71,.064,.68,.025,silver,.22,.211,.21);
  box(memory,.59,.113,.65,.019,dark,.95,.128,.19);
  box(storage,.64,.105,.56,.017,dark,-.34,.124,-.52);
  box(radio,.60,.069,.57,.016,material('#244537',.22,.50),-.87,.110,-.01);
  box(radio,.55,.098,.51,.017,silver,-.87,.169,-.01);
  box(antenna,.11,.009,.44,.002,material('#206452',.10,.48),-1.24,.072,-.11);
  cylinder(antenna,.064,.041,boardGold,-1.20,.109,.35);
  cylinder(antenna,.024,.012,dark,-1.20,.135,.35);
  printedHardwareMarking(pcb,'COMPUTE MODULE 4',.19,.070,.77,.015,white);
  for(const x of [-.36,.71]) for(let i=0;i<4;i++){
    box(pcb,.028,.012,.037,.002,boardGold,x+i*.051,.073,.58);
  }
  squareChip(pcb,.50,-.62,.33,7);
  surfaceChip(pcb,-.91,.62,.26,.22,4);
  for(const [x,z] of [[-.61,.58],[-1.11,.52],[.93,-.64],[1.07,.58],[.70,-.60]]) box(pcb,.10,.051,.080,.009,white,x,.096,z);
  for(const z of [-.47,.47]) {
    box(connectors,1.99,.103,.22,.014,dark,0,-.064,z);
    for(let i=0;i<50;i++) for(const side of [-1,1]) box(connectors,.016,.020,.049,.003,boardGold,(i-24.5)*.037,-.125,z+side*.054);
  }
  return model;
}

function imxPlusKit() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), module=group(model,'module'), cpu=group(model,'cpu');
  const cameras=group(model,'cameras'), ethernet=group(model,'ethernet'), usb=group(model,'usb');
  const industrial=group(model,'industrial'), expansion=group(model,'expansion');
  const dsi=group(model,'dsi'), lvds=group(model,'lvds'), hdmi=group(model,'hdmi'), power=group(model,'power'), console=group(model,'console');
  const mounts=fourCornerMounts(4.36,2.99,.068);
  boardPlate(pcb,4.36,2.99,mounts,material('#256e4a',.18,.48));
  for(const point of mounts) platedHole(pcb,...point);
  box(module,1.14,.097,1.13,.017,material('#155d48',.17,.49),-.41,.152,-.12);
  for(const a of [-1,1]) for(const b of [-1,1]) cylinder(module,.047,.041,boardGold,-.41+a*.52,.211,-.12+b*.51);
  for(const x of [-.82,-.05]) box(module,.24,.079,.24,.014,dark,x,.235,-.11);
  box(cpu,.39,.076,.37,.018,material('#31574b',.23,.44),-.44,.239,-.13);
  box(cpu,.21,.019,.20,.005,material('#606e87',.48,.31),-.44,.285,-.13);
  for(let i=0;i<5;i++) {
    const x=-1.49+i*.49;
    const port=[dsi,cameras,cameras,lvds,lvds][i];
    portAtEdge(port,x,-1.40,.31,.34,.26,0);
    box(port,.23,.046,.12,.009,dark,x,.31,-1.38);
  }
  for(const x of [-.49,-.10]) portAtEdge(ethernet,x,1.36,.30,.46,.32,Math.PI);
  portAtEdge(console,-1.98,1.43,.20,.24,.12,Math.PI);
  portAtEdge(power,-1.68,1.43,.22,.24,.15,Math.PI);
  for(const [x,width] of [[-1.38,.22],[-1.03,.29]]) portAtEdge(usb,x,1.43,width,.24,.16,Math.PI);
  portAtEdge(hdmi,.87,-1.43,.30,.25,.15,0);
  for(const x of [.49,1.30]) {
    portAtEdge(industrial,x,1.37,.65,.38,.28,Math.PI);
    box(industrial,.46,.12,.039,.007,dark,x,.18,1.56);
    for(let i=0;i<5;i++) box(industrial,.032,.027,.020,.004,boardGold,x+(i-2)*.063,.196,1.59);
  }
  maleHeader(expansion,1.73,-.58,16,{rows:2,alongZ:true,pitch:.091});
  for(const [x,z,w] of [[1.08,-.72,.24],[1.27,.24,.22],[-1.94,.98,.29],[.47,.97,.21],[-1.24,.96,.20],[.91,.57,.22],[-1.30,-.84,.16]]) surfaceChip(pcb,x,z,w,w*.82,4);
  printedHardwareMarking(pcb,'IMX8M PLUS',.82,.070,.83,.018,white);
  for(let i=0;i<7;i++){
    const z=-.53+i*.13;
    wire(pcb,[[.22,.065,z],[.49,.065,z],[.61,.065,z+.12],[1.41,.065,z+.12]],.0045,material('#367c58',.13,.55));
  }
  return model;
}

function orinNanoKit() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), module=group(model,'module'), cooler=group(model,'cooler'), fan=group(model,'fan');
  const usb=group(model,'usb'), network=group(model,'network'), display=group(model,'display'), power=group(model,'power'), service=group(model,'service'), header=group(model,'header'), ribbon=group(model,'ribbon');
  const mounts=fourCornerMounts(2.57,3.16,.075);
  boardPlate(pcb,2.57,3.16,mounts,material('#24262a',.18,.50));
  for(const point of mounts) platedHole(pcb,...point);
  box(pcb,2.54,.118,3.14,.028,dark,0,-.079,0);
  box(module,1.45,.085,1.94,.023,material('#313632',.18,.47),.31,.168,-.04);
  box(module,1.31,.074,1.79,.019,dark,.31,.237,-.04);
  const shroud=new T.Shape().moveTo(-.35,-.93).lineTo(.97,-.93).lineTo(.97,.97).lineTo(-.35,.97).closePath();
  const intake=new T.Path();intake.absarc(.32,.12,.51,0,Math.PI*2,true);shroud.holes.push(intake);
  make(cooler,new T.ExtrudeGeometry(shroud,{depth:.119,bevelEnabled:true,bevelThickness:.013,bevelSize:.014,bevelSegments:2,curveSegments:38}),material('#35363a',.28,.43),0,.424,0).rotation.x=-Math.PI/2;
  for(let i=0;i<19;i++) box(cooler,1.27,.123,.031,.005,dark,.31,.337,-.89+i*.096);
  cylinder(fan,.281,.099,dark,.32,.450,-.12);
  for(let i=0;i<9;i++) {
    const angle=i*Math.PI*2/9;
    const blade=new T.Shape().moveTo(.249,-.040).quadraticCurveTo(.381,-.018,.478,.094)
      .lineTo(.461,.133).quadraticCurveTo(.363,.059,.249,.045).closePath();
    make(fan,new T.ExtrudeGeometry(blade,{depth:.042,bevelSize:.007,bevelThickness:.006,bevelSegments:2}),
      material('#20242a',.18,.49),.32,.418,-.12).rotation.set(-Math.PI/2,0,angle,'YXZ');
  }
  for(const z of [-.27,.24]) portAtEdge(usb,-1.13,z,.46,.49,.45,Math.PI/2);
  portAtEdge(network,-1.13,.81,.49,.47,.43,Math.PI/2);
  portAtEdge(display,-1.13,-.83,.42,.40,.22,Math.PI/2);
  box(power,.39,.29,.40,.021,dark,-1.14,.214,-1.30);
  cylinder(power,.088,.021,silver,-1.346,.234,-1.30).rotation.z=Math.PI/2;
  cylinder(power,.050,.024,dark,-1.358,.234,-1.30).rotation.z=Math.PI/2;
  portAtEdge(service,-1.17,1.22,.23,.27,.13,Math.PI/2);
  for(const z of [-.27,.24]) for(const y of [.19,.36]) {
    box(usb,.019,.044,.28,.006,material('#236298',.08,.45),-1.382,y,z);
  }
  maleHeader(header,-.99,1.42,20,{rows:2,pitch:.105});
  for(const x of [-.24,.39]) sideSocket(ribbon,x,-1.38,Math.PI,{width:.51,depth:.18,height:.11,pins:22});
  for(const [x,z,w] of [[-.61,-.78,.20],[-.66,.62,.18],[.87,1.11,.22],[-.66,1.13,.17]]) surfaceChip(pcb,x,z,w,w,4);
  printedHardwareMarking(cooler,'NVIDIA',.30,.545,.68,.030,material('#777b81',.13,.52));
  return model;
}

function hailoHat() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), chip=group(model,'chip'), header=group(model,'header');
  const flex=group(model,'flex'), interfaceSocket=group(model,'interface');
  const mountRings=group(model,'mounting');
  const outline=[[-1.64,-1.02],[1.55,-1.02],[1.67,-.92],[1.67,1.03],[1.53,1.13],[1.12,1.13],[1.12,.68],[.68,.68],[.68,1.05],[-1.52,1.05],[-1.64,.94],[-1.64,.45],[-1.24,.45],[-1.24,-.26],[-1.64,-.26]];
  const mounts=[[-1.49,-.87,.082],[1.49,-.87,.082],[-1.48,.89,.082],[1.49,.96,.082]];
  controllerBoard(pcb,outline,mounts,material('#088664',.19,.49));
  for(const [x,z,r] of mounts) make(mountRings,new T.TorusGeometry(r,.024,10,28),boardGold,x,.072,z).rotation.x=Math.PI/2;
  box(chip,.81,.088,.79,.020,material('#2e4740',.18,.47),.05,.119,.19);
  box(chip,.72,.068,.69,.023,silver,.05,.190,.19);
  box(chip,.62,.013,.59,.017,bright,.05,.230,.19);
  for(const z of [-.85,-.71]) femaleHeader(header,-1.30,z,20);
  sideSocket(interfaceSocket,-1.23,.02,-Math.PI/2,{width:.45,depth:.22,height:.11,pins:16});
  box(flex,.93,.018,.38,.008,material('#ca7d28',.22,.42),-1.81,.123,.02);
  box(flex,.16,.023,.38,.007,material('#983c31',.15,.48),-2.19,.128,.02);
  box(interfaceSocket,.12,.036,.46,.008,white,-1.40,.196,.02);
  const flexInk=material('#fbe9ba',.10,.55);
  printedHardwareMarking(flex,'PCI E',-1.84,.134,.02,.018,flexInk);
  for(let i=0;i<16;i++) {
    const z=(i-7.5)*.020+.02;
    box(flex,.16,.004,.013,.002,boardGold,-1.48,.135,z);
    box(flex,.075,.004,.013,.002,boardGold,-2.10,.135,z);
  }
  const trace=material('#259a73',.18,.53);
  for(let i=0;i<9;i++) {
    box(pcb,.40,.002,.008,.001,trace,.62,.068,.07+i*.022).rotation.y=-.42;
    cylinder(pcb,.014,.004,boardGold,.86,.069,.19+i*.022);
  }
  for(const [x,z] of [[-.74,.59],[-.52,.65],[.69,-.50],[.89,.56],[-.39,-.45]]) surfaceChip(pcb,x,z,.14,.12,3);
  printedHardwareMarking(chip,'HAILO',.05,.238,.17,.031,material('#7a7c7b',.17,.48));
  printedHardwareMarking(pcb,'AI HAT+',.95,.068,.35,.024,white);
  printedHardwareMarking(pcb,'13 TOPS',.95,.068,.53,.019,white);
  return model;
}

function tinyFpgaBx() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), fpga=group(model,'fpga'), flash=group(model,'flash'), pads=group(model,'pads');
  const usb=group(model,'usb'), reset=group(model,'reset');
  const clock=group(model,'clock'), power=group(model,'power');
  const edge=[-1,1].flatMap(side=>Array.from({length:14},(_,i)=>[-1.21+i*.186,side*.51,.041]));
  boardPlate(pcb,2.67,1.24,edge,material('#069678',.18,.49));
  const padFinish=material('#ddba68',.52,.36);
  const barrelFinish=new T.MeshStandardMaterial({color:'#ddba68',metalness:.52,roughness:.36,side:T.BackSide});
  for(const [x,z,r] of edge) {
    make(pads,new T.RingGeometry(r,.066,32),padFinish,x,.067,z).rotation.x=-Math.PI/2;
    make(pads,new T.CylinderGeometry(r,r,.065,32,1,true),barrelFinish,x,.0325,z);
  }
  box(fpga,.40,.076,.40,.014,dark,-.01,.122,.01).rotation.y=Math.PI/4;
  surfaceChip(flash,.77,.08,.34,.29,4);
  controllerUsb(usb,-1.19,0,.46,'micro');
  box(reset,.232,.083,.18,.016,silver,1.10,.115,.05);
  cylinder(reset,.073,.021,bright,1.10,.164,.05);
  const trace=material('#63c1aa',.15,.49);
  for(let i=0;i<11;i++) {
    const x=-.95+i*.168;
    box(pcb,.008,.004,.32,.001,trace,x,.068,-.29).rotation.y=.41;
    box(pcb,.008,.004,.32,.001,trace,x,.068,.28).rotation.y=-.33;
  }
  for(const [x,z,w] of [[-.72,-.20,.18],[.39,-.21,.17]]) surfaceChip(pcb,x,z,w,w*.75,3);
  box(clock,.20,.064,.16,.011,material('#8e9698',.32,.42),-.44,.101,.25);
  surfaceChip(power,-.63,-.14,.20,.16,3);
  printedHardwareMarking(pcb,'BX',.43,.069,.09,.018,white);
  for(let i=0;i<12;i++) {
    const x=-1.02+i*.186;
    printedHardwareMarking(pcb,String(i+1),x,.069,.408,.010,white);
  }
  for(const [x,z] of [[-.92,.18],[-.79,.09],[-.59,.05],[-.38,-.26],[.31,.18],[.49,.24],[.85,-.26],[.94,.27]]) {
    box(pcb,.084,.033,.043,.006,material('#9a7b57',.12,.54),x,.091,z);
    for(const side of [-1,1]) box(pcb,.018,.029,.044,.004,bright,x+side*.039,.09,z);
  }
  return model;
}

function c6748Kit() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), dsp=group(model,'dsp'), memory=group(model,'memory'), video=group(model,'video');
  const ethernet=group(model,'ethernet'), usb=group(model,'usb'), power=group(model,'power'), expansion=group(model,'expansion');
  const composite=group(model,'composite'), sata=group(model,'sata'), boot=group(model,'boot');
  const mounts=fourCornerMounts(3.47,2.83,.077);
  boardPlate(pcb,3.47,2.83,mounts,material('#25483e',.20,.48));
  for(const point of mounts) platedHole(pcb,...point);
  box(dsp,.63,.103,.58,.016,dark,-.34,.136,-.10);
  for(const [x,z,w,d] of [[.47,-.20,.33,.39],[.51,.40,.41,.25],[.07,-.70,.45,.36]]) box(memory,w,.09,d,.012,dark,x,.119,z);
  portAtEdge(ethernet,-.91,1.16,.62,.68,.46,0);
  portAtEdge(usb,-.37,-1.21,.48,.50,.54,Math.PI);
  portAtEdge(usb,-1.01,-1.25,.35,.38,.24,Math.PI);
  portAtEdge(video,1.61,-.60,.60,.37,.29,Math.PI/2);
  box(video,.061,.18,.53,.020,material('#184eab',.15,.51),1.813,.198,-.60);
  for(let row=0;row<3;row++) for(let i=0;i<5;i++) cylinder(video,.018,.014,dark,1.849,.145+row*.05,-.60+(i-2)*.068).rotation.z=Math.PI/2;
  for(const z of [-.88,-.32]) {
    make(video,new T.CylinderGeometry(.056,.056,.082,6),silver,1.847,.195,z).rotation.z=Math.PI/2;
    cylinder(video,.020,.009,dark,1.892,.195,z).rotation.z=Math.PI/2;
  }
  for(const x of [-1.04,-.79]) box(ethernet,.055,.055,.012,.004,material('#b5a454',.13,.48),x,.39,1.505);
  const cardTrace=material('#436553',.16,.49);
  for(let i=0;i<13;i++) {
    box(pcb,.56,.002,.007,.001,cardTrace,-.36,.068,-.52+i*.023).rotation.y=.48;
  }
  box(power,.43,.32,.35,.023,dark,1.23,.221,1.19);
  cylinder(power,.091,.03,silver,1.23,.221,1.38).rotation.x=Math.PI/2;
  cylinder(power,.051,.018,dark,1.23,.221,1.401).rotation.x=Math.PI/2;
  portAtEdge(composite,.28,-1.27,.28,.31,.23,0);
  cylinder(composite,.101,.037,silver,.28,.21,-1.45).rotation.x=Math.PI/2;
  cylinder(composite,.059,.021,material('#d5aa38',.22,.47),.28,.21,-1.472).rotation.x=Math.PI/2;
  sideSocket(sata,.42,1.08,Math.PI,{width:.34,depth:.22,height:.13,pins:7,finish:dark});
  box(boot,.71,.106,.22,.013,material('#956a29',.12,.46),-.02,.12,.39);
  for(let i=0;i<8;i++) box(boot,.039,.024,.073,.004,white,(i-3.5)*.079,.186,.39);
  printedHardwareMarking(dsp,'C6748',-.34,.190,-.10,.030,material('#9b9993',.12,.48));
  maleHeader(expansion,-1.40,-.77,13,{rows:2,alongZ:true,pitch:.10});
  femaleHeader(expansion,-.54,.49,8);
  sideSocket(expansion,-.74,-.84,0,{width:.92,depth:.17,height:.12,pins:12});
  for(const [x,z,w] of [[-.98,.46,.26],[.86,-.82,.23],[1.14,.08,.24],[.96,.78,.19],[-.53,1.01,.23]]) surfaceChip(pcb,x,z,w,w*.75,4);
  return model;
}

function openCr() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), cpu=group(model,'cpu'), headers=group(model,'headers');
  const sockets=group(model,'sockets'), power=group(model,'power'), usb=group(model,'usb');
  const ttl=group(model,'ttl'), rs485=group(model,'rs485'), battery=group(model,'battery'), buttons=group(model,'buttons');
  const mounts=fourCornerMounts(3.48,2.50,.090);
  boardPlate(pcb,3.48,2.50,mounts,material('#08718c',.20,.49));
  for(const point of mounts) platedHole(pcb,...point);
  squareChip(cpu,.61,-.08,.75,19);
  femaleHeader(headers,-.41,-.76,15);
  femaleHeader(headers,-.22,.84,14);
  maleHeader(headers,-.06,-1.12,9,{rows:2,pitch:.109});
  for(let i=0;i<6;i++) {
    sideSocket(i<3?ttl:rs485,-.84+i*.41,1.15,0,{pins:i<3?3:4,width:.37,height:.15,depth:.20});
  }
  box(battery,.39,.18,.20,.015,material('#a93632',.16,.47),-1.36,.154,1.14);
  for(const x of [-1.45,-1.27]) cylinder(battery,.041,.034,boardGold,x,.249,1.14);
  for(const z of [.48,.72,.95]) tactileCap(buttons,1.57,z,.135);
  printedHardwareMarking(pcb,'OPENCR',-.26,.070,-.25,.032,white);
  printedHardwareMarking(pcb,'1.0',.08,.070,-.47,.014,white);
  const inductor=material('#9e9681',.25,.59);
  box(power,.34,.16,.34,.026,inductor,-.88,.151,-.27);
  printedHardwareMarking(power,'330',-.88,.232,-.27,.019,dark);
  for(const [x,z] of [[-.78,.37],[1.29,.37]]) {
    box(power,.27,.16,.25,.024,inductor,x,.153,z);
    printedHardwareMarking(power,'2R2',x,.234,z,.013,dark);
  }
  for(const [x,z,r] of [[-1.27,-.82,.184],[-1.27,-.37,.18],[-1.13,.44,.137],[-1.16,.74,.124]]) {
    printedHardwareMarking(power,'220',x,.301,z-r*.12,r*.09,dark);
    box(power,r*.72,.004,r*.19,.002,dark,x,.301,z+r*.36);
  }
  for(const z of [-.79,-.47,.53]) sideSocket(sockets,-1.60,z,-Math.PI/2,{pins:3,width:.25,height:.17,depth:.20});
  for(const z of [-.78,-.40]) sideSocket(sockets,1.60,z,Math.PI/2,{pins:4,width:.31,height:.16,depth:.22});
  for(const [x,z,r] of [[-1.27,-.82,.184],[-1.27,-.37,.18],[-1.13,.44,.137],[-1.16,.74,.124],[-.28,.28,.076],[-.28,.48,.074],[-.28,.68,.074]]) {
    cylinder(power,r,.224,silver,x,.175,z);
    cylinder(power,r*.88,.014,bright,x,.293,z);
  }
  box(power,.49,.34,.34,.022,dark,-1.66,.221,.83);
  cylinder(power,.099,.024,silver,-1.911,.225,.83).rotation.z=Math.PI/2;
  const local=new T.Group();
  local.position.set(1.67,0,.15);local.rotation.y=Math.PI;usb.add(local);
  controllerUsb(local,0,0,.33,'micro');
  for(const [x,z,w] of [[-.68,-.69,.43],[-.48,.81,.39],[1.28,.63,.22],[.54,.53,.21],[1.18,-.28,.19]]) surfaceChip(pcb,x,z,w,w*.68,4);
  return model;
}

function pixhawk6c() {
  const model=new T.Group();
  const casework=group(model,'case'), status=group(model,'status'), power=group(model,'power');
  const navigation=group(model,'navigation'), telemetry=group(model,'telemetry');
  const aux=group(model,'aux'), main=group(model,'main'), accessories=group(model,'accessories');
  const can=group(model,'can'), receiver=group(model,'receiver');
  const graphite=material('#23262b',.12,.49), trim=material('#34373d',.18,.51);
  box(casework,1.63,.31,3.13,.080,graphite,0,.18,0);
  box(casework,1.53,.118,3.03,.043,trim,0,.339,0);
  box(casework,1.55,.115,1.40,.039,graphite,0,.392,-.79);
  for(const z of [-1.12,1.14]) for(const x of [-.62,.62]) cylinder(casework,.054,.014,dark,x,.409,z);
  for(const x of [-.68,.68]) for(let i=0;i<3;i++) box(status,.040,.016,.074,.005,material('#6f7780',.22,.40),x,.455,-1.01+i*.18);
  const cream=material('#cfba91',.08,.46);
  const ports=[
    [power,[[-.49,-.10,6],[-.49,.16,6]]],
    [navigation,[[.06,.16,6],[-.45,.42,10]]],
    [telemetry,[[-.48,.70,6],[.01,.70,6],[.49,.70,6]]],
    [accessories,[[.52,-.10,4],[.16,.42,3],[.25,.96,4]]],
    [can,[[.53,.16,4],[.53,.42,4]]],
    [receiver,[[.06,-.10,3],[-.26,.96,5]]],
    [aux,[[-.39,1.26,10]]], [main,[[.38,1.26,10]]]
  ];
  for(const [assembly,items] of ports) {
    const plate=new T.Group();plate.position.y=.33;assembly.add(plate);
    for(const [x,z,pins] of items) {
      const width=.16+pins*.035;
      box(plate,width,.042,.153,.010,cream,x,.088,z);
      box(plate,width-.052,.012,.097,.005,dark,x,.113,z);
      for(let i=0;i<pins;i++) box(plate,.014,.009,.058,.003,boardGold,x+(i-(pins-1)/2)*.030,.120,z);
    }
  }
  const legend=material('#c6bfae',.12,.55);
  for(const [label,x,z] of [
    ['POWER1',-.49,-.10],['DSM',.06,-.10],['USB',.52,-.10],
    ['POWER2',-.49,.16],['GPS2',.06,.16],['CAN1',.53,.16],
    ['GPS1',-.45,.42],['CAN2',.53,.42],
    ['TELEM1',-.48,.70],['TELEM2',.01,.70],['TELEM3',.49,.70],
    ['AUX',-.39,1.26],['MAIN',.38,1.26],
  ]) printedHardwareMarking(casework,label,x,.413,z-.102,.010,legend);
  const arrow=new T.Shape().moveTo(-.092,-.074).lineTo(0,.104)
    .lineTo(.092,-.074).lineTo(0,-.040).closePath();
  make(casework,new T.ShapeGeometry(arrow),white,0,.452,-1.04).rotation.x=-Math.PI/2;
  printedHardwareMarking(casework,'PIXHAWK 6C',0,.452,-.63,.027,white);
  for(const side of [-1,1]) for(let i=0;i<5;i++) {
    box(casework,.035,.072,.092,.009,trim,side*.817,.236,.33+i*.24);
  }
  return model;
}

function odriveS1() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), terminal=group(model,'terminal'), capacitors=group(model,'capacitors');
  const logic=group(model,'logic'), interfacePorts=group(model,'interface'), usb=group(model,'usb');
  const can=group(model,'can'), debug=group(model,'debug');
  const mounts=fourCornerMounts(2.82,2.07,.092);
  boardPlate(pcb,2.82,2.07,mounts,material('#24262a',.17,.51));
  for(const point of mounts) platedHole(pcb,...point);
  const green=material('#20886b',.09,.44);
  const top=new T.Shape().moveTo(-1.24,-.28).lineTo(1.24,-.28).lineTo(1.24,.28).lineTo(-1.24,.28).closePath();
  for(let i=0;i<7;i++) {
    const x=(i-3)*.338;
    const hole=new T.Path();hole.absarc(x,0,.119,0,Math.PI*2,true);top.holes.push(hole);
    make(terminal,new T.RingGeometry(.119,.145,32),green,x,.659,.73).rotation.x=-Math.PI/2;
    cylinder(terminal,.103,.041,silver,x,.555,.73);
    box(terminal,.144,.009,.022,.004,dark,x,.579,.73).rotation.y=.28;
    box(terminal,.252,.172,.024,.009,material('#145444',.08,.54),x,.34,1.026);
    box(terminal,.163,.118,.012,.004,dark,x,.342,1.041);
    box(terminal,.155,.024,.013,.003,silver,x,.275,1.043);
    box(terminal,.028,.176,.046,.007,green,x+.159,.34,1.040);
  }
  box(terminal,2.48,.49,.57,.029,green,0,.312,.73);
  make(terminal,new T.ExtrudeGeometry(top,{depth:.105,bevelEnabled:false,curveSegments:30}),green,0,.551,.73).rotation.x=-Math.PI/2;
  for(let i=0;i<4;i++) {
    const x=-1.00+i*.67;
    cylinder(capacitors,.22,.42,silver,x,.274,.25);
    cylinder(capacitors,.204,.018,bright,x,.492,.25);
    const ink=material('#494b4d',.10,.54);
    printedHardwareMarking(capacitors,'TDK',x,.503,.19,.019,ink);
    printedHardwareMarking(capacitors,'120',x,.503,.31,.019,ink);
    box(capacitors,.074,.004,.096,.003,ink,x+.139,.503,.25);
  }
  squareChip(logic,-.64,-.14,.36,8);
  squareChip(logic,.15,-.27,.27,6);
  sideSocket(interfacePorts,-.67,-.80,Math.PI,{width:1.17,depth:.33,height:.34,pins:15});
  for(let i=0;i<15;i++) {
    box(interfacePorts,.032,.023,.29,.004,boardGold,-.67+(i-7)*.070,.205,-.80);
  }
  for(const z of [-.82,-.48]) sideSocket(can,1.17,z,Math.PI/2,{width:.29,depth:.24,height:.18,pins:4});
  sideSocket(debug,.57,-.60,Math.PI,{width:.33,depth:.23,height:.18,pins:5});
  printedHardwareMarking(pcb,'ODRIVE',-.18,.069,-.065,.032,white);
  printedHardwareMarking(pcb,'S1',.33,.069,-.063,.023,white);
  for(const [x,z] of [[-.92,-.53],[-.43,-.53],[-.09,-.50],[.55,-.20],[.78,-.54],[1.05,-.41]]) {
    surfaceChip(pcb,x,z,.115,.095,2);
  }
  const usbMount=new T.Group();
  usbMount.position.set(.14,0,-.83);
  usbMount.rotation.y=-Math.PI/2;
  usb.add(usbMount);
  controllerUsb(usbMount,0,0,.33,'c');
  for(const [x,z] of [[-1.07,-.16],[-.96,-.42],[.91,-.23],[.62,-.11]]) box(pcb,.21,.097,.17,.015,dark,x,.114,z);
  return model;
}

function optaPlc() {
  const model=new T.Group();
  const casework=group(model,'case'), terminals=group(model,'terminals'), controls=group(model,'controls');
  const usb=group(model,'usb'), ethernet=group(model,'ethernet'), rear=group(model,'rear'), latch=group(model,'latch');
  const rs485=group(model,'rs485'), supply=group(model,'supply');
  const shell=material('#393c42',.19,.52), recessed=material('#1d2025',.12,.56);
  box(casework,2.74,1.03,2.52,.050,shell,0,.59,-.06);
  box(casework,2.71,.75,1.78,.043,shell,0,1.32,-.23);
  box(casework,2.68,.085,1.74,.028,material('#42454b',.19,.52),0,1.72,-.23);
  box(terminals,2.73,.55,.57,.024,shell,0,.37,1.40);
  for(let i=0;i<4;i++) {
    const x=(i-1.5)*.63;
    for(const z of [1.25,1.48]) {
      cylinder(terminals,.083,.043,silver,x,.648,z);
      box(terminals,.112,.009,.019,.003,recessed,x,.673,z).rotation.y=.39;
    }
    box(terminals,.29,.20,.022,.009,recessed,x,.39,1.696);
  }
  for(let i=0;i<12;i++) {
    const x=(i-5.5)*.213;
    const bank=i<4?supply:rear;
    box(bank,.210,.46,.33,.014,shell,x,.41,-1.43);
    cylinder(bank,.069,.049,silver,x,.657,-1.43);
    box(bank,.091,.008,.015,.003,recessed,x,.687,-1.43);
  }
  box(rs485,.62,.23,.27,.014,recessed,1.00,.978,-1.24);
  for(let i=0;i<3;i++) {
    cylinder(rs485,.056,.032,silver,.81+i*.19,1.105,-1.24);
  }
  const legend=material('#c7bfae',.11,.47);
  printedHardwareMarking(casework,'OPTA',-.66,1.764,-.13,.043,legend);
  printedHardwareMarking(casework,'FINDER',.64,1.764,-.22,.027,legend);
  printedHardwareMarking(casework,'24 V',.60,1.764,.04,.019,legend);
  printedHardwareMarking(casework,'LAN',.60,1.764,.41,.015,legend);
  printedHardwareMarking(casework,'USB',-.90,1.764,.52,.013,legend);
  for(let i=0;i<4;i++) {
    printedHardwareMarking(terminals,String(i+1),(i-1.5)*.63,.647,1.60,.019,legend);
  }
  for(let i=0;i<5;i++) {
    box(casework,.36,.031,.015,.004,recessed,-.62,1.24+i*.066,.666);
  }
  box(casework,.018,.25,.70,.005,recessed,1.368,.99,-.46);
  for(const x of [-.90,-.37]) {
    box(controls,.31,.017,.35,.009,recessed,x,1.771,-.80);
    cylinder(controls,.070,.019,dark,x,1.792,-.733);
    box(controls,.082,.015,.070,.005,silver,x,1.788,-.88);
  }
  for(let i=0;i<4;i++) {
    const x=-.99+i*.17;
    box(controls,.116,.018,.115,.005,recessed,x,1.774,.42);
    box(controls,.049,.009,.048,.004,white,x,1.787,.42);
  }
  for(let i=0;i<5;i++) box(casework,.072,.010,.10,.003,recessed,.62+i*.13,1.766,-.81);
  const usbPort=new T.Group();
  usbPort.position.set(-.92,.67,1.22);usbPort.rotation.y=Math.PI/2;usb.add(usbPort);
  controllerUsb(usbPort,0,0,.33,'c');
  const lanPort=new T.Group();
  lanPort.position.set(.93,.62,1.06);lanPort.rotation.y=Math.PI;ethernet.add(lanPort);
  metalPort(lanPort,0,0,.42,.46,.31);
  box(latch,1.72,.145,.35,.025,recessed,0,.06,-.25);
  box(latch,.62,.122,.44,.019,dark,0,.065,1.03);
  return model;
}

function thingsGateway() {
  const model=new T.Group();
  const shell=group(model,'shell'), base=group(model,'base'), antenna=group(model,'antenna');
  const status=group(model,'status'), ethernet=group(model,'ethernet'), power=group(model,'power');
  const cream=material('#f0f0ec',.03,.45), baseFinish=material('#c2c4c4',.12,.51);
  const lidProfile=new T.Shape().moveTo(-.87,-.92)
    .quadraticCurveTo(-1.12,-.90,-1.16,-.60)
    .quadraticCurveTo(-1.24,.12,-1.13,.61)
    .quadraticCurveTo(-1.06,.87,-.77,.93)
    .quadraticCurveTo(.09,1.04,.85,.92)
    .quadraticCurveTo(1.12,.88,1.15,.61)
    .quadraticCurveTo(1.25,.05,1.15,-.62)
    .quadraticCurveTo(1.10,-.92,.82,-.95)
    .quadraticCurveTo(.02,-1.02,-.87,-.92);
  make(shell,new T.ExtrudeGeometry(lidProfile,{
    depth:.18,bevelEnabled:true,bevelSegments:4,steps:1,
    bevelSize:.064,bevelThickness:.07,curveSegments:16,
  }),cream,0,.37,0).rotation.x=-Math.PI/2;
  box(base,2.16,.23,1.66,.15,baseFinish,0,.175,0);
  for(const x of [-.75,.75]) for(const z of [-.51,.51]) cylinder(base,.107,.039,dark,x,.05,z);
  for(let i=0;i<5;i++) {
    const x=(i-2)*.055;
    box(status,.026,.086,.028,.006,dark,x,.386,.937);
    box(status,.012,.063,.021,.004,white,x,.399,.951);
  }
  const pivot=new T.Group();
  pivot.position.set(.89,.325,-.70);pivot.rotation.set(-.61,0,-.55);antenna.add(pivot);
  cylinder(pivot,.092,.19,dark,0,.035,0);
  make(pivot,new T.CylinderGeometry(.030,.062,1.79,36),dark,0,.98,0);
  make(pivot,new T.SphereGeometry(.031,24,16),dark,0,1.875,0);
  const lanMount=new T.Group();
  lanMount.position.set(.08,.087,-.80);
  ethernet.add(lanMount);
  metalPort(lanMount,0,0,.40,.23,.16);
  box(power,.29,.19,.27,.018,dark,-.58,.219,-.80);
  make(power,new T.TorusGeometry(.064,.013,9,24),silver,-.58,.22,-.941);
  cylinder(power,.022,.044,silver,-.58,.22,-.937).rotation.x=Math.PI/2;
  cylinder(antenna,.069,.078,boardGold,.89,.325,-.916).rotation.x=Math.PI/2;
  const badge=new T.Group();
  badge.position.set(.75,0,.59);
  badge.rotation.y=-.56;
  shell.add(badge);
  const ink=material('#8d9192',.05,.55);
  printedHardwareMarking(badge,'THE THINGS',0,.622,0,.010,ink);
  printedHardwareMarking(badge,'NETWORK',0,.622,.069,.010,ink);
  return model;
}

function floraWearable() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), pads=group(model,'pads'), cpu=group(model,'cpu');
  const usb=group(model,'usb'), battery=group(model,'battery'), led=group(model,'led');
  const power=group(model,'power'), debug=group(model,'debug');
  const reset=group(model,'reset'), indicators=group(model,'indicators');
  const shape=new T.Shape();
  shape.absarc(0,0,1.34,0,Math.PI*2,false);
  const padAngles=[-144,-125,-107,-89,-70,-51,-32,-14,14,32,51,70,90,110];
  for(const degrees of padAngles) {
    const a=degrees*Math.PI/180;
    const x=1.17*Math.cos(a), z=1.17*Math.sin(a);
    const hole=new T.Path();hole.absarc(x,-z,.098,0,Math.PI*2,true);shape.holes.push(hole);
    make(pads,new T.RingGeometry(.098,.157,40),boardGold,x,.068,z).rotation.x=-Math.PI/2;
    make(pads,new T.RingGeometry(.098,.157,40),boardGold,x,-.001,z).rotation.x=Math.PI/2;

  }
  make(pcb,new T.ExtrudeGeometry(shape,{depth:.066,bevelEnabled:false,curveSegments:40}),material('#212126',.14,.51)).rotation.x=-Math.PI/2;
  squareChip(cpu,-.22,-.07,.51,11);
  controllerUsb(usb,-1.17,-.37,.47,'micro');
  sideSocket(battery,.98,.44,Math.PI/2,{finish:dark,pins:2,width:.39,depth:.33,height:.23});
  box(led,.245,.10,.244,.015,white,.38,.124,.19);
  const pink=new T.MeshStandardMaterial({color:'#f1b6e6',emissive:'#b23c7f',emissiveIntensity:.38,roughness:.37});
  box(led,.157,.018,.158,.011,pink,.38,.183,.19);
  box(power,.35,.12,.213,.015,silver,-.30,.133,.66);
  box(power,.103,.077,.11,.010,dark,-.25,.219,.66);
  tactileCap(reset,.67,.30,.14);
  for(const [x,z,color] of [[-.75,-.44,'#f2b783'],[-.79,.16,'#a6de9c']]) {
    box(indicators,.103,.051,.079,.008,white,x,.094,z);
    box(indicators,.059,.013,.049,.004,material(color,.10,.46),x,.126,z);
  }
  printedHardwareMarking(pcb,'FLORA',.18,.068,.67,.022,white);
  const emblem=new T.Group();
  emblem.position.set(.38,.069,.51);
  pcb.add(emblem);
  for(let i=0;i<5;i++) {
    const a=i*Math.PI*2/5;
    const petal=make(emblem,new T.CircleGeometry(.045,18),white,.060*Math.cos(a),0,.060*Math.sin(a));
    petal.rotation.x=-Math.PI/2;
  }
  printedHardwareMarking(cpu,'32U4',-.22,.180,-.07,.023,material('#79787a',.12,.53));
  for(let i=0;i<3;i++) for(let j=0;j<2;j++) {
    const x=.27+i*.134,z=-.52+j*.131;
    make(debug,new T.TorusGeometry(.036,.015,8,24),boardGold,x,.076,z).rotation.x=Math.PI/2;
  }
  for(const [x,z] of [[-.77,-.48],[-.76,-.24],[-.72,.03],[-.64,.28],[.35,.62],[.65,-.34],[.79,-.14],[-.19,-.71]]) box(pcb,.146,.051,.066,.010,white,x,.096,z);
  return model;
}

function ds18Probe() {
  const model=new T.Group(), jacket=group(model,'jacket'), tip=group(model,'tip'), leads=group(model,'leads'), seal=group(model,'seal');
  const path=Array.from({length:171},(_,i)=>{
    const t=i/170, a=.33+t*Math.PI*5.44, r=.74+t*.39;
    return [-.39+r*Math.cos(a),.12+.054*t,r*.83*Math.sin(a)];
  });
  wire(jacket,[[1.22,.12,.24],[.73,.12,.21],...path,[.09,.12,1.04]],.042,material('#252527',.10,.34));
  const metal=cylinder(tip,.073,.63,material('#aeb6bd',.72,.27),1.71,.122,.24);
  cylinder(tip,.074,.018,bright,1.419,.122,.24).rotation.z=Math.PI/2;
  metal.rotation.z=Math.PI/2;
  const end=cylinder(tip,.069,.017,silver,2.025,.122,.24);
  end.rotation.z=Math.PI/2;
  cylinder(seal,.086,.30,dark,1.27,.122,.24).rotation.z=Math.PI/2;
  cylinder(seal,.091,.037,material('#313235',.10,.48),1.15,.122,.24).rotation.z=Math.PI/2;
  for(const [i,color] of ['#c44228','#276eb0','#dfb935'].entries()) {
    const z=1.04+(i-1)*.105;
    wire(leads,[[.09,.12,1.04],[.39,.105,z],[.74,.09,z+.02]],.018,material(color,.08,.45));
    wire(leads,[[.74,.09,z+.02],[.98,.09,z+.03]],.009,material('#a97450',.62,.36));
  }
  return model;
}

function aht20Demo() {
  const model=new T.Group(), housing=group(model,'housing'), sensor=group(model,'sensor'), leads=group(model,'leads');
  const base=group(model,'base'), display=group(model,'display');
  const hostUsb=group(model,'host-usb');
  const enclosure=new T.Shape().moveTo(-.67,-.27).lineTo(.67,-.27).lineTo(.67,.27).lineTo(-.67,.27).closePath();
  for(let row=0;row<3;row++) for(let col=0;col<6;col++) {
    const hole=new T.Path();hole.absarc(-.28+col*.138,-.135+row*.136,.035,0,Math.PI*2,true);enclosure.holes.push(hole);
  }
  box(housing,1.34,.19,.54,.048,dark,.25,.12,-.98);
  make(housing,new T.ExtrudeGeometry(enclosure,{depth:.067,bevelEnabled:true,bevelSegments:2,bevelSize:.014,bevelThickness:.011,curveSegments:18}),dark,.25,.281,-.98).rotation.x=-Math.PI/2;
  box(sensor,.84,.048,.39,.012,material('#13784d',.17,.50),.40,.231,-.98);
  box(sensor,.27,.056,.22,.013,silver,.46,.255,-.98);
  box(base,2.23,.19,1.24,.040,white,-.17,.098,.64);
  box(base,2.14,.012,.052,.004,material('#b3b1a7',.11,.55),-.17,.199,.64);
  for(let col=0;col<27;col++) for(let row=0;row<10;row++) {
    const z=.20+row*.098+(row>=5?.035:0);
    box(base,.031,.007,.034,.002,dark,-1.17+col*.077,.197,z);
  }
  for(const [z,color] of [[.11,'#5c92b9'],[.16,'#bd6161'],[1.11,'#5c92b9'],[1.17,'#bd6161']]) box(base,2.07,.006,.014,.002,material(color,.04,.52),-.17,.201,z);
  box(display,1.25,.084,.57,.026,dark,-.52,.264,.64);
  box(display,.90,.019,.405,.008,material('#20334b',.19,.27),-.47,.315,.64);
  const displayInk=material('#73b7eb',.06,.42);
  printedHardwareMarking(display,'AHT20 DEMO',-.47,.326,.54,.015,displayInk);
  printedHardwareMarking(display,'TEMP 23.47 C',-.47,.326,.64,.013,displayInk);
  printedHardwareMarking(display,'RH 62.42',-.47,.326,.74,.013,displayInk);
  box(hostUsb,.23,.091,.25,.012,silver,-1.19,.265,.64);
  box(hostUsb,.31,.119,.25,.024,dark,-1.43,.264,.64);
  wire(hostUsb,[[-1.56,.264,.64],[-1.82,.19,.64],[-2.07,.16,.69]],.036,dark);
  for(let i=0;i<12;i++) for(const side of [-1,1]) cylinder(display,.021,.018,boardGold,-1.05+i*.094,.316,.64+side*.262);
  for(const [i,color] of ['#dd4337','#e2b335','#e5e4dd','#25272b'].entries()) {
    const off=(i-1.5)*.045;
    wire(leads,[[.91,.175,-.97+off],[1.14,.23,-.86+off],[1.18,.30,-.54+off],[.95,.36,-.25+off],[.65+off,.32,.13],[.37+off,.23,.57]],.022,material(color,.08,.48));
  }
  return model;
}

function bmp388Breakout() {
  const model=new T.Group(), pcb=group(model,'pcb'), chip=group(model,'chip'), pads=group(model,'pads'), leftSocket=group(model,'left-socket'), rightSocket=group(model,'right-socket'), mounts=group(model,'mounts');
  const mounting=[[-.95,-.48,.106],[.95,-.48,.106]];
  const contacts=Array.from({length:8},(_,i)=>[-.89+i*.248,.44,.042]);
  const outline=[[-1.02,-.68],[1.02,-.68],[1.145,-.56],[1.145,.56],
    [1.02,.68],[-1.02,.68],[-1.145,.56],[-1.145,-.56]];
  controllerBoard(pcb,outline,[...mounting,...contacts],material('#333538',.17,.51));
  for(const point of mounting) platedHole(mounts,...point);
  for(const point of contacts) platedHole(pads,...point);
  sideSocket(leftSocket,-.91,-.12,-Math.PI/2,{width:.49,depth:.30,height:.24});
  sideSocket(rightSocket,.91,-.12,Math.PI/2,{width:.49,depth:.30,height:.24});
  box(chip,.25,.063,.19,.012,silver,.064,.102,.021);
  cylinder(chip,.024,.007,dark,.119,.137,.010);
  surfaceChip(pcb,-.48,.02,.27,.21,3);
  surfaceChip(pcb,.51,-.22,.24,.18,3);
  for(const [x,z] of [[-.56,.27],[-.29,-.29],[.17,-.32],[.45,.25],[-.23,.13]]) box(pcb,.118,.052,.081,.009,white,x,.096,z);
  for(const [i,label] of ['VIN','3V','GND','SCK','SDO','SDI','CS','INT'].entries()) {
    printedHardwareMarking(pcb,label,-.89+i*.248,.068,.29,.010,white);
  }
  printedHardwareMarking(pcb,'BMP388',.27,.068,-.43,.025,white);
  return model;
}

function scd40Breakout() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), sensor=group(model,'sensor'), membrane=group(model,'membrane');
  const leftSocket=group(model,'left-socket'), rightSocket=group(model,'right-socket');
  const pads=group(model,'pads'), mounting=group(model,'mounting');
  const mounts=fourCornerMounts(2.10,1.75,.102);
  const contacts=Array.from({length:5},(_,i)=>[-.52+i*.238,.65,.043]);
  boardPlate(pcb,2.10,1.75,[...mounts,...contacts],material('#303236',.17,.52));
  for(const point of mounts) platedHole(mounting,...point);
  for(const point of contacts) platedHole(pads,...point);
  box(sensor,.92,.077,.95,.021,material('#2c8155',.19,.48),0,.105,-.08);
  box(sensor,.82,.37,.84,.071,silver,0,.310,-.08);
  box(membrane,.57,.022,.58,.043,material('#e3e3de',.07,.67),0,.505,-.08);
  const rim=material('#999d9e',.55,.46);
  for(const x of [-.32,.32]) box(sensor,.024,.009,.65,.003,rim,x,.498,-.08);
  for(const z of [-.40,.24]) box(sensor,.65,.009,.024,.003,rim,0,.498,z);
  sideSocket(leftSocket,-.80,-.085,-Math.PI/2,{width:.48,depth:.28,height:.22});
  sideSocket(rightSocket,.80,-.085,Math.PI/2,{width:.48,depth:.28,height:.22});
  printedHardwareMarking(pcb,'SCD40',.40,.068,-.58,.024,white);
  for(const [x,z] of [[-.58,.29],[.43,.51],[-.63,.47],[.58,-.34]]) box(pcb,.14,.053,.085,.009,white,x,.096,z);
  return model;
}

function pmsa003iBreakout() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), can=group(model,'can'), airflow=group(model,'airflow');
  const pads=group(model,'pads'), leftSocket=group(model,'left-socket'), rightSocket=group(model,'right-socket');
  const vents=group(model,'vents'), mounting=group(model,'mounting');
  const mounts=[[-1.16,-.83,.078],[-1.16,.83,.078],[1.14,-.83,.078],[1.14,.83,.078]];
  const contacts=Array.from({length:7},(_,i)=>[-1.18,-.54+i*.180,.036]);
  boardPlate(pcb,2.57,1.97,[...mounts,...contacts],material('#292b30',.17,.51));
  for(const point of mounts) platedHole(mounting,...point);
  for(const point of contacts) platedHole(pads,...point);
  const blue=material('#087fb8',.72,.34);
  box(can,1.94,.52,1.84,.034,blue,.24,.333,0);
  box(can,1.95,.060,1.85,.021,material('#159fc7',.70,.30),.24,.615,0);
  const seam=material('#53a3bd',.50,.46);
  for(const y of [.14,.53]) {
    box(can,1.89,.015,.014,.003,seam,.24,y,.920);
    box(can,.014,.015,1.80,.003,seam,-.732,y,0);
  }
  for(const x of [-.55,1.03]) for(const y of [.19,.40]) box(vents,.10,.052,.014,.005,dark,x,y,.929);
  const cap=new T.Shape().moveTo(-.39,-.36).lineTo(.39,-.36).lineTo(.39,.36).lineTo(-.39,.36).closePath();
  for(const [x,z] of [[-.27,-.24],[.27,.24]]) {
    const hole=new T.Path();hole.absarc(x,z,.064,0,Math.PI*2,true);cap.holes.push(hole);
    cylinder(airflow,.055,.010,dark,.56+x,.648,-.47-z);
  }
  make(airflow,new T.ExtrudeGeometry(cap,{depth:.075,bevelEnabled:true,bevelThickness:.013,bevelSize:.012,bevelSegments:2,curveSegments:28}),dark,.56,.65,-.47).rotation.x=-Math.PI/2;
  sideSocket(leftSocket,-.91,-.75,-Math.PI/2,{finish:dark,width:.34,depth:.25,height:.15});
  sideSocket(rightSocket,-.91,.75,-Math.PI/2,{finish:dark,width:.34,depth:.25,height:.15});
  printedHardwareMarking(can,'PLANTOWER',.28,.647,.31,.029,material('#51bde1',.29,.43));
  for(const z of [-.44,-.20,.05,.28,.47]) box(pcb,.130,.056,.090,.009,white,-.91,.100,z);
  return model;
}

function guvaUvBreakout() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), detector=group(model,'detector'), amplifier=group(model,'amp');
  const pads=group(model,'pads'), mount=group(model,'mount');
  const outline=[[-.98,-.48],[.94,-.48],[1.08,-.36],[1.08,.36],[.94,.48],[-.98,.48],[-1.10,.35],[-1.10,-.35]];
  const holes=[[-.86,-.27,.055],[-.86,0,.055],[-.86,.27,.055]];
  controllerBoard(pcb,outline,[...holes,[.79,.00,.126]],material('#0776ad',.17,.49));
  for(const point of holes) platedHole(pads,...point);
  make(mount,new T.TorusGeometry(.144,.029,10,38),boardGold,.79,.075,0).rotation.x=Math.PI/2;
  box(detector,.37,.117,.36,.033,white,.40,.132,.028);
  cylinder(detector,.094,.018,material('#e3e0d5',.09,.41),.40,.195,.028);
  surfaceChip(amplifier,-.16,.018,.32,.22,3);
  for(const [x,z] of [[-.48,.18],[-.44,-.19],[.18,-.25],[.17,.25],[.58,-.30]]) box(amplifier,.14,.051,.077,.009,silver,x,.096,z);
  printedHardwareMarking(pcb,'SENSOR',.40,.068,-.31,.012,white);
  printedHardwareMarking(pcb,'UV',.71,.068,-.33,.024,white);
  for(const [z,label] of [[-.27,'OUT'],[0,'-'],[.27,'+']]) {
    printedHardwareMarking(pcb,label,-.64,.068,z,.012,white);
  }
  return model;
}

function weatherMeter() {
  const model=new T.Group();
  const mast=group(model,'mast'), arms=group(model,'arms'), vane=group(model,'vane');
  const cups=group(model,'cups'), rain=group(model,'rain'), leads=group(model,'leads');
  const collector=group(model,'collector');
  const polymer=material('#dedfd8',.08,.52);
  cylinder(mast,.063,2.22,silver,0,1.07,0);
  box(mast,.23,.27,.16,.017,bright,0,.76,.047);
  box(arms,2.76,.090,.16,.012,polymer,0,2.06,0);
  for(let i=0;i<10;i++) box(arms,.26,.051,.064,.005,polymer,-1.22+i*.271,2.03,.069).rotation.z=(i%2?-1:1)*.47;
  for(const x of [-1.31,1.31]) cylinder(arms,.094,.32,polymer,x,2.23,0);
  cylinder(vane,.15,.31,polymer,-1.31,2.45,0);
  box(vane,1.03,.050,.061,.010,polymer,-1.44,2.66,0);
  make(vane,new T.SphereGeometry(.106,28,20),polymer,-1.94,2.66,0).scale.set(1.38,.47,.63);
  make(vane,new T.SphereGeometry(.25,40,24),polymer,-1.01,2.75,0).scale.set(.77,1.13,.14);
  cylinder(cups,.16,.27,polymer,1.31,2.43,0);
  for(let i=0;i<3;i++) {
    const arm=new T.Group();arm.position.set(1.31,2.62,0);arm.rotation.y=i*Math.PI*2/3;cups.add(arm);
    box(arm,.49,.035,.037,.004,polymer,.24,0,0);
    const cupShape=new T.SphereGeometry(.164,32,20,0,Math.PI*2,0,Math.PI/2);
    const shell=polymer.clone();shell.side=T.DoubleSide;
    make(arm,cupShape,shell,.49,0,0).rotation.x=Math.PI/2;
    make(arm,new T.TorusGeometry(.161,.012,8,32),polymer,.49,0,0);
  }
  box(rain,.94,.54,.64,.043,polymer,-.62,.79,.25);
  const rim=new T.Shape().moveTo(-.47,-.32).lineTo(.47,-.32).lineTo(.47,.32).lineTo(-.47,.32).closePath();
  const opening=new T.Path().moveTo(-.404,-.252).lineTo(-.404,.252).lineTo(.404,.252).lineTo(.404,-.252).closePath();
  rim.holes.push(opening);
  make(collector,new T.ExtrudeGeometry(rim,{depth:.14,bevelEnabled:false}),polymer,-.62,1.06,.25).rotation.x=-Math.PI/2;
  const basin=material('#c0c3bb',.08,.53);
  for(const z of [.128,.372]) {
    box(collector,.81,.028,.268,.008,basin,-.62,1.102,z).rotation.x=z<.25?.21:-.21;
  }
  box(rain,.31,.11,.21,.014,silver,-.16,.82,.09);
  wire(leads,[[-.67,.52,.35],[-.62,.34,.34],[-.42,.09,.32],[-.38,-.03,.34]],.016,dark);
  wire(leads,[[.03,2.05,.11],[.10,1.70,.14],[.097,1.16,.13],[.14,.47,.14],[.16,.06,.13]],.012,dark);
  return model;
}

function sharpIr() {
  const model=new T.Group();
  const housing=group(model,'housing'), emitter=group(model,'emitter'), receiver=group(model,'receiver'), mount=group(model,'mount');
  const plug=group(model,'plug'), wires=group(model,'wires');
  const contacts=group(model,'contacts');
  const shell=material('#34363a',.15,.49);
  box(housing,1.30,.31,.59,.031,shell,-.68,.20,-.69);
  box(receiver,.58,.028,.32,.019,material('#656568',.18,.47),-.43,.355,-.69);
  for(const [x,optics,radius] of [[-1.11,emitter,.111],[-.24,receiver,.126]]) {
    make(optics,new T.TorusGeometry(.138,.033,10,40),dark,x,.373,-.69).rotation.x=Math.PI/2;
    cylinder(optics,radius,.024,material('#121e25',.32,.16),x,.361,-.69);
    box(optics,.052,.006,.030,.006,material('#697981',.42,.26),x,.376,-.69);
  }
  for(const x of [-1.46,.10]) {
    const ring=new T.Shape();ring.absarc(0,0,.17,0,Math.PI*2,false);
    const hole=new T.Path();hole.absarc(0,0,.077,0,Math.PI*2,true);ring.holes.push(hole);
    make(mount,new T.ExtrudeGeometry(ring,{depth:.099,bevelEnabled:false,curveSegments:32}),shell,x,.10,-.69).rotation.x=-Math.PI/2;
  }
  sideSocket(plug,-.68,-.31,0,{width:.35,depth:.26,height:.17,pins:3});
  box(plug,.245,.133,.19,.016,white,-.68,.136,-.11);
  for(const [i,color] of ['#e8e8e3','#1c1e22','#bb2831'].entries()) {
    const off=(i-1)*.051;
    wire(wires,[[-.68+off,.11,-.06],[-.56+off,.105,.48],[-.12+off,.097,1.02],[.63+off,.099,1.00],[1.10+off,.11,.59],[1.06+off,.12,.04],[.66+off,.14,-.23],[.18+off,.14,-.18],[-.08+off,.135,.21],[.07+off,.13,.62],[.65+off,.14,.78],[1.12+off,.15,.52],[1.39+off,.17,-.28]],.024,material(color,.09,.44));
    wire(contacts,[[1.39+off,.17,-.28],[1.45+off,.17,-.44]],.008,material('#bc8b69',.64,.41));
  }
  return model;
}

function gravityTof() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), ports=group(model,'ports'), supports=group(model,'supports');
  const optics=group(model,'optics'), pins=group(model,'pins'), mounts=group(model,'mounts');
  const holes=[[-.60,-.51,.126],[.60,-.51,.126],[-.12,-.43,.042],[.14,-.43,.042]];
  const outline=[[-.78,-.64],[.78,-.64],[.87,-.54],[.87,.53],[.75,.64],[-.75,.64],[-.87,.52],[-.87,-.53]];
  controllerBoard(pcb,outline,holes,material('#242629',.18,.50));
  for(const [x,z] of holes.slice(0,2)) make(mounts,new T.TorusGeometry(.149,.041,10,40),boardGold,x,.076,z).rotation.x=Math.PI/2;
  for(const point of holes.slice(2)) platedHole(pins,...point);
  sideSocket(ports,0,.41,0,{width:1.22,depth:.35,height:.29,pins:4,finish:material('#e5daba',.07,.48)});
  for(const x of [-.30,0,.30]) surfaceChip(supports,x,-.085,.17,.14,3);
  box(optics,.26,.10,.18,.016,dark,0,-.059,.12);
  for(const x of [-.058,.058]) cylinder(optics,.034,.013,material('#152b38',.26,.21),x,-.113,.12);
  printedHardwareMarking(pcb,'GRAVITY',.15,.067,.58,.017,white);
  printedHardwareMarking(pcb,'GPIO XSHUT',.01,.067,-.58,.011,white);
  return model;
}

function tfminiRangefinder() {
  const model=new T.Group();
  const body=group(model,'body'), optics=group(model,'optics'), mount=group(model,'mount'), connector=group(model,'connector'), harness=group(model,'harness');
  const ends=group(model,'ends');
  const black=material('#22262a',.12,.45);
  box(body,1.08,.31,.55,.042,black,-.92,.20,-.70);
  for(const x of [-1.18,-.68]) {
    const rings=[[.120,-.08],[.158,-.08],[.168,-.06],[.168,.07],[.157,.085],[.119,.085],[.120,-.08]];
    make(optics,new T.LatheGeometry(rings.map(v=>new T.Vector2(...v)),56),dark,x,.417,-.70);
    make(optics,new T.SphereGeometry(.117,36,24),material('#53616a',.49,.15),x,.435,-.70).scale.y=.21;
  }
  const flange=new T.Shape().moveTo(-.18,-.22).lineTo(.12,-.22).lineTo(.12,.22).lineTo(-.18,.22).closePath();
  const hole=new T.Path();hole.absarc(-.07,0,.069,0,Math.PI*2,true);flange.holes.push(hole);
  make(mount,new T.ExtrudeGeometry(flange,{depth:.097,bevelEnabled:true,bevelSegments:2,bevelThickness:.013,bevelSize:.013,curveSegments:28}),black,-1.48,.099,-.70).rotation.x=-Math.PI/2;
  sideSocket(connector,-.92,-.398,0,{width:.34,depth:.22,height:.14,pins:4});
  for(const [i,color] of ['#1f2328','#dfded9','#b82c35','#1d9278'].entries()) {
    const off=(i-1.5)*.039;
    wire(harness,[[-.92+off,.13,-.285],[-.82+off,.102,.37],[-.27+off,.096,.97],[.53+off,.10,1.02],[1.16+off,.12,.58],[1.23+off,.13,-.06],[.95+off,.15,-.64],[.39+off,.16,-.91],[-.13,.18,-.91+off*2]],.017,material(color,.10,.47));
    box(ends,.23,.053,.066,.010,dark,-.245,.18,-.91+off*2);
    box(ends,.13,.023,.023,.004,silver,-.397,.18,-.91+off*2);
  }
  for(const x of [-1.37,-.47]) for(const z of [-.89,-.51]) {
    cylinder(body,.023,.009,material('#141518',.08,.55),x,.361,z);
  }
  return model;
}

function presenceRadar() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), chip=group(model,'chip'), leftPatch=group(model,'left-patch'), rightPatch=group(model,'right-patch'), pins=group(model,'pins'), indicator=group(model,'indicator');
  boardPlate(pcb,3.29,.66,[],material('#173b66',.18,.51));
  squareChip(chip,.53,.02,.38,7);
  for(const [antenna,x,z] of [[leftPatch,-1.00,.04],[rightPatch,1.33,-.04]]) {
    box(antenna,.35,.012,.32,.006,boardGold,x,.073,z);
  }
  for(const [x1,z1,x2,z2] of [[-1.03,.04,-.79,.16],[-.79,.16,-.52,.10],[-.52,.10,-.34,-.07],[-.34,-.07,.34,-.07],[.70,.04,.92,.11],[.92,.11,1.18,.12],[1.18,.12,1.30,-.05]]) {
    const antenna=x1<0?leftPatch:rightPatch;
    const trace=box(antenna,Math.hypot(x2-x1,z2-z1),.012,.039,.004,boardGold,(x1+x2)/2,.073,(z1+z2)/2);
    trace.rotation.y=-Math.atan2(z2-z1,x2-x1);
  }
  for(let i=0;i<5;i++) {
    const z=(i-2)*.111;
    cylinder(pins,.034,.02,silver,-1.51,.074,z);
    box(pins,.106,.117,.105,.009,dark,-1.51,-.057,z);
    box(pins,.028,.234,.028,.004,boardGold,-1.51,-.187,z);
  }
  box(indicator,.15,.074,.128,.014,white,-.45,.107,-.235);
  box(indicator,.086,.012,.07,.006,material('#d2b35e',.12,.45),-.45,.15,-.235);
  printedHardwareMarking(pcb,'24GHZ',1.20,.068,-.26,.014,white);
  return model;
}

function pirMotion() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), lens=group(model,'lens'), detector=group(model,'detector'), delay=group(model,'delay'), sensitivity=group(model,'sensitivity'), output=group(model,'output');
  const capacitor=group(model,'capacitor');
  const mounting=[[-.72,.64,.071],[.72,-.64,.071]];
  boardPlate(pcb,1.71,1.57,mounting,material('#08a77f',.16,.50));
  for(const point of mounting) platedHole(pcb,...point);
  const translucent=new T.MeshPhysicalMaterial({color:'#e9e7dc',metalness:.02,roughness:.39,transparent:true,opacity:.81,flatShading:true});
  box(lens,1.37,.14,1.32,.041,translucent,0,.164,-.03);
  make(lens,new T.SphereGeometry(.581,32,12,0,Math.PI*2,0,Math.PI/2),translucent,0,.233,-.035).scale.y=.84;
  cylinder(detector,.135,.091,silver,0,.12,-.035);
  box(detector,.10,.013,.069,.005,material('#263d45',.19,.27),0,.173,-.035);
  for(const [x,adjustments] of [[-.31,delay],[.31,sensitivity]]) {
    box(adjustments,.245,.213,.24,.024,dark,x,-.101,.54);
    cylinder(adjustments,.109,.061,material('#d8a325',.12,.48),x,-.104,.69).rotation.x=Math.PI/2;
    box(adjustments,.12,.020,.013,.003,dark,x,-.105,.724);
  }
  box(output,.42,.147,.18,.015,dark,.26,-.086,.746);
  for(let i=0;i<3;i++) box(output,.035,.189,.038,.005,boardGold,.26+(i-1)*.127,-.199,.746);
  cylinder(capacitor,.083,.33,material('#282a2b',.14,.45),-.57,-.151,.52);
  cylinder(capacitor,.075,.016,silver,-.57,-.322,.52);
  box(capacitor,.033,.25,.006,.002,white,-.57,-.15,.602);
  return model;
}

function inertialBreakout({width,depth,chipSize,chipZ,front,rear,finish,support,whiteSockets,clock=false,splitSockets=false,marking}) {
  const model=new T.Group();
  const pcb=group(model,'pcb'), chip=group(model,'chip'), pads=group(model,'pads');
  const mounts=group(model,'mounts'), electronics=group(model,'electronics');
  const sockets=splitSockets?[group(model,'left-socket'),group(model,'right-socket')]:[group(model,'sockets')];
  const mounting=fourCornerMounts(width,depth,.108);
  const contacts=[...front.map(x=>[x,depth/2-.235,.039]),...rear.map(x=>[x,-depth/2+.235,.039])];
  const x=width/2,z=depth/2,c=.11;
  controllerBoard(pcb,[[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c],[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c]],
    [...mounting,...contacts],material(finish,.18,.52));
  for(const point of mounting) platedHole(mounts,...point);
  for(const point of contacts) platedHole(pads,...point);
  box(chip,chipSize,.083,chipSize*.94,.014,dark,.02,.127,chipZ);
  cylinder(chip,.024,.007,material('#44464a',.12,.52),.02+chipSize*.30,.173,chipZ+chipSize*.29);
  for(const side of [-1,1]) sideSocket(sockets[splitSockets && side>0?1:0],side*(x-.22),-.045,side*Math.PI/2,{width:.46,depth:.29,height:.225,finish:whiteSockets?white:dark});
  for(const [px,pz] of support) box(electronics,.125,.061,.078,.011,silver,px,.102,pz);
  surfaceChip(electronics,-.44,.02,.21,.14,3);
  surfaceChip(electronics,.46,.21,.18,.13,3);
  if(clock) box(group(model,'clock'),.202,.068,.107,.014,bright,.37,.104,.16);
  if(marking) printedHardwareMarking(pcb,marking,0,.068,-.49,.019,white);
  return model;
}

const adxl345 = () => {
  const model=inertialBreakout({
  width:2.12,depth:1.34,chipSize:.39,chipZ:.055,
  front:[-.59,-.355,-.12,.115,.35,.585],rear:[-.34,-.106,.128,.362],
  finish:'#36383b',support:[[-.52,-.32],[-.26,.28],[.33,-.26],[.47,-.08]],whiteSockets:false,splitSockets:true,marking:'ADXL345'
  });
  const chip=model.getObjectByName('chip');
  for(const z of [-.14,.25]) for(let i=0;i<6;i++) {
    box(chip,.023,.021,.062,.004,bright,-.14+i*.062,.080,z);
  }
  const connectorFinish=material('#7a7d80',.34,.44);
  for(const name of ['left-socket','right-socket']) {
    model.getObjectByName(name).traverse(object=>{
      if(object.isMesh && object.material===dark) object.material=connectorFinish;
    });
  }
  return model;
};
const bno055 = () => inertialBreakout({
  width:2.25,depth:1.52,chipSize:.51,chipZ:-.023,
  front:[-.60,-.36,-.12,.12,.36,.60],rear:[-.32,-.08,.16,.40],
  finish:'#24262a',support:[[-.61,.28],[-.39,-.30],[.49,-.32],[.60,.32],[.25,.26]],whiteSockets:true,clock:true,splitSockets:true,marking:'BNO055'
});
const lis3mdl = () => inertialBreakout({
  width:2.18,depth:1.42,chipSize:.28,chipZ:.085,
  front:[-.62,-.38,-.14,.10,.34,.58],rear:[-.35,-.12,.11,.34],
  finish:'#282a2c',support:[[-.53,-.27],[-.32,-.11],[-.29,.25],[.21,-.15],[.32,.32],[.56,-.29]],whiteSockets:true,splitSockets:true,marking: 'LIS3MDL'
});

function mpu6050Demo() {
  const model=new T.Group(), breadboard=group(model,'breadboard'), host=group(model,'host');
  const screen=group(model,'screen'), module=group(model,'module'), sensor=group(model,'sensor'), harness=group(model,'harness');
  const hostUsb=group(model,'host-usb');
  box(breadboard,2.73,.16,1.71,.041,white,-.34,.09,-.48);
  box(breadboard,2.65,.012,.071,.004,material('#bfc0b9',.10,.55),-.34,.175,-.48);
  for(let col=0;col<29;col++) for(let row=0;row<14;row++) {
    const z=-1.21+row*.107+(row>=7?.063:0);
    box(breadboard,.035,.007,.031,.002,dark,-1.60+col*.09,.174,z);
  }
  for(const [z,color] of [[-1.27,'#b66e83'],[-1.06,'#529ab8'],[.06,'#b66e83'],[.28,'#529ab8']]) box(breadboard,2.56,.005,.014,.002,material(color,.07,.52),-.34,.179,z);
  box(host,1.65,.059,.70,.021,dark,-.81,.241,-.40);
  for(const z of [-.72,-.09]) for(let i=0;i<14;i++) cylinder(host,.019,.029,boardGold,-1.53+i*.11,.281,z);
  for(const z of [-.61,-.41,-.21]) tactileCap(host,-1.53,z,.105);
  box(hostUsb,.19,.102,.22,.013,silver,-1.68,.253,-.40);
  box(hostUsb,.27,.153,.25,.018,dark,-1.83,.26,-.40);
  wire(hostUsb,[[-1.96,.26,-.40],[-2.16,.20,-.40],[-2.34,.17,-.37]],.032,dark);
  box(screen,1.03,.071,.47,.012,material('#232a32',.18,.36),-.71,.307,-.40);
  box(screen,.91,.010,.38,.007,material('#243949',.20,.30),-.71,.35,-.40);
  const ink=material('#a9c6d5',.08,.48);
  printedHardwareMarking(screen,'ACCEL',-.71,.356,-.48,.017,ink);
  printedHardwareMarking(screen,'GYRO',-.71,.356,-.39,.017,ink);
  printedHardwareMarking(screen,'MPU6050',-.71,.356,-.30,.015,ink);
  const sensorBoard=new T.Group();
  sensorBoard.position.set(-.16,0,1.42);module.add(sensorBoard);
  const mounts=fourCornerMounts(.82,.55,.064);
  boardPlate(sensorBoard,.82,.55,mounts,material('#144342',.18,.48));
  for(const point of mounts) platedHole(sensorBoard,...point);
  for(let i=0;i<6;i++) for(const side of [-1,1]) platedHole(sensorBoard,-.27+i*.103,side*.216,.022);
  sideSocket(sensorBoard,.37,0,Math.PI/2,{width:.27,depth:.18,height:.12,finish:dark});
  box(sensor,.172,.067,.172,.014,dark,-.16,.115,1.42);
  for(const [i,color] of ['#cf332e','#242629','#e0b931','#267db8'].entries()) {
    const off=(i-1.5)*.048;
    wire(harness,[[.23,.13,1.42+off],[.66,.13,1.38+off],[1.32+off,.16,1.14],[1.65+off,.20,.49],[1.55+off,.24,-.30],[1.02+off,.26,-.78],[-.10+off,.23,-.94]],.017,material(color,.10,.43));
  }
  return model;
}

function gpsDemo() {
  const model=new T.Group();
  const host=group(model,'host'), display=group(model,'display'), module=group(model,'module');
  const patch=group(model,'patch'), cable=group(model,'cable'), usb=group(model,'usb');
  const gpsSocket=group(model,'gps-socket');
  const blue=material('#0477a6',.21,.46);
  box(host,1.62,.066,.70,.037,blue,-.42,.12,-.87);
  squareChip(host,-.16,-.85,.32,7);
  for(const z of [-1.16,-.57]) for(let i=0;i<16;i++) cylinder(host,.020,.018,boardGold,-1.17+i*.095,.159,z);
  sideSocket(host,.34,-.87,Math.PI/2,{width:.29,depth:.18,height:.12,finish:dark});
  controllerUsb(usb,-1.27,-.88,.30,'micro');
  box(usb,.62,.18,.35,.030,dark,-1.73,.136,-.88);
  wire(usb,[[-2.01,.14,-.88],[-2.24,.13,-.89],[-2.45,.13,-.92]],.044,dark);
  box(display,1.62,.071,.76,.039,dark,-.42,.119,-.05);
  box(display,1.04,.079,.43,.012,material('#29303d',.19,.34),-.37,.181,-.043);
  for(const z of [-.36,.27]) for(let i=0;i<16;i++) cylinder(display,.022,.019,boardGold,-1.16+i*.097,.16,z);
  for(const z of [-.28,-.08,.12,.28]) tactileCap(display,-1.12,z,.105);
  box(module,.83,.068,.78,.040,material('#224439',.18,.51),-.10,.113,1.18);
  for(const x of [-.43,.23]) for(const z of [.86,1.50]) make(module,new T.TorusGeometry(.051,.018,9,32),boardGold,x,.155,z).rotation.x=Math.PI/2;
  for(const z of [.91,1.45]) for(let i=0;i<6;i++) cylinder(module,.021,.014,boardGold,-.30+i*.078,.153,z);
  sideSocket(gpsSocket,.29,1.18,Math.PI/2,{width:.27,depth:.18,height:.12,finish:dark});
  box(patch,.37,.083,.36,.016,white,-.10,.177,1.18);
  cylinder(patch,.024,.012,silver,-.10,.227,1.18);
  sideSocket(gpsSocket,-.49,1.18,-Math.PI/2,{width:.27,depth:.18,height:.12,finish:dark});
  printedHardwareMarking(display,'GPS DEMO',-.37,.222,-.12,.020,material('#9aa6d5',.10,.47));
  printedHardwareMarking(display,'POSITION',-.37,.222,-.02,.016,material('#9aa6d5',.10,.47));
  for(const [i,color] of ['#cf362e','#222428','#e6bd2c','#327eb6'].entries()) {
    const off=(i-1.5)*.037;
    wire(cable,[[.41,.14,-.87+off],[.93+off,.15,-.81],[1.38+off,.15,-.43],[1.41+off,.14,.40],[1.22+off,.14,.86],[.84+off,.14,1.13],[.39,.14,1.18+off]],.015,material(color,.08,.47));
  }
  return model;
}

function as5600Breakout() {
  const model=inertialBreakout({
    width:2.23,depth:1.47,chipSize:.45,chipZ:.036,
    front:[-.61,-.37,-.13,.11,.35,.59],rear:[],
    finish:'#2b2c2e',support:[[-.50,-.30],[-.32,.28],[.39,-.30],[.32,.28]],whiteSockets:true,splitSockets:true,marking:'AS5600'
  });
  const chip=model.getObjectByName('chip');
  for(let i=0;i<4;i++) for(const side of [-1,1]) box(chip,.040,.024,.086,.005,bright,.02+(i-1.5)*.098,.080,.036+side*.248);
  return model;
}

function tiltSwitch() {
  const model=new T.Group(), can=group(model,'can'), insulator=group(model,'insulator'), leads=group(model,'leads'), ball=group(model,'ball');
  const profile=[[.207,-.61],[.231,-.59],[.242,-.56],[.242,.57],[.229,.60],[.207,.60],[.207,-.61]];
  make(can,new T.LatheGeometry(profile.map(v=>new T.Vector2(...v)),64),silver,-.30,.25,0).rotation.z=Math.PI/2;
  cylinder(can,.227,.035,silver,-.915,.25,0).rotation.z=Math.PI/2;
  for(const x of [-.878,.279]){
    const lip=make(can,new T.TorusGeometry(.226,.014,10,48),bright,x,.25,0);
    lip.rotation.y=Math.PI/2;
  }
  cylinder(insulator,.200,.045,material('#d4ac68',.08,.52),.30,.25,0).rotation.z=Math.PI/2;
  for(const z of [-.082,.082]) box(leads,.88,.028,.029,.005,boardGold,.75,.25,z);
  for(const z of [-.082,.082]) {
    cylinder(insulator,.046,.011,material('#e4d2a0',.21,.44),.326,.25,z).rotation.z=Math.PI/2;
    box(leads,.15,.025,.027,.004,boardGold,.233,.25,z);
  }
  make(ball,new T.SphereGeometry(.113,36,24),bright,-.50,.15,0);
  return model;
}

function cdsCell() {
  const model=new T.Group(), substrate=group(model,'substrate'), trace=group(model,'trace'), contacts=group(model,'contacts'), leads=group(model,'leads');
  const outline=[[-.28,-.18],[-.20,-.26],[.18,-.26],[.26,-.17],[.26,.19],[.16,.27],[-.19,.27],[-.28,.18]];
  const shape=new T.Shape();
  outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  make(substrate,new T.ExtrudeGeometry(shape,{depth:.141,bevelEnabled:true,bevelThickness:.023,bevelSize:.019,bevelSegments:2}),material('#b96048',.08,.50),0,.37,0);
  make(substrate,new T.ExtrudeGeometry(shape,{depth:.019,bevelEnabled:false}),material('#cac2ad',.07,.57),0,.37,.148);
  const points=[];
  for(let row=0;row<8;row++) {
    const y=.37-.195+row*.055, left=row%2===0;
    points.push([left?-.11:.11,y,.171],[left?.10:-.10,y,.171]);
  }
  points.unshift([-.188,.38,.173]);
  points.push([.188,.38,.173]);
  wire(trace,points,.010,material('#865d4c',.18,.52));
  for(const x of [-.188,.188]) cylinder(contacts,.044,.031,silver,x,.38,.176).rotation.x=Math.PI/2;
  for(const x of [-.166,.166]) wire(leads,[[x,.40,-.01],[x,.42,-.31],[x*1.13,.47,-1.63]],.020,bright);
  return model;
}

function as7341Breakout() {
  const model=inertialBreakout({
    width:2.16,depth:1.47,chipSize:.29,chipZ:.073,
    front:[-.60,-.36,-.12,.12,.36,.60],rear:[],
    finish:'#292b2d',support:[[-.49,-.24],[-.28,-.30],[-.52,.24],[.34,.28]],whiteSockets:true,splitSockets:true,marking:'AS7341'
  });
  const detector=model.getObjectByName('chip'), lamp=group(model,'lamp');
  cylinder(detector,.036,.013,dark,.047,.171,.06);
  box(lamp,.295,.063,.25,.016,white,.21,.104,-.41);
  box(lamp,.198,.012,.164,.012,material('#e4c884',.08,.46),.21,.142,-.41);
  return model;
}

function max4466Microphone() {
  const model=new T.Group();
  const board=group(model,'board'), capsule=group(model,'capsule'), grille=group(model,'grille');
  const pads=group(model,'pads'), amp=group(model,'amp'), trim=group(model,'trim');
  const mounting=group(model,'mounting');
  const outline=[[-.93,-.51],[.89,-.51],[1.00,-.39],[1.00,.39],[.89,.51],[-.93,.51],[-1.03,.39],[-1.03,-.39]];
  const contacts=[-.25,0,.25].map(z=>[.79,z,.051]);
  controllerBoard(board,outline,[...contacts,[-.81,.31,.094]],material('#212225',.17,.52));
  platedHole(mounting,-.81,.31,.108);
  for(const point of contacts) platedHole(pads,...point);
  cylinder(capsule,.47,.34,material('#b8bdc2',.56,.32),-.34,.235,-.045);
  make(capsule,new T.TorusGeometry(.447,.024,12,56),bright,-.34,.403,-.045).rotation.x=Math.PI/2;
  cylinder(grille,.436,.026,material('#191a1c',.08,.72),-.34,.413,-.045);
  for(let i=-5;i<=5;i++) {
    const offset=i*.069;
    const length=2*Math.sqrt(.414**2-offset**2);
    cylinder(grille,.004,length,material('#3a3b3d',.08,.63),-.34+offset,.429,-.045).rotation.x=Math.PI/2;
    cylinder(grille,.004,length,material('#303134',.08,.65),-.34,.434,-.045+offset).rotation.z=Math.PI/2;
  }
  for(const [z,label] of [[-.25,'OUT'],[0,'GND'],[.25,'VCC']]) {
    printedHardwareMarking(board,label,.56,.069,z,.011,white);
  }
  printedHardwareMarking(board,'MAX4466',.43,.069,.38,.013,white);
  const underside=new T.Group();
  underside.rotation.x=Math.PI;
  amp.add(underside);
  surfaceChip(underside,.06,.11,.25,.19,3);
  box(trim,.26,.132,.24,.019,dark,.49,-.070,-.16);
  cylinder(trim,.082,.035,material('#c5a365',.44,.40),.49,-.144,-.16);
  box(trim,.113,.008,.017,.003,dark,.49,-.166,-.16);
  return model;
}

function mpr121Breakout() {
  const model=new T.Group();
  const board=group(model,'board'), chip=group(model,'chip'), electrodes=group(model,'electrodes');
  const pads=group(model,'pads'), left=group(model,'left-socket'), right=group(model,'right-socket');
  const mounting=group(model,'mounting');
  const edge=Array.from({length:13},(_,i)=>[-1.24+i*.205,-.68,.037]);
  const host=Array.from({length:7},(_,i)=>[-.79+i*.234,.59,.043]);
  const mounts=[[-1.26,.59,.112],[1.26,.59,.112]];
  boardPlate(board,2.86,1.57,[...edge,...host,...mounts],material('#242629',.18,.51));
  for(const point of edge) platedHole(electrodes,...point);
  for(const point of host) platedHole(pads,...point);
  for(const point of mounts) platedHole(mounting,...point);
  squareChip(chip,.025,.015,.37,6);
  sideSocket(left,-1.12,.02,-Math.PI/2,{width:.49,depth:.32,height:.23});
  sideSocket(right,1.12,.02,Math.PI/2,{width:.49,depth:.32,height:.23});
  for(let i=0;i<12;i++) printedHardwareMarking(board,String(i),-1.24+i*.205,.069,-.52,.011,white);
  printedHardwareMarking(board,'GND',1.22,.069,-.52,.010,white);
  printedHardwareMarking(board,'MPR121',0,.069,-.36,.021,white);
  for(const [x,z] of [[-.57,.30],[-.71,-.29],[-.41,-.31],[.32,.25],[.43,-.26],[.64,.33]]) box(board,.139,.056,.084,.009,white,x,.097,z);
  surfaceChip(board,-.67,.10,.23,.17,3);
  surfaceChip(board,.70,.06,.19,.15,3);
  return model;
}

function beamLoadCell() {
  const model=new T.Group();
  const beam=group(model,'beam'), mounting=group(model,'mounting'), cover=group(model,'cover'), leads=group(model,'leads');
  const section=new T.Shape().moveTo(-1.22,-.196).lineTo(1.22,-.196).lineTo(1.22,.196).lineTo(-1.22,.196).closePath();
  const aperture=new T.Path();aperture.absellipse(0,0,.32,.133,0,Math.PI*2,true);section.holes.push(aperture);
  make(beam,new T.ExtrudeGeometry(section,{depth:.38,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:2,curveSegments:34}),material('#c3c7ca',.44,.39),.53,.248,-.19);
  for(const x of [-.44,-.04,1.18,1.59]) {
    cylinder(mounting,.070,.012,dark,x,.450,0);
    for(let ring=0;ring<3;ring++) make(mounting,new T.TorusGeometry(.051+ring*.009,.003,7,30),bright,x,.458+ring*.002,0).rotation.x=Math.PI/2;
  }
  box(beam,.017,.239,.24,.004,material('#dac75b',.10,.54),1.757,.252,0);
  box(beam,.020,.035,.098,.003,dark,1.768,.254,0);
  box(cover,.64,.020,.34,.006,white,.54,.456,0);
  const sideLegend=new T.Group();
  sideLegend.position.set(.53,.25,.201);
  sideLegend.rotation.x=Math.PI/2;
  cover.add(sideLegend);
  printedHardwareMarking(sideLegend,'LOAD CELL',0,0,0,.012,material('#515452',.12,.61));
  for(const [i,color] of ['#c13b39','#258875','#28292c','#e3ded0'].entries()) {
    const off=(i-1.5)*.048;
    wire(leads,[[-.68,.31,off],[-1.10,.22,-.45+off],[-1.70,.15,-.55+off],[-2.04,.095,-.28+off],[-2.07,.073,.21+off],[-1.65,.071,.52+off],[-1.07,.078,.48+off]],.015,material(color,.08,.44));
    wire(leads,[[-1.07,.078,.48+off],[-.98,.081,.47+off]],.007,silver);
  }
  return model;
}

function flexStrip() {
  const model=new T.Group();
  const backing=group(model,'backing'), track=group(model,'track'), electrodes=group(model,'electrodes'), tails=group(model,'tails');
  const amber=material('#a74716',.29,.38);
  box(backing,3.32,.029,.31,.013,amber,-.03,0,0);
  cylinder(backing,.155,.029,amber,1.63,0,0);
  box(track,2.56,.011,.242,.005,material('#252426',.07,.57),.31,.019,0);
  cylinder(track,.121,.011,dark,1.59,.019,0);
  for(let i=0;i<23;i++) box(electrodes,.055,.006,.232,.002,bright,-.935+i*.111,.027,0);
  for(const z of [-.089,.089]) {
    box(electrodes,.63,.008,.061,.003,bright,-1.35,.025,z);
    box(tails,.31,.017,.039,.005,bright,-1.82,0,z);
  }
  return model;
}

function soilMoistureDemo() {
  const model=new T.Group();
  const pot=group(model,'pot'), soil=group(model,'soil'), plant=group(model,'plant');
  const probe=group(model,'probe'), circuit=group(model,'circuit'), cable=group(model,'cable');
  const terracotta=material('#866553',.02,.88);
  const profile=[[0,0],[.47,0],[.51,.026],[.53,.068],[.56,.23],[.59,.43],[.64,.68],
    [.68,.91],[.70,1.012],[.73,1.07],[.733,1.113],[.716,1.14],[.646,1.14],[.628,1.10],
    [.615,1.034],[.582,.79],[.54,.54],[.49,.23],[.46,.10],[0,.10]];
  const potGeometry=new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),96);
  const clayVertices=potGeometry.getAttribute('position');
  const clayColors=[];
  const clayColor=new T.Color();
  for(let i=0;i<clayVertices.count;i++){
    const x=clayVertices.getX(i),y=clayVertices.getY(i),z=clayVertices.getZ(i);
    const shade=.91+.066*Math.sin(y*72+Math.sin(x*15+z*11))+.048*Math.sin(x*74+y*105-z*92);
    clayColor.setScalar(shade);
    clayColors.push(clayColor.r,clayColor.g,clayColor.b);
  }
  potGeometry.setAttribute('color',new T.Float32BufferAttribute(clayColors,3));
  terracotta.vertexColors=true;
  make(pot,potGeometry,terracotta,-.91,0,0);
  cylinder(soil,.634,.10,material('#36261c',.01,.93),-.91,.99,0);
  const stone=material('#b19c81',.02,.87);
  for(let i=0;i<34;i++) {
    const a=i*2.4,r=.59*Math.sqrt(i/34);
    make(soil,new T.DodecahedronGeometry(.013+(i%4)*.005),stone,-.91+Math.cos(a)*r,1.043,Math.sin(a)*r);
  }
  const stem=material('#687440',.02,.77);
  wire(plant,[[-1.02,1.04,0],[-1.11,1.35,.015],[-1.05,1.66,0],[-1.12,1.96,-.025]],.048,stem);
  for(let i=0;i<12;i++) {
    const a=i*2.4,r=.21+(i%3)*.037,y=1.27+Math.floor(i/2)*.126;
    const leaf=make(plant,new T.SphereGeometry(1,24,14),material(i%3===0?'#75913e':'#91ab50',.02,.58),-1.09+Math.cos(a)*r,y,Math.sin(a)*r);
    leaf.scale.set(.28,.048,.115);leaf.rotation.set(0,-a,.18);
  }
  const sensor=group(probe,'probe-pcb');
  sensor.position.set(-.42,1.27,.23);sensor.rotation.set(.16,0,-.36);
  box(sensor,.27,.81,.036,.009,material('#168963',.12,.54),0,0,0);
  for(const x of [-.07,.07]) wire(sensor,[[x,-.33,.023],[x,.06,.023],[x*.43,.13,.023],[x*.43,.23,.023]],.009,white);
  box(sensor,.12,.12,.05,.008,dark,.01,.27,.023);
  box(sensor,.16,.092,.096,.012,white,0,.38,.03);
  printedHardwareMarking(circuit,'METRO',.19,.067,.17,.023,white);
  const finish=material('#222326',.14,.60);
  boardPlate(circuit,1.32,.89,[[-.53,-.32,.035],[.53,.32,.035]],finish);
  circuit.position.set(1.02,.018,.46);
  box(circuit,.29,.16,.27,.014,silver,-.45,.13,-.19);
  box(circuit,.24,.18,.23,.018,dark,-.47,.133,.24);
  for(const z of [-.32,.32]) {
    box(circuit,.92,.14,.11,.012,dark,.12,.13,z);
    for(let i=0;i<9;i++) box(circuit,.025,.026,.026,.004,bright,-.26+i*.089,.207,z);
  }
  surfaceChip(circuit,.14,.02,.25,.24,5);
  for(const [i,color] of ['#d83a38','#252628','#e9e6d9','#128579'].entries()) {
    const d=(i-1.5)*.039;
    wire(cable,[[-.28+d,1.62,.27],[-.07+d,1.97,.24],[.51+d,2.15,.12],[1.16+d,1.97,.10],[1.48+d,1.52,.16],[1.32+d,.76,.19],[.82+d,.20,.18]],.018,material(color,.06,.51));
  }
  return model;
}

function contactlessLevelKit() {
  const model=new T.Group();
  const pad=group(model,'pad'), cable=group(model,'cable'), plug=group(model,'plug');
  const board=group(model,'board'), input=group(model,'input'), output=group(model,'output'), trim=group(model,'trim'), tool=group(model,'tool'), jumpers=group(model,'jumpers');
  const ivory=material('#c9c9bd',.05,.56);
  cylinder(pad,.41,.121,ivory,-1.39,.113,-.51);
  cylinder(pad,.392,.018,white,-1.39,.18,-.51);
  const coil=Array.from({length:97},(_,i)=>{
    const f=i/96,a=-2.6+f*5*Math.PI,r=.72+.26*(1-f);
    return [-.40+Math.cos(a)*r,.082+f*.1,.18+Math.sin(a)*r];
  });
  wire(cable,[[-1.04,.117,-.62],...coil,[-1.13,.10,.97],[-1.50,.10,.92]],.056,dark);
  box(plug,.25,.17,.34,.022,white,-1.63,.105,.90);
  for(let i=0;i<4;i++) box(plug,.039,.026,.052,.004,bright,-1.744,.195,.789+i*.074);
  boardPlate(board,.79,.74,[[.25,.24,.056],[.25,-.24,.056]],material('#232324',.13,.54));
  surfaceChip(board,.03,0,.16,.18,3);
  for(const z of [-.24,.24]) platedHole(board,.25,z,.057);
  sideSocket(input,-.29,0,Math.PI/2,{pins:4,width:.34,depth:.18,height:.14});
  sideSocket(output,.29,0,-Math.PI/2,{pins:3,width:.31,depth:.18,height:.14});
  cylinder(trim,.081,.045,ivory,-1.39,.036,-.51);
  cylinder(trim,.044,.023,bright,-1.39,.012,-.51);
  box(trim,.070,.006,.014,.003,dark,-1.39,-.001,-.51);
  for(const part of [board,input,output]) part.position.set(1.31,0,.62);
  const cyan=material('#148ba7',.12,.37);
  const handle=cylinder(tool,.067,.54,cyan,1.03,.098,-.36);handle.rotation.x=Math.PI/2;
  const shaft=cylinder(tool,.025,.52,silver,1.03,.098,-.88);shaft.rotation.x=Math.PI/2;
  box(tool,.065,.027,.052,.005,bright,1.03,.098,-1.14);
  for(const [i,color] of ['#222222','#b35623','#4d9745','#2096b1'].entries()) {
    const x=1.45+i*.056;
    wire(jumpers,[[x,.058,-.41],[x+.02,.105,-.78],[x-.015,.072,-1.15]],.018,material(color,.04,.51));
    for(const z of [-.40,-1.13]) box(jumpers,.047,.058,.095,.006,dark,x,.059,z);
  }
  return model;
}

function waterFlowMeter() {
  const model=new T.Group();
  const passage=group(model,'passage'), inlet=group(model,'inlet'), outlet=group(model,'outlet');
  const cap=group(model,'cap'), harness=group(model,'harness'), connector=group(model,'connector');
  const rotor=group(model,'rotor');
  const polymer=material('#262629',.12,.54), ridge=material('#38383b',.12,.50);
  const tube=(part,r,len,x)=> {
    const section=new T.Shape();section.absarc(0,0,r,0,Math.PI*2,false);
    const hollow=new T.Path();hollow.absarc(0,0,r*.70,0,Math.PI*2,true);section.holes.push(hollow);
    const mesh=make(part,new T.ExtrudeGeometry(section,{depth:len,bevelEnabled:false,curveSegments:40}),polymer,x,.44,.02);
    mesh.rotation.y=Math.PI/2;
  };
  tube(passage,.33,1.32,-.18);
  for(const [part,x] of [[inlet,-.52],[outlet,1.14]]) {
    tube(part,.286,.34,x);
    for(let i=0;i<8;i++) make(part,new T.TorusGeometry(.286,.012,8,40),ridge,x+.021+i*.042,.44,.02).rotation.y=Math.PI/2;
  }
  cylinder(cap,.49,.22,polymer,.48,.49,.08);
  cap.position.y=.21;
  make(cap,new T.TorusGeometry(.467,.022,10,64),ridge,.48,.604,.08).rotation.x=Math.PI/2;
  cylinder(cap,.126,.03,ridge,.48,.62,.08);
  const arrow=new T.Shape().moveTo(-.10,-.022).lineTo(.012,-.022).lineTo(.012,-.048)
    .lineTo(.084,0).lineTo(.012,.048).lineTo(.012,.022).lineTo(-.10,.022).closePath();
  make(cap,new T.ExtrudeGeometry(arrow,{depth:.012,bevelEnabled:false}),ridge,.48,.605,-.24).rotation.x=-Math.PI/2;
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    const rib=box(cap,.30,.026,.027,.01,ridge,.48+.281*Math.cos(a),.614,.08+.281*Math.sin(a));rib.rotation.y=-a;
  }
  for(let i=0;i<6;i++) {
    const angle=i*Math.PI/3;
    cylinder(cap,.025,.009,dark,.48+.414*Math.cos(angle),.613,.08+.414*Math.sin(angle));
  }
  const sheath=[[-2.18,.09,-.65],[-2.24,.08,.28],[-1.92,.085,1.00],[-1.24,.085,1.17],[-.38,.084,1.12],[.19,.095,.93]];
  wire(harness,sheath,.063,polymer);
  for(const [i,color] of ['#aa272e','#d1a532','#232427'].entries()){
    const o=(i-1)*.037;
    wire(harness,[[.15,.095,.96+o],[.33+o,.13,.84],[.49+o,.22,.52]],.018,material(color,.05,.44));
  }
  box(connector,.24,.17,.32,.026,polymer,-2.18,.109,-.76);
  box(connector,.115,.025,.19,.008,ridge,-2.18,.20,-.80);
  const rotorFinish=material('#a1a0a2',.18,.47);
  cylinder(rotor,.075,.17,silver,.48,.41,.08);
  for(let i=0;i<6;i++) {
    const angle=i*Math.PI/3;
    const blade=box(rotor,.18,.10,.036,.006,rotorFinish,.48+.15*Math.cos(angle),.40,.08+.15*Math.sin(angle));
    blade.rotation.y=-angle+.22;
  }
  return model;
}

function analogPhKit() {
  const model=new T.Group();
  const handle=group(model,'handle'), tip=group(model,'tip'), collar=group(model,'collar'), guard=group(model,'guard');
  const strainRelief=group(model,'strain-relief'), cable=group(model,'cable'), bnc=group(model,'bnc');
  const acrylic=new T.MeshPhysicalMaterial({color:'#14a2d1',metalness:.06,roughness:.22,transmission:.48,thickness:.16});
  const glass=new T.MeshPhysicalMaterial({color:'#b5eaff',roughness:.13,transmission:.64,thickness:.08});
  for(const part of [handle,tip,collar,guard,strainRelief]) part.position.set(0,.23,.33);
  axial(handle,.113,1.93,acrylic,.10);
  axial(handle,.047,1.74,material('#178bb1',.22,.37),.16);
  axial(tip,.064,.46,glass,1.24);
  make(tip,new T.SphereGeometry(.066,24,12),glass,1.48,0,0).scale.x=1.24;
  axial(collar,.142,.111,dark,1.04);
  axial(collar,.158,.178,acrylic,1.16);
  for(let i=0;i<8;i++) make(collar,new T.TorusGeometry(.157,.006,6,36),bright,1.08+i*.023,0,0).rotation.y=Math.PI/2;
  make(guard,new T.CylinderGeometry(.124,.124,.47,48,1,true),acrylic,1.42,0,0).rotation.z=Math.PI/2;
  make(guard,new T.TorusGeometry(.122,.012,8,36),glass,1.65,0,0).rotation.y=Math.PI/2;
  axial(strainRelief,.133,.46,material('#d2c393',.03,.51),-1.09);
  for(let i=0;i<4;i++) make(strainRelief,new T.TorusGeometry(.079+i*.012,.010,7,28),white,-1.32+i*.044,0,0).rotation.y=Math.PI/2;
  wire(cable,[[-1.29,.23,.33],[-1.66,.115,.45],[-1.68,.066,.76],[-1.17,.071,.96],[-.29,.084,.98],[.75,.080,.71],[.59,.084,.54],[-.41,.093,.76],[-.95,.084,1.14],[-.31,.078,1.20],[.50,.097,1.05]],.036,material('#222125',.06,.43));
  bnc.position.set(.54,.107,1.05);
  axial(bnc,.075,.35,dark,.12);
  axial(bnc,.103,.25,silver,.38);
  axial(bnc,.117,.052,bright,.49);
  axial(bnc,.026,.052,boardGold,.52);
  for(const z of [-.11,.11]) box(bnc,.082,.056,.052,.01,silver,.42,0,z);
  for(const [id,color,x,z] of [['acid','#ad2d69',-.93,-.58],['neutral','#349753',.31,-.64]]) {
    const buffers=group(model,id);
    for(const dx of [-.23,.23]) {
      cylinder(buffers,.176,.37,glass,x+dx,.19,z);
      cylinder(buffers,.179,.113,material(color,.07,.59),x+dx,.16,z);
      const label=new T.Group();
      label.position.set(x+dx,.16,z+.18);
      label.rotation.x=Math.PI/2;
      buffers.add(label);
      printedHardwareMarking(label,id==='acid'?'PH 4':'PH 7',0,.001,0,.012,white);
      cylinder(buffers,.181,.112,white,x+dx,.414,z);
      for(let i=0;i<36;i++){
        const a=i*Math.PI/18;
        box(buffers,.019,.09,.018,.004,white,x+dx+.176*Math.cos(a),.415,z+.176*Math.sin(a));
      }
    }
  }
  return model;
}

function mq2Module() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), mounting=group(model,'mounting'), socket=group(model,'socket');
  const can=group(model,'can'), mesh=group(model,'mesh'), status=group(model,'status');
  const holes=[[-.58,-.47,.123],[.58,-.47,.123],[-.58,.47,.123],[.58,.47,.123]];
  controllerBoard(pcb,[[-.74,-.54],[-.62,-.65],[.61,-.65],[.74,-.54],[.74,.54],[.62,.65],[-.61,.65],[-.74,.54]],holes,material('#1c2021',.12,.54));
  for(const hole of holes) platedHole(mounting,...hole);
  sideSocket(socket,.47,-.19,Math.PI/2,{pins:3,width:.47,depth:.34,height:.23});
  cylinder(can,.423,.21,silver,-.14,.18,.018);
  for(const y of [.114,.273,.31]) make(can,new T.TorusGeometry(.411,.017,10,56),bright,-.14,y,.018).rotation.x=Math.PI/2;
  const profile=[[.401,.32],[.396,.50],[.357,.70],[.290,.82],[.211,.867],[.10,.89],[0,.895]];
  make(mesh,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),material('#a5a49b',.61,.56),-.14,0,.018);
  const filaments=material('#c3c1b8',.71,.44);
  for(const [r,y] of profile.slice(0,-1)) for(const shift of [.006,.023]) {
    make(mesh,new T.TorusGeometry(r,.003,5,64),filaments,-.14,y+shift,.018).rotation.x=Math.PI/2;
  }
  for(let i=0;i<112;i++){
    const a=i*Math.PI/56;
    wire(mesh,profile.map(([r,y],j)=>[-.14+(r+.001)*Math.cos(a+j*.015),y,.018+(r+.001)*Math.sin(a+j*.015)]),.0029,filaments);
  }
  box(status,.145,.064,.127,.009,material("#e4dfcb",.08,.43),-.52,.10,.29);
  box(status,.061,.018,.061,.004,material('#c8a759',.15,.46),-.52,.14,.29);
  printedHardwareMarking(pcb,'MQ2',.27,.068,.44,.022,white);
  return model;
}

function gravityFlameModule() {
  const model=new T.Group();
  const board=group(model,'board'), mounts=group(model,'mounts'), socket=group(model,'socket');
  const detector=group(model,'detector'), leads=group(model,'leads'), passives=group(model,'passives');
  const holes=[[-.68,-.31,.132],[-.68,.31,.132]];
  controllerBoard(board,[[-.93,-.28],[-.78,-.51],[.70,-.51],[.88,-.32],[.88,.35],[.70,.52],[-.80,.52],[-.93,.29]],holes,material('#212224',.17,.53));
  for(const hole of holes) platedHole(mounts,...hole);
  sideSocket(socket,.51,0,-Math.PI/2,{pins:3,width:.57,depth:.41,height:.26});
  const epoxy=material('#171719',.14,.19);
  detector.position.set(0,.185,0);
  axial(detector,.109,.43,epoxy,-.76);
  axial(detector,.127,.054,dark,-.53);
  make(detector,new T.SphereGeometry(.109,36,18),epoxy,-.975,0,0).scale.x=.63;
  for(const z of [-.067,.067]) {
    wire(leads,[[-.54,.185,z],[-.40,.185,z],[-.35,.11,z]],.017,bright);
    cylinder(leads,.041,.022,boardGold,-.35,.075,z);
  }
  for(const [x,z] of [[.03,-.17],[.13,.20],[-.17,.12]]) {
    box(passives,.09,.043,.054,.006,dark,x,.087,z);
    for(const dx of [-.038,.038]) box(passives,.016,.043,.056,.003,bright,x+dx,.088,z);
  }
  printedHardwareMarking(board,'FLAME SENSOR',.10,.068,.40,.014,white);
  return model;
}

function gravityPressureTransducer() {
  const model=new T.Group();
  const body=group(model,'body'), flats=group(model,'flats'), thread=group(model,'thread'), port=group(model,'port');
  const gland=group(model,'gland'), cable=group(model,'cable'), leads=group(model,'leads');
  const probe=new T.Group();
  probe.position.set(.04,.27,-.26);probe.rotation.y=.64;
  model.add(probe);
  for(const part of [body,flats,thread,port,gland]) probe.add(part);
  axial(body,.235,.68,silver,-.17);
  axial(body,.237,.25,material('#4a4b45',.28,.59),-.19);
  axial(body,.240,.071,bright,-.17);
  make(flats,new T.CylinderGeometry(.281,.281,.42,6),silver,.34,0,0).rotation.z=Math.PI/2;
  axial(thread,.194,.36,silver,.72);
  const helix=Array.from({length:156},(_,i)=>{
    const a=i/155*Math.PI*18;
    return [.56+i/155*.305,Math.cos(a)*.193,Math.sin(a)*.193];
  });
  wire(thread,helix,.014,bright);
  const face=new T.Shape();
  face.absarc(0,0,.191,0,Math.PI*2,false);
  const bore=new T.Path();
  bore.absarc(0,0,.063,0,Math.PI*2,true);
  face.holes.push(bore);
  make(port,new T.ExtrudeGeometry(face,{depth:.034,bevelEnabled:false,curveSegments:32}),bright,.89,0,0).rotation.y=Math.PI/2;
  axial(port,.061,.015,dark,.897);
  axial(gland,.167,.17,silver,-.55);
  make(gland,new T.CylinderGeometry(.128,.151,.16,6),silver,-.68,0,0).rotation.z=Math.PI/2;
  axial(gland,.083,.12,dark,-.78);
  const loops=Array.from({length:100},(_,i)=>{
    const f=i/99,a=.25+f*Math.PI*5.2;
    return [Math.cos(a)*(1.11+f*.26),.064+.098*(1-f),.04+Math.sin(a)*(.84+f*.25)];
  });
  wire(cable,[[-.62,.27,.25],[-.91,.09,.52],...loops,[.88,.07,.94],[1.22,.07,.89]],.055,material('#232427',.07,.52));
  for(const [i,color] of ['#a74632','#242626','#a98036'].entries()){
    const z=.88+(i-1)*.043;
    wire(leads,[[1.20,.07,z],[1.39,.068,z-.015],[1.52,.071,z-.11]],.012,material(color,.03,.51));
    box(leads,.15,.047,.039,.006,dark,1.58,.07,z-.11);
  }
  return model;
}

function ina260PowerMonitor() {
  const model=new T.Group();
  const board=group(model,'board'), ic=group(model,'ic'), header=group(model,'header'), jumpers=group(model,'jumpers');
  const plus=group(model,'plus'), minus=group(model,'minus'), mounts=group(model,'mounts');
  const busJumper=group(model,'bus-jumper');
  const pads=Array.from({length:8},(_,i)=>[-.86,-.83+i*.235,.057]);
  const holes=[[.86,-.85,.126],[.86,.85,.126]];
  const outline=[[-1.08,-.91],[-.94,-1.07],[.95,-1.07],[1.08,-.91],[1.08,.91],[.94,1.07],[-.95,1.07],[-1.08,.91]];
  controllerBoard(board,outline,[...pads,...holes],material('#0759ac',.20,.40));
  for(const point of pads) platedHole(header,...point);
  for(const point of holes) platedHole(mounts,...point);
  surfaceChip(ic,-.20,0,.44,.46,10);
  const block=material('#333234',.16,.54);
  for(const [part,z] of [[plus,-.255],[minus,.255]]) {
    box(part,.85,.46,.51,.036,block,.57,.296,z);
    cylinder(part,.167,.023,material('#858b90',.38,.47),.54,.528,z);
    cylinder(part,.135,.027,material('#c5c8c9',.54,.32),.54,.546,z);
    const slot=box(part,.209,.007,.03,.002,dark,.54,.563,z);
    slot.rotation.y=.72;
    const entry=cylinder(part,.111,.020,dark,1.004,.27,z);entry.rotation.z=Math.PI/2;
    const contact=cylinder(part,.073,.020,boardGold,1.016,.27,z);contact.rotation.z=Math.PI/2;
  }
  for(const [part,x,z] of [[jumpers,-.50,-.72],[jumpers,-.05,-.72],[busJumper,-.23,.62]]) {
    box(part,.185,.016,.26,.007,white,x,.075,z);
    for(const dx of [-.041,.041]) box(part,.052,.014,.13,.003,boardGold,x+dx,.09,z);
  }
  for(const z of [-.37,-.13,.26,.44]) {
    box(board,.14,.035,.08,.005,white,-.55,.088,z);
    for(const dx of [-.055,.055]) box(board,.026,.038,.081,.003,bright,-.55+dx,.089,z);
  }
  printedHardwareMarking(board,'INA260',.06,.068,.77,.022,white);
  printedHardwareMarking(board,'POWER SENSOR',.06,.068,.96,.012,white);
  printedHardwareMarking(board,'VIN+',.55,.068,-.67,.022,white);
  printedHardwareMarking(board,'VIN-',.55,.068,.68,.022,white);
  return model;
}

function us5881HallSwitch() {
  const model=new T.Group();
  const packageBody=group(model,'package');
  const profile=new T.Shape().moveTo(-.47,-.40).lineTo(.47,-.40).lineTo(.47,.23)
    .lineTo(.33,.40).lineTo(-.33,.40).lineTo(-.47,.23).closePath();
  make(packageBody,new T.ExtrudeGeometry(profile,{depth:.25,bevelEnabled:true,bevelSize:.040,bevelThickness:.035,bevelSegments:3}),material('#222226',.09,.60),0,.245,-.78).rotation.x=-Math.PI/2;
  printedHardwareMarking(packageBody,'U58',0,.536,-.78,.041,material('#77777b',.13,.57));
  for(const [id,x,len] of [['power',-.30,1.72],['ground',0,1.76],['signal',.30,1.81]]) {
    const lead=group(model,id);
    box(lead,.13,.053,.28,.008,bright,x,.154,-.31);
    box(lead,.083,.044,len,.007,silver,x,.154,-.18+len/2);
  }
  return model;
}

function oxygenSensorKit() {
  const model=new T.Group();
  const cell=group(model,'cell'), membrane=group(model,'membrane'), pins=group(model,'pins');
  const board=group(model,'board'), sockets=group(model,'sockets'), components=group(model,'components');
  const receptacles=group(model,'receptacles');
  const wires=group(model,'wires'), plugs=group(model,'plugs');
  const can=material('#363632',.42,.57);
  cylinder(cell,.50,.89,can,-.31,.54,-.72);
  for(const y of [.111,.972]) make(cell,new T.TorusGeometry(.485,.020,12,54),silver,-.31,y,-.72).rotation.x=Math.PI/2;
  cylinder(cell,.441,.035,dark,-.31,.994,-.72);
  cylinder(membrane,.222,.014,material('#e6e3d8',.03,.81),-.31,1.016,-.72);
  make(membrane,new T.TorusGeometry(.235,.014,10,48),dark,-.31,1.016,-.72).rotation.x=Math.PI/2;
  for(const [x,z] of [[-.57,-.70],[-.21,-.95],[-.18,-.46]]) cylinder(pins,.032,.125,boardGold,x,.073,z);
  const holes=[[-.58,-.47,.084],[.58,-.47,.084],[-.58,.47,.084],[.58,.47,.084]];
  for(const part of [board,sockets,components,receptacles]) part.position.set(-.65,.016,.63);
  boardPlate(board,1.35,1.10,holes,material('#212321',.11,.59));
  for(const hole of holes) platedHole(board,...hole);
  sideSocket(sockets,-.45,.13,Math.PI/2,{pins:4,width:.43,depth:.29,height:.18});
  for(const [x,z] of [[-.10,-.18],[.17,.12],[-.19,.30]]) {
    make(receptacles,new T.TorusGeometry(.029,.012,8,24),boardGold,x,.078,z).rotation.x=Math.PI/2;
    cylinder(receptacles,.022,.008,dark,x,.069,z);
  }
  for(const [x,z] of [[.13,-.15],[.20,.22],[-.09,-.32]]) surfaceChip(components,x,z,.19,.14,3);
  for(let i=0;i<12;i++){
    const x=.19+(i%4)*.079,z=.38-Math.floor(i/4)*.093;
    box(components,.044,.033,.040,.004,i%2?boardGold:white,x,.088,z);
  }
  for(const [i,color] of ['#dd4834','#df7353','#202326','#2781a8'].entries()) {
    const coil=Array.from({length:75},(_,j)=>{
      const f=j/74,a=-1.5+f*4.8*Math.PI,r=.46+(i-1.5)*.038;
      return [.85+Math.cos(a)*r,.065+f*.066,.35+Math.sin(a)*r];
    });
    wire(wires,coil,.022,material(color,.03,.52));
    const [x,y,z]=coil.at(-1);
    box(plugs,.089,.071,.145,.008,dark,x,y,z+.06);
  }
  return model;
}

function cameraModuleThreeDemo() {
  const model=new T.Group();
  const pcb=group(model,'camera-board'), lens=group(model,'lens'), focus=group(model,'focus'), ribbon=group(model,'ribbon');
  const host=group(model,'host'), csi=group(model,'csi'), ports=group(model,'ports');
  const cameraSocket=group(model,'camera-socket');
  const green=material('#137d51',.18,.46), lensGlass=material('#183641',.39,.13);
  const cameraHoles=[[-.30,-.29,.052],[.30,-.29,.052],[-.30,.29,.052],[.30,.29,.052]];
  boardPlate(pcb,.79,.77,cameraHoles,green);
  for(const hole of cameraHoles) platedHole(pcb,...hole);
  for(const x of [-.18,.10,.18]) box(pcb,.063,.036,.051,.005,white,x,.087,.27);
  box(focus,.425,.21,.402,.035,dark,0,.185,-.043);
  cylinder(lens,.143,.058,dark,0,.311,-.043);
  cylinder(lens,.094,.017,lensGlass,0,.342,-.043);
  sideSocket(cameraSocket,.23,0,Math.PI/2,{width:.43,depth:.19,height:.10,pins:15});
  for(const part of [pcb,focus,lens,cameraSocket]) part.position.set(-1.49,.035,.59);
  const hostHoles=[[-1.02,-.57,.054],[1.02,-.57,.054],[-1.02,.57,.054],[1.02,.57,.054]];
  boardPlate(host,2.30,1.36,hostHoles,green);
  for(const hole of hostHoles) platedHole(host,...hole);
  box(host,.39,.075,.39,.018,silver,-.29,.11,.01);
  surfaceChip(host,.26,-.016,.35,.32,5);
  for(let i=0;i<20;i++) for(const z of [-.52,-.61]) box(host,.033,.14,.033,.004,boardGold,-.91+i*.084,.135,z);
  for(const [x,z] of [[-.74,.31],[-.54,.43],[.14,.47],[.27,-.30],[.49,.08]]) surfaceChip(host,x,z,.117,.10,3);
  for(const [z,w,h] of [[-.45,.40,.40],[0,.39,.45],[.45,.39,.45]]) {
    box(ports,.49,h,w,.025,silver,.94,.068+h/2,z);
    for(const y of (z<0?[.23]:[.18,.36])) {
      box(ports,.015,.105,w*.74,.006,dark,1.188,y,z);
      box(ports,.018,.026,w*.56,.004,z===0?boardBlue:dark,1.20,y-.014,z);
    }
  }
  for(const x of [-.85,-.53,-.20]) box(ports,.214,.105,.157,.014,silver,x,.119,.663);
  box(csi,.15,.108,.42,.009,white,.39,.122,.49);
  box(csi,.05,.09,.415,.008,dark,.47,.138,.49);
  for(const part of [host,csi,ports]) part.position.set(.44,.04,-.41);
  const path=new T.CatmullRomCurve3([[-1.37,.107,.59],[-1.08,.16,.52],[-.76,.40,.37],[-.44,.74,.22],[-.07,.88,.07],[.42,.76,.02],[.76,.39,.07],[.82,.17,.08]].map(p=>new T.Vector3(...p)));
  const coords=[],indices=[];
  for(let i=0;i<=48;i++){
    const p=path.getPoint(i/48);
    for(const z of [-.175,.175]) coords.push(p.x,p.y,p.z+z);
    const j=2*i;
    if(i<48) indices.push(j,j+2,j+1,j+1,j+2,j+3);
  }
  const film=new T.BufferGeometry();
  film.setAttribute('position',new T.Float32BufferAttribute(coords,3));
  film.setIndex(indices);film.computeVertexNormals();
  make(ribbon,film,new T.MeshStandardMaterial({color:'#f6f3e8',roughness:.59,side:T.DoubleSide}));
  for(let i=0;i<18;i++){
    const p=path.getPoint(.13+i*.040),t=path.getTangent(.13+i*.040);
    const line=box(ribbon,.013,.006,.19,.002,boardBlue,p.x,p.y+.005,p.z);
    line.rotation.z=Math.atan2(t.y,t.x);
  }
  return model;
}

function mlx90640ThermalArray() {
  const model=new T.Group();
  const board=group(model,'board'), housing=group(model,'housing'), optics=group(model,'optics');
  const pins=group(model,'pins'), left=group(model,'left-socket'), right=group(model,'right-socket'), mounts=group(model,'mounts');
  const pads=[-.54,-.27,0,.27,.54].map(x=>[x,.52,.047]);
  const holes=[[-1.07,-.56,.132],[1.07,-.56,.132],[-1.07,.56,.132],[1.07,.56,.132]];
  controllerBoard(board,[[-1.23,-.56],[-1.10,-.72],[1.10,-.72],[1.23,-.56],[1.23,.56],[1.10,.72],[-1.10,.72],[-1.23,.56]], [...pads,...holes],material('#252525',.13,.56));
  for(const hole of holes) platedHole(mounts,...hole);
  for(const pad of pads) platedHole(pins,...pad);
  cylinder(housing,.435,.057,silver,0,.104,-.075);
  make(housing,new T.CylinderGeometry(.389,.419,.65,64,1,true),material('#1e1e21',.38,.36),0,.446,-.075);
  for(const [y,r] of [[.62,.393],[.69,.405],[.779,.373]]) make(housing,new T.TorusGeometry(r,.026,9,56),dark,0,y,-.075).rotation.x=Math.PI/2;
  for(let i=0;i<5;i++) make(optics,new T.TorusGeometry(.260-i*.016,.016,9,56),dark,0,.770-i*.043,-.075).rotation.x=Math.PI/2;
  cylinder(optics,.199,.032,material('#294347',.39,.19),0,.573,-.075);
  sideSocket(left,-1.07,-.02,-Math.PI/2,{pins:4,width:.36,depth:.26,height:.14});
  sideSocket(right,1.07,-.02,Math.PI/2,{pins:4,width:.36,depth:.26,height:.14});
  printedHardwareMarking(board,'MLX90640',.53,.068,-.49,.014,white);
  return model;
}

function oakDStereoCamera() {
  const model=new T.Group();
  const housing=group(model,'housing'), window=group(model,'window'), fasteners=group(model,'fasteners');
  const rear=group(model,'rear'), usb=group(model,'usb');
  const shell=material('#29292b',.56,.53), black=material('#141718',.25,.24);
  const outline=new T.Shape().moveTo(-1.34,-.33).lineTo(1.34,-.33)
    .absarc(1.34,0,.33,-Math.PI/2,Math.PI/2,false).lineTo(-1.34,.33)
    .absarc(-1.34,0,.33,Math.PI/2,Math.PI*1.5,false).closePath();
  make(housing,new T.ExtrudeGeometry(outline,{depth:.40,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:30}),shell,0,.06,-.40).rotation.x=-Math.PI/2;
  box(housing,1.50,.40,1.07,.10,shell,0,.25,.32);
  const faceMaterial=new T.MeshPhysicalMaterial({color:'#101517',roughness:.18,transmission:.20,thickness:.055});
  box(window,2.78,.032,.49,.015,faceMaterial,0,.469,-.40);
  for(const [id,x] of [['left',-1.15],['rgb',0],['right',1.15]]) {
    const lens=group(model,id);
    cylinder(lens,id==='rgb'?.100:.123,.047,black,x,.494,-.40);
    make(lens,new T.TorusGeometry(id==='rgb'?.077:.098,.011,9,42),shell,x,.518,-.40).rotation.x=Math.PI/2;
    cylinder(lens,id==='rgb'?.051:.061,.015,material('#263f47',.42,.11),x,.523,-.40);
  }
  for(const [x,z] of [[-1.49,-.40],[1.49,-.40],[-.56,.68],[.56,.68]]) {
    cylinder(fasteners,.070,.025,black,x,.466,z);
    box(fasteners,.081,.006,.016,.002,dark,x,.482,z).rotation.y=.66;
  }
  box(rear,1.45,.071,1.08,.027,material('#202125',.52,.54),0,.063,.29);
  box(usb,.32,.14,.024,.012,silver,0,.20,.873);
  box(usb,.25,.083,.024,.010,dark,0,.20,.886);
  box(usb,.173,.023,.021,.006,bright,0,.20,.899);
  return model;
}

function pulseSensorKit() {
  const model=new T.Group();
  const disc=group(model,'disc'), emitter=group(model,'emitter'), receiver=group(model,'receiver');
  const cable=group(model,'cable'), pins=group(model,'pins'), holder=group(model,'holder');
  const clip=group(model,'clip'), sheets=group(model,'sheets'), pads=group(model,'pads'), strap=group(model,'strap');
  const x=-.84,z=-.67;
  cylinder(disc,.198,.075,material('#232526',.09,.50),x,.092,z);
  cylinder(disc,.173,.013,white,x,.135,z);
  box(emitter,.069,.033,.052,.006,material('#e5d8a4',.06,.43),x,.153,z-.031);
  box(receiver,.063,.032,.049,.006,dark,x,.152,z+.048);
  for(const [i,color] of ['#ac89bf','#c23d48','#28272b'].entries()){
    const o=(i-1)*.032;
    wire(cable,[[x,.099,z+.17+o],[-.79,.065,-.18+o],[-.81,.053,.62+o],[-.97,.062,.85+o],[-1.44,.052,.47+o],[-1.63,.055,.08+o],[-1.55,.052,-.03+o],[-1.28,.053,.21+o],[-.90,.059,.77+o],[-.59,.052,.78+o],[-.21,.053,.58+o]],.014,material(color,.04,.46));
    box(pins,.155,.055,.033,.006,dark,-.14,.055,.58+o);
    box(pins,.102,.024,.019,.004,boardGold,-.02,.055,.58+o);
  }
  const red=material('#c12827',.12,.43);
  const ringFrame=new T.Shape().moveTo(-.28,-.24).lineTo(.28,-.24).lineTo(.28,.24).lineTo(-.28,.24).closePath();
  const opening=new T.Path();opening.absarc(0,0,.157,0,Math.PI*2,true);ringFrame.holes.push(opening);
  make(holder,new T.ExtrudeGeometry(ringFrame,{depth:.094,bevelEnabled:false,curveSegments:24}),red,.58,.055,-.65).rotation.x=-Math.PI/2;
  for(const dx of [-.24,.24]) box(holder,.062,.125,.43,.009,red,.58+dx,.12,-.65);
  cylinder(clip,.138,.046,silver,1.30,.126,-.65);
  box(clip,.111,.12,.14,.012,bright,1.30,.08,-.53);
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6;
    cylinder(clip,.009,.003,dark,1.30+.095*Math.cos(a),.151,-.65+.095*Math.sin(a));
  }
  box(sheets,.79,.017,.57,.009,white,.59,.025,.06);
  box(pads,.31,.015,.55,.006,white,1.35,.026,.06);
  for(const dz of [-.133,.133]) cylinder(pads,.103,.027,dark,1.35,.046,.06+dz);
  const weave=material('#28292a',.04,.93);
  for(let i=0;i<33;i++) box(strap,.015,.004,.27,.001,weave,.07+i*.049,.085,.68);
  box(strap,1.65,.075,.30,.018,material('#18191b',.03,.96),.87,.046,.68);
  return model;
}

function opticalFingerprintReader() {
  const model=new T.Group();
  const housing=group(model,'housing'), bezel=group(model,'bezel'), window=group(model,'window');
  const spring=group(model,'spring'), rear=group(model,'rear'), cable=group(model,'cable'), plug=group(model,'plug');
  const shell=material('#292a2c',.16,.53);
  const profile=new T.Shape().moveTo(-1,-.30).lineTo(1.04,-.30).lineTo(1.04,-.21)
    .lineTo(.36,.55).lineTo(-.97,.55).closePath();
  make(housing,new T.ExtrudeGeometry(profile,{depth:.83,bevelEnabled:true,bevelThickness:.028,bevelSize:.025,bevelSegments:3}),shell,0,.36,-.415);
  const face=new T.Group();
  face.position.set(.73,.505,0);face.rotation.z=-.84;
  face.add(bezel,window);model.add(face);
  box(bezel,1.02,.12,.82,.043,shell,0,0,0);
  box(window,.78,.029,.60,.035,material('#10181e',.41,.12),0,.069,0);
  box(window,.52,.012,.48,.019,material('#192d36',.39,.18),-.045,.083,0);
  for(const x of [-.55,-.29,-.04]) {
    box(housing,.053,.031,.81,.006,shell,x,.916,0);
  }
  for(const z of [-.441,.441]) {
    box(spring,.23,.49,.092,.014,dark,-.50,.53,z);
    box(spring,.124,.26,.098,.011,shell,-.61,.62,z);
  }
  box(rear,.092,.82,.85,.022,material('#494b49',.27,.57),-1.018,.48,0);
  for(const [i,color] of ['#e4b931','#2171ba','#38a291','#e35239','#e3e4d9','#28282b'].entries()) {
    const off=(i-2.5)*.035;
    wire(cable,[[-1.08,.77,off],[-1.25,.99,off],[-1.28,1.21,-.37+off],[-.94,1.29,-.71+off],[-.35,1.22,-.97+off],[.40,.83,-1.08+off],[1.05,.35,-1.03+off],[1.59,.15,-.84+off]],.014,material(color,.05,.43));
  }
  box(plug,.23,.16,.29,.018,white,1.67,.134,-.83);
  for(let i=0;i<6;i++) box(plug,.024,.018,.021,.003,boardGold,1.785,.15,-.922+i*.036);
  return model;
}

function tinyPicoV3Radio() {
  const model=new T.Group();
  const board=group(model,'board'), usb=group(model,'usb'), pads=group(model,'pads');
  const processor=group(model,'processor'), bridge=group(model,'bridge'), antenna=group(model,'antenna');
  const led=group(model,'led'), reset=group(model,'reset'), power=group(model,'power');
  const holes=[-.46,.46].flatMap(z=>Array.from({length:10},(_,i)=>[-1.01+i*.211,z,.042]));
  controllerBoard(board,[[-1.20,-.56],[1.16,-.56],[1.21,-.50],[1.21,.50],[1.16,.56],[-1.20,.56]],holes,material('#262628',.16,.57));
  for(const point of holes) platedHole(pads,...point);
  box(usb,.44,.20,.44,.024,silver,-1.0,.166,0);
  box(usb,.017,.108,.341,.008,dark,-1.23,.176,0);
  box(usb,.023,.023,.27,.006,white,-1.235,.171,0);
  squareChip(processor,.61,.036,.39,8);processor.rotation.y=-.38;processor.position.set(.063,0,.19);
  squareChip(bridge,-.28,.083,.29,6);
  printedHardwareMarking(processor,'ESP32',.61,.180,.03,.016,material('#9a989a',.12,.52));
  box(antenna,.159,.051,.123,.006,material('#be9f5b',.42,.49),1.056,.091,.225);
  make(antenna,new T.TorusGeometry(.049,.012,10,40),boardGold,1.056,.122,.225).rotation.x=Math.PI/2;
  cylinder(antenna,.019,.018,bright,1.056,.118,.225);
  box(led,.142,.076,.143,.008,white,1.053,.103,-.253);
  box(led,.067,.008,.065,.003,material('#d8c777',.04,.49),1.053,.146,-.253);
  box(reset,.179,.073,.157,.012,bright,.81,.104,.351);
  cylinder(reset,.049,.027,dark,.81,.155,.351);
  surfaceChip(power,.11,-.22,.234,.19,3);
  for(const [x,z] of [[-.69,.16],[-.54,-.19],[-.38,-.24],[-.04,.23],[.40,-.25],[.64,-.32],[.91,-.14]]) {
    box(power,.086,.037,.053,.004,white,x,.083,z);
    for(const dx of [-.034,.034]) box(power,.018,.039,.054,.004,silver,x+dx,.084,z);
  }
  return model;
}

function espC6RadioDevKit() {
  const model=new T.Group();
  const board=group(model,'board'), module=group(model,'module'), antenna=group(model,'antenna');
  const native=group(model,'native'), uart=group(model,'uart'), jumper=group(model,'jumper');
  const pins=group(model,'pins'), boot=group(model,'boot'), reset=group(model,'reset'), led=group(model,'led'), bridge=group(model,'bridge');
  const finish=material('#28292c',.13,.58);
  boardPlate(board,2.64,1.13,[],finish);
  box(module,1.05,.07,.85,.007,finish,.78,.100,0);
  box(module,.86,.147,.77,.018,silver,.72,.203,0);
  for(const z of [-.427,.427]) for(let i=0;i<14;i++) box(module,.044,.029,.067,.004,boardGold,.29+i*.067,.096,z);
  box(antenna,.395,.067,.85,.006,material('#242b2d',.19,.61),1.49,.101,0);
  const trace=material('#77765a',.27,.57);
  wire(antenna,[[1.31,.137,-.31],[1.57,.137,-.31],[1.57,.137,-.15],[1.39,.137,-.15],[1.39,.137,.02],[1.57,.137,.02],[1.57,.137,.19],[1.39,.137,.19],[1.39,.137,.30]],.011,trace);
  for(const [part,z] of [[native,.305],[uart,-.305]]) {
    box(part,.425,.18,.425,.022,silver,-1.185,.154,z);
    box(part,.018,.094,.322,.007,dark,-1.406,.155,z);
    box(part,.026,.027,.277,.006,white,-1.415,.15,z);
  }
  for(const z of [-.515,.515]) {
    box(pins,2.48,.095,.118,.012,dark,.012,-.053,z);
    for(let i=0;i<15;i++) box(pins,.034,.33,.034,.004,boardGold,-1.12+i*.161,-.074,z);
  }
  for(const [buttons,z] of [[reset,-.30],[boot,.30]]) {
    box(buttons,.153,.066,.143,.009,bright,-.82,.101,z);
    cylinder(buttons,.045,.03,dark,-.82,.145,z);
  }
  box(jumper,.22,.24,.135,.016,dark,-.11,.185,-.40);
  for(const x of [-.162,-.058]) box(jumper,.042,.033,.035,.004,boardGold,x,.322,-.40);
  box(led,.135,.068,.135,.008,white,-.51,.100,-.33);
  squareChip(bridge,-.57,.05,.28,5);
  for(const [x,z] of [[-.30,.28],[-.31,-.21],[-.10,.23],[.04,-.20],[.13,.36]]) box(board,.081,.033,.052,.004,white,x,.082,z);
  printedHardwareMarking(module,'ESP32-C6',.72,.278,.01,.022,material('#929193',.13,.47));
  return model;
}

function rfm95LoRaBreakout() {
  const model=new T.Group();
  const pcb=group(model,'pcb'), radio=group(model,'radio'), edge=group(model,'edge');
  const antenna=group(model,'antenna'), logic=group(model,'logic'), supply=group(model,'supply');
  const front=[-.72,-.48,-.24,0,.24,.48,.72].map(x=>[x,.66,.045]);
  const back=[-.72,-.48,-.24,0,.24,.48,.72].map(x=>[x,-.66,.045]);
  boardPlate(pcb,1.76,1.61,[...front,...back],material('#06639f',.16,.49));
  for(const hole of [...front,...back]) platedHole(edge,...hole);
  box(radio,.99,.044,1.07,.009,material('#284644',.14,.52),-.13,.087,-.012);
  box(radio,.82,.104,.85,.021,silver,-.13,.157,-.014);
  for(const z of [-.49,.47]) for(let i=0;i<8;i++) box(radio,.059,.026,.091,.004,boardGold,-.57+i*.127,.094,z);
  surfaceChip(logic,.62,.01,.22,.33,5);
  surfaceChip(supply,.61,-.36,.17,.14,3);
  for(const [x,z] of [[.74,-.45],[.45,-.51],[.60,.34],[.69,.42]]) {
    box(supply,.071,.034,.06,.005,white,x,.091,z);
    for(const dx of [-.026,.026]) box(supply,.020,.037,.062,.003,bright,x+dx,.092,z);
  }
  box(antenna,.209,.012,.155,.004,boardGold,-.714,.073,.393);
  box(antenna,.162,.011,.101,.003,boardGold,-.714,.073,.555);
  printedHardwareMarking(radio,'RFM95W',-.13,.211,-.014,.025,material('#777a7c',.18,.46));
  printedHardwareMarking(pcb,'ANT',-.69,.068,.27,.011,white);
  return model;
}

function nordicThingy91() {
  const model=new T.Group();
  const lid=group(model,'lid'), base=group(model,'base'), light=group(model,'light'), button=group(model,'button'), usb=group(model,'usb'), flap=group(model,'flap');
  const yellow=material('#ffbd0a',.06,.49), baseFinish=material('#ed9b04',.09,.54);
  box(base,2.04,.29,2.04,.049,baseFinish,0,.169,0);
  box(lid,2.07,.25,2.07,.041,yellow,0,.412,0);
  box(lid,2.07,.016,2.07,.007,material('#a66612',.08,.59),0,.298,0);
  cylinder(light,.128,.027,material('#9e5607',.38,.37),-.66,.545,.60);
  make(light,new T.SphereGeometry(.096,34,20),new T.MeshPhysicalMaterial({color:'#981924',roughness:.21,transmission:.25,thickness:.08}),-.66,.554,.60).scale.y=.42;
  const logo=material('#edaa06',.07,.47);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    const mark=box(button,.32,.007,.016,.003,logo,Math.cos(a)*.27,.541,-.29+Math.sin(a)*.27);
    mark.rotation.y=-a-Math.PI/2;
  }
  printedHardwareMarking(button,'NORDIC',.12,.541,.10,.023,logo);
  for(const x of [-.77,.77]) {
    box(base,.013,.046,.22,.004,material('#bf7911',.10,.60),x*1.325,.235,.15);
  }
  box(flap,.37,.16,.045,.016,baseFinish,.35,.251,1.029);
  box(flap,.275,.10,.020,.010,yellow,.35,.253,1.058);
  box(usb,.26,.105,.038,.009,baseFinish,-.55,.181,-1.018);
  box(usb,.17,.057,.019,.008,dark,-.55,.184,-1.041);
  return model;
}

function pn532NfcBoard() {
  const model=new T.Group();
  const board=group(model,'board'), antenna=group(model,'antenna'), chip=group(model,'chip');
  const pads=group(model,'pads'), mounts=group(model,'mounts'), selects=group(model,'selects'), match=group(model,'match');
  const finish=material('#0867b2',.18,.48), maskedCopper=material('#2575ae',.37,.47);
  const holes=[[-1.64,-.62,.097],[-1.64,.62,.097],[1.64,-.62,.097],[1.64,.62,.097]];
  const host=Array.from({length:10},(_,i)=>[.37+i*.126,-.61,.031]);
  boardPlate(board,3.52,1.49,[...holes,...host],finish);
  for(const point of holes) platedHole(mounts,...point);
  for(const point of host) platedHole(pads,...point);
  for(let i=0;i<5;i++){
    const x0=-1.62+i*.032,x1=.17-i*.032,z0=-.61+i*.032,z1=.61-i*.032;
    box(antenna,x1-x0,.005,.014,.002,maskedCopper,(x0+x1)/2,.069,z0);
    box(antenna,x1-x0,.005,.014,.002,maskedCopper,(x0+x1)/2,.069,z1);
    box(antenna,.014,.005,z1-z0,.002,maskedCopper,x0,.069,0);
    box(antenna,.014,.005,z1-z0,.002,maskedCopper,x1,.069,0);
  }
  printedHardwareMarking(board,'PN532',-.57,.068,.06,.042,white);
  squareChip(chip,1.03,.04,.30,7);
  for(const x of [1.36,1.49]) {
    box(selects,.09,.012,.22,.004,white,x,.074,.36);
    for(const z of [.307,.412]) box(selects,.070,.012,.067,.003,boardGold,x,.084,z);
  }
  for(const [x,z] of [[.31,.13],[.31,-.13],[.42,.13],[.42,-.13],[.53,.13],[.53,-.13],[.63,.33],[.79,.28],[.86,-.31],[1.18,-.31],[1.30,-.16],[.68,-.36]]) {
    box(match,.067,.027,.052,.004,white,x,.081,z);
    for(const dx of [-.025,.025]) box(match,.019,.030,.053,.003,bright,x+dx,.082,z);
  }
  return model;
}

function canPalTransceiver() {
  const model=new T.Group();
  const board=group(model,'board'), terminal=group(model,'terminal'), chip=group(model,'chip');
  const pads=group(model,'pads'), terminator=group(model,'terminator'), mount=group(model,'mount');
  const pinRow=Array.from({length:7},(_,i)=>[-.74+i*.22,.575,.048]);
  const screwHole=[.76,-.25,.139];
  const outline=[[-.91,-.58],[-.76,-.72],[.76,-.72],[.91,-.58],[.91,.58],[.76,.72],[-.76,.72],[-.91,.58]];
  controllerBoard(board,outline,[...pinRow,screwHole],material('#252527',.14,.55));
  for(const point of pinRow) platedHole(pads,...point);
  platedHole(mount,...screwHole);
  surfaceChip(chip,-.13,.012,.32,.32,4);
  const green=material('#51aa71',.06,.56);
  for(let i=0;i<3;i++){
    const x=-.54+i*.34;
    box(terminal,.34,.36,.43,.027,green,x,.245,-.42);
    cylinder(terminal,.103,.019,dark,x,.429,-.42);
    cylinder(terminal,.072,.023,bright,x,.442,-.42);
    box(terminal,.092,.007,.016,.003,dark,x,.456,-.42).rotation.y=.32;
    box(terminal,.146,.14,.015,.007,dark,x,.236,-.198);
    box(terminal,.094,.08,.014,.005,boardGold,x,.221,-.190);
  }
  box(terminator,.36,.095,.155,.013,material('#e3bb27',.11,.43),.45,.132,.26);
  box(terminator,.242,.012,.059,.004,dark,.45,.184,.26);
  for(const [x,z] of [[-.65,.18],[-.50,-.11],[.22,.05],[.51,-.06],[.70,.20]]) {
    box(board,.109,.035,.075,.005,white,x,.084,z);
    for(const dx of [-.042,.042]) box(board,.025,.038,.076,.003,bright,x+dx,.085,z);
  }
  printedHardwareMarking(board,'CAN PAL',0,.068,.37,.017,white);
  printedHardwareMarking(board,'120',.45,.068,.12,.013,white);
  return model;
}

function magTagDashboard() {
  const model=new T.Group();
  const board=group(model,'board'), display=group(model,'display'), buttons=group(model,'buttons');
  const lights=group(model,'lights'), ambient=group(model,'ambient'), feet=group(model,'feet');
  const usb=group(model,'usb'), wifi=group(model,'wifi'), battery=group(model,'battery');
  const holes=[[-1.53,-.89,.097],[-1.53,.89,.097],[1.53,-.89,.097],[1.53,.89,.097]];
  controllerBoard(board,[[-1.68,-.88],[-1.55,-1.02],[1.55,-1.02],[1.68,-.88],[1.68,.88],[1.55,1.02],[-1.55,1.02],[-1.68,.88]],holes,material('#262728',.15,.52));
  for(const [x,z,r] of holes) {
    platedHole(feet,x,z,r);
    cylinder(feet,.103,.11,white,x,-.052,z);
  }
  box(display,2.94,.13,1.53,.022,material('#acb4af',.16,.55),0,.130,0);
  box(display,2.78,.018,1.36,.009,material('#d6dcd3',.06,.68),0,.203,0);
  const service=group(model,'service');
  const pixels=material('#444c55',.06,.61);
  const glyphs=[['1001','1111','1111','1001','1001'],['0110','1001','1111','1001','1001'],['0111','1000','1011','1001','0111'],['1111','0110','0110','0110','0110'],['0110','1001','1111','1001','1001'],['0111','1000','1011','1001','0111']].map(rows=>rows.join(''));
  for(const [i,glyph] of glyphs.entries()) for(let j=0;j<20;j++) if(glyph[j]==='1') {
    box(display,.070,.003,.071,.001,pixels,-1.20+i*.43+j%4*.071,.214,-.24+Math.floor(j/4)*.071);
  }
  printedHardwareMarking(display,'2025 EDITION',0,.214,.25,.021,pixels);
  printedHardwareMarking(display,'SSD1680',0,.214,.47,.023,pixels);
  for(const x of [-.34,.34]) {
    box(service,.134,.071,.102,.009,silver,x,-.037,.984);
    box(service,.082,.052,.045,.005,dark,x,-.033,1.05);
  }
  for(const x of [-1.08,-.38,.38,1.08]) {
    box(buttons,.21,.080,.126,.009,bright,x,.105,.894);
    box(buttons,.135,.027,.062,.007,dark,x,.154,.894);
    box(lights,.149,.064,.116,.010,white,x,.103,-.891);
    box(lights,.096,.013,.065,.005,material('#e0caa0',.03,.49),x,.141,-.897);
  }
  box(ambient,.115,.052,.084,.007,dark,0,.094,-.90);
  box(ambient,.052,.012,.043,.005,material('#747660',.19,.31),0,.127,-.90);
  box(usb,.38,.129,.25,.016,silver,0,-.050,.959);
  box(usb,.278,.068,.019,.007,dark,0,-.049,1.089);
  box(wifi,1.02,.09,.59,.012,silver,.56,-.049,-.22);
  box(wifi,.31,.065,.57,.006,material('#28312b',.12,.56),1.20,-.043,-.22);
  box(battery,.27,.12,.20,.012,white,-.99,-.065,.60);
  return model;
}

function relayOutletModule() {
  const model=new T.Group();
  const shell=group(model,'shell'), feet=group(model,'feet'), switchPart=group(model,'switch');
  const status=group(model,'status'), control=group(model,'control'), cable=group(model,'cable'), plug=group(model,'plug');
  const polymer=material('#28292a',.13,.61), charcoal=material('#1b1c1d',.12,.52);
  box(shell,2.44,.42,1.41,.11,polymer,.52,.272,.52);
  box(shell,2.53,.10,1.43,.048,charcoal,.52,.098,.52);
  for(const x of [-.73,1.77]){
    box(feet,.23,.092,1.19,.026,charcoal,x,.059,.52);
    for(const z of [.10,.95]) cylinder(feet,.050,.010,dark,x,.11,z);
  }
  const sockets=[['normally-off',.13,.19],['normally-off',.13,.84],['normally-on',1.15,.19],['always',1.15,.84]];
  const faceFinish=material('#333434',.10,.57);
  for(const [id,x,z] of sockets) {
    const part=model.getObjectByName(id)??group(model,id);
    const outline=new T.Shape().moveTo(-.24,-.24).lineTo(.24,-.24).lineTo(.24,.24).lineTo(-.24,.24).closePath();
    for(const [sx,sz,w,h] of [[-.08,-.076,.051,.137],[.075,-.076,.059,.156]]) {
      const slot=new T.Path();
      slot.moveTo(sx-w/2,sz-h/2).lineTo(sx-w/2,sz+h/2).lineTo(sx+w/2,sz+h/2).lineTo(sx+w/2,sz-h/2).closePath();
      outline.holes.push(slot);
    }
    const ground=new T.Path();
    ground.absarc(0,.107,.052,0,Math.PI*2,true);outline.holes.push(ground);
    box(part,.50,.012,.50,.009,charcoal,x,.484,z);
    make(part,new T.ExtrudeGeometry(outline,{depth:.031,bevelEnabled:false,curveSegments:18}),faceFinish,x,.492,z).rotation.x=-Math.PI/2;
    const ink=material('#b09a5b',.19,.53);
    box(part,.32,.006,.025,.002,ink,x,.526,z+.27);
    const label=id==='always'?'ALWAYS ON':id==='normally-on'?'NORM ON':'NORM OFF';
    printedHardwareMarking(part,label,x,.527,z+.225,.010,ink);
  }
  box(switchPart,.29,.050,.37,.013,charcoal,-.43,.498,.37);
  box(switchPart,.211,.065,.276,.015,material('#c94432',.14,.37),-.43,.532,.37).rotation.z=.12;
  box(switchPart,.072,.008,.019,.002,white,-.43,.571,.38);
  cylinder(status,.038,.025,material('#748050',.12,.37),-.42,.492,.81);
  box(control,.33,.15,.16,.014,material('#42a46b',.11,.53),.54,.24,1.229);
  for(const x of [.464,.617]){
    box(control,.078,.054,.014,.004,dark,x,.252,1.312);
    cylinder(control,.034,.018,bright,x,.323,1.25);
  }
  const jacket=material('#252625',.07,.51);
  wire(cable,[[-.72,.24,.51],[-1.15,.14,.47],[-1.75,.116,.05],[-1.73,.116,-.42],[-1.10,.120,-.69],[-.48,.12,-1.12],[.10,.122,-1.32],[.75,.119,-1.22],[1.12,.12,-.88],[1.45,.12,-.71]],.055,jacket);
  for(let i=0;i<5;i++) axial(cable,.096-i*.008,.045,jacket,-.74-i*.048).position.set(-.74-i*.048,.24-i*.012,.51);
  plug.position.set(1.49,.12,-.72);plug.rotation.y=-.23;
  box(plug,.37,.21,.27,.049,jacket,.10,0,0);
  for(const z of [-.068,.068]) box(plug,.19,.020,.044,.006,bright,.37,.027,z);
  axial(plug,.025,.17,silver,.36).position.set(.36,-.060,0);
  return model;
}

function nanoBleSenseRevTwo() {
  const model=new T.Group();
  const board=group(model,'board'), module=group(model,'module'), antenna=group(model,'antenna');
  const usb=group(model,'usb'), pins=group(model,'pins'), reset=group(model,'reset'), imu=group(model,'imu');
  const microphone=group(model,'microphone'), environment=group(model,'environment'), optical=group(model,'optical');
  const power=group(model,'power'), magnetometer=group(model,'magnetometer'), pressure=group(model,'pressure');
  const finish=material('#153e47',.15,.56);
  const holes=[-.53,.53].flatMap(z=>Array.from({length:15},(_,i)=>[-1.49+i*.213,z,.039]));
  const mounts=[[-1.68,-.52,.075],[-1.68,.52,.075],[1.68,-.52,.075],[1.68,.52,.075]];
  boardPlate(board,3.51,1.23,[...holes,...mounts],finish);
  for(const [x,z,r] of holes){
    make(pins,new T.RingGeometry(r,.061,28),boardGold,x,.069,z).rotation.x=-Math.PI/2;
    platedHole(pins,x,z,r);
  }
  for(const point of mounts) platedHole(board,...point);
  box(module,.84,.058,.77,.009,material('#3a6550',.13,.51),1.22,.096,0);
  box(module,.80,.113,.77,.015,silver,1.07,.163,0);
  box(module,.67,.005,.61,.004,white,1.07,.224,0);
  for(let i=0;i<7;i++) for(let j=0;j<7;j++) if((i*7+j*3+i*j)%5<2) box(module,.028,.003,.028,.001,dark,.95+i*.030,.228,-.18+j*.030);
  box(antenna,.28,.058,.77,.008,material('#305f51',.11,.54),1.50,.096,0);
  for(const [z,x] of [[-.19,1.55],[0,1.51],[.19,1.47]]) box(antenna,.139,.003,.016,.001,boardGold,x,.127,z);
  box(usb,.37,.174,.43,.017,silver,-1.63,.151,0);
  box(usb,.017,.087,.30,.007,dark,-1.817,.156,0);
  box(usb,.026,.023,.246,.006,white,-1.827,.148,0);
  box(reset,.20,.069,.18,.009,bright,-.93,.102,0);
  cylinder(reset,.066,.035,white,-.93,.152,0);
  squareChip(imu,-.34,.036,.216,4);
  box(magnetometer,.108,.054,.118,.006,dark,.02,.093,.23);
  box(microphone,.148,.063,.179,.010,silver,-.36,.101,-.272);
  cylinder(microphone,.022,.007,dark,-.36,.135,-.294);
  box(environment,.123,.051,.132,.006,material('#444342',.12,.60),-.67,.094,-.22);
  box(pressure,.123,.051,.132,.006,silver,.14,.094,.20);
  cylinder(pressure,.015,.007,dark,.17,.123,.20);
  printedHardwareMarking(board,'NANO 33 BLE',-.94,.068,-.41,.015,white);
  box(optical,.174,.056,.204,.008,material('#253b33',.12,.48),.38,.100,-.08);
  for(const z of [-.13,-.032]) cylinder(optical,.022,.014,material('#827564',.18,.46),.38,.133,z);
  surfaceChip(power,-1.23,.32,.20,.15,3);
  for(let i=0;i<19;i++){
    const x=-1.45+i*.154,z=i<13?-.39:.38;
    box(power,.078,.041,.042,.004,i%3?white:dark,x,.086,z);
  }
  return model;
}

function robotLink(parent,a,b,width,depth,finish,taper=.82) {
  const start=new T.Vector3(...a), end=new T.Vector3(...b), delta=end.clone().sub(start);
  const center=start.clone().lerp(end,.5);
  const shape=new T.Shape().moveTo(-width/2,-delta.length()/2)
    .lineTo(width/2,-delta.length()/2).lineTo(width*taper/2,delta.length()/2)
    .lineTo(-width*taper/2,delta.length()/2).closePath();
  const bevel=Math.min(.025,width*.17,depth*.20);
  const mesh=make(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3}),finish);
  mesh.position.copy(center);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  mesh.position.add(new T.Vector3(0,0,-depth/2).applyQuaternion(mesh.quaternion));
  return mesh;
}

function robotPivot(parent,p,r,width=.17,finish=dark) {
  const [x,y,z]=p;
  cylinder(parent,r,width,finish,x,y,z).rotation.z=Math.PI/2;
  for(const side of [-1,1]){
    cylinder(parent,r*.76,.027,silver,x+side*width/2,y,z).rotation.z=Math.PI/2;
    cylinder(parent,r*.36,.029,dark,x+side*(width/2+.013),y,z).rotation.z=Math.PI/2;
  }
}

function robotHand(parent,p,side,finish) {
  const [x,y,z]=p;
  box(parent,.13,.15,.095,.030,finish,x,y,z);
  for(let i=0;i<4;i++){
    const dx=(i-1.5)*.031, length=.105-(i===3?.020:0);
    robotLink(parent,[x+dx,y-.063,z],[x+dx,y-.063-length,z+.033],.022,.022,silver);
    box(parent,.025,.032,.022,.008,dark,x+dx,y-.067-length,z+.041);
  }
  robotLink(parent,[x-side*.056,y,z],[x-side*.099,y-.075,z+.052],.031,.030,finish);
}

function fullBodyHumanoid() {
  const model=new T.Group();
  const shell=material('#d0cdc2',.29,.45), metal=material('#7f8282',.73,.38), visorFinish=material('#101519',.45,.17);
  const head=group(model,'head'), visor=group(model,'visor'), neck=group(model,'neck');
  const chest=group(model,'chest'), spine=group(model,'spine'), pelvis=group(model,'pelvis');
  const shoulders=group(model,'shoulders'), upperArms=group(model,'upper-arms'), elbows=group(model,'elbows');
  const forearms=group(model,'forearms'), hands=group(model,'hands'), hips=group(model,'hips');
  const thighs=group(model,'thighs'), knees=group(model,'knees'), shins=group(model,'shins'), ankles=group(model,'ankles'), feet=group(model,'feet');
  const chin=group(model,'chin'), abdominal=group(model,'abdominal');
  box(head,.42,.46,.34,.12,shell,0,3.81,.012);
  box(visor,.343,.265,.058,.027,visorFinish,0,3.838,.185);
  box(visor,.063,.016,.008,.003,metal,0,3.935,.216);
  const optic=material('#5a747e',.34,.25);
  for(const x of [-.078,.078]) {
    box(visor,.047,.027,.007,.006,optic,x,3.85,.216);
  }
  box(chin,.26,.096,.24,.027,metal,0,3.63,.025);
  for(const side of [-1,1]) robotPivot(head,[side*.184,3.83,.010],.103,.060);
  cylinder(neck,.093,.216,metal,0,3.53,0);
  box(chest,.69,.59,.39,.09,dark,0,3.18,0);
  robotLink(chest,[0,3.04,.139],[0,3.49,.12],.42,.17,shell,1.56);
  for(const side of [-1,1]) {
    robotLink(chest,[side*.27,3.04,.135],[side*.39,3.40,.082],.116,.15,shell,1.30);
    box(chest,.097,.081,.019,.009,metal,side*.24,3.25,.229).rotation.z=side*.44;
  }
  const breastplate=new T.Shape().moveTo(-.153,.10).lineTo(.153,.10).lineTo(.177,.028)
    .lineTo(.099,-.13).lineTo(-.099,-.13).lineTo(-.177,.028).closePath();
  make(abdominal,new T.ExtrudeGeometry(breastplate,{depth:.022,bevelSize:.015,bevelThickness:.012,bevelSegments:2}),visorFinish,0,3.041,.235);
  for(let i=0;i<4;i++) box(spine,.28-i*.019,.089,.224,.025,i%2?metal:dark,0,2.62+i*.105,.035);
  box(pelvis,.55,.21,.33,.055,dark,0,2.48,0);
  robotLink(pelvis,[0,2.26,.112],[0,2.57,.091],.19,.18,shell,1.82);
  for(const side of [-1,1]){
    const shoulder=[side*.52,3.30,0], elbow=[side*.68,2.76,.006], wrist=[side*.82,2.29,.031];
    robotPivot(shoulders,shoulder,.152,.21);box(shoulders,.212,.23,.25,.079,shell,side*.60,3.33,-.025);
    robotLink(upperArms,[side*.58,3.18,.015],[side*.67,2.89,.005],.14,.14,metal);
    box(upperArms,.133,.24,.055,.026,shell,side*.611,3.07,.076).rotation.z=side*.30;
    robotPivot(elbows,elbow,.095,.145);
    robotLink(forearms,[side*.70,2.66,.013],wrist,.16,.15,shell,.65);
    box(forearms,.062,.23,.035,.012,metal,side*.755,2.52,.095).rotation.z=side*.29;
    robotHand(hands,[side*.84,2.14,.03],side,shell);
    const hip=[side*.29,2.42,0],knee=[side*.39,1.47,.052], ankle=[side*.42,.43,-.006];
    robotPivot(hips,hip,.176,.24);
    robotLink(thighs,[side*.34,1.63,.026],[side*.31,2.26,0],.261,.254,shell,1.15);
    box(thighs,.084,.085,.016,.006,metal,side*.362,1.79,.179);
    robotPivot(knees,knee,.146,.214);
    const jointAlloy=material('#a8a8a0',.51,.42);
    for(const [assembly,joint,radius,depth] of [[elbows,elbow,.068,.084],[knees,knee,.106,.119]]) {
      make(assembly,new T.TorusGeometry(radius,.010,8,28),jointAlloy,joint[0],joint[1],joint[2]+depth);
    }
    box(knees,.143,.192,.082,.024,metal,knee[0],knee[1],.158);
    robotLink(shins,[side*.42,.56,0],[side*.40,1.28,.043],.16,.21,shell,1.49);
    box(shins,.078,.173,.028,.008,metal,side*.40,.968,.160);
    for(let slot=0;slot<5;slot++) box(shins,.049,.010,.009,.003,dark,side*.40,.916+slot*.025,.176);
    robotPivot(ankles,ankle,.106,.17);
    box(feet,.28,.12,.46,.037,dark,side*.43,.177,.103);
    box(feet,.246,.146,.37,.045,shell,side*.43,.269,.107);
    box(feet,.183,.079,.11,.017,metal,side*.43,.327,.196);
  }
  return model;
}

function classroomHumanoid() {
  const model=new T.Group();
  const ivory=material('#e1e1da',.16,.35), blue=material('#1d4260',.39,.37), glass=material('#0d161c',.39,.14);
  const cyan=new T.MeshStandardMaterial({color:'#96cde7',emissive:'#487d9b',emissiveIntensity:.72,roughness:.28});
  const head=group(model,'head'), face=group(model,'face'), ears=group(model,'ears'), chest=group(model,'chest');
  const waist=group(model,'waist'), shoulder=group(model,'shoulder'), arms=group(model,'arms'), elbows=group(model,'elbows');
  const hands=group(model,'hands'), hips=group(model,'hips'), legs=group(model,'legs'), knees=group(model,'knees'), shoes=group(model,'shoes');
  const ankles=group(model,'ankles'), neck=group(model,'neck');
  make(head,new T.SphereGeometry(.49,42,26),ivory,0,3.53,0).scale.set(1,.88,.78);
  box(head,.46,.067,.32,.030,blue,0,3.933,-.032);
  box(face,.704,.439,.108,.050,glass,0,3.536,.323);
  for(const x of [-.19,.19]) {
    make(face,new T.TorusGeometry(.079,.011,10,40),cyan,x,3.59,.384);
    make(face,new T.SphereGeometry(.043,22,14),glass,x,3.59,.390).scale.z=.29;
  }
  wire(face,[[-.064,3.48,.385],[-.031,3.449,.388],[.022,3.451,.388],[.060,3.479,.385]],.010,cyan);
  cylinder(neck,.151,.17,dark,0,3.098,.057);
  for(const s of [-1,1]) {
    cylinder(ears,.192,.105,blue,s*.44,3.53,0).rotation.z=Math.PI/2;
    make(ears,new T.TorusGeometry(.141,.012,10,40),silver,s*.498,3.53,0).rotation.y=Math.PI/2;
  }
  make(chest,new T.SphereGeometry(.51,40,24),ivory,0,2.72,0).scale.set(.89,.94,.56);
  robotLink(chest,[0,2.68,.253],[0,3.08,.208],.19,.078,blue,1.81);
  box(waist,.44,.16,.28,.043,dark,0,2.29,0);
  make(hips,new T.SphereGeometry(.34,34,20),ivory,0,2.14,0).scale.set(1.04,.63,.79);
  for(const side of [-1,1]){
    const s=[side*.52,2.89,0],e=[side*.70,2.43,.01],w=[side*.79,1.99,.073];
    robotPivot(shoulder,s,.137,.18);
    make(shoulder,new T.SphereGeometry(.172,32,18),blue,side*.605,2.958,0).scale.set(1,.75,1);
    robotLink(arms,[side*.57,2.81,0],[side*.66,2.51,.008],.21,.19,ivory,.85);
    robotPivot(elbows,e,.089,.145);
    robotLink(arms,[side*.71,2.34,.02],w,.205,.165,ivory,.79);
    box(arms,.13,.25,.052,.026,blue,side*.758,2.17,.119).rotation.z=side*.20;
    robotHand(hands,[side*.82,1.88,.085],side,ivory);
    robotPivot(hips,[side*.265,2.08,0],.128,.19);
    robotLink(legs,[side*.31,1.32,.018],[side*.27,1.97,0],.26,.24,ivory,1.12);
    box(legs,.105,.27,.048,.023,blue,side*.389,1.69,.119).rotation.z=side*.06;
    robotPivot(knees,[side*.32,1.24,.037],.13,.19);
    box(knees,.181,.196,.109,.034,blue,side*.32,1.24,.133);
    robotLink(legs,[side*.36,.43,-.018],[side*.33,1.09,.02],.30,.26,ivory,.88);
    for(const offset of [-.087,.087]) cylinder(ankles,.093,.046,offset<0?dark:silver,side*(.363+offset*1.75),.464,.012).rotation.z=Math.PI/2;
    box(shoes,.49,.105,.55,.044,blue,side*.37,.219,.14);
    box(shoes,.443,.192,.47,.067,ivory,side*.37,.32,.143);
    box(shoes,.134,.017,.123,.008,blue,side*.37,.423,.23);
  }
  return model;
}

function mobileSocialRobot() {
  const model=new T.Group();
  const cream=material('#d7d9d8',.34,.38), navy=material('#17304c',.44,.38), black=material('#151719',.06,.58);
  const head=group(model,'head'), face=group(model,'face'), screen=group(model,'screen'), body=group(model,'body');
  const shoulders=group(model,'shoulders'), arms=group(model,'arms'), elbows=group(model,'elbows'), hands=group(model,'hands');
  const base=group(model,'base'), wheels=group(model,'wheels'), strip=group(model,'strip');
  const ears=group(model,'ears'), crown=group(model,'crown'), neck=group(model,'neck');
  const blueGlow=new T.MeshStandardMaterial({color:'#7dd3ed',emissive:'#3f8eb4',emissiveIntensity:.85,roughness:.31});
  make(head,new T.SphereGeometry(.39,40,24),cream,0,2.94,0).scale.set(1,.91,.88);
  box(face,.583,.385,.113,.055,material('#0d151a',.36,.18),0,2.94,.284);
  for(const x of [-.159,.159]) {
    make(face,new T.TorusGeometry(.064,.010,10,40,4.72),blueGlow,x,2.978,.346).rotation.z=-.72;
    const side=Math.sign(x);
    cylinder(ears,.128,.071,navy,side*.352,2.935,0).rotation.z=Math.PI/2;
    make(ears,new T.TorusGeometry(.103,.008,12,48),silver,side*.391,2.935,0).rotation.y=Math.PI/2;
  }
  wire(face,[[-.051,2.872,.342],[-.02,2.851,.344],[.024,2.852,.344],[.052,2.876,.342]],.009,blueGlow);
  box(crown,.119,.079,.090,.032,navy,0,3.239,.172);
  cylinder(crown,.024,.015,black,0,3.24,.222).rotation.x=Math.PI/2;
  cylinder(neck,.11,.22,black,0,2.58,0);
  cylinder(neck,.145,.049,silver,0,2.551,0);
  const torso=[[0,.78],[.49,.78],[.44,1.04],[.35,1.28],[.30,1.60],[.33,1.99],[.43,2.30],[.40,2.46],[.29,2.55],[0,2.55]];
  make(body,new T.LatheGeometry(torso.map(p=>new T.Vector2(...p)),64),cream);
  robotLink(body,[0,.83,.389],[0,1.90,.287],.27,.11,navy,.68);
  box(screen,.91,.65,.123,.037,black,0,2.25,.371).rotation.x=-.12;
  box(screen,.80,.54,.025,.012,material('#173d7d',.39,.19),0,2.25,.450).rotation.x=-.12;
  const graphic=new T.Shape().moveTo(-.377,-.21).lineTo(.39,.10).lineTo(.39,-.248).closePath();
  const displayGraphic=make(screen,new T.ShapeGeometry(graphic),material('#32689e',.23,.35),0,2.25,.465);
  displayGraphic.rotation.x=-.12;
  const pedestal=[[0,.14],[.56,.14],[.67,.23],[.72,.49],[.63,.64],[.55,.72],[.47,.83],[0,.83]];
  make(base,new T.LatheGeometry(pedestal.map(p=>new T.Vector2(...p)),64),navy);
  make(base,new T.LatheGeometry([[.65,.57],[.64,.64],[.55,.74],[.48,.78]].map(p=>new T.Vector2(...p)),64),cream);
  const graphiteWheel=material('#20242a',.08,.77);
  for(const side of [-1,1]) {
    cylinder(wheels,.357,.21,black,side*.621,.416,-.027).rotation.z=Math.PI/2;
    for(let slot=0;slot<28;slot++){
      const angle=slot*Math.PI/14;
      box(wheels,.125,.016,.021,.005,graphiteWheel,side*.624,.416+.355*Math.cos(angle),-.027+.355*Math.sin(angle)).rotation.x=angle;
    }
    cylinder(wheels,.286,.032,navy,side*.736,.416,-.027).rotation.z=Math.PI/2;
    make(wheels,new T.TorusGeometry(.241,.013,10,48),silver,side*.754,.416,-.027).rotation.y=Math.PI/2;
  }
  box(strip,.31,.025,.023,.009,blueGlow,0,.419,.707);
  for(const [side,elbow,wrist] of [[-1,[-.66,1.99,.022],[-.71,1.57,.060]],[1,[.65,1.99,.10],[1.04,2.22,.18]]]){
    const shoulder=[side*.49,2.40,0];
    robotPivot(shoulders,shoulder,.141,.16,navy);
    robotLink(arms,shoulder,elbow,.145,.16,cream);
    robotPivot(elbows,elbow,.086,.118);
    cylinder(elbows,.074,.026,silver,elbow[0],elbow[1],elbow[2]+.093).rotation.x=Math.PI/2;
    cylinder(elbows,.032,.012,black,elbow[0],elbow[1],elbow[2]+.111).rotation.x=Math.PI/2;
    robotLink(arms,elbow,wrist,.143,.128,cream,.66);
    const hand=new T.Group();hand.position.set(...wrist);
    hand.rotation.z=side===1?2.14:0;
    hands.add(hand);
    robotHand(hand,[0,-.09,0],side,cream);
  }
  return model;
}

function bipedalResearchPlatform() {
  const model=new T.Group();
  const alloy=material('#a6aaa8',.72,.36), graphite=material('#232b36',.46,.48);
  const chassis=group(model,'chassis'), hips=group(model,'hips'), thigh=group(model,'thigh');
  const knee=group(model,'knee'), shin=group(model,'shin'), springs=group(model,'springs');
  const cables=group(model,'cables'), ankles=group(model,'ankles'), feet=group(model,'feet');
  const upperSprings=group(model,'upper-springs');
  box(chassis,1.12,.36,.57,.068,graphite,0,2.77,0);
  box(chassis,.83,.11,.54,.021,alloy,0,2.99,-.015);
  robotLink(chassis,[0,2.54,.246],[0,2.96,.267],.37,.096,alloy,1.6);
  for(let i=0;i<5;i++) for(let j=0;j<6;j++) box(chassis,.019,.018,.010,.002,dark,-.095+j*.036,2.66+i*.030,.301);
  for(const s of [-1,1]){
    const stride=s*.15;
    const h=[s*.47,2.70,stride],k=[s*.52,1.67,.28+stride],a=[s*.52,.46,-.19+stride];
    robotPivot(hips,h,.224,.26);
    for(const off of [-.084,.084]) {
      robotLink(thigh,[h[0]+off,2.50,stride],[k[0]+off,1.81,.26+stride],.08,.125,alloy,.76);
      robotLink(shin,[k[0]+off,1.57,.27+stride],[a[0]+off,.56,-.16+stride],.077,.133,alloy,.72);
    }
    robotPivot(knee,k,.162,.25);
    robotPivot(ankles,a,.102,.164);
    for(const [top,bottom] of [[[h[0],2.48,.03+stride],[k[0],1.86,.22+stride]],[[k[0],1.45,.17+stride],[a[0],.66,-.12+stride]]]){
      const spring=top[1]>2?upperSprings:springs;
      robotLink(spring,top,bottom,.082,.079,graphite);
      const start=new T.Vector3(...top),end=new T.Vector3(...bottom);
      const helix=Array.from({length:92},(_,i)=>{
        const t=i/91,p=start.clone().lerp(end,.13+.74*t),r=.071;
        return [p.x+Math.cos(t*Math.PI*14)*r,p.y,p.z+Math.sin(t*Math.PI*14)*r];
      });
      wire(spring,helix,.018,silver);
    }
    wire(cables,[[h[0]+s*.10,2.83,-.10+stride],[h[0]+s*.20,2.58,-.10+stride],[h[0]+s*.18,2.27,-.08+stride],[k[0]+s*.11,1.97,.17+stride],[k[0]+s*.10,1.79,.27+stride]],.033,dark);
    wire(cables,[[k[0]+s*.095,1.51,.26+stride],[k[0]+s*.18,1.20,.14+stride],[a[0]+s*.13,.76,-.13+stride],[a[0]+s*.067,.49,-.21+stride]],.025,graphite);
    box(feet,.39,.097,.54,.046,dark,a[0],.206,a[2]+.106);
    box(feet,.34,.108,.41,.037,alloy,a[0],.277,a[2]+.097);
    for(const side of [-1,1]){
      box(feet,.076,.031,.21,.014,graphite,a[0]+side*.125,.25,a[2]+.228).rotation.y=side*.17;
    }
    box(feet,.205,.048,.26,.018,graphite,a[0],.347,a[2]+.105);
  }
  return model;
}

function flangeBolts(parent,x,y,z,r,count,finish,vertical=false) {
  for(let i=0;i<count;i++){
    const a=i*2*Math.PI/count;
    const bolt=make(parent,new T.CylinderGeometry(.022,.022,.022,6),finish,x+r*Math.cos(a),vertical?y+r*Math.sin(a):y,vertical?z:z+r*Math.sin(a));
    if(vertical) bolt.rotation.x=Math.PI/2;
  }
}

function manipulationTorso() {
  const model=new T.Group();
  const base=group(model,'base'), waist=group(model,'waist'), torso=group(model,'torso');
  const neck=group(model,'neck'), head=group(model,'head'), optics=group(model,'optics');
  const shoulders=group(model,'shoulders'), links=group(model,'links'), elbows=group(model,'elbows'), wrists=group(model,'wrists');
  const fingers=group(model,'fingers'), loom=group(model,'loom'), block=group(model,'block');
  const headLoom=group(model,'head-loom'), palms=group(model,'palms');
  const steel=material('#aaaeb1',.70,.35), navy=material('#263952',.48,.39);
  box(base,1.65,.13,1.05,.030,steel,0,.075,0);
  for(const x of [-.72,.72]) for(const z of [-.42,.42]) cylinder(base,.041,.024,silver,x,.145,z);
  box(base,1.18,.21,.75,.065,navy,0,.24,0);
  cylinder(waist,.38,.18,steel,0,.432,0);
  cylinder(waist,.34,.31,dark,0,.61,0);
  flangeBolts(waist,0,.523,0,.302,10,bright);
  robotLink(torso,[0,.70,0],[0,1.96,0],.64,.57,steel,1.73);
  box(torso,.70,.21,.11,.03,navy,0,1.92,.321);
  for(const x of [-.28,.28]) robotLink(torso,[x,.77,.15],[x*1.47,1.61,.20],.17,.095,dark);
  cylinder(neck,.15,.26,steel,0,2.14,0);
  cylinder(neck,.20,.11,dark,0,2.19,0);
  wire(headLoom,[[-.113,1.93,-.22],[-.411,2.12,-.24],[-.529,2.43,-.159],[-.422,2.61,-.049],[-.331,2.58,.035]],.033,dark);
  wire(headLoom,[[-.151,1.92,-.234],[-.449,2.13,-.254],[-.564,2.43,-.170],[-.452,2.61,-.057],[-.366,2.58,.033]],.017,navy);
  box(head,.89,.39,.59,.11,steel,0,2.48,0);
  box(head,.43,.038,.32,.019,navy,0,2.679,-.020);
  box(optics,.74,.211,.05,.024,dark,0,2.47,.302);
  for(const x of [-.229,.229]){
    cylinder(optics,.077,.025,navy,x,2.47,.332).rotation.x=Math.PI/2;
    cylinder(optics,.047,.024,material('#244b63',.43,.16),x,2.47,.348).rotation.x=Math.PI/2;
  }
  for(const s of [-1,1]){
    const shoulder=[s*.71,1.89,0], elbow=[s*1.16,1.15,.19], wrist=[s*.77,1.23,.83];
    robotPivot(shoulders,shoulder,.249,.24,navy);
    robotLink(links,shoulder,elbow,.33,.32,steel,.75);
    robotPivot(elbows,elbow,.173,.23,dark);
    robotLink(links,elbow,wrist,.33,.30,navy,.72);
    robotPivot(wrists,wrist,.154,.19);
    box(palms,.22,.32,.16,.039,steel,s*.59,1.23,.91);
    for(const y of [1.105,1.35]) cylinder(palms,.020,.010,dark,s*.598,y,.994).rotation.x=Math.PI/2;
    for(let i=0;i<4;i++){
      const y=1.10+i*.081;
      robotLink(fingers,[s*.57,y,.98],[s*.32,y,1.031],.053,.055,steel,.82);
      cylinder(fingers,.032,.020,dark,s*.44,y,1.064).rotation.x=Math.PI/2;
      box(fingers,.092,.050,.058,.010,dark,s*.29,y,1.018);
    }
    robotLink(fingers,[s*.65,1.38,.94],[s*.48,1.49,.88],.069,.061,steel);
    wire(loom,[[s*.51,1.78,-.22],[s*.84,2.17,-.13],[s*1.01,1.86,-.095],[s*1.18,1.20,.03],[s*1.25,1.07,.35],[s*1.09,1.11,.65],[s*.82,1.16,.83]],.042,dark);
  }
  box(block,.76,.65,.43,.021,material('#226499',.07,.64),0,1.30,.91);
  return model;
}

function orangeIndustrialArm() {
  const model=new T.Group();
  const base=group(model,'base'), turn=group(model,'turn'), shoulder=group(model,'shoulder'), upper=group(model,'upper');
  const elbow=group(model,'elbow'), boom=group(model,'boom'), wrist=group(model,'wrist'), flange=group(model,'flange');
  const loom=group(model,'loom'), motors=group(model,'motors'), clamps=group(model,'clamps');
  const orange=material('#e56811',.24,.40), navy=material('#263147',.46,.47);
  box(base,1.17,.12,1.03,.023,navy,-.48,.065,0);
  make(base,new T.CylinderGeometry(.41,.48,.42,48),navy,-.48,.319,0);
  for(const x of [-.96,0]) for(const z of [-.41,.41]) cylinder(base,.048,.065,bright,x,.139,z);
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const x=Math.cos(angle),z=Math.sin(angle);
    robotLink(base,[-.48+x*.35,.16,z*.35],[-.48+x*.43,.47,z*.43],.097,.127,navy,1);
  }
  cylinder(turn,.438,.14,orange,-.48,.56,0);
  flangeBolts(turn,-.48,.641,0,.39,12,bright);
  const s=[-.48,1.02,0],e=[-.73,2.33,0];
  robotLink(turn,[-.48,.63,0],s,.42,.47,orange,1.1);
  cylinder(shoulder,.331,.55,orange,...s).rotation.x=Math.PI/2;
  flangeBolts(shoulder,s[0],s[1],.288,.266,12,dark,true);
  robotLink(upper,[-.51,1.16,0],[-.74,2.19,0],.46,.35,orange,.63);
  robotLink(upper,[-.59,1.26,.18],[-.74,2.17,.18],.107,.047,orange,.73);
  cylinder(elbow,.25,.44,orange,...e).rotation.x=Math.PI/2;
  flangeBolts(elbow,e[0],e[1],.234,.189,10,dark,true);
  robotLink(boom,[-.60,2.37,0],[.62,2.17,0],.31,.35,orange,.92);
  robotLink(boom,[-.53,2.40,.15],[.54,2.225,.15],.083,.062,orange);
  robotLink(wrist,[.56,2.18,0],[1.05,2.11,0],.36,.32,orange,.88);
  cylinder(wrist,.18,.22,orange,1.12,2.09,0).rotation.z=Math.PI/2;
  cylinder(flange,.150,.080,silver,1.28,2.09,0).rotation.z=Math.PI/2;
  cylinder(flange,.083,.009,dark,1.325,2.09,0).rotation.z=Math.PI/2;
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    cylinder(flange,.021,.014,dark,1.33,2.09+.11*Math.cos(a),.11*Math.sin(a)).rotation.z=Math.PI/2;
  }
  box(motors,.36,.32,.42,.040,dark,-.97,1.02,0);
  box(motors,.34,.14,.25,.027,dark,-.40,2.49,-.02);
  for(const [x,y,width] of [[-.22,2.31,.045],[.13,2.25,.045],[.47,2.19,.045]]) {
    box(boom,width,.25,.018,.005,navy,x,y,.172).rotation.z=-.16;
  }
  const cablePath=[[-.78,.64,-.14],[-.94,.81,-.25],[-.62,1.16,-.31],[-.78,1.76,-.23],[-.97,2.35,-.10],[-.70,2.60,-.06],[-.35,2.48,-.08],[.12,2.38,-.14],[.68,2.29,-.13],[1.12,2.19,-.12]];
  wire(loom,cablePath,.044,dark);
  const cableCurve=new T.CatmullRomCurve3(cablePath.map(point=>new T.Vector3(...point)));
  for(const t of [.26,.35,.45,.84]){
    const center=cableCurve.getPoint(t), tangent=cableCurve.getTangent(t);
    const band=make(clamps,new T.TorusGeometry(.052,.014,10,34),bright,...center.toArray());
    band.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tangent);
  }
  return model;
}

function whiteCollaborativeArm() {
  const model=new T.Group();
  const plate=group(model,'plate'), base=group(model,'base'), shoulder=group(model,'shoulder'), upper=group(model,'upper');
  const elbow=group(model,'elbow'), forearm=group(model,'forearm'), wrist=group(model,'wrist'), fingers=group(model,'fingers');
  const cable=group(model,'cable'), fixture=group(model,'fixture'), pads=group(model,'pads'), distal=group(model,'distal');
  const ivory=material('#d2d5d2',.25,.40), teal=material('#227e86',.42,.37);
  box(plate,3.43,.117,1.70,.031,silver,0,.070,0);
  box(plate,3.43,.091,1.70,.026,dark,0,-.023,0);
  for(let i=0;i<17;i++) for(let j=0;j<8;j++) cylinder(plate,.017,.003,dark,-1.54+i*.19,.13,-.665+j*.19);
  cylinder(base,.52,.10,silver,.83,.183,0);
  make(base,new T.CylinderGeometry(.34,.43,.36,56),teal,.83,.407,0);
  flangeBolts(base,.83,.247,0,.465,10,bright);
  const s=[.82,.91,0],e=[.66,2.22,.02],f=[-.63,1.72,.08];
  cylinder(shoulder,.34,.57,ivory,...s).rotation.x=Math.PI/2;
  cylinder(shoulder,.263,.037,teal,s[0],s[1],.303).rotation.x=Math.PI/2;
  robotLink(upper,[.81,1.03,0],e,.49,.43,ivory,.88);
  cylinder(elbow,.28,.50,ivory,...e).rotation.x=Math.PI/2;
  cylinder(elbow,.222,.032,teal,e[0],e[1],.285).rotation.x=Math.PI/2;
  flangeBolts(elbow,e[0],e[1],.309,.163,5,dark,true);
  robotLink(forearm,[.54,2.14,.03],f,.39,.38,ivory,.86);
  cylinder(distal,.235,.40,ivory,...f).rotation.x=Math.PI/2;
  cylinder(distal,.173,.036,teal,f[0],f[1],.305).rotation.x=Math.PI/2;
  flangeBolts(distal,f[0],f[1],.328,.129,4,dark,true);
  robotLink(wrist,[-.78,1.69,.06],[-.98,1.28,.10],.39,.37,ivory,.78);
  cylinder(wrist,.194,.18,silver,-.99,1.225,.1);
  cylinder(wrist,.161,.05,dark,-.99,1.11,.1);
  box(fingers,.39,.15,.27,.025,dark,-.99,1.01,.10);
  for(const s of [-1,1]){
    robotLink(fingers,[-.99+s*.15,.99,.10],[-.99+s*.19,.62,.10],.11,.11,teal);
    box(pads,.086,.16,.125,.014,dark,-.99+s*.142,.67,.10);
    for(let ridge=0;ridge<4;ridge++) box(pads,.016,.010,.105,.003,dark,-.99+s*.095,.621+ridge*.031,.10);
  }
  wire(cable,[[.74,2.33,-.09],[.53,2.47,-.21],[.19,2.33,-.19],[-.13,2.05,-.14],[-.52,2.01,-.13],[-.77,1.85,-.13],[-.94,1.55,-.06]],.042,dark);
  box(fixture,.96,.139,.66,.021,silver,-.99,.200,.10);
  make(fixture,new T.TorusGeometry(.235,.045,9,48),dark,-.99,.285,.10).rotation.x=Math.PI/2;
  flangeBolts(fixture,-.99,.286,.10,.36,8,bright);
  return model;
}

function desktopServoArm() {
  const model=new T.Group();
  const base=group(model,'base'), slew=group(model,'slew'), brackets=group(model,'brackets'), servos=group(model,'servos');
  const upper=group(model,'upper'), forearm=group(model,'forearm'), pivots=group(model,'pivots'), wiring=group(model,'wiring');
  const wrist=group(model,'wrist'), jaws=group(model,'jaws'), feet=group(model,'feet'), pads=group(model,'pads');
  const steel=material('#bdc2c5',.73,.38), blue=material('#243851',.48,.40);
  box(base,1.27,.16,1.11,.024,steel,-.63,.157,0);
  box(base,1.27,.075,1.11,.022,blue,-.63,.256,0);
  for(const x of [-1.14,-.13]) for(const z of [-.45,.45]){
    cylinder(feet,.061,.105,dark,x,.065,z);
    cylinder(base,.039,.025,bright,x,.307,z);
  }
  cylinder(slew,.446,.131,steel,-.62,.348,0);
  cylinder(slew,.363,.090,blue,-.62,.447,0);
  flangeBolts(slew,-.62,.422,0,.403,8,bright);
  for(const z of [-.225,.225]) box(brackets,.57,.57,.086,.024,blue,-.61,.77,z);
  const s=[-.66,.79,0],e=[-.34,1.89,0],w=[.96,1.47,0];
  for(const [x,y,z] of [s,e,w]){
    box(servos,.385,.328,.365,.028,dark,x,y,z);
    box(servos,.402,.108,.387,.013,blue,x,y-.12,z);
    cylinder(pivots,.144,.05,steel,x,y,.239).rotation.x=Math.PI/2;
    flangeBolts(pivots,x,y,.271,.099,6,dark,true);
  }
  for(const z of [-.22,.22]){
    for(const off of [-.113,.113]) {
      robotLink(upper,[s[0]+off,s[1],z],[e[0]+off,e[1],z],.080,.074,steel,.83);
      robotLink(forearm,[e[0],e[1]+off,z],[w[0],w[1]+off,z],.072,.075,steel,.83);
    }
    for(const [x,y] of [[-.66,.87],[-.38,1.75],[-.16,1.84],[.40,1.64],[.88,1.49]]) box(x<-.20?upper:forearm,.16,.15,.085,.019,steel,x,y,z);
  }
  box(wrist,.28,.36,.47,.032,blue,1.14,1.43,0);
  box(wrist,.12,.29,.47,.023,steel,1.30,1.41,0);
  for(const side of [-1,1]){
    robotLink(jaws,[1.32,1.41,side*.14],[1.51,1.38,side*.28],.12,.11,steel);
    robotLink(jaws,[1.51,1.38,side*.28],[1.78,1.37,side*.26],.13,.11,steel);
    box(pads,.22,.095,.038,.012,dark,1.68,1.37,side*.204);
    for(let ridge=0;ridge<6;ridge++) box(pads,.013,.072,.009,.002,dark,1.59+ridge*.036,1.37,side*.183);
  }
  for(const [i,color] of ['#202124','#c25420','#c79737'].entries()){
    const dz=-.29-i*.025;
    wire(wiring,[[-.81,.59,dz],[-.93,.98,dz],[-.72,1.64,dz],[-.49,2.06,dz],[-.10,1.98,dz],[.16,1.74,dz],[.59,1.60,dz],[.82,1.74,dz],[1.04,1.57,dz]],.014,material(color,.05,.55));
  }
  return model;
}

function blueScaraRobot() {
  const model=new T.Group();
  const base=group(model,'base'), column=group(model,'column'), shoulder=group(model,'shoulder');
  const inner=group(model,'inner'), elbow=group(model,'elbow'), outer=group(model,'outer');
  const head=group(model,'head'), slide=group(model,'slide'), tip=group(model,'tip'), cable=group(model,'cable');
  const hatch=group(model,'hatch'), glands=group(model,'glands');
  const blue=material('#263c58',.44,.43), ivory=material('#dbdedc',.23,.43);
  box(base,1.04,.13,1.03,.028,blue,1.05,.07,0);
  for(const x of [.61,1.49]) for(const z of [-.43,.43]) cylinder(base,.039,.055,bright,x,.161,z);
  box(column,.76,.86,.72,.050,blue,1.05,.55,0);
  box(hatch,.50,.59,.033,.014,silver,1.05,.54,.370);
  for(const x of [.845,1.255]) for(const y of [.304,.776]) cylinder(hatch,.018,.009,bright,x,y,.392).rotation.x=Math.PI/2;
  cylinder(shoulder,.400,.18,silver,1.04,1.044,0);
  cylinder(shoulder,.369,.11,blue,1.04,1.173,0);
  robotLink(inner,[1.05,1.14,.02],[.22,1.14,.41],.18,.33,silver,1);
  cylinder(elbow,.219,.18,silver,.19,1.15,.42);
  cylinder(elbow,.16,.067,blue,.19,1.264,.42);
  robotLink(outer,[.21,1.20,.40],[-1.20,1.20,.20],.19,.33,silver,.91);
  box(head,1.01,.53,.66,.09,ivory,-1.13,1.53,.20);
  box(head,1.02,.143,.67,.034,blue,-1.13,1.27,.20);
  box(head,.36,.041,.40,.017,blue,-1.33,1.798,.20);
  for(const x of [-1.53,-1.29]) cylinder(slide,.043,.41,bright,x,1.01,.20);
  cylinder(slide,.13,.085,silver,-1.41,.798,.20);
  cylinder(slide,.058,.35,silver,-1.41,.67,.20);
  cylinder(tip,.043,.11,bright,-1.41,.444,.20);
  cylinder(tip,.022,.088,dark,-1.41,.354,.20);
  const path=[[-1.02,1.82,.14],[-.96,2.16,.13],[-.53,2.44,.11],[.11,2.45,.07],[.72,2.23,.015],[.98,1.87,0],[1.02,1.30,0]];
  cylinder(glands,.105,.105,blue,1.02,1.279,0);
  make(glands,new T.CylinderGeometry(.076,.093,.097,8),dark,1.02,1.370,0);
  make(glands,new T.CylinderGeometry(.076,.089,.089,8),dark,-1.02,1.851,.14);
  wire(cable,path,.063,dark);
  const curve=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(...p)));
  for(let i=0;i<=54;i++) {
    const t=i/54,p=curve.getPointAt(t);
    const ring=make(cable,new T.TorusGeometry(.061,.008,6,24),dark,...p.toArray());
    ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),curve.getTangentAt(t).normalize());
  }
  return model;
}

function deltaPickAndPlace() {
  const model=new T.Group();
  const frame=group(model,'frame'), drives=group(model,'drives'), hub=group(model,'hub'), upper=group(model,'upper');
  const links=group(model,'links'), joints=group(model,'joints'), tool=group(model,'tool'), cups=group(model,'cups');
  const lines=group(model,'lines'), tray=group(model,'tray'), manifold=group(model,'manifold');
  const blue=material('#273b56',.39,.42), rod=material('#303132',.44,.44);
  for(const x of [-1.43,1.43]) for(const z of [-.65,.65]){
    box(frame,.16,2.23,.16,.011,silver,x,1.17,z);
    box(frame,.035,2.03,.008,.003,dark,x,1.15,z+.082);
    box(frame,.31,.062,.31,.012,silver,x,.058,z);
    box(frame,.23,.20,.23,.021,blue,x,2.25,z);
  }
  for(const z of [-.65,.65]) box(frame,2.90,.14,.14,.010,silver,0,2.27,z);
  for(const x of [-1.43,1.43]) box(frame,.14,.14,1.30,.010,silver,x,2.27,0);
  cylinder(hub,.385,.242,bright,0,2.112,0);
  cylinder(hub,.315,.080,silver,0,1.96,0);
  for(const angle of [.12,2.21,4.31]){
    const c=Math.cos(angle),s=Math.sin(angle),dx=-s*.083,dz=c*.083;
    const inner=[c*.34,2.097,s*.34],outer=[c*1.12,1.86,s*.89],lower=[c*.227,.70,s*.227];
    box(drives,.26,.25,.25,.028,dark,...inner);
    robotLink(upper,inner,outer,.198,.19,blue,.67);
    for(const sign of [-1,1]){
      const a=[outer[0]+dx*sign,outer[1],outer[2]+dz*sign],b=[lower[0]+dx*sign,lower[1],lower[2]+dz*sign];
      robotLink(links,a,b,.027,.034,rod,1);
      for(const p of [a,b]) make(joints,new T.SphereGeometry(.053,20,14),silver,...p);
    }
  }
  cylinder(tool,.287,.080,silver,0,.696,0);
  box(manifold,.66,.076,.31,.019,silver,0,.47,0);
  for(const x of [-.277,.277]) cylinder(manifold,.022,.013,bright,x,.516,.10);
  for(const x of [-.083,.083]) {
    cylinder(manifold,.026,.041,blue,x,.528,0);
    cylinder(manifold,.016,.019,bright,x,.557,0);
  }
  cylinder(tool,.084,.23,dark,0,.576,0);
  for(const x of [-.245,-.08,.08,.245]){
    cylinder(cups,.027,.09,silver,x,.387,.02);
    make(cups,new T.CylinderGeometry(.034,.057,.058,26),material('#1b57a5',.12,.57),x,.319,.02);
  }
  for(const x of [-.035,.035]) wire(lines,[[x,1.99,0],[x+.04,1.70,.03],[x+.07,1.30,.04],[x-.01,.95,.06],[x-.067,.69,.01],[x-.074,.53,0]],.019,material('#155db0',.14,.45));
  box(tray,1.78,.063,.87,.023,silver,0,.115,0);
  for(const x of [-.86,.86]) box(tray,.050,.11,.88,.015,bright,x,.174,0);
  for(const z of [-.416,.416]) box(tray,1.72,.11,.045,.013,bright,0,.174,z);
  return model;
}

function cartesianGantry() {
  const model=new T.Group();
  const frame=group(model,'frame'), feet=group(model,'feet'), rails=group(model,'rails'), bridge=group(model,'bridge');
  const carriage=group(model,'carriage'), slide=group(model,'slide'), motor=group(model,'motor');
  const chain=group(model,'chain'), tool=group(model,'tool'), axisDrive=group(model,'axis-drive'), gussets=group(model,'gussets');
  const blue=material('#263d58',.44,.44), railFinish=material('#a9b0b2',.73,.36);
  for(const x of [-1.44,1.44]) for(const z of [-.88,.88]) {
    box(frame,.17,1.16,.17,.013,blue,x,.685,z);
    cylinder(feet,.043,.149,silver,x,.135,z);
    cylinder(feet,.093,.045,dark,x,.051,z);
    box(frame,.214,.224,.198,.012,blue,x,1.30,z);
    robotLink(gussets,[x,1.16,z],[x,1.32,z-Math.sign(z)*.29],.087,.10,blue,1);
  }
  for(const z of [-.88,.88]) box(frame,2.91,.12,.13,.012,blue,0,.38,z);
  for(const x of [-1.44,1.44]){
    box(frame,.136,.12,1.76,.012,blue,x,.38,0);
    box(rails,.198,.176,1.98,.012,railFinish,x,1.29,0);
    for(const dx of [-.059,.059]) box(rails,.014,.012,1.94,.004,dark,x+dx,1.385,0);
  }
  box(axisDrive,.19,.168,.29,.027,dark,-1.44,1.32,1.075);
  box(axisDrive,.185,.155,.048,.008,bright,-1.44,1.32,1.207);
  for(let i=0;i<5;i++) box(axisDrive,.196,.175,.012,.003,dark,-1.44,1.32,1.005+i*.029);
  const z=-.26;
  box(bridge,2.84,.214,.182,.018,railFinish,0,1.55,z);
  for(const y of [1.492,1.595]) box(bridge,2.77,.021,.020,.004,silver,0,y,z+.095);
  for(const x of [-1.41,1.41]){
    box(bridge,.26,.29,.26,.022,blue,x,1.48,z);
    box(bridge,.32,.102,.36,.011,dark,x,1.39,z);
  }
  box(carriage,.50,.35,.115,.016,blue,.24,1.55,z+.142);
  box(slide,.24,1.16,.195,.017,railFinish,.25,1.64,z+.24);
  for(const x of [.176,.323]) box(slide,.027,.994,.029,.007,bright,x,1.62,z+.35);
  box(motor,.209,.26,.205,.019,dark,.25,2.34,z+.25);
  box(motor,.19,.039,.21,.008,silver,.25,2.19,z+.25);
  box(tool,.22,.114,.205,.015,silver,.25,1.018,z+.24);
  cylinder(tool,.047,.102,bright,.25,.936,z+.25);
  const path=new T.CatmullRomCurve3([[-1.23,1.62,z-.10],[-.98,1.73,z-.14],[-.20,1.77,z-.15],[.83,1.79,z-.15],[1.13,1.92,z-.15],[.97,2.07,z-.15],[.29,2.08,z-.15]].map(p=>new T.Vector3(...p)));
  for(let i=0;i<=38;i++){
    const t=i/38,p=path.getPointAt(t),v=path.getTangentAt(t);
    box(chain,.080,.096,.128,.007,dark,...p.toArray()).rotation.z=Math.atan2(v.y,v.x);
  }
  wire(chain,[[.24,2.06,z-.14],[.12,2.21,z-.05],[.13,2.46,z+.11],[.25,2.49,z+.25]],.027,dark);
  return model;
}

function twoWheelTeachingRobot() {
  const model=new T.Group();
  const chassis=group(model,'chassis'), deck=group(model,'deck'), wheels=group(model,'wheels'), tires=group(model,'tires');
  const motors=group(model,'motors'), caster=group(model,'caster'), sensor=group(model,'sensor'), stand=group(model,'stand');
  const board=group(model,'board'), battery=group(model,'battery'), cables=group(model,'cables'), headers=group(model,'headers');
  const blue=material('#214a77',.35,.43), rubber=material('#222527',.08,.77);
  box(chassis,1.61,.148,1.55,.055,silver,0,.47,.02);
  for(const x of [-.75,.75]) box(chassis,.10,.43,1.53,.031,blue,x,.68,.01);
  for(const x of [-.64,.64]) for(const z of [-.63,.63]) cylinder(deck,.037,.55,silver,x,.83,z);
  box(deck,1.51,.097,1.45,.035,silver,0,1.145,.014);
  for(const x of [-.63,.63]) for(const z of [-.63,.63]) cylinder(deck,.054,.021,dark,x,1.201,z);
  for(const s of [-1,1]){
    const x=s*.97;
    cylinder(tires,.531,.242,rubber,x,.575,-.045).rotation.z=Math.PI/2;
    for(let i=0;i<30;i++) {
      const a=i*Math.PI/15;
      for(const d of [-.073,.073]) box(tires,.103,.044,.071,.009,rubber,x+d,.575+.52*Math.cos(a),-.045+.52*Math.sin(a)).rotation.x=a;
    }
    const face=x+s*.133;
    make(wheels,new T.TorusGeometry(.429,.036,9,56),silver,face,.575,-.045).rotation.y=Math.PI/2;
    cylinder(wheels,.120,.038,silver,face,.575,-.045).rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      box(wheels,.038,.325,.072,.011,silver,face,.575+.246*Math.cos(a),-.045+.246*Math.sin(a)).rotation.x=a;
    }
    box(motors,.32,.26,.40,.037,silver,s*.56,.73,-.045);
    cylinder(motors,.087,.14,bright,s*.78,.58,-.045).rotation.z=Math.PI/2;
    for(const [i,color] of ['#c64132','#d7a23b','#24252a'].entries()){
      const ox=(i-1)*.028;
      wire(cables,[[s*.43+ox,1.26,.37],[s*.61+ox,1.20,.51],[s*.64+ox,1.02,.62],[s*.54+ox,.79,.45],[s*.54+ox,.73,.11]],.014,material(color,.05,.52));
    }
  }
  cylinder(caster,.112,.069,silver,0,.35,.69);
  for(const x of [-.083,.083]) box(caster,.045,.203,.19,.009,bright,x,.235,.69);
  cylinder(caster,.113,.12,rubber,0,.151,.697).rotation.z=Math.PI/2;
  box(sensor,.65,.35,.092,.028,blue,0,.706,.821);
  for(const x of [-.163,.163]){
    cylinder(sensor,.111,.057,silver,x,.713,.893).rotation.x=Math.PI/2;
    cylinder(sensor,.081,.034,dark,x,.713,.925).rotation.x=Math.PI/2;
  }
  box(battery,.66,.29,.68,.049,dark,0,.814,.01);
  boardPlate(board,1.01,.79,[],boardBlue);board.position.set(0,1.215,.10);
  surfaceChip(board,.07,.01,.204,.19,4);
  headers.position.copy(board.position);
  for(const x of [-.4,.4]) {
    box(headers,.087,.112,.64,.009,dark,x,.127,-.017);
    for(let i=0;i<10;i++) box(headers,.022,.030,.022,.004,boardGold,x,.196,-.28+i*.057);
  }
  box(stand,.48,.35,.085,.013,blue,0,1.41,-.59);
  for(const x of [-.155,0,.155]) for(const y of [1.32,1.48]) cylinder(stand,.023,.006,bright,x,y,-.543).rotation.x=Math.PI/2;
  box(stand,.68,.074,.31,.018,blue,0,1.626,-.60);
  for(const x of [-.24,0,.24]) cylinder(stand,.032,.008,bright,x,1.669,-.60);
  return model;
}

function fourWheelRover() {
  const model=new T.Group();
  const chassis=group(model,'chassis'), deck=group(model,'deck'), bumpers=group(model,'bumpers'), skid=group(model,'skid');
  const tires=group(model,'tires'), hubs=group(model,'hubs'), suspension=group(model,'suspension'), arms=group(model,'arms'), nose=group(model,'nose');
  const blue=material('#20374d',.48,.47), rubber=material('#252727',.08,.83);
  box(chassis,1.59,.39,2.02,.096,blue,0,.82,0);
  box(chassis,1.44,.14,1.83,.047,dark,0,.61,0);
  box(deck,1.48,.082,1.83,.025,silver,0,1.056,0);
  const brushedDeck=material('#b0b7ba',.49,.43);
  box(deck,1.40,.012,1.72,.008,brushedDeck,0,1.099,0);
  for(const x of [-.62,.62]) for(const z of [-.75,0,.75]) cylinder(deck,.033,.012,bright,x,1.107,z);
  for(const s of [-1,1]){
    const z=s*1.08;
    wire(bumpers,[[-.78,1.02,z*.83],[-.83,1.18,z],[-.63,1.21,z*1.09],[.63,1.21,z*1.09],[.83,1.18,z],[.78,1.02,z*.83]],.052,blue);
  }
  box(skid,1.04,.34,.10,.028,silver,0,.667,1.001).rotation.x=.40;
  box(nose,.91,.22,.061,.021,silver,0,.94,1.035);
  for(const side of [-1,1]) for(let slot=0;slot<3;slot++){
    box(nose,.095-slot*.015,.016,.012,.004,dark,side*.345,.905+slot*.034,1.069);
  }
  for(const x of [-.32,-.16,0,.16,.32]) box(skid,.043,.14,.017,.005,dark,x,.645,1.063).rotation.set(.40,0,-.39);
  for(const s of [-1,1]) for(const z of [-.73,.73]){
    const x=s*.98;
    cylinder(tires,.46,.328,rubber,x,.46,z).rotation.z=Math.PI/2;
    for(let i=0;i<24;i++) for(const [offset,phase] of [[-.10,0],[.10,.10]]){
      const a=i*Math.PI/12+phase;
      const lug=box(tires,.158,.06,.093,.01,rubber,x+offset,.46+.457*Math.cos(a),z+.457*Math.sin(a));
      lug.rotation.set(a,Math.sign(offset)*.25,0);
    }
    const outside=x+s*.174;
    make(hubs,new T.TorusGeometry(.306,.033,10,48),silver,outside,.46,z).rotation.y=Math.PI/2;
    cylinder(hubs,.108,.042,silver,outside,.46,z).rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      box(hubs,.035,.233,.073,.010,bright,outside,.46+.197*Math.cos(a),z+.197*Math.sin(a)).rotation.x=a;
    }
    robotLink(arms,[s*.49,.61,z-.16],[s*.83,.47,z],.065,.092,silver);
    robotLink(arms,[s*.49,.61,z+.16],[s*.83,.47,z],.065,.092,silver);
    robotLink(suspension,[s*.77,.98,z],[s*.91,.54,z],.060,.066,dark);
    const coil=Array.from({length:84},(_,i)=>{
      const t=i/83,a=12*Math.PI*t;
      return [s*(.78+.12*t)+.062*Math.cos(a),.93-.32*t,z+.053*Math.sin(a)];
    });
    wire(suspension,coil,.013,bright);
  }
  return model;
}

function trackedInspectionRobot() {
  const model=new T.Group();
  const hull=group(model,'hull'), tracks=group(model,'tracks'), sprockets=group(model,'sprockets');
  const bogies=group(model,'bogies'), sides=group(model,'sides'), camera=group(model,'camera');
  const lights=group(model,'lights'), handle=group(model,'handle'), grille=group(model,'grille'), idlers=group(model,'idlers'), bezel=group(model,'bezel');
  const blue=material('#233a54',.43,.44), rubber=material('#212325',.09,.76);
  box(hull,1.44,.65,2.04,.123,blue,0,.62,0);
  box(hull,1.22,.068,1.70,.023,silver,0,.971,-.063);
  box(hull,1.19,.57,.12,.045,silver,0,.596,1.021);
  for(const s of [-1,1]){
    const x=s*.89;
    for(const z of [-.75,.75]){
      const wheel=z<0?sprockets:idlers;
      cylinder(wheel,.406,.245,dark,x,.444,z).rotation.z=Math.PI/2;
      cylinder(wheel,.294,.044,silver,x+s*.145,.444,z).rotation.z=Math.PI/2;
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        cylinder(wheel,.023,.017,bright,x+s*.171,.444+.246*Math.cos(a),z+.246*Math.sin(a)).rotation.z=Math.PI/2;
      }
    }
    for(const z of [-.37,0,.37]){
      cylinder(bogies,.154,.25,dark,x,.24,z).rotation.z=Math.PI/2;
      cylinder(bogies,.106,.039,silver,x+s*.143,.24,z).rotation.z=Math.PI/2;
    }
    const pads=[];
    for(let i=0;i<16;i++) {
      const a=-Math.PI/2+i*Math.PI/15;
      pads.push([.444+.425*Math.sin(a),.75+.425*Math.cos(a),a],[.444+.425*Math.sin(a+Math.PI),-.75+.425*Math.cos(a+Math.PI),a+Math.PI]);
    }
    for(let i=1;i<14;i++) pads.push([.869,-.75+i*1.5/14,Math.PI/2],[.019,-.75+i*1.5/14,-Math.PI/2]);
    for(const [y,z,a] of pads){
      box(tracks,.36,.123,.079,.009,rubber,x,y,z).rotation.x=a;
      box(tracks,.386,.056,.023,.006,dark,x,y+.041*Math.sin(a),z+.041*Math.cos(a)).rotation.x=a;
    }
    box(sides,.051,.33,1.33,.024,silver,x+s*.159,.54,0);
    for(const z of [-.30,-.20,-.10]) box(sides,.009,.116,.038,.006,dark,x+s*.187,.54,z).rotation.x=.36;
  }
  box(camera,.48,.47,.15,.033,dark,0,.59,1.106);
  box(bezel,.55,.49,.045,.058,silver,0,.59,1.181);
  for(const x of [-.213,.213]) for(const y of [.414,.766]){
    cylinder(bezel,.026,.014,dark,x,y,1.206).rotation.x=Math.PI/2;
  }
  cylinder(camera,.172,.073,dark,0,.59,1.204).rotation.x=Math.PI/2;
  cylinder(camera,.105,.020,material('#34495e',.48,.15),0,.59,1.249).rotation.x=Math.PI/2;
  for(const x of [-.405,.405]){
    box(lights,.17,.43,.061,.020,dark,x,.61,1.105);
    for(const y of [.49,.61,.73]) box(lights,.117,.084,.033,.010,white,x,y,1.149);
  }
  wire(handle,[[-.36,.99,-.38],[-.35,1.20,-.38],[-.23,1.28,-.38],[.23,1.28,-.38],[.35,1.20,-.38],[.36,.99,-.38]],.053,silver);
  box(grille,.76,.070,.56,.020,blue,0,1.018,.47);
  for(let i=0;i<9;i++) box(grille,.038,.019,.401,.006,dark,-.30+i*.075,1.060,.47);
  return model;
}

function mecanumPlatform() {
  const model=new T.Group();
  const frame=group(model,'frame'), top=group(model,'top'), panels=group(model,'panels');
  const axles=group(model,'axles'), plates=group(model,'plates'), rollers=group(model,'rollers'), pins=group(model,'pins');
  const navy=material('#20384e',.46,.45), roll=material('#213244',.16,.63);
  box(frame,1.74,.44,2.25,.073,navy,0,.475,0);
  box(top,1.78,.073,2.27,.022,silver,0,.734,0);
  for(let i=0;i<8;i++) for(let j=0;j<7;j++) cylinder(top,.016,.004,dark,-.72+j*.24,.773,-.97+i*.276);
  for(const z of [-1.13,1.13]){
    box(panels,1.56,.35,.066,.031,silver,0,.475,z);
    box(panels,1.30,.22,.018,.008,navy,0,.524,z+Math.sign(z)*.038);
    for(const x of [-.45,.45]) box(panels,.207,.030,.014,.003,dark,x,.353,z+Math.sign(z)*.041);
  }
  const plateProfile=new T.Shape();
  for(let i=0;i<96;i++){
    const angle=i*Math.PI/48, r=.301+.056*Math.cos(angle*8);
    const xy=[r*Math.cos(angle),r*Math.sin(angle)];
    if(i===0) plateProfile.moveTo(...xy); else plateProfile.lineTo(...xy);
  }
  plateProfile.closePath();
  const plateGeometry=new T.ExtrudeGeometry(plateProfile,{depth:.029,bevelEnabled:true,bevelSize:.009,bevelThickness:.006,bevelSegments:2});
  for(const s of [-1,1]) for(const z of [-.77,.77]){
    const x=s*.98,r=.385,y=.446;
    cylinder(axles,.107,.37,silver,s*.86,y,z).rotation.z=Math.PI/2;
    for(const shift of [-.126,.126]){
      const face=x+shift;
      make(plates,plateGeometry,silver,face,y,z).rotation.y=Math.PI/2;
      cylinder(plates,.112,.051,dark,face,y,z).rotation.z=Math.PI/2;
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        cylinder(plates,.032,.012,dark,face+s*.026,y+.247*Math.cos(a),z+.247*Math.sin(a)).rotation.z=Math.PI/2;
      }
    }
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4, hand=s*Math.sign(z);
      const direction=new T.Vector3(.74,-hand*.65*Math.sin(a),hand*.65*Math.cos(a)).normalize();
      const roller=make(rollers,new T.CapsuleGeometry(.087,.244,8,18),roll,x,y+r*Math.cos(a),z+r*Math.sin(a));
      roller.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);
      for(const sign of [-1,1]){
        const end=roller.position.clone().addScaledVector(direction,sign*.213);
        const pin=cylinder(pins,.032,.050,bright,...end.toArray());
        pin.quaternion.copy(roller.quaternion);
      }
    }
  }
  return model;
}

function warehouseMobileRobot() {
  const model=new T.Group();
  const lower=group(model,'lower'), shell=group(model,'shell'), deck=group(model,'deck'), wheels=group(model,'wheels');
  const bumper=group(model,'bumper'), lidar=group(model,'lidar'), lights=group(model,'lights'), guides=group(model,'guides'), crate=group(model,'crate');
  const grips=group(model,'grips');
  const navy=material('#1c4267',.45,.37), bin=material('#666d75',.05,.63), darkTrim=material('#23272c',.16,.60);
  box(lower,2.17,.31,1.70,.133,darkTrim,0,.270,0);
  box(shell,2.14,.32,1.70,.128,silver,0,.544,0);
  box(deck,2.10,.22,1.67,.108,navy,0,.765,0);
  box(deck,1.88,.064,1.50,.034,dark,0,.897,0);
  for(const s of [-1,1]){
    cylinder(wheels,.359,.144,darkTrim,s*1.041,.369,-.27).rotation.z=Math.PI/2;
    cylinder(wheels,.303,.049,silver,s*1.12,.369,-.27).rotation.z=Math.PI/2;
    cylinder(wheels,.111,.017,bright,s*1.147,.369,-.27).rotation.z=Math.PI/2;
    box(guides,.076,.236,1.48,.026,silver,s*.88,.981,0);
    box(lights,.347,.048,.032,.015,new T.MeshStandardMaterial({color:'#a0ddff',emissive:'#4c9fdb',emissiveIntensity:.8}),s*.72,.461,.849);
  }
  box(bumper,2.08,.15,.175,.054,darkTrim,0,.218,.805);
  box(lidar,.65,.35,.114,.035,dark,0,.43,.844);
  cylinder(lidar,.198,.237,dark,0,.436,.855);
  for(const x of [-.304,.304]) {
    box(shell,.043,.26,.20,.015,silver,x,.43,.895);
  }
  cylinder(lidar,.202,.073,material('#2f4d61',.43,.20),0,.46,.855);
  box(crate,1.61,.077,1.31,.027,bin,0,.988,0);
  for(const s of [-1,1]){
    box(crate,.074,.69,1.34,.024,bin,s*.802,1.351,0);
    box(crate,1.61,.69,.071,.024,bin,0,1.351,s*.669);
    box(crate,.102,.089,1.40,.013,bin,s*.810,1.722,0);
    box(crate,1.71,.089,.102,.013,bin,0,1.722,s*.682);
    box(grips,.435,.123,.029,.020,darkTrim,0,1.56,s*.719);
    box(grips,.475,.028,.039,.012,bin,0,1.504,s*.733);
    box(grips,.029,.092,.039,.009,bin,s*.228,1.555,s*.733);
    for(const x of [-.52,-.35,.35,.52]){
      box(crate,.035,.127,.063,.007,bin,x,1.636,s*.700);
    }
    for(const x of [-.685,.685]){
      box(crate,.046,.65,.044,.009,bin,x,1.35,s*.721);
      box(crate,.119,.080,.051,.009,bin,x,1.62,s*.722);
    }
  }
  return model;
}

function palletGuidedVehicle() {
  const m=new T.Group(), chassis=group(m,'chassis'), wheels=group(m,'wheels'), deck=group(m,'deck'), column=group(m,'column');
  const beacon=group(m,'beacon'), stops=group(m,'stops'), sensor=group(m,'sensor'), lights=group(m,'lights');
  const pallet=group(m,'pallet'), cartons=group(m,'cartons'), straps=group(m,'straps'), lane=group(m,'lane');
  const retainers=group(m,'retainers'), wrap=group(m,'wrap');
  const navy=material('#22384f',.45,.42), wood=material('#a08157',.03,.85), cardboard=material('#a48f73',.06,.80);
  box(chassis,1.48,.39,2.83,.096,navy,0,.35,0);
  box(chassis,1.51,.13,2.85,.052,dark,0,.171,0);
  box(deck,1.46,.135,2.80,.034,silver,0,.575,0);
  box(deck,1.38,.17,.56,.055,navy,0,.634,1.13);
  for(const x of [-.65,.65]) for(const z of [-.99,.65]){
    box(retainers,.092,.218,.112,.016,silver,x,.713,z);
    box(retainers,.121,.053,.161,.012,dark,x,.638,z);
  }
  for(const s of [-1,1]) for(const z of [-.96,.73]){
    cylinder(wheels,.224,.105,dark,s*.725,.238,z).rotation.z=Math.PI/2;
    cylinder(wheels,.172,.026,silver,s*.785,.238,z).rotation.z=Math.PI/2;
  }
  box(column,1.36,1.44,.225,.056,navy,0,1.22,-1.24);
  box(column,.054,1.05,.179,.020,silver,-.693,1.25,-1.24);
  cylinder(beacon,.059,.07,dark,-.54,1.96,-1.25);
  cylinder(beacon,.057,.105,new T.MeshStandardMaterial({color:'#58c277',emissive:'#3ba45d',emissiveIntensity:.7}),-.54,2.045,-1.25);
  cylinder(beacon,.059,.054,dark,-.54,2.124,-1.25);
  for(const [x,y,z] of [[.30,.741,1.03],[-.52,1.76,-1.097]]){
    cylinder(stops,.066,.03,material('#e5b324',.04,.55),x,y,z);
    cylinder(stops,.043,.047,material('#bd2526',.07,.48),x,y+.031,z);
  }
  box(sensor,.36,.21,.08,.02,dark,0,.297,1.431);
  cylinder(sensor,.108,.116,material('#19323e',.35,.22),0,.303,1.478);
  for(const x of [-.51,.51]) box(lights,.265,.047,.025,.012,white,x,.438,1.426);
  for(const x of [-.52,0,.52]) {
    box(pallet,.157,.105,1.76,.014,wood,x,.693,-.16);
    for(const z of [-.81,0,.52]) box(pallet,.177,.093,.18,.012,wood,x,.756,z);
  }
  for(let i=0;i<7;i++) box(pallet,1.29,.063,.204,.009,wood,0,.826,-.94+i*.247);
  for(const x of [-.31,.31]) for(const z of [-.62,.21]) for(const y of [1.02,1.35,1.68])
    box(cartons,.61,.324,.818,.011,cardboard,x,y,z);
  const film=new T.MeshPhysicalMaterial({color:'#dbd4c6',roughness:.32,transparent:true,opacity:.48,depthWrite:false});
  for(let pass=0;pass<10;pass++){
    const y=.91+pass*.093;
    wire(wrap,[[-.63,y,.62],[0,y+.014,.627],[.63,y+.022,.62],[.634,y+.013,-.21],[.63,y-.009,-1.03],[0,y-.021,-1.035],[-.63,y-.009,-1.03],[-.634,y-.009,-.21],[-.63,y,.62]],.011,film);
  }
  for(const x of [-.37,.37]){
    box(straps,.043,.98,.012,.003,dark,x,1.352,.631);
    box(straps,.043,.012,1.68,.003,dark,x,1.853,-.203);
  }
  box(lane,.079,.012,3.96,.003,material('#e9b324',.05,.63),0,.008,0);
  return m;
}

function rockerBogieExplorer() {
  const m=new T.Group(), terrain=group(m,'terrain'), body=group(m,'body'), solar=group(m,'solar'), mast=group(m,'mast');
  const head=group(m,'head'), optics=group(m,'optics'), antennas=group(m,'antennas'), rockers=group(m,'rockers');
  const bogies=group(m,'bogies'), tires=group(m,'tires'), hubs=group(m,'hubs'), cables=group(m,'cables');
  const noseCameras=group(m,'nose-cameras'), antennaDish=group(m,'dish');
  const alloy=material('#a69d87',.61,.52), blue=material('#233751',.39,.47), soil=material('#897662',.07,.88);
  make(terrain,new T.CylinderGeometry(1.68,1.73,.15,46),soil,0,.065,0).scale.z=1.11;
  for(let i=0;i<138;i++){
    const a=i*2.399,r=1.60*Math.sqrt(i/138);
    const rock=make(terrain,new T.DodecahedronGeometry(.029+(i%7)*.014,0),i%3?soil:alloy,r*Math.cos(a),.141,r*1.09*Math.sin(a));
    rock.scale.set(1.4,.47,.88);rock.rotation.y=a;
  }
  box(body,1.49,.35,1.92,.055,alloy,0,1.086,0);
  box(body,1.37,.20,.04,.012,blue,0,1.071,.976);
  for(const x of [-.69,.69]) {
    box(body,.13,.115,.038,.010,alloy,x,1.17,.994);
    for(const y of [1.04,1.15]) cylinder(body,.021,.016,bright,x,y,1.002).rotation.x=Math.PI/2;
  }
  box(solar,1.63,.046,2.04,.014,alloy,0,1.29,0);
  for(let i=0;i<7;i++) for(let j=0;j<10;j++) box(solar,.204,.009,.183,.003,blue,-.64+i*.213,1.32,-.885+j*.194);
  const mx=.24,mz=.51;
  cylinder(mast,.054,.89,silver,mx,1.779,mz);
  for(const y of [1.36,1.65,1.97,2.20]) cylinder(mast,.105,.065,alloy,mx,y,mz);
  box(head,.59,.24,.32,.028,alloy,mx,2.317,mz);
  for(const [x,r] of [[.06,.054],[.33,.071],[.49,.079]]){
    cylinder(optics,r,.054,dark,x,2.32,mz+.174).rotation.x=Math.PI/2;
    cylinder(optics,r*.62,.018,material('#283d47',.44,.14),x,2.32,mz+.209).rotation.x=Math.PI/2;
  }
  cylinder(antennas,.018,.56,dark,-.44,1.62,-.61);
  cylinder(antennaDish,.038,.41,silver,.26,1.52,-.57);
  make(antennaDish,new T.CylinderGeometry(.17,.083,.048,36),alloy,.26,1.737,-.57);
  for(const s of [-1,1]){
    box(noseCameras,.155,.144,.121,.022,alloy,s*.625,1.072,1.013);
    cylinder(noseCameras,.048,.017,dark,s*.625,1.072,1.081).rotation.x=Math.PI/2;
    cylinder(noseCameras,.026,.016,material('#28435a',.46,.19),s*.625,1.072,1.094).rotation.x=Math.PI/2;
    const rockerPivot=[s*.84,1.08,.16], bogiePivot=[s*.96,.78,-.37];
    robotPivot(rockers,rockerPivot,.124,.13,alloy);
    robotLink(rockers,[s*1.07,.46,1.13],rockerPivot,.12,.137,alloy);
    robotLink(rockers,rockerPivot,bogiePivot,.13,.136,alloy);
    robotPivot(bogies,bogiePivot,.103,.14,alloy);
    for(const z of [-1.08,-.12]) robotLink(bogies,bogiePivot,[s*1.06,.46,z],.096,.124,alloy);
    for(const z of [-1.08,-.12,1.13]){
      const x=s*1.14;
      cylinder(tires,.319,.216,dark,x,.468,z).rotation.z=Math.PI/2;
      for(let i=0;i<22;i++){
        const a=i*Math.PI/11;
        box(tires,.23,.039,.071,.008,dark,x,.468+.314*Math.cos(a),z+.314*Math.sin(a)).rotation.set(a,.24,0);
      }
      const face=x+s*.118;
      make(hubs,new T.TorusGeometry(.237,.023,8,38),alloy,face,.468,z).rotation.y=Math.PI/2;
      cylinder(hubs,.08,.034,alloy,face,.468,z).rotation.z=Math.PI/2;
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        box(hubs,.022,.171,.041,.007,alloy,face,.468+.15*Math.cos(a),z+.15*Math.sin(a)).rotation.x=a;
      }
    }
    wire(cables,[[s*.73,1.18,-.64],[s*.86,1.02,-.57],[s*.93,.82,-.34],[s*.99,.75,-.24]],.022,material('#b18c3d',.22,.61));
  }
  return m;
}

function inspectionQuadruped() {
  const m=new T.Group(), body=group(m,'body'), handles=group(m,'handles'), hips=group(m,'hips');
  const thighs=group(m,'thighs'), knees=group(m,'knees'), shins=group(m,'shins'), feet=group(m,'feet');
  const head=group(m,'head'), optics=group(m,'optics'), scanner=group(m,'scanner'), loom=group(m,'loom');
  const vent=group(m,'vent'), hipCaps=group(m,'hip-caps');
  const navy=material('#283a57',.48,.40), alloy=material('#b3b4ae',.68,.38);
  box(body,.91,.54,1.76,.105,navy,0,1.33,0);
  box(body,.76,.14,1.46,.041,alloy,0,1.625,0);
  for(const s of [-1,1]) {
    box(body,.048,.33,1.17,.030,alloy,s*.461,1.305,0);
    box(vent,.028,.201,.64,.015,navy,s*.491,1.31,0);
    for(let i=0;i<7;i++) box(vent,.012,.139,.023,.005,dark,s*.509,1.31,-.26+i*.087).rotation.x=.35;
    wire(handles,[[s*.30,1.68,-.64],[s*.30,1.83,-.55],[s*.30,1.84,.12],[s*.30,1.69,.22]],.029,silver);
  }
  box(head,.57,.19,.36,.041,dark,0,1.59,.95);
  box(head,.74,.27,.41,.071,alloy,0,1.896,.96);
  box(optics,.633,.172,.035,.018,dark,0,1.89,1.168);
  for(const x of [-.205,0,.205]){
    cylinder(optics,.059,.019,silver,x,1.891,1.194).rotation.x=Math.PI/2;
    cylinder(optics,.043,.024,material('#243b52',.44,.14),x,1.89,1.205).rotation.x=Math.PI/2;
  }
  cylinder(scanner,.187,.19,dark,0,2.102,.96);
  cylinder(scanner,.176,.083,material('#264b66',.46,.19),0,2.114,.96);
  cylinder(scanner,.181,.035,bright,0,2.210,.96);
  make(scanner,new T.TorusGeometry(.180,.010,8,36),alloy,0,2.050,.96).rotation.x=Math.PI/2;
  wire(loom,[[0,1.58,.69],[-.27,1.63,.79],[-.28,1.88,.84],[-.23,1.93,1.0]],.026,dark);
  for(const s of [-1,1]) for(const d of [-1,1]){
    const h=[s*.55,1.38,d*.64],k=[s*.78,.83,d*.83-.26],f=[s*.84,.20,d*.89+.12];
    robotPivot(hips,h,.193,.246,navy);
    cylinder(hipCaps,.143,.052,alloy,h[0]+s*.138,h[1],h[2]).rotation.z=Math.PI/2;
    cylinder(hipCaps,.109,.012,silver,h[0]+s*.170,h[1],h[2]).rotation.z=Math.PI/2;
    robotLink(thighs,h,k,.203,.169,navy,.75);
    robotLink(thighs,[h[0]+s*.087,1.29,h[2]],[k[0]+s*.043,.91,k[2]],.072,.072,alloy);
    robotPivot(knees,k,.102,.124,dark);
    cylinder(knees,.078,.025,alloy,k[0]+s*.071,k[1],k[2]).rotation.z=Math.PI/2;
    wire(loom,[[h[0],1.31,h[2]],[h[0]+s*.08,1.20,h[2]-.12],
      [k[0]+s*.066,.99,k[2]-.07],[k[0]+s*.067,.86,k[2]]],.017,dark);
    robotLink(shins,k,f,.124,.130,alloy,.69);
    robotPivot(feet,f,.071,.088,dark);
    box(feet,.178,.104,.21,.033,dark,f[0],.097,f[2]);
  }
  return m;
}

function sixLegWalkingPlatform() {
  const m=new T.Group(), deck=group(m,'deck'), frame=group(m,'frame'), hip=group(m,'hip');
  const upper=group(m,'upper'), knee=group(m,'knee'), lower=group(m,'lower'), feet=group(m,'feet'), cables=group(m,'cables');
  const frontVent=group(m,'front-vent');
  const navy=material('#293d52',.43,.40), alloy=material('#c3c2b9',.70,.36);
  const shape=new T.Shape().moveTo(-.56,-.87).lineTo(.56,-.87).lineTo(.82,-.50).lineTo(.82,.50).lineTo(.56,.87).lineTo(-.56,.87).lineTo(-.82,.50).lineTo(-.82,-.50).closePath();
  make(frame,new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelThickness:.025,bevelSize:.026,bevelSegments:3}),navy,0,1.05,0).rotation.x=-Math.PI/2;
  make(deck,new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelThickness:.016,bevelSize:.016,bevelSegments:3}),alloy,0,1.32,0).rotation.x=-Math.PI/2;
  for(const x of [-.48,0,.48]) for(const z of [-.67,-.40,.40,.67]) cylinder(deck,.024,.017,dark,x,1.400,z);
  for(const z of [-.28,.28]) for(let i=0;i<5;i++) box(deck,.185,.007,.019,.002,dark,0,1.399,z+i*.037);
  box(frontVent,.55,.185,.05,.014,alloy,0,1.182,.885);
  for(let slot=0;slot<10;slot++) box(frontVent,.023,.111,.012,.003,dark,-.211+slot*.047,1.179,.915).rotation.z=.17;
  for(const s of [-1,1]) for(const d of [-1,0,1]){
    const h=[s*.70,1.17,d*.68],k=[s*(d===0?1.31:1.08),1.20,d*1.03],a=[s*(d===0?1.51:1.30),.20,d*1.30];
    box(hip,.285,.215,.24,.031,dark,...h);
    robotPivot(hip,h,.119,.245,navy);
    for(const z of [-.078,.078]) robotLink(upper,[h[0],h[1],h[2]+z],[k[0],k[1],k[2]+z],.089,.076,alloy);
    robotPivot(knee,k,.137,.18,navy);
    for(const z of [-.068,.068]) robotLink(lower,[k[0],k[1]-.067,k[2]+z],[a[0],a[1],a[2]+z],.070,.053,alloy,.69);
    const mid=new T.Vector3(...k).lerp(new T.Vector3(...a),.49);
    box(lower,.126,.127,.184,.023,navy,...mid.toArray()).rotation.z=s*.19;
    cylinder(feet,.081,.176,dark,a[0],.116,a[2]);
    for(const y of [.058,.093,.128]) cylinder(feet,.085,.016,dark,a[0],y,a[2]);
    wire(cables,[[h[0],1.21,h[2]],[h[0]+s*.099,1.43,h[2]],[k[0]-s*.08,1.39,k[2]],[k[0],1.21,k[2]+.08]],.022,dark);
  }
  return m;
}

function octopodRobot() {
  const m=new T.Group(), shell=group(m,'shell'), frame=group(m,'frame'), vents=group(m,'vents'), vision=group(m,'vision');
  const hips=group(m,'hips'), upper=group(m,'upper'), knees=group(m,'knees'), lower=group(m,'lower'), feet=group(m,'feet');
  const legGuards=group(m,'leg-guards'), sideVents=group(m,'side-vents');
  const blue=material('#263a57',.51,.42);
  const shellProfile=new T.Shape().moveTo(-.25,-.76)
    .quadraticCurveTo(-.53,-.36,-.47,.19).quadraticCurveTo(-.39,.62,-.25,.75)
    .lineTo(.25,.75).quadraticCurveTo(.39,.62,.47,.19)
    .quadraticCurveTo(.53,-.36,.25,-.76).closePath();
  const carapace=new T.ExtrudeGeometry(shellProfile,{
    depth:.13,bevelEnabled:true,bevelSegments:3,bevelSize:.048,bevelThickness:.047,
  });
  make(shell,carapace,blue,0,1.34,-.08).rotation.set(-Math.PI/2+.20,0,0);
  const edgeTrim=material('#a1a8ad',.49,.43);
  for(const side of [-1,1]) {
    wire(shell,[[side*.24,1.41,.70],[side*.39,1.46,.42],[side*.47,1.53,-.09],
      [side*.43,1.60,-.47],[side*.26,1.65,-.77]],.022,edgeTrim);
  }
  box(frame,.90,.30,1.48,.08,silver,0,1.16,-.04);
  box(vents,.34,.020,.47,.009,dark,0,1.61,-.38).rotation.x=.30;
  for(let i=0;i<6;i++) box(vents,.25,.017,.018,.004,silver,0,1.625-i*.011,-.54+i*.048).rotation.x=.30;
  for(const side of [-1,1]){
    box(sideVents,.040,.139,.27,.011,silver,side*.449,1.355,-.15).rotation.x=.18;
    for(let slot=0;slot<5;slot++) box(sideVents,.012,.066,.018,.004,dark,side*.474,1.355,-.24+slot*.042).rotation.x=.25;
  }
  box(vision,.59,.21,.11,.05,dark,0,1.188,.734);
  for(const x of [-.159,.05,.179]) cylinder(vision,.05,.025,material('#264455',.38,.16),x,1.19,.8).rotation.x=Math.PI/2;
  for(const s of [-1,1]) for(const d of [-1.5,-.5,.5,1.5]){
    const h=[s*.49,1.10,d*.43],k=[s*(1.05-Math.abs(d)*.10),1.24,d*.61],f=[s*(1.48-Math.abs(d)*.06),.14,d*.79];
    robotPivot(hips,h,.114,.16,blue);
    robotLink(upper,h,k,.142,.116,silver,.84);
    robotPivot(knees,k,.112,.13,blue);
    robotLink(legGuards,k,[s*(1.28-Math.abs(d)*.08),.68,d*.70],.18,.137,blue,.60);
    robotLink(lower,[s*(1.28-Math.abs(d)*.08),.68,d*.70],f,.116,.101,silver,.54);
    box(feet,.145,.18,.14,.031,dark,f[0],.108,f[2]);
  }
  return m;
}

function serpentineRobot() {
  const m=new T.Group(), head=group(m,'head'), eye=group(m,'eye'), lamps=group(m,'lamps'), shields=group(m,'shields');
  const joints=group(m,'joints'), couplers=group(m,'couplers'), tail=group(m,'tail');
  const crown=group(m,'crown');
  const blue=material('#283d58',.48,.42);
  const path=new T.CatmullRomCurve3([[-1.42,.25,1.11],[-.46,.25,.89],[.51,.25,.78],[1.20,.25,.30],[.91,.24,-.17],[.07,.23,-.29],[-.76,.23,-.51],[-.86,.21,-.93],[.07,.19,-1.15],[1.28,.11,-1.17]].map(p=>new T.Vector3(...p)));
  const orient=(mesh,t)=>{
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),path.getTangentAt(t).normalize());
    return mesh;
  };
  for(let i=1;i<=15;i++){
    const t=i/16,p=path.getPointAt(t),r=.222*(1-.61*Math.max(0,(t-.64)/.36));
    orient(cylinder(shields,r,.27,i%2?blue:silver,...p.toArray()),t);
    const mid=path.getPointAt(t-.025);
    orient(cylinder(joints,r*.80,.225,dark,...mid.toArray()),t);
    const sleeveEdge=path.getPointAt(t-.031);
    orient(cylinder(joints,r*.85,.039,silver,...sleeveEdge.toArray()),t);
    for(const y of [-.12,.12]){
      const edge=p.clone().addScaledVector(path.getTangentAt(t),y);
      const ring=make(couplers,new T.TorusGeometry(r*.98,.012,8,36),silver,...edge.toArray());
      ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),path.getTangentAt(t));
    }
  }
  const start=path.getPointAt(.035);
  orient(make(head,new T.CylinderGeometry(.24,.173,.47,12),silver,...start.toArray()),.035);
  const cap=box(crown,.255,.036,.236,.024,blue,start.x,start.y+.203,start.z);
  const heading=path.getTangentAt(.035);
  cap.rotation.y=Math.atan2(heading.x,heading.z);
  for(let slot=0;slot<4;slot++){
    const offset=new T.Vector3((slot-1.5)*.043,0,.016).applyAxisAngle(new T.Vector3(0,1,0),cap.rotation.y);
    box(crown,.019,.008,.087,.003,dark,cap.position.x+offset.x,cap.position.y+.021,cap.position.z+offset.z).rotation.y=cap.rotation.y;
  }
  const origin=path.getPointAt(0), normal=path.getTangentAt(0).negate();
  orient(cylinder(eye,.124,.046,dark,...origin.toArray()),0);
  orient(cylinder(eye,.084,.024,material('#223d4b',.52,.15),...origin.clone().addScaledVector(normal,.034).toArray()),0);
  const right=new T.Vector3().crossVectors(normal,new T.Vector3(0,1,0)).normalize();
  for(const s of [-1,1]) orient(cylinder(lamps,.040,.025,white,...origin.clone().addScaledVector(right,s*.145).addScaledVector(normal,.012).toArray()),0);
  const endpoint=path.getPointAt(.98);
  orient(make(tail,new T.ConeGeometry(.10,.28,20),blue,...endpoint.toArray()),.98);
  return m;
}

function bioInspiredRobotFish() {
  const m=new T.Group(), nose=group(m,'nose'), frame=group(m,'frame'), sensor=group(m,'sensor');
  const body=group(m,'body'), joints=group(m,'joints'), rings=group(m,'rings'), tail=group(m,'tail');
  const fins=group(m,'fins'), wiring=group(m,'wiring');
  const dorsal=group(m,'dorsal'), finHubs=group(m,'fin-hubs');
  const navy=material('#183d62',.47,.37), foil=material('#8da9bc',.43,.39), window=new T.MeshPhysicalMaterial({color:'#8bb9c9',roughness:.17,transparent:true,opacity:.25,depthWrite:false,metalness:.09});
  const place=(part,profile,finish,x)=>{
    const mesh=make(part,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),finish,x,.84,0);
    mesh.rotation.z=-Math.PI/2;mesh.scale.x=.79;
    return mesh;
  };
  place(nose,[[0,-.77],[.09,-.65],[.23,-.49],[.36,-.24],[.423,.01]],window,-.69).userData.cycleThrough=true;
  place(body,[[.421,-.65],[.44,-.36],[.44,0],[.37,.39],[.27,.57]],navy,-.04);
  for(const side of [-1,1]){
    const panel=new T.Shape().moveTo(-.57,-.05).lineTo(-.33,-.20).lineTo(.29,-.23).lineTo(.48,-.12)
      .lineTo(.49,.15).lineTo(.23,.25).lineTo(-.17,.18).closePath();
    const shellPanel=make(body,new T.ExtrudeGeometry(panel,{depth:.018,bevelSize:.017,bevelThickness:.009,bevelSegments:3}),silver,0,.82,side*.403);
    shellPanel.rotation.y=side===1?.11:Math.PI-.11;
  }
  place(frame,[[.425,-.049],[.425,.05]],silver,-.68);
  box(frame,.37,.13,.18,.022,dark,-.94,.742,0);
  for(const s of [-1,1]){
    cylinder(sensor,.107,.039,silver,-.96,.868,s*.260).rotation.x=Math.PI/2;
    cylinder(sensor,.071,.029,material('#294559',.42,.15),-.96,.868,s*.285).rotation.x=Math.PI/2;
  }
  wire(wiring,[[-1.19,.81,.086],[-1.03,.96,.139],[-.86,1.015,.119],[-.68,.957,.092]],.021,material('#b87b27',.31,.48));
  for(let i=0;i<4;i++){
    const r=.268-i*.041,x=.51+i*.222;
    axial(joints,r*.79,.245,dark,x).position.set(x,.84,0);
    axial(rings,r,.141,i%2?navy:silver,x+.079).position.set(x+.079,.84,0);
  }
  const fin=(part,points,x,y,z,angle=0)=>{
    const shape=new T.Shape();
    points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));
    shape.closePath();
    make(part,new T.ExtrudeGeometry(shape,{depth:.027,bevelEnabled:true,bevelThickness:.016,bevelSize:.015,bevelSegments:3}),foil,x,y,z).rotation.x=angle;
  };
  fin(dorsal,[[0,0],[.24,.28],[.63,.47],[.42,0]],-.44,1.145,0);
  for(const s of [-1,1]){
    fin(fins,[[0,0],[.30,.37],[.66,.38],[.31,0]],-.58,.71,s*.28,s*.85);
    cylinder(finHubs,.068,.036,silver,-.55,.727,s*.391).rotation.x=Math.PI/2;
    cylinder(finHubs,.028,.014,dark,-.55,.727,s*.413).rotation.x=Math.PI/2;
  }
  fin(tail,[[0,0],[.22,.35],[.58,.59],[.48,.18],[.42,0],[.48,-.20],[.60,-.57],[.25,-.32]],1.27,.84,0);
  for(let index=0;index<7;index++){
    const t=index/6;
    wire(tail,[[1.615,.84,.027],[1.649+.045*t,.84+.19*t,.027],[1.675+.111*t,.84+.36*t,.027]],.005,silver);
    wire(tail,[[1.615,.84,.027],[1.649+.045*t,.84-.19*t,.027],[1.675+.110*t,.84-.37*t,.027]],.005,silver);
  }
  return m;
}

function cameraQuadcopter() {
  const m=new T.Group(), shell=group(m,'shell'), top=group(m,'top'), arms=group(m,'arms'), motors=group(m,'motors');
  const props=group(m,'props'), feet=group(m,'feet'), gimbal=group(m,'gimbal'), camera=group(m,'camera');
  const vents=group(m,'vents');
  const navy=material('#243e61',.48,.41), metal=material('#c0c3c0',.64,.40);
  box(shell,.68,.35,1.56,.14,navy,0,.69,0);
  box(shell,.62,.175,1.49,.086,metal,0,.872,0);
  box(top,.40,.033,.78,.017,dark,0,.967,-.15);
  for(const s of [-1,1]){
    box(vents,.041,.109,.265,.017,navy,s*.320,.743,-.21);
    for(let i=0;i<4;i++) box(vents,.012,.049,.031,.004,dark,s*.344,.751,-.28+i*.050).rotation.x=.36;
  }
  for(const s of [-1,1]) for(const f of [-1,1]){
    const x=s*(f===1?1.10:.99),z=f*.85;
    robotLink(arms,[s*.25,.71,f*.35],[x,.67,z],.20,.18,navy,.81);
    cylinder(motors,.143,.16,silver,x,.755,z);
    cylinder(motors,.130,.08,dark,x,.873,z);
    for(let slot=0;slot<10;slot++){
      const a=slot*Math.PI/5;
      cylinder(motors,.016,.014,material('#9c663e',.53,.44),x+.100*Math.cos(a),.916,z+.100*Math.sin(a));
    }
    cylinder(props,.075,.062,navy,x,.943,z);
    const blade=new T.Shape().moveTo(.015,.039).quadraticCurveTo(.29,.065,.52,.128).quadraticCurveTo(.64,.136,.68,.094).quadraticCurveTo(.58,.005,.31,-.043).lineTo(.026,-.027).closePath();
    for(const a of [0,Math.PI]){
      const rotor=new T.Group();rotor.position.set(x,.944,z);rotor.rotation.y=a+s*f*.57;props.add(rotor);
      make(rotor,new T.ExtrudeGeometry(blade,{depth:.017,bevelEnabled:true,bevelThickness:.007,bevelSize:.009,bevelSegments:2}),dark).rotation.x=-Math.PI/2;
    }
    robotLink(feet,[x,.665,z],[x+s*.072,.146,z+f*.036],.102,.098,navy,.71);
    box(feet,.124,.074,.13,.022,dark,x+s*.072,.138,z+f*.036);
  }
  box(gimbal,.39,.095,.28,.022,dark,0,.50,.57);
  for(const s of [-1,1]) cylinder(gimbal,.104,.063,silver,s*.173,.383,.675).rotation.z=Math.PI/2;
  box(camera,.273,.226,.205,.044,dark,0,.382,.708);
  cylinder(camera,.091,.032,metal,0,.382,.826).rotation.x=Math.PI/2;
  cylinder(camera,.062,.024,material('#264556',.39,.14),0,.382,.848).rotation.x=Math.PI/2;
  return m;
}

function surveyVtolAircraft() {
  const m=new T.Group(), body=group(m,'body'), canopy=group(m,'canopy'), wing=group(m,'wing'), tail=group(m,'tail');
  const booms=group(m,'booms'), motors=group(m,'motors'), rotors=group(m,'rotors'), pusher=group(m,'pusher');
  const skids=group(m,'skids'), camera=group(m,'camera');
  const fins=group(m,'tail-fins'), antenna=group(m,'antenna');
  const whitePaint=material('#d5d7d4',.24,.45), navy=material('#203958',.39,.32);
  const profile=[[0,-1.18],[.08,-1.06],[.17,-.59],[.25,-.15],[.36,.47],[.30,.87],[.18,1.04],[0,1.13]];
  make(body,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),48),whitePaint,0,.72,0).rotation.x=Math.PI/2;
  box(body,.27,.113,.37,.049,whitePaint,0,.655,.894);
  for(const side of [-1,1]) {
    robotLink(body,[side*.245,.72,.421],[side*.151,.682,.963],.046,.039,whitePaint,.71);
  }
  const glass=make(canopy,new T.SphereGeometry(1,36,20),navy,0,.944,.60);
  glass.scale.set(.26,.125,.44);
  for(const s of [-1,1]){
    const outline=new T.Shape().moveTo(0,-.23).lineTo(s*1.84,-.04).lineTo(s*1.96,.08).lineTo(s*1.90,.26).lineTo(0,.36).closePath();
    make(wing,new T.ExtrudeGeometry(outline,{depth:.063,bevelEnabled:true,bevelThickness:.023,bevelSize:.021,bevelSegments:3}),whitePaint,0,.79,0).rotation.x=-Math.PI/2;
    box(wing,.215,.068,.295,.018,navy,s*1.81,.833,-.11);
    robotLink(booms,[s*.74,.74,-.78],[s*.74,.73,.65],.12,.14,whitePaint,1);
    for(const z of [-.77,.63]){
      cylinder(motors,.091,.22,silver,s*.74,.72,z);
      cylinder(rotors,.052,.054,dark,s*.74,.872,z);
      box(rotors,.69,.023,.064,.011,dark,s*.74,.905,z).rotation.y=s*.43;
    }
    robotLink(skids,[s*.15,.57,.29],[s*.38,.218,.38],.052,.055,silver);
    robotLink(skids,[s*.13,.54,-.39],[s*.38,.218,-.38],.049,.052,silver);
    box(skids,.065,.067,1.17,.029,dark,s*.38,.19,0);
    box(fins,.07,.44,.31,.017,navy,s*.46,1.07,-1.35);
    robotLink(tail,[s*.13,.72,-.76],[s*.44,1.00,-1.37],.082,.067,whitePaint,1);
  }
  box(tail,.96,.059,.31,.016,whitePaint,0,.98,-1.35);
  cylinder(antenna,.034,.061,silver,0,.998,.105);
  cylinder(antenna,.081,.036,dark,0,1.042,.105);
  cylinder(pusher,.075,.102,silver,0,.738,-.96).rotation.x=Math.PI/2;
  box(pusher,.49,.043,.024,.007,dark,0,.738,-1.025).rotation.z=.90;
  make(camera,new T.SphereGeometry(.146,32,20),dark,0,.513,.86);
  cylinder(camera,.062,.026,navy,0,.51,.989).rotation.x=Math.PI/2;
  return m;
}

function cagedInspectionRov() {
  const m=new T.Group(), frame=group(m,'frame'), guards=group(m,'guards'), handles=group(m,'handles');
  const enclosure=group(m,'enclosure'), dome=group(m,'dome'), camera=group(m,'camera');
  const thrusters=group(m,'thrusters'), impellers=group(m,'impellers'), lamps=group(m,'lamps'), tether=group(m,'tether');
  const gland=group(m,'gland'), flange=group(m,'flange');
  const navy=material('#234565',.38,.48), alloy=material('#a8b1b1',.66,.46);
  for(const x of [-.83,.83]) for(const z of [-.72,.72]){
    box(frame,.099,1.17,.096,.013,alloy,x,.67,z);
    for(const y of [.115,1.20]){
      box(guards,.162,.188,.162,.023,navy,x,y,z);
      for(const offset of [-.039,.039]){
        cylinder(guards,.016,.009,bright,x+offset,y,z+Math.sign(z)*.084).rotation.x=Math.PI/2;
      }
    }
  }
  for(const y of [.105,1.22]) {
    for(const x of [-.83,.83]) box(frame,.106,.103,1.52,.015,alloy,x,y,0);
    for(const z of [-.72,.72]) box(frame,1.71,.107,.096,.013,alloy,0,y,z);
  }
  for(const x of [-.59,.59]) wire(handles,[[x,1.23,-.43],[x,1.43,-.31],[x,1.43,.33],[x,1.23,.45]],.063,navy);
  cylinder(enclosure,.362,1.28,dark,0,.65,-.040).rotation.x=Math.PI/2;
  box(enclosure,1.15,.111,1.14,.019,navy,0,1.15,-.02);
  const glazing=make(dome,new T.SphereGeometry(.312,48,24,0,Math.PI*2,0,Math.PI/2),new T.MeshPhysicalMaterial({color:'#a5c8d1',roughness:.15,transparent:true,opacity:.27,depthWrite:false,metalness:.10}),0,.65,.689);
  glazing.rotation.x=Math.PI/2;
  glazing.userData.cycleThrough=true;
  make(flange,new T.TorusGeometry(.329,.034,9,52),alloy,0,.65,.69);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    cylinder(flange,.016,.012,bright,.332*Math.cos(a),.65+.332*Math.sin(a),.726).rotation.x=Math.PI/2;
  }
  box(camera,.294,.253,.157,.044,dark,0,.65,.666);
  cylinder(camera,.127,.098,dark,0,.65,.770).rotation.x=Math.PI/2;
  machinedRing(camera,0,.65,.826,.111,.078,.038,alloy);
  machinedRing(camera,0,.65,.849,.078,.060,.023,dark);
  const lens=make(camera,new T.SphereGeometry(.062,36,20),material('#244756',.34,.16),0,.65,.852);
  lens.scale.z=.40;
  for(const x of [-.59,.59]) for(const [y,z] of [[.91,-.27],[.39,.39]]){
    const duct=make(thrusters,new T.CylinderGeometry(.227,.227,.245,36,1,true),navy,x,y,z);duct.rotation.x=Math.PI/2;
    make(thrusters,new T.TorusGeometry(.220,.025,8,36),navy,x,y,z+.129);
    cylinder(impellers,.055,.100,dark,x,y,z).rotation.x=Math.PI/2;
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2;
      box(impellers,.132,.040,.046,.013,dark,x+Math.cos(a)*.107,y+Math.sin(a)*.107,z).rotation.z=a;
    }
  }
  for(const x of [-.58,.58]){
    box(lamps,.23,.132,.110,.027,dark,x,.278,.764);
    for(const dx of [-.059,0,.059]) box(lamps,.041,.054,.019,.009,white,x+dx,.28,.83);
  }
  cylinder(gland,.079,.16,silver,.03,1.28,-.02);
  for(let i=0;i<5;i++) cylinder(gland,.052-i*.003,.023,dark,.03,1.375+i*.023,-.02);
  wire(tether,[[.03,1.35,-.02],[.035,1.60,-.03],[-.13,1.80,-.10],[-.49,1.83,-.23],[-.94,1.77,-.37],[-1.35,1.78,-.50]],.034,material('#e9b925',.07,.50));
  return m;
}

function yellowSurveyAuv() {
  const m=new T.Group(), hull=group(m,'hull'), seams=group(m,'seams'), bow=group(m,'bow'), window=group(m,'window');
  const fins=group(m,'fins'), mast=group(m,'mast'), duct=group(m,'duct'), rotor=group(m,'rotor'), skid=group(m,'skid');
  const hatch=group(m,'hatch'), rudders=group(m,'rudders');
  const gold=material('#eeb517',.17,.47), navy=material('#243c51',.39,.45);
  const tube=(part,profile,finish)=>make(part,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),finish,0,.53,0).rotation.z=-Math.PI/2;
  tube(hull,[[.135,-1.31],[.235,-1.08],[.35,-.58],[.394,-.17],[.397,.70],[.34,1.15],[.283,1.34]],gold);
  tube(bow,[[.283,1.34],[.213,1.48],[.117,1.57],[.0,1.61]],navy);
  for(const [x,r] of [[-.90,.272],[-.57,.349],[.11,.398],[.69,.397],[1.33,.283]]){
    make(seams,new T.TorusGeometry(r,.014,8,52),x<-.7?navy:gold,x,.53,0).rotation.y=Math.PI/2;
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      make(seams,new T.SphereGeometry(.010,8,6),silver,x,.53+r*Math.cos(a),r*Math.sin(a));
    }
  }
  cylinder(window,.077,.037,material('#325467',.49,.14),1.579,.54,0).rotation.z=Math.PI/2;
  box(window,.177,.077,.024,.014,dark,.94,.49,.366);
  box(hatch,.223,.166,.034,.018,silver,.28,.63,.390);
  for(const x of [.194,.366]) for(const y of [.573,.687]) cylinder(hatch,.013,.007,dark,x,y,.410).rotation.x=Math.PI/2;
  for(const s of [-1,1]){
    const horizontal=box(fins,.66,.064,.47,.016,gold,-.26,.484,s*.461);
    horizontal.rotation.y=s*.23;
    robotLink(rudders,[-1.14,.53,0],[-1.44,.53+s*.46,0],.17,.075,navy,.79);
    box(rudders,.149,.045,.075,.009,gold,-1.447,.53+s*.454,0).rotation.z=s*.24;
  }
  box(mast,.42,.072,.249,.025,navy,.13,.927,0);
  for(const z of [-.059,.059]) cylinder(mast,.026,.25,silver,.13,1.066,z);
  box(mast,.177,.052,.174,.018,navy,.13,1.216,0);
  make(duct,new T.CylinderGeometry(.193,.193,.199,40,1,true),navy,-1.43,.53,0).rotation.z=Math.PI/2;
  make(duct,new T.TorusGeometry(.185,.017,9,44),navy,-1.542,.53,0).rotation.y=Math.PI/2;
  cylinder(rotor,.057,.174,silver,-1.45,.53,0).rotation.z=Math.PI/2;
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    box(rotor,.035,.113,.049,.008,dark,-1.47,.53+.105*Math.cos(a),.105*Math.sin(a)).rotation.x=a;
  }
  box(skid,1.00,.08,.27,.024,navy,.08,.126,0);
  return m;
}

function orbitalServiceArm() {
  const m=new T.Group(), module=group(m,'module'), collar=group(m,'collar'), base=group(m,'base'), upper=group(m,'upper');
  const elbow=group(m,'elbow'), forearm=group(m,'forearm'), wrist=group(m,'wrist'), gripper=group(m,'gripper');
  const cables=group(m,'cables'), array=group(m,'array'), supports=group(m,'supports');
  const grapple=group(m,'grapple'), jointCovers=group(m,'joint-covers');
  const insulation=material('#c9c6b8',.48,.52), blue=material('#243e61',.43,.43);
  cylinder(module,.638,2.53,silver,-1.31,1.46,-.23);
  for(const y of [.46,.94,1.49,2.03,2.64]) make(collar,new T.TorusGeometry(.641,.022,8,48),insulation,-1.31,y,-.23).rotation.x=Math.PI/2;
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    box(module,.04,2.26,.069,.006,insulation,-1.31+.635*Math.cos(a),1.47,-.23+.635*Math.sin(a)).rotation.y=-a;
  }
  const a=[-.79,1.30,.11],e=[.63,1.93,.10],w=[1.19,.98,.34],t=[1.48,.71,.43];
  cylinder(grapple,.292,.118,insulation,-.923,1.30,.106).rotation.z=Math.PI/2;
  cylinder(grapple,.255,.034,silver,-.854,1.30,.106).rotation.z=Math.PI/2;
  cylinder(base,.236,.238,insulation,...a).rotation.x=Math.PI/2;
  cylinder(base,.180,.075,silver,a[0],a[1],a[2]+.147).rotation.x=Math.PI/2;
  robotLink(upper,a,e,.197,.203,insulation,.91);
  robotLink(upper,[-.59,1.40,.231],[-.23,1.56,.219],.121,.028,blue);
  cylinder(elbow,.181,.24,silver,...e).rotation.x=Math.PI/2;
  cylinder(jointCovers,.148,.040,insulation,e[0],e[1],e[2]+.137).rotation.x=Math.PI/2;
  flangeBolts(jointCovers,e[0],e[1],e[2]+.163,.119,7,dark,true);
  robotLink(forearm,e,w,.187,.192,insulation,.89);
  robotLink(forearm,[.89,1.51,.283],[1.07,1.18,.352],.096,.033,blue);
  robotPivot(wrist,w,.124,.175,insulation);
  robotLink(wrist,w,t,.177,.163,silver);
  box(gripper,.26,.17,.28,.037,dark,...t);
  for(const s of [-1,1]){
    robotLink(gripper,[1.51,.72,.43+s*.127],[1.69,.61,.43+s*.19],.077,.083,silver);
    robotLink(gripper,[1.69,.61,.43+s*.19],[1.72,.48,.43+s*.121],.062,.064,insulation);
  }
  wire(cables,[[-1.23,1.85,.23],[-1.10,1.48,.34],[-.76,1.52,.31],[-.34,1.69,.21],[.10,1.92,.21],[.55,2.10,.21],[.77,1.99,.19],[1.06,1.34,.41],[1.19,1.11,.43]],.020,material('#a9803a',.35,.51));
  box(supports,2.73,.082,.09,.011,insulation,.28,2.52,-.61);
  for(const x of [-.65,0,.65,1.30]) {
    box(supports,.055,.61,.055,.006,silver,x,2.56,-.61);
    box(array,.601,.56,.048,.010,material('#2c3e72',.25,.45),x+.30,2.57,-.61);
    for(let i=0;i<7;i++) box(array,.009,.53,.006,.001,silver,x+.049+i*.083,2.57,-.583);
    for(let i=0;i<5;i++) box(array,.578,.007,.005,.001,silver,x+.30,2.35+i*.111,-.582);
  }
  return m;
}

function factoryPedestal(part,x,z,navy) {
  box(part,.82,.086,.76,.017,navy,x,.053,z);
  make(part,new T.CylinderGeometry(.273,.334,.35,40),navy,x,.268,z);
  cylinder(part,.294,.062,silver,x,.48,z);
  flangeBolts(part,x,.519,z,.25,8,bright);
}

function factoryAxis(part,p,r,width,finish) {
  const [x,y,z]=p;
  cylinder(part,r,width,finish,x,y,z).rotation.x=Math.PI/2;
  cylinder(part,r*.78,.036,silver,x,y,z+width/2+.007).rotation.x=Math.PI/2;
  flangeBolts(part,x,y,z+width/2+.03,r*.61,7,dark,true);
}

function precisionAssemblyCell() {
  const m=new T.Group(), pedestal=group(m,'pedestal'), axes=group(m,'axes'), links=group(m,'links'), wrist=group(m,'wrist');
  const spindle=group(m,'spindle'), cable=group(m,'cable'), table=group(m,'table'), fixture=group(m,'fixture'), work=group(m,'work');
  const guard=group(m,'guard'), probeMount=group(m,'probe-mount');
  const navy=material('#263f61',.45,.43), alloy=material('#b6bdc0',.70,.38);
  const a=[-.97,.87,-.10],b=[-.69,2.18,-.12],c=[.81,1.92,-.10];
  factoryPedestal(pedestal,-.97,-.10,navy);
  robotLink(axes,[-.97,.49,-.10],a,.31,.34,navy);
  factoryAxis(axes,a,.245,.37,navy);factoryAxis(axes,b,.227,.31,navy);
  robotLink(links,a,b,.29,.32,alloy,.92);
  robotLink(links,b,c,.226,.245,alloy,.81);
  box(wrist,.27,.30,.29,.044,navy,c[0],c[1],c[2]);
  cylinder(wrist,.142,.14,silver,.81,1.69,-.10);
  cylinder(probeMount,.102,.29,alloy,.81,1.45,-.10);
  for(const x of [.712,.908]) box(probeMount,.044,.248,.105,.013,dark,x,1.44,-.10);
  for(let i=0;i<4;i++){
    const t=i*Math.PI/2;
    cylinder(spindle,.026,.20,bright,.81+.065*Math.cos(t),1.251,-.10+.065*Math.sin(t));
  }
  wire(cable,[[-1.18,.75,-.25],[-1.30,.94,-.21],[-1.04,1.44,-.27],[-.94,2.13,-.25],[-.67,2.43,-.22],[-.12,2.27,-.23],[.55,2.19,-.24],[.93,1.99,-.25],[.96,1.64,-.18]],.046,dark);
  box(table,1.43,.111,1.26,.023,alloy,.88,.68,-.05);
  for(const x of [.26,1.50]) for(const z of [-.55,.45]) box(table,.101,.60,.102,.009,alloy,x,.332,z);
  for(let i=0;i<6;i++) box(table,1.35,.006,.017,.002,dark,.88,.739,-.57+i*.206);
  box(fixture,.82,.086,.68,.015,silver,.81,.797,-.10);
  for(const x of [.49,1.13]) for(const z of [-.36,.16]){
    cylinder(fixture,.067,.204,alloy,x,.925,z);
    cylinder(fixture,.071,.042,dark,x,1.037,z);
  }
  cylinder(work,.184,.22,alloy,.81,.932,-.10);
  make(work,new T.TorusGeometry(.138,.030,10,44),bright,.81,1.052,-.10).rotation.x=Math.PI/2;
  const pane=new T.MeshPhysicalMaterial({color:'#b7d3e2',transparent:true,opacity:.16,depthWrite:false,roughness:.22});
  for(const x of [.11,.82,1.53]) box(guard,.061,1.66,.061,.007,alloy,x,1.54,-.79);
  for(const y of [.72,2.37]) box(guard,1.48,.051,.061,.006,alloy,.82,y,-.79);
  box(guard,1.41,1.60,.018,.004,pane,.82,1.55,-.795).userData.cycleThrough=true;
  return m;
}

function arcWeldingCell() {
  const m=new T.Group(), pedestal=group(m,'pedestal'), joints=group(m,'joints'), arm=group(m,'arm'), torch=group(m,'torch');
  const loom=group(m,'loom'), power=group(m,'power'), bench=group(m,'bench'), screens=group(m,'screens');
  const parts=group(m,'parts'), clamps=group(m,'clamps');
  const nozzle=group(m,'nozzle'), cables=group(m,'power-cables');
  const blue=material('#223955',.48,.40), steel=material('#a2a9ad',.71,.41);
  const a=[-1.04,.82,.20],b=[-.86,2.00,.08],c=[.37,1.68,.13];
  factoryPedestal(pedestal,-1.04,.20,blue);
  factoryAxis(joints,a,.23,.39,blue);factoryAxis(joints,b,.203,.32,blue);
  robotLink(arm,a,b,.28,.265,steel);
  robotLink(arm,[-1.13,.92,.31],[-.97,1.90,.24],.13,.106,blue);
  robotLink(arm,b,c,.23,.252,steel,.82);
  factoryAxis(joints,c,.122,.18,blue);
  robotLink(torch,c,[.68,1.26,.23],.109,.121,dark,.67);
  wire(nozzle,[[.65,1.30,.23],[.73,1.20,.236],[.77,1.11,.239]],.030,material('#b47a41',.48,.48));
  wire(loom,[[-1.25,.27,.22],[-1.46,.61,.14],[-1.39,.97,.17],[-1.14,1.39,.09],[-1.10,2.02,.03],[-.86,2.24,.06],[-.31,2.03,.08],[.31,1.95,.11],[.63,1.86,.15],[.68,1.42,.20]],.051,dark);
  robotLink(nozzle,[.697,1.237,.233],[.742,1.166,.237],.066,.064,silver,.78);
  wire(cables,[[-.45,.20,-.31],[-.52,.10,-.29],[-.65,.09,-.19],[-.91,.16,-.09],[-1.12,.24,.06]],.036,dark);
  wire(cables,[[-.38,.19,-.31],[-.47,.08,-.25],[-.68,.073,-.14],[-.92,.12,-.04],[-1.12,.21,.09]],.026,dark);
  box(power,.60,.83,.39,.024,blue,-.21,.466,-.51);
  box(power,.49,.69,.025,.010,steel,-.21,.475,-.30);
  for(let i=0;i<6;i++) box(power,.25,.013,.007,.002,dark,-.21,.36+i*.032,-.283);
  box(bench,1.41,.103,1.04,.019,steel,.98,.66,.24);
  for(const x of [.37,1.58]) for(const z of [-.18,.66]){
    box(bench,.11,.58,.11,.009,blue,x,.335,z);
    cylinder(bench,.076,.031,silver,x,.040,z);
  }
  for(const z of [-.19,.67]) box(bench,1.29,.09,.087,.009,blue,.98,.277,z);
  for(let i=0;i<13;i++) cylinder(bench,.013,.005,dark,.33+i*.105,.714,.715);
  for(const [x,z] of [[.96,-.31],[1.61,.05]]){
    box(screens,x>1.5?.052:1.25,1.10,x>1.5?.74:.052,.013,blue,x,1.259,z);
    for(const off of [-.59,.59]) if(x<1.5) box(screens,.046,1.12,.062,.006,steel,x+off,1.26,z);
  }
  box(parts,.62,.20,.35,.016,steel,.90,.824,.24);
  box(parts,.19,.39,.33,.012,steel,1.09,1.003,.24);
  for(const x of [.47,1.45]){
    box(clamps,.13,.09,.16,.01,dark,x,.757,.22);
    cylinder(clamps,.023,.243,silver,x,.901,.22);
    cylinder(clamps,.037,.077,blue,x,1.051,.22);
  }
  return m;
}

function vehicleCoatingCell() {
  const m=new T.Group(), pedestal=group(m,'pedestal'), joints=group(m,'joints'), arm=group(m,'arm'), nozzle=group(m,'nozzle');
  const hoses=group(m,'hoses'), sill=group(m,'sill'), body=group(m,'body'), cabin=group(m,'cabin'), fixture=group(m,'fixture');
  const sprayTip=group(m,'spray-tip'), floor=group(m,'floor');
  const alloyFloor=material('#697176',.61,.50);
  const blue=material('#213958',.45,.41), pearl=material('#d8dedf',.38,.45);
  const a=[-1.27,.81,0],b=[-.99,2.25,-.06],c=[.24,2.10,.02];
  factoryPedestal(pedestal,-1.27,0,blue);
  factoryAxis(joints,a,.233,.36,blue);factoryAxis(joints,b,.197,.32,blue);
  robotLink(arm,a,b,.28,.25,silver);
  robotLink(arm,b,c,.213,.22,blue,.83);
  factoryAxis(joints,c,.105,.16,silver);
  robotLink(nozzle,c,[.43,1.80,.13],.10,.105,silver,.59);
  robotLink(sprayTip,[.405,1.846,.124],[.474,1.734,.148],.058,.060,dark,.81);
  robotLink(sprayTip,[.460,1.760,.145],[.488,1.718,.152],.047,.048,bright,.8);
  wire(hoses,[[-1.48,.51,-.10],[-1.63,.98,-.13],[-1.31,1.55,-.14],[-1.27,2.23,-.17],[-.98,2.47,-.14],[-.40,2.35,-.16],[.20,2.26,-.11],[.46,2.06,.05]],.045,dark);
  for(const x of [.41,1.58]){
    box(sill,.085,.17,1.74,.022,pearl,x,.69,.25);
    for(const z of [-.43,.90]) make(body,new T.TorusGeometry(.224,.028,9,36,Math.PI),pearl,x,.76,z).rotation.y=Math.PI/2;
    box(body,.082,.26,1.60,.032,pearl,x,.94,.24);
  }
  box(body,1.14,.111,.52,.034,pearl,.995,1.06,.984).rotation.x=.12;
  box(body,1.13,.092,.073,.016,pearl,.995,.745,1.135);
  const grille=material('#737d83',.32,.50);
  box(body,.52,.108,.018,.010,grille,.995,.846,1.17);
  for(const x of [.61,1.38]) {
    box(body,.208,.106,.019,.022,grille,x,.93,1.152);
    box(body,.199,.069,.024,.012,pearl,x,.79,1.16);
  }
  box(body,1.11,.12,.29,.024,pearl,.995,1.01,-.50);
  for(const x of [.51,1.49]){
    robotLink(cabin,[x,1.03,-.48],[x,1.54,-.24],.065,.065,pearl);
    robotLink(cabin,[x,1.04,.70],[x,1.54,.40],.070,.065,pearl);
    robotLink(cabin,[x,1.06,.06],[x,1.53,.05],.052,.055,pearl);
  }
  box(cabin,1.00,.087,.75,.030,pearl,1.0,1.54,.08);
  for(const z of [-.38,.76]){
    box(fixture,1.50,.085,.10,.009,dark,1.0,.172,z);
    for(const x of [.51,1.49]) box(fixture,.072,.47,.077,.009,silver,x,.383,z);
  }
  for(const x of [.36,1.64]) box(fixture,.08,.085,1.27,.009,dark,x,.18,.17);
  box(floor,3.52,.037,2.55,.013,material('#444a50',.65,.62),.02,.002,.12);
  for(let i=0;i<35;i++) box(floor,.012,.009,2.52,.002,alloyFloor,-1.67+i*.099,.024,.12);
  for(let i=0;i<19;i++) box(floor,3.48,.008,.010,.002,alloyFloor,.02,.024,-1.05+i*.13);
  return m;
}

function cartonPalletizingCell() {
  const m=new T.Group(), pedestal=group(m,'pedestal'), shoulder=group(m,'shoulder'), upper=group(m,'upper'), elbow=group(m,'elbow');
  const boom=group(m,'boom'), wrist=group(m,'wrist'), manifold=group(m,'manifold'), cups=group(m,'cups'), cables=group(m,'cables');
  const pallet=group(m,'pallet'), stack=group(m,'stack'), carried=group(m,'carried');
  const vacuumLines=group(m,'vacuum-lines');
  const navy=material('#223957',.50,.39), ivory=material('#c2c5c6',.48,.42), wood=material('#b28e60',.06,.79);
  const card=material('#ac8260',.04,.81), tape=material('#bda17b',.04,.72);
  const a=[-1.03,.81,-.08],b=[-.69,2.26,-.12],c=[.91,2.12,-.05];
  factoryPedestal(pedestal,-1.03,-.08,navy);
  box(pedestal,.53,.29,.53,.031,navy,-1.03,.31,-.08);
  factoryAxis(shoulder,a,.234,.38,navy);
  robotLink(upper,a,b,.273,.284,ivory,.89);
  factoryAxis(elbow,b,.205,.31,navy);
  robotLink(boom,b,c,.229,.23,ivory,.78);
  factoryAxis(wrist,c,.125,.18,ivory);
  cylinder(wrist,.086,.183,silver,.91,1.95,-.05);
  box(manifold,.62,.095,.45,.018,silver,.91,1.80,-.05);
  for(const x of [.74,1.08]){
    cylinder(manifold,.027,.037,bright,x,1.866,.055);
    wire(vacuumLines,[[.93,2.011,.055],[x,1.978,.105],[x,1.911,.103],[x,1.877,.055]],.014,material('#246eb1',.14,.48));
  }
  for(const x of [.71,.91,1.11]) for(const z of [-.18,.08]){
    cylinder(cups,.023,.072,silver,x,1.72,z);
    make(cups,new T.CylinderGeometry(.027,.046,.042,24),navy,x,1.67,z);
  }
  wire(cables,[[-1.24,.77,-.23],[-1.22,1.16,-.24],[-1.04,1.83,-.21],[-.87,2.43,-.20],[-.51,2.47,-.21],[.12,2.31,-.20],[.78,2.35,-.18],[1.08,2.18,-.14],[.99,1.89,-.13]],.043,dark);
  for(const x of [.24,.81,1.38]) box(pallet,.18,.10,1.00,.010,wood,x,.085,.07);
  for(let i=0;i<5;i++) box(pallet,1.36,.073,.173,.009,wood,.82,.155,-.32+i*.196);
  for(const x of [.39,.80,1.21]) for(const y of [.35,.666,.982]){
    box(stack,.405,.309,.82,.012,card,x,y,.07);
    box(stack,.062,.004,.820,.002,tape,x,y+.157,.07);
  }
  box(carried,.65,.308,.56,.011,card,.91,1.494,-.05);
  box(carried,.073,.005,.56,.002,tape,.91,1.650,-.05);
  return m;
}

function warehouseRackCarrier() {
  const m=new T.Group(), shell=group(m,'shell'), wheels=group(m,'wheels'), sensors=group(m,'sensors'), lift=group(m,'lift');
  const frame=group(m,'frame'), shelves=group(m,'shelves'), casters=group(m,'casters'), boxes=group(m,'boxes'), totes=group(m,'totes');
  const guards=group(m,'guards'), lights=group(m,'lights');
  const blue=material('#25435e',.46,.42), grey=material('#525b62',.16,.65), paper=material('#a88561',.04,.81);
  box(shell,1.01,.31,2.25,.085,blue,0,.271,0);
  box(shell,1.00,.122,2.24,.055,silver,0,.306,0);
  box(shell,.91,.145,.93,.062,blue,0,.40,.63);
  for(const s of [-1,1]) for(const z of [-.62,.65]){
    cylinder(wheels,.152,.101,dark,s*.48,.164,z).rotation.z=Math.PI/2;
    cylinder(wheels,.106,.027,silver,s*.539,.164,z).rotation.z=Math.PI/2;
  }
  box(sensors,.39,.080,.031,.015,dark,0,.389,1.119);
  for(const x of [-.11,0,.11]) cylinder(sensors,.024,.014,material('#304b5e',.40,.19),x,.389,1.143).rotation.x=Math.PI/2;
  for(const x of [-.36,.36]) box(lights,.144,.036,.022,.008,white,x,.341,1.126);
  box(lights,.862,.023,.015,.007,material('#61badb',.32,.32),0,.166,1.128);
  box(lift,.63,.113,.97,.023,dark,0,.449,-.28);
  for(const x of [-.20,.20]) box(lift,.101,.32,.65,.013,grey,x,.607,-.27);
  box(lift,.78,.084,1.16,.014,silver,0,.766,-.27);
  for(const x of [-.66,.66]) for(const z of [-.95,.40]){
    box(frame,.073,1.78,.071,.007,silver,x,1.70,z);
    box(frame,.107,.097,.104,.009,blue,x,2.57,z);
    box(casters,.095,.113,.102,.010,silver,x,.756,z);
    cylinder(casters,.078,.052,dark,x,.670,z).rotation.z=Math.PI/2;
  }
  for(const y of [.84,1.24,1.64,2.04,2.55]){
    box(shelves,1.36,.046,1.41,.007,silver,0,y,-.275);
    for(let i=0;i<14;i++) box(shelves,1.30,.008,.013,.002,dark,0,y+.025,-.90+i*.092);
  }
  for(const x of [-.668,.668]){
    for(let i=0;i<15;i++) box(guards,.010,1.65,.009,.002,silver,x,1.68,-.92+i*.091);
    for(let i=0;i<17;i++) box(guards,.011,.010,1.35,.002,silver,x,.87+i*.10,-.27);
  }
  for(const x of [-.415,0,.415]){
    for(const y of [1.41,2.21]) box(boxes,.375,.292,.80,.014,paper,x,y,-.27);
    for(const y of [1.00,1.80]){
      box(totes,.372,.264,.82,.021,grey,x,y,-.27);
      box(totes,.394,.052,.847,.012,grey,x,y+.135,-.27);
      box(totes,.152,.045,.014,.006,dark,x,y+.080,.153);
    }
  }
  return m;
}

function discCleaningRobot() {
  const m=new T.Group(), lid=group(m,'lid'), bumper=group(m,'bumper'), skirt=group(m,'skirt'), scanner=group(m,'scanner');
  const window=group(m,'window'), vents=group(m,'vents'), brush=group(m,'brush'), pad=group(m,'pad'), wheels=group(m,'wheels'), button=group(m,'button');
  const caster=group(m,'caster'), fascia=group(m,'fascia');
  const navy=material('#233753',.43,.42), chrome=material('#b3b6b6',.72,.34);
  cylinder(skirt,1.11,.157,navy,0,.222,0);
  cylinder(bumper,1.12,.267,chrome,0,.421,0);
  cylinder(lid,1.077,.058,chrome,0,.575,0);
  make(lid,new T.TorusGeometry(1.058,.021,9,64),navy,0,.607,0).rotation.x=Math.PI/2;
  make(window,new T.CylinderGeometry(1.126,1.126,.145,56,1,true,-.86,1.72),dark,0,.430,0);
  box(window,.34,.090,.020,.010,dark,0,.435,1.124);
  cylinder(window,.032,.018,material('#273e52',.46,.20),0,.433,1.137).rotation.x=Math.PI/2;
  cylinder(scanner,.252,.124,dark,0,.660,-.16);
  cylinder(scanner,.261,.053,chrome,0,.747,-.16);
  make(scanner,new T.TorusGeometry(.254,.014,8,44),material('#36759d',.36,.38),0,.603,-.16).rotation.x=Math.PI/2;
  for(let i=0;i<5;i++) make(vents,new T.CylinderGeometry(1.124,1.124,.011,22,1,true,.95,.30),dark,0,.344+i*.032,0);
  cylinder(brush,.078,.092,dark,-.70,.168,.663);
  for(let i=0;i<36;i++){
    const a=.55+i*.174;
    robotLink(brush,[-.70,.126,.663],[-.70+.323*Math.cos(a),.060,.663+.323*Math.sin(a)],.010,.012,dark,1);
  }
  box(pad,1.01,.049,.47,.020,material('#777a79',.02,.95),.14,.11,.35);
  for(const s of [-1,1]){
    cylinder(wheels,.155,.141,dark,s*.77,.151,-.26).rotation.z=Math.PI/2;
    cylinder(wheels,.097,.025,navy,s*.85,.151,-.26).rotation.z=Math.PI/2;
  }
  const faceBand=new T.Shape().moveTo(-.50,.39).lineTo(.50,.39).quadraticCurveTo(.60,.51,.60,.81)
    .quadraticCurveTo(0,1.015,-.60,.81).quadraticCurveTo(-.60,.51,-.50,.39).closePath();
  const fasciaGeometry=new T.ShapeGeometry(faceBand);
  fasciaGeometry.rotateZ(Math.PI);
  make(fascia,fasciaGeometry,navy,0,.607,0).rotation.x=-Math.PI/2;
  cylinder(caster,.099,.068,chrome,0,.151,-.79);
  cylinder(caster,.068,.080,dark,0,.079,-.79).rotation.z=Math.PI/2;
  cylinder(button,.061,.016,navy,0,.612,.57);
  make(button,new T.TorusGeometry(.040,.007,7,28),material('#3e7d9d',.23,.35),0,.625,.57).rotation.x=Math.PI/2;
  return m;
}

function restaurantDeliveryRobot() {
  const m=new T.Group(), base=group(m,'base'), frame=group(m,'frame'), wheels=group(m,'wheels'), shelves=group(m,'shelves');
  const head=group(m,'head'), face=group(m,'face'), sensors=group(m,'sensors'), light=group(m,'light'), dishes=group(m,'dishes');
  const drinkware=group(m,'drinkware'), cloche=group(m,'cloche');
  const navy=material('#243653',.43,.39), silverShell=material('#b6bbc0',.61,.40), glass=material('#10191f',.41,.15);
  const glow=new T.MeshStandardMaterial({color:'#9ed9fc',emissive:'#549bd1',emissiveIntensity:.7});
  box(base,1.31,.29,.91,.122,navy,0,.244,0);
  box(base,1.32,.151,.91,.090,silverShell,0,.443,0);
  box(light,1.185,.026,.021,.009,glow,0,.350,.455);
  for(const x of [-.52,.52]) for(const z of [-.27,.27]) cylinder(wheels,.125,.104,dark,x,.118,z).rotation.z=Math.PI/2;
  for(const s of [-1,1]){
    robotLink(frame,[s*.566,.49,-.08],[s*.450,2.18,-.15],.133,.26,silverShell,.76);
    box(frame,.111,1.55,.205,.040,navy,s*.473,1.30,-.305).rotation.z=s*.063;
  }
  for(const y of [.66,1.19,1.71]){
    box(shelves,1.16-(y-.66)*.11,.076,.75,.037,navy,0,y,.04);
    box(shelves,1.09-(y-.66)*.11,.023,.697,.023,dark,0,y+.048,.041);
  }
  box(head,.98,.51,.54,.127,navy,0,2.34,-.045);
  box(head,.89,.405,.084,.037,silverShell,0,2.35,.215);
  box(face,.794,.338,.036,.019,glass,0,2.379,.269);
  for(const x of [-.224,.224]) make(face,new T.TorusGeometry(.047,.008,8,26,2.30),glow,x,2.416,.289).rotation.z=.38;
  wire(face,[[-.052,2.35,.29],[-.020,2.324,.291],[.021,2.324,.291],[.054,2.351,.29]],.007,glow);
  box(sensors,.273,.066,.028,.011,dark,0,.23,.457);
  for(const x of [-.074,0,.074]) cylinder(sensors,.019,.009,glass,x,.23,.477).rotation.x=Math.PI/2;
  for(const [x,y,z] of [[-.29,.72,.22],[.22,.72,.16],[.27,1.25,.20],[.18,1.78,.16],[-.17,1.78,.11]]) cylinder(dishes,.122,.027,white,x,y,z);
  make(cloche,new T.SphereGeometry(.197,28,16,0,Math.PI*2,0,Math.PI/2),silver, -.17,1.25,.04);
  cylinder(cloche,.035,.061,silver,-.17,1.467,.04);
  const clear=new T.MeshPhysicalMaterial({color:'#c6dfeb',roughness:.18,transmission:.63,thickness:.018});
  for(const [x,z] of [[-.35,.21],[-.22,.24]]){
    make(drinkware,new T.CylinderGeometry(.055,.043,.115,28,1,true),clear,x,.792,z);
    cylinder(drinkware,.043,.014,clear,x,.741,z);
  }
  cylinder(drinkware,.075,.091,white,.245,.779,.16);
  make(drinkware,new T.TorusGeometry(.034,.009,9,24),white,.318,.785,.16);
  for(let i=0;i<10;i++){
    const a=i*2.399;
    make(dishes,new T.DodecahedronGeometry(.028),material(i%2?'#7a9b45':'#c78434',.02,.78),-.17+.076*Math.cos(a),1.813,.11+.076*Math.sin(a));
  }
  return m;
}

function indoorPatrolRobot() {
  const m=new T.Group(), shell=group(m,'shell'), bumper=group(m,'bumper'), wheels=group(m,'wheels'), arches=group(m,'arches');
  const band=group(m,'band'), lights=group(m,'lights'), mast=group(m,'mast'), dome=group(m,'dome'), camera=group(m,'camera'), vents=group(m,'vents');
  const hubs=group(m,'hubs'), frontCamera=group(m,'front-camera');
  const blue=material('#28425c',.47,.43), metal=material('#aeb5b9',.65,.39);
  const bodyProfile=[
    [0,.335],[.36,.335],[.44,.38],[.48,.51],[.49,.72],[.493,.91],[.488,1.07],
    [.473,1.21],[.441,1.31],[.385,1.40],[.294,1.48],[.176,1.537],[0,1.552],
  ];
  const fairing=make(shell,new T.LatheGeometry(bodyProfile.map(([r,y])=>new T.Vector2(r,y)),64),metal);
  fairing.scale.z=1.25;
  box(bumper,1.16,.27,1.36,.094,blue,0,.330,0);
  box(bumper,1.12,.104,1.30,.047,dark,0,.192,0);
  for(const s of [-1,1]) for(const z of [-.435,.425]){
    cylinder(wheels,.250,.154,dark,s*.543,.259,z).rotation.z=Math.PI/2;
    cylinder(hubs,.205,.030,silver,s*.634,.259,z).rotation.z=Math.PI/2;
    cylinder(hubs,.084,.019,bright,s*.657,.259,z).rotation.z=Math.PI/2;
    make(arches,new T.TorusGeometry(.265,.047,9,38,Math.PI),blue,s*.622,.269,z).rotation.y=Math.PI/2;
  }
  const belt=make(band,new T.CylinderGeometry(.492,.500,.159,44,1,true,-1.22,2.44),dark,0,1.118,0);
  belt.scale.z=1.26;
  cylinder(frontCamera,.052,.018,material('#263f53',.46,.15),0,1.120,.642).rotation.x=Math.PI/2;
  for(const x of [-.33,.33]){
    box(lights,.131,.024,.017,.006,white,x,1.117,.470).rotation.y=Math.sign(x)*.69;
    box(lights,.131,.024,.017,.006,white,x,.308,.687);
  }
  cylinder(mast,.157,.084,blue,0,1.551,-.03);
  cylinder(mast,.062,.443,silver,0,1.789,-.03);
  cylinder(mast,.074,.128,dark,0,1.652,-.03);
  cylinder(dome,.227,.086,metal,0,2.045,-.03);
  const glazing=make(dome,new T.SphereGeometry(.187,40,24,0,Math.PI*2,Math.PI/2,Math.PI/2),new T.MeshPhysicalMaterial({color:'#384b58',roughness:.18,transparent:true,opacity:.33,depthWrite:false,metalness:.09}),0,2.012,-.03);
  glazing.userData.cycleThrough=true;
  cylinder(camera,.096,.087,dark,0,1.954,.063).rotation.x=Math.PI/2;
  machinedRing(camera,0,1.954,.111,.079,.054,.026,silver);
  cylinder(camera,.050,.018,material('#31596e',.46,.14),0,1.954,.129).rotation.x=Math.PI/2;
  box(vents,.022,.151,.205,.012,metal,.463,.798,-.19);
  for(let i=0;i<6;i++) box(vents,.012,.013,.173,.004,dark,.48,.743+i*.022,-.19);
  return m;
}

function surgicalManipulatorSuite() {
  const m=new T.Group(), base=group(m,'base'), column=group(m,'column'), gantry=group(m,'gantry');
  const pivots=group(m,'pivots'), links=group(m,'links'), holders=group(m,'holders'), tools=group(m,'tools');
  const tabletop=group(m,'tabletop'), lift=group(m,'lift');
  const pads=group(m,'pads'), rollers=group(m,'rollers');
  const pearl=material('#d3d8db',.28,.43), navy=material('#233853',.39,.41);
  box(base,1.00,.25,1.30,.067,navy,-1.25,.17,-.19);
  for(const x of [-1.63,-.87]) for(const z of [-.68,.30]){
    box(rollers,.137,.146,.159,.019,pearl,x,.137,z);
    cylinder(rollers,.074,.042,silver,x+.076,.082,z).rotation.z=Math.PI/2;
  }
  box(column,.45,1.87,.53,.071,pearl,-1.31,1.17,-.43);
  box(column,.19,1.80,.064,.017,silver,-1.30,1.19,-.148);
  box(gantry,2.63,.21,.73,.084,silver,-.20,2.17,-.44);
  box(gantry,2.55,.10,.72,.069,navy,-.20,2.065,-.44);
  for(let i=0;i<4;i++){
    const x=-.99+i*.555, shift=(1.5-i)*.225;
    const mount=[x,1.90,-.31], bend=[x+shift*.42,1.59,-.08], tip=[x+shift,1.34,.13];
    cylinder(pivots,.113,.21,pearl,...mount);
    robotPivot(pivots,bend,.080,.12,navy);
    robotLink(links,mount,bend,.15,.155,pearl);
    robotLink(links,bend,tip,.117,.125,pearl,.76);
    robotLink(holders,tip,[tip[0]+shift*.30,1.18,.227],.081,.073,silver);
    robotLink(tools,[tip[0]+shift*.30,1.19,.225],[tip[0]+shift*.60,1.03,.304],.021,.021,bright);
  }
  box(lift,1.18,.14,.86,.050,silver,.35,.108,.41);
  box(lift,1.20,.064,.86,.038,navy,.35,.047,.41);
  box(lift,.42,.47,.36,.023,silver,.35,.389,.41);
  box(lift,.81,.09,.58,.016,dark,.35,.666,.41);
  box(tabletop,2.04,.063,.64,.014,silver,.375,.706,.41);
  for(const x of [-.39,.12,.63,1.14]) box(pads,.505,.109,.65,.030,navy,x,.778,.41);
  for(const z of [.067,.753]) box(tabletop,2.01,.042,.032,.008,bright,.365,.707,z);
  return m;
}

function standingRehabExoskeleton() {
  const m=new T.Group(), stand=group(m,'stand'), platform=group(m,'platform'), harness=group(m,'harness'), belt=group(m,'belt');
  const hips=group(m,'hips'), thighs=group(m,'thighs'), knees=group(m,'knees'), shins=group(m,'shins');
  const cuffs=group(m,'cuffs'), footplates=group(m,'footplates'), wiring=group(m,'wiring');
  const pack=group(m,'pack'), buckles=group(m,'buckles');
  const navy=material('#26364e',.42,.44), fabric=material('#20242b',.04,.89);
  box(platform,1.44,.12,1.21,.023,silver,0,.084,.11);
  box(platform,1.46,.047,1.24,.022,navy,0,.035,.11);
  for(const x of [-.61,.61]) for(const z of [-.40,.61]) cylinder(platform,.045,.042,dark,x,.027,z);
  box(stand,.122,2.36,.109,.014,silver,-.40,1.29,-.37);
  robotLink(stand,[-.41,.18,-.33],[-.41,.52,-.04],.103,.103,silver);
  box(pack,.155,.39,.19,.025,silver,-.49,2.04,-.29);
  box(pack,.133,.126,.030,.014,navy,-.49,2.021,-.179);
  wire(wiring,[[-.49,2.24,-.28],[-.48,2.34,-.16],[-.33,2.34,-.13],[-.27,2.20,-.12]],.016,dark);
  box(harness,.48,.59,.17,.041,fabric,0,2.08,-.23);
  for(const x of [-.19,.19]) wire(harness,[[x,1.92,.03],[x,2.15,.11],[x,2.40,.065],[x,2.45,-.14],[x,2.34,-.29],[x,2.10,-.28]],.043,fabric);
  box(belt,.72,.18,.35,.053,fabric,0,1.84,-.09);
  box(buckles,.14,.114,.044,.012,navy,0,1.84,.105);
  box(buckles,.084,.027,.014,.004,silver,0,1.84,.134);
  for(const s of [-1,1]){
    const h=[s*.37,1.76,-.09],k=[s*.40,1.01,.095],f=[s*.42,.26,.041];
    robotPivot(hips,h,.148,.147,navy);
    robotLink(thighs,h,k,.128,.125,silver,.81);
    robotPivot(knees,k,.122,.142,navy);
    robotLink(shins,k,f,.105,.121,silver,.68);
    for(const [y,z] of [[1.40,.015],[.69,.078]]){
      box(cuffs,.237,.143,.31,.034,fabric,s*.30,y,z);
      box(cuffs,.254,.061,.32,.015,navy,s*.30,y+.012,z);
    }
    box(footplates,.29,.077,.48,.022,dark,f[0],.171,.174);
    box(footplates,.245,.11,.12,.022,fabric,f[0],.236,.23);
    wire(wiring,[[s*.28,1.89,-.22],[s*.49,1.68,-.18],[s*.48,1.26,.03],[s*.47,1.01,.16],[s*.48,.69,.08],[s*.44,.30,.07]],.018,dark);
  }
  return m;
}

function fieldMonitoringRover() {
  const m=new T.Group(), hull=group(m,'hull'), covers=group(m,'covers'), fascia=group(m,'fascia');
  const wheels=group(m,'wheels'), suspension=group(m,'suspension'), mast=group(m,'mast'), antenna=group(m,'antenna');
  const scanner=group(m,'scanner'), camera=group(m,'camera'), soil=group(m,'soil'), crop=group(m,'crop');
  const vents=group(m,'vents'), headlights=group(m,'headlights');
  const navy=material('#243e5a',.48,.41), dirt=material('#69543b',.04,.92), leaf=material('#59853a',.04,.77);
  box(soil,3.73,.081,2.96,.031,dirt,0,.038,0);
  for(const x of [-1.62,1.61]) for(let j=0;j<10;j++) for(let i=0;i<4;i++){
    const a=i*Math.PI/2+j*.59;
    const mesh=make(crop,new T.SphereGeometry(.10,14,9),leaf,x+.073*Math.cos(a),.137,-1.25+j*.274+.066*Math.sin(a));
    mesh.scale.set(1.05,.37,.52);mesh.rotation.y=-a;
  }
  box(hull,1.37,.39,1.76,.079,navy,0,.77,0);
  box(covers,1.42,.173,1.81,.059,silver,0,1.006,0);
  box(covers,1.32,.115,1.72,.045,navy,0,1.12,0);
  for(const x of [-.727,.727]){
    box(vents,.017,.166,.201,.009,silver,x,1.005,-.30);
    for(let i=0;i<6;i++) box(vents,.012,.013,.132,.003,dark,x+Math.sign(x)*.011,.953+i*.021,-.30);
  }
  box(fascia,1.17,.26,.067,.024,silver,0,.896,.909);
  box(fascia,.55,.103,.015,.008,dark,0,.949,.950);
  for(const x of [-.43,.43]) box(headlights,.263,.036,.024,.006,white,x,1.022,.951);
  for(const s of [-1,1]) for(const z of [-.64,.64]){
    const x=s*.871;
    cylinder(wheels,.378,.255,dark,x,.466,z).rotation.z=Math.PI/2;
    cylinder(wheels,.238,.026,navy,x+s*.135,.466,z).rotation.z=Math.PI/2;
    for(let i=0;i<21;i++) {
      const a=i*Math.PI*2/21;
      box(wheels,.257,.049,.076,.009,i%4?dark:dirt,x,.465+.375*Math.cos(a),z+.375*Math.sin(a)).rotation.set(a,.30,0);
    }
    robotLink(suspension,[s*.48,.70,z],[s*.76,.47,z],.070,.081,silver);
    const coil=Array.from({length:72},(_,i)=>{
      const t=i/71,a=t*Math.PI*12;
      return [s*(.60+.12*t)+.035*Math.cos(a),.83-.28*t,z+.035*Math.sin(a)];
    });
    wire(suspension,coil,.011,bright);
  }
  cylinder(mast,.051,.83,silver,.13,1.53,.13);
  box(mast,.19,.13,.21,.021,dark,.13,1.18,.13);
  cylinder(antenna,.145,.045,silver,.13,1.988,.13);
  cylinder(scanner,.088,.135,dark,.15,1.79,.20);
  cylinder(scanner,.091,.044,navy,.15,1.802,.20);
  box(camera,.22,.091,.11,.019,dark,.18,1.59,.27);
  cylinder(camera,.028,.013,navy,.20,1.59,.331).rotation.x=Math.PI/2;
  return m;
}

function fruitPickingRover() {
  const m=new T.Group(), chassis=group(m,'chassis'), wheels=group(m,'wheels'), arm=group(m,'arm'), axes=group(m,'axes');
  const gripper=group(m,'gripper'), camera=group(m,'camera'), basket=group(m,'basket'), produce=group(m,'produce');
  const bench=group(m,'bench'), stems=group(m,'stems');
  const loom=group(m,'loom'), pads=group(m,'pads');
  const navy=material('#253c58',.42,.43), cream=material('#d6d0ba',.16,.55), fruit=material('#bb382b',.07,.47), leaf=material('#527c38',.05,.70);
  box(chassis,1.11,.44,1.60,.066,navy,.40,.69,0);
  box(chassis,1.14,.143,1.63,.036,silver,.40,.909,0);
  box(chassis,.79,.032,.026,.007,white,.40,.747,.805);
  for(const s of [-1,1]) for(const z of [-.56,.56]){
    const x=.40+s*.69;
    cylinder(wheels,.333,.267,dark,x,.356,z).rotation.z=Math.PI/2;
    cylinder(wheels,.216,.039,silver,x+s*.139,.356,z).rotation.z=Math.PI/2;
    cylinder(wheels,.106,.040,dark,x+s*.164,.356,z).rotation.z=Math.PI/2;
    for(let i=0;i<20;i++){
      const a=i*Math.PI/10;
      box(wheels,.264,.049,.071,.008,dark,x,.356+.33*Math.cos(a),z+.33*Math.sin(a)).rotation.set(a,.27,0);
    }
  }
  const a=[.33,1.14,.15],b=[.24,1.98,.10],c=[-.55,1.63,.24],w=[-.97,1.43,.31];
  cylinder(axes,.212,.10,silver,.33,1.04,.15);
  for(const p of [a,b,c]) factoryAxis(axes,p,.138,.19,navy);
  robotLink(arm,a,b,.20,.185,silver,.79);
  robotLink(arm,b,c,.178,.162,silver,.81);
  robotLink(arm,c,w,.101,.105,navy,.75);
  wire(loom,[[.36,1.10,.015],[.50,1.54,-.01],[.45,1.98,-.04],[.27,2.17,-.06],[.02,2.06,-.047],[-.28,1.85,.025],[-.60,1.71,.11],[-.89,1.60,.23]],.035,dark);
  box(gripper,.17,.13,.25,.024,dark,...w);
  for(const z of [.19,.44]) robotLink(gripper,[-.98,1.43,z],[-1.24,1.23,z],.081,.071,cream);
  for(const z of [.19,.44]) robotLink(pads,[-1.17,1.282,z],[-1.25,1.227,z],.086,.077,material('#e2dbca',.08,.68),.84);
  box(camera,.245,.151,.15,.025,dark,-.88,1.64,.31);
  cylinder(camera,.047,.017,navy,-1.009,1.64,.31).rotation.z=Math.PI/2;
  box(basket,.70,.183,.69,.036,cream,.53,1.073,-.40);
  for(let slot=0;slot<10;slot++) box(basket,.011,.083,.019,.004,dark,.887,1.075,-.67+slot*.059);
  for(const x of [.18,.88]) box(basket,.043,.06,.71,.010,navy,x,1.175,-.40);
  for(const z of [-.74,-.056]) box(basket,.72,.060,.046,.012,navy,.53,1.175,z);
  for(let i=0;i<13;i++) make(produce,new T.SphereGeometry(.045,16,11),fruit,.30+i%4*.15,1.190,-.63+Math.floor(i/4)*.147).scale.y=.81;
  make(produce,new T.SphereGeometry(.070,20,15),fruit,-1.22,1.23,.315).scale.y=1.27;
  box(bench,.60,.088,1.79,.020,silver,-1.52,1.08,.02);
  for(const z of [-.73,.76]) box(bench,.068,1.05,.067,.006,silver,-1.54,.54,z);
  for(let i=0;i<15;i++){
    const z=-.78+i*.112;
    make(stems,new T.SphereGeometry(.132,14,10),leaf,-1.53+(i%3)*.04,1.25+(i%2)*.09,z).scale.set(1.19,.52,.78);
  }
  return m;
}

function crawlerRunningGear(tracks, rollers, x, center, length, radius, width, finish) {
  const half=length/2;
  for(const z of [-half,half]){
    cylinder(rollers,radius*.89,width*.82,dark,x,center,z).rotation.z=Math.PI/2;
    cylinder(rollers,radius*.69,.032,silver,x+Math.sign(x)*width*.44,center,z).rotation.z=Math.PI/2;
  }
  for(const z of [-half*.58,0,half*.58]) cylinder(rollers,radius*.42,width*.79,silver,x,center-radius*.49,z).rotation.z=Math.PI/2;
  const shoe=(y,z,a)=>{
    box(tracks,width,.107,.068,.010,finish,x,y,z).rotation.x=a;
    box(tracks,width*.74,.057,.020,.004,dark,x,y+.039*Math.sin(a),z+.039*Math.cos(a)).rotation.x=a;
  };
  for(let i=0;i<=12;i++){
    const a=-Math.PI/2+i*Math.PI/12;
    shoe(center+radius*Math.sin(a),half+radius*Math.cos(a),a);
    shoe(center-radius*Math.sin(a),-half-radius*Math.cos(a),a+Math.PI);
  }
  const count=Math.round(length/.095);
  for(let i=1;i<count;i++){
    const z=-half+i*length/count;
    shoe(center+radius,z,Math.PI/2);
    shoe(center-radius,z,-Math.PI/2);
  }
}

function trackedBricklayingRobot() {
  const m=new T.Group(), body=group(m,'body'), tracks=group(m,'tracks'), rollers=group(m,'rollers'), side=group(m,'side');
  const turn=group(m,'turn'), joints=group(m,'joints'), links=group(m,'links'), cable=group(m,'cable');
  const jaws=group(m,'jaws'), block=group(m,'block'), wall=group(m,'wall');
  const vents=group(m,'vents'), toolLines=group(m,'tool-lines');
  const blue=material('#283d57',.45,.46), concrete=material('#9b9892',.03,.87);
  for(const s of [-1,1]){
    crawlerRunningGear(tracks,rollers,s*.64,.26,1.13,.233,.242,dark);
    box(side,.038,.20,.96,.019,silver,s*.772,.264,0);
  }
  box(body,1.06,.48,1.52,.070,blue,0,.644,0);
  box(body,1.06,.335,.491,.037,silver,0,.626,.14);
  for(const side of [-1,1]){
    box(vents,.019,.236,.281,.009,silver,side*.539,.614,.14);
    for(let i=0;i<7;i++) box(vents,.011,.013,.229,.002,dark,side*.553,.533+i*.025,.14);
  }
  cylinder(turn,.290,.147,silver,0,.923,-.08);
  cylinder(turn,.26,.082,blue,0,1.030,-.08);
  const a=[0,1.11,-.12],b=[.16,2.08,.12],c=[.12,1.80,1.24],w=[.12,1.44,1.47];
  for(const p of [a,b,c]) robotPivot(joints,p,.135,.186,blue);
  robotLink(links,a,b,.22,.21,silver);
  robotLink(links,b,c,.19,.18,silver);
  robotLink(links,c,w,.14,.17,blue);
  wire(cable,[[.01,1.01,-.42],[.20,1.29,-.39],[.34,1.86,-.15],[.35,2.22,.17],[.28,2.19,.63],[.27,2.04,1.17],[.25,1.63,1.49]],.041,dark);
  wire(toolLines,[[.02,1.61,1.455],[-.12,1.61,1.50],[-.19,1.54,1.58],[-.19,1.39,1.625]],.018,material('#286eab',.16,.48));
  box(cable,.095,.090,.105,.014,dark,.25,1.64,1.49);
  box(jaws,.55,.105,.35,.017,silver,.12,1.425,1.47);
  for(const x of [-.17,.41]) box(jaws,.095,.286,.31,.018,blue,x,1.267,1.47);
  box(block,.50,.203,.32,.013,concrete,.12,1.249,1.47);
  for(let row=0;row<3;row++) for(let i=0;i<4;i++)
    box(wall,.503,.232,.36,.010,concrete,-.83+i*.517+(row%2)*.229,.135+row*.244,1.57);
  return m;
}

function rubbleInspectionCrawler() {
  const m=new T.Group(), hull=group(m,'hull'), tracks=group(m,'tracks'), rollers=group(m,'rollers'), guards=group(m,'guards');
  const lamps=group(m,'lamps'), mast=group(m,'mast'), camera=group(m,'camera'), antenna=group(m,'antenna');
  const terrain=group(m,'terrain'), culvert=group(m,'culvert');
  const grab=group(m,'grab'), taskLights=group(m,'task-lights');
  const blue=material('#263a55',.43,.45), rock=material('#77766f',.02,.93);
  box(terrain,3.04,.072,2.52,.028,rock,0,.04,0);
  for(let i=0;i<36;i++){
    const a=i*2.399,r=Math.sqrt(i/36);
    const fragment=make(terrain,new T.DodecahedronGeometry(.083+i%5*.032,0),rock,1.46*r*Math.cos(a),.098,1.18*r*Math.sin(a));
    fragment.scale.set(1.2,.55,.9);fragment.rotation.y=a;
  }
  const tube=new T.Shape();tube.absarc(0,0,.413,0,Math.PI*2,false);
  const bore=new T.Path();bore.absarc(0,0,.327,0,Math.PI*2,true);tube.holes.push(bore);
  make(culvert,new T.ExtrudeGeometry(tube,{depth:.49,bevelEnabled:true,bevelThickness:.012,bevelSize:.011,bevelSegments:2}),rock,.82,.48,-1.06);
  for(const s of [-1,1]){
    crawlerRunningGear(tracks,rollers,s*.69,.368,1.29,.251,.292,dark);
    box(guards,.039,.204,1.23,.025,blue,s*.801,.405,0);
  }
  box(hull,1.17,.372,1.52,.078,blue,0,.73,0);
  box(hull,1.07,.10,1.42,.031,silver,0,.956,0);
  box(hull,1.14,.21,.068,.019,silver,0,.738,.781);
  for(const x of [-.373,.373]){
    box(lamps,.183,.093,.022,.013,white,x,.750,.825);
    wire(grab,[[x,.965,.28],[x,1.087,.34],[x,1.084,.54],[x,.965,.62]],.030,silver);
  }
  cylinder(mast,.131,.12,dark,.04,1.042,.22);
  cylinder(mast,.065,.54,silver,.04,1.338,.22);
  cylinder(mast,.089,.074,dark,.04,1.602,.22);
  box(camera,.365,.205,.231,.047,blue,.04,1.764,.24);
  cylinder(camera,.081,.028,material('#2c4555',.44,.16),.04,1.76,.366).rotation.x=Math.PI/2;
  for(const x of [-.092,.172]) box(taskLights,.049,.059,.020,.006,white,x,1.765,.367);
  cylinder(antenna,.018,.51,dark,-.38,1.201,-.53);
  return m;
}

function cutawaySpurGearbox() {
  const m=new T.Group(), casePart=group(m,'case'), rim=group(m,'rim'), bearings=group(m,'bearings'), shafts=group(m,'shafts');
  const bolts=group(m,'mount-bolts'), webs=group(m,'webs');
  const blue=material('#26394f',.50,.43), tooth=material('#b4b5af',.53,.36);
  box(casePart,3.00,.19,.93,.027,blue,0,.107,0);
  for(const x of [-1.36,1.36]) for(const z of [-.36,.36]){
    cylinder(bolts,.052,.018,dark,x,.208,z);
    make(bolts,new T.CylinderGeometry(.038,.038,.025,6),bright,x,.229,z);
  }
  for(const x of [-1.16,-.58,.58,1.16]) box(webs,.080,.284,.077,.012,blue,x,.354,.387);
  box(casePart,2.87,.40,.79,.039,blue,0,.383,-.02);
  box(casePart,2.78,1.34,.099,.044,blue,0,1.09,-.346);
  for(const x of [-1.36,1.36]) box(casePart,.13,1.23,.69,.029,blue,x,1.01,-.027);
  box(casePart,2.79,.091,.69,.031,blue,0,1.776,-.029);
  for(const x of [-1.31,1.31]) box(rim,.081,1.17,.057,.015,silver,x,1.075,.329);
  for(const y of [.47,1.75]) box(rim,2.67,.071,.062,.015,silver,0,y,.328);
  for(const x of [-1.28,-.65,0,.65,1.28]) for(const y of [.47,1.75]) cylinder(rim,.023,.012,dark,x,y,.366).rotation.x=Math.PI/2;
  for(const [id,x,y,teeth] of [['input',-.91,.92,20],['idler',-.03,1.105,34],['output',.915,1.005,24]]){
    const part=group(m,id), pitch=teeth*.0166, root=pitch-.031, tip=pitch+.029;
    const shape=new T.Shape();
    for(let i=0;i<teeth;i++) for(const [j,r] of [[0,root],[.18,root],[.30,tip],[.64,tip],[.77,root]]){
      const a=(i+j)*Math.PI*2/teeth+(id==='idler'?.08:0);
      const xx=r*Math.cos(a),yy=r*Math.sin(a);
      if(i===0&&j===0) shape.moveTo(xx,yy);else shape.lineTo(xx,yy);
    }
    shape.closePath();
    make(part,new T.ExtrudeGeometry(shape,{depth:.154,bevelEnabled:true,bevelThickness:.008,bevelSize:.007,bevelSegments:2}),tooth,x,y,-.174);
    make(part,new T.TorusGeometry(root*.82,.006,8,48),silver,x,y,-.013);
    cylinder(part,pitch*.42,.15,silver,x,y,.048).rotation.x=Math.PI/2;
    cylinder(shafts,.090,.51,silver,x,y,.21).rotation.x=Math.PI/2;
    cylinder(shafts,.074,.096,bright,x,y,.488).rotation.x=Math.PI/2;
    box(bearings,.287,.321,.15,.023,silver,x,.62,.17);
    make(bearings,new T.TorusGeometry(.119,.035,10,36),silver,x,y,.210);
    for(let i=0;i<9;i++){
      const a=i*Math.PI*2/9;
      make(bearings,new T.SphereGeometry(.018,10,8),bright,x+.125*Math.cos(a),y+.125*Math.sin(a),.243);
    }
  }
  return m;
}

function fourBarLinkageDemo() {
  const m=new T.Group(), base=group(m,'base'), feet=group(m,'feet'), brackets=group(m,'brackets'), fixed=group(m,'fixed');
  const left=group(m,'left'), right=group(m,'right'), coupler=group(m,'coupler'), pins=group(m,'pins');
  const groundPins=group(m,'ground-pins'), washers=group(m,'washers');
  const blue=material('#233d5f',.47,.42);
  box(base,3.11,.146,1.03,.026,silver,0,.135,0);
  const a=[-1.15,.64,.14],b=[-.84,1.46,.14],c=[1.26,1.84,.14],d=[1.01,.64,.14];
  for(const p of [a,d]){
    box(brackets,.54,.10,.53,.013,blue,p[0],.249,0);
    robotLink(brackets,[p[0],.29,0],[p[0],.66,0],.303,.31,blue,.73);
  }
  for(const x of [-1.41,1.41]) for(const z of [-.37,.37]){
    cylinder(feet,.074,.071,dark,x,.046,z);
    cylinder(feet,.046,.05,silver,x,.095,z);
  }
  robotLink(fixed,a,d,.147,.077,silver,1);
  robotLink(left,[a[0],a[1],.203],[b[0],b[1],.203],.136,.077,silver,1);
  robotLink(right,[d[0],d[1],.204],[c[0],c[1],.204],.136,.077,silver,1);
  robotLink(coupler,[b[0],b[1],.14],[c[0],c[1],.14],.145,.081,blue,1);
  for(const [x,y] of [a,b,c,d]){
    const pin=y===a[1]?groundPins:pins;
    cylinder(pin,.124,.060,dark,x,y,.255).rotation.x=Math.PI/2;
    cylinder(washers,.086,.034,silver,x,y,.299).rotation.x=Math.PI/2;
    make(pin,new T.CylinderGeometry(.056,.056,.032,6),bright,x,y,.331).rotation.x=Math.PI/2;
  }
  return m;
}

function machinedRing(part,x,y,z,outer,inner,length,finish) {
  const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
  const bore=new T.Path();bore.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(bore);
  const geometry=new T.ExtrudeGeometry(shape,{depth:length,bevelEnabled:true,bevelThickness:.008,bevelSize:.006,bevelSegments:2,curveSegments:36});
  return make(part,geometry.translate(0,0,-length/2),finish,x,y,z);
}

function axialHelix(part,start,end,radius,turns,wireRadius,finish) {
  const segments=Math.ceil(turns*24);
  const points=Array.from({length:segments+1},(_,i)=>{
    const t=i/segments,angle=t*2*Math.PI*turns;
    return new T.Vector3(start+(end-start)*t,radius*Math.cos(angle),radius*Math.sin(angle));
  });
  return make(part,new T.TubeGeometry(new T.CatmullRomCurve3(points),points.length*2,wireRadius,9,false),finish);
}

function mountedShaftCoupling() {
  const m=new T.Group(), mount=group(m,'mount'), races=group(m,'races'), balls=group(m,'balls'), shafts=group(m,'shafts');
  const coupling=group(m,'coupling'), collars=group(m,'collars'), bolts=group(m,'bolts');
  const clampScrews=group(m,'clamp-screws');
  const blue=material('#253a54',.52,.44);
  const y=.73, bx=-.93;
  box(mount,.35,.16,1.27,.019,blue,bx,.098,0);
  machinedRing(mount,bx,y,0,.548,.455,.265,blue).rotation.y=Math.PI/2;
  machinedRing(races,bx+.151,y,0,.457,.366,.099,silver).rotation.y=Math.PI/2;
  machinedRing(races,bx+.17,y,0,.297,.195,.110,silver).rotation.y=Math.PI/2;
  for(let i=0;i<14;i++){
    const a=i*Math.PI/7;
    make(balls,new T.SphereGeometry(.044,17,11),bright,bx+.208,y+.333*Math.cos(a),.333*Math.sin(a));
  }
  for(const z of [-.48,.48]) cylinder(bolts,.053,.099,silver,bx,.21,z);
  cylinder(shafts,.19,1.17,silver,-.40,y,0).rotation.z=Math.PI/2;
  cylinder(shafts,.157,.63,silver,1.19,y,0).rotation.z=Math.PI/2;
  machinedRing(coupling,.61,y,0,.316,.180,.72,silver).rotation.y=Math.PI/2;
  for(const x of [.32,.51,.70,.89]) machinedRing(coupling,x,y,0,.361,.181,.162,silver).rotation.y=Math.PI/2;
  for(const x of [.206,1.008]) {
    machinedRing(collars,x,y,0,.369,.182,.103,blue).rotation.y=Math.PI/2;
    for(const a of [.32,2.42,4.51]){
      const screw=make(clampScrews,new T.CylinderGeometry(.033,.033,.025,6),dark,x,y+.373*Math.cos(a),.373*Math.sin(a));
      screw.rotation.x=a;
    }
  }
  for(const x of [.413,.603,.793]){
    machinedRing(coupling,x,y,0,.320,.181,.017,material('#575c62',.74,.43)).rotation.y=Math.PI/2;
  }
  m.rotation.y=-.23;
  return m;
}

function timingBeltBench() {
  const m=new T.Group(), base=group(m,'base'), stands=group(m,'stands'), drive=group(m,'drive'), driven=group(m,'driven');
  const bearings=group(m,'bearings'), belt=group(m,'belt'), fasteners=group(m,'fasteners');
  const feet=group(m,'feet'), hubs=group(m,'hubs');
  const blue=material('#263b56',.49,.43), rubber=material('#222325',.07,.81);
  box(base,2.94,.16,.90,.028,silver,0,.133,0);
  for(const x of [-1.34,1.34]) for(const z of [-.31,.31]) cylinder(feet,.070,.072,dark,x,.040,z);
  const machinedFinish=material('#bec6cb',.54,.34);
  for(const [part,x,y,r,count] of [[drive,-.98,.68,.287,22],[driven,.89,.966,.561,42]]) {
    box(stands,.62,.105,.58,.017,blue,x,.259,-.12);
    box(stands,.46,y-.20,.254,.033,blue,x,(y+.25)/2,-.28);
    cylinder(bearings,r*.59,.153,blue,x,y,-.133).rotation.x=Math.PI/2;
    cylinder(part,r-.027,.202,silver,x,y,.062).rotation.x=Math.PI/2;
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count;
      box(part,.041,.051,.204,.006,silver,x+(r-.021)*Math.cos(a),y+(r-.021)*Math.sin(a),.062).rotation.z=a-Math.PI/2;
    }
    cylinder(part,r,.046,machinedFinish,x,y,.192).rotation.x=Math.PI/2;
    make(part,new T.TorusGeometry(r*.80,.004,8,56),silver,x,y,.216);
    cylinder(hubs,r*.23,.078,machinedFinish,x,y,.240).rotation.x=Math.PI/2;
    cylinder(hubs,r*.105,.012,dark,x,y,.285).rotation.x=Math.PI/2;
    flangeBolts(fasteners,x,y,.225,r*.47,5,dark,true);
  }
  const a=new T.Vector2(-.98,.68),b=new T.Vector2(.89,.966),delta=b.clone().sub(a);
  const angle=Math.atan2(delta.y,delta.x), tangent=Math.acos((.287-.561)/delta.length());
  const points=[];
  for(const [c,r,start,end] of [[b,.565,angle-tangent,angle+tangent],[a,.292,angle+tangent,angle+2*Math.PI-tangent]]) for(let i=0;i<=32;i++){
    const t=start+(end-start)*i/32;
    points.push(new T.Vector2(c.x+r*Math.cos(t),c.y+r*Math.sin(t)));
  }
  const path=new T.Path();points.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();
  const positions=[],indices=[];
  for(let i=0;i<=points.length;i++){
    const p=points[i%points.length],previous=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
    const n=next.clone().sub(previous).normalize();
    for(const [dr,z] of [[-.015,-.065],[-.015,.164],[.015,-.065],[.015,.164]]) positions.push(p.x+n.y*dr,p.y-n.x*dr,z);
    if(i<points.length) for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]]) indices.push(4*i+a,4*i+b,4*i+4+a,4*i+b,4*i+4+b,4*i+4+a);
  }
  const strip=new T.BufferGeometry();
  strip.setAttribute('position',new T.Float32BufferAttribute(positions,3));strip.setIndex(indices);strip.computeVertexNormals();
  const beltFinish=rubber.clone();beltFinish.side=T.DoubleSide;
  make(belt,strip,beltFinish);
  for(let i=0;i<89;i++){
    const t=i/89,p=path.getPointAt(t),v=path.getTangentAt(t);
    box(belt,.031,.035,.218,.004,rubber,p.x-v.y*.013,p.y+v.x*.013,.050).rotation.z=Math.atan2(v.y,v.x);
  }
  return m;
}

function ballScrewLinearStage() {
  const m=new T.Group(), base=group(m,'base'), rails=group(m,'rails'), endBlocks=group(m,'end-blocks');
  const screw=group(m,'screw'), journals=group(m,'journals'), nut=group(m,'nut'), sliders=group(m,'sliders'), table=group(m,'table');
  const endBearings=group(m,'end-bearings'), nutMount=group(m,'nut-mount');
  const blue=material('#273e58',.50,.43);
  box(base,3.03,.155,1.17,.019,blue,0,.117,0);
  for(const z of [-.56,.56]){
    box(base,2.99,.056,.17,.009,silver,0,.057,z);
    for(const x of [-1.32,-.70,0,.70,1.32]) cylinder(base,.025,.009,dark,x,.089,z);
  }
  for(const z of [-.402,.402]){
    box(rails,2.79,.117,.192,.011,silver,0,.255,z);
    for(let i=0;i<10;i++) cylinder(rails,.022,.007,dark,-1.20+i*.263,.317,z);
    box(rails,2.73,.021,.018,.004,bright,0,.267,z+.103);
    for(const x of [-.23,.24]){
      box(sliders,.302,.147,.241,.019,blue,x,.359,z);
      box(sliders,.24,.058,.249,.009,silver,x,.447,z);
    }
  }
  for(const x of [-1.38,1.38]){
    box(endBlocks,.231,.39,.86,.025,blue,x,.348,0);
    machinedRing(endBearings,x*1.092,.357,0,.144,.083,.049,silver).rotation.y=Math.PI/2;
    cylinder(journals,.075,.207,bright,x*1.129,.357,0).rotation.z=Math.PI/2;
  }
  axial(screw,.079,2.55,silver,0).position.y=.357;
  axialHelix(screw,-1.25,1.25,.083,41,.012,bright).position.y=.357;
  axial(nut,.14,.37,silver,0).position.y=.357;
  machinedRing(nut,-.199,.357,0,.16,.082,.046,silver).rotation.y=Math.PI/2;
  box(nutMount,.34,.106,.45,.014,silver,0,.426,0);
  for(const z of [-.172,.172]) cylinder(nutMount,.024,.021,bright,-.135,.441,z);
  box(table,.82,.091,.94,.022,silver,0,.51,0);
  for(const x of [-.33,-.11,.11,.33]) for(const z of [-.36,-.12,.12,.36]) cylinder(table,.019,.006,dark,x,.559,z);
  return m;
}

function coiloverDamper() {
  const m=new T.Group(), top=group(m,'top'), eye=group(m,'eye'), spring=group(m,'spring'), damper=group(m,'damper');
  const rod=group(m,'rod'), seats=group(m,'seats'), stop=group(m,'stop'), studs=group(m,'studs');
  const bushing=group(m,'bushing');
  const blue=material('#233c59',.51,.39), elastomer=material('#ae8750',.08,.69);
  for(const x of [-.81,.69]){
    axial(seats,.367,.074,silver,x);
    axial(seats,.333,.061,blue,x*1.095);
  }
  axial(damper,.191,1.63,silver,.26);
  axial(damper,.213,.60,blue,.68);
  axial(rod,.094,1.12,bright,-.54);
  axial(stop,.145,.231,elastomer,-.49);
  for(const x of [-.576,-.52,-.465,-.411]) axial(stop,.156,.035,elastomer,x);
  axialHelix(spring,-.86,.78,.316,7.25,.055,blue);
  robotLink(eye,[-1.07,0,0],[-1.40,0,0],.25,.194,blue,.68);
  machinedRing(eye,-1.43,0,0,.149,.068,.116,blue);
  machinedRing(bushing,-1.43,0,0,.077,.052,.153,silver);
  axial(top,.329,.085,blue,.945);
  axial(top,.136,.138,bright,1.02);
  axial(top,.079,.084,dark,1.119);
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    const pin=axial(studs,.033,.18,silver,1.04);
    pin.position.set(1.04,.241*Math.cos(a),.241*Math.sin(a));
  }
  m.rotation.z=.51;
  m.position.y=.84;
  return m;
}

function steeringAxleDemo() {
  const m=new T.Group(), beam=group(m,'beam'), tires=group(m,'tires'), hubs=group(m,'hubs'), knuckles=group(m,'knuckles');
  const rods=group(m,'rods'), servo=group(m,'servo'), horn=group(m,'horn'), mounts=group(m,'mounts');
  const rodEnds=group(m,'rod-ends'), dragLink=group(m,'drag-link');
  const navy=material('#233953',.44,.45), rubber=material('#252625',.08,.81);
  box(beam,2.21,.20,.29,.031,navy,0,.448,0);
  box(mounts,.46,.14,.31,.022,silver,.08,.567,-.046);
  box(servo,.61,.34,.38,.038,navy,.12,.765,-.171);
  box(servo,.24,.302,.39,.027,dark,.35,.775,-.171);
  cylinder(horn,.118,.081,silver,-.06,.655,.037);
  robotLink(horn,[-.06,.631,.037],[.22,.525,.31],.105,.075,silver);
  for(const s of [-1,1]){
    const wheel=new T.Group();wheel.position.set(s*1.20,.44,0);wheel.rotation.y=s*.13;
    const tireParts=new T.Group(),hubParts=new T.Group();tireParts.position.copy(wheel.position);hubParts.position.copy(wheel.position);
    tireParts.rotation.copy(wheel.rotation);hubParts.rotation.copy(wheel.rotation);tires.add(tireParts);hubs.add(hubParts);
    cylinder(tireParts,.431,.244,rubber,0,0,0).rotation.z=Math.PI/2;
    for(let i=0;i<26;i++) for(const x of [-.061,.061]){
      const a=i*Math.PI/13+x;
      box(tireParts,.112,.040,.079,.008,rubber,x,.428*Math.cos(a),.428*Math.sin(a)).rotation.set(a,Math.sign(x)*.23,0);
    }
    make(hubParts,new T.TorusGeometry(.309,.035,9,48),silver,s*.126,0,0).rotation.y=Math.PI/2;
    cylinder(hubParts,.119,.063,bright,s*.143,0,0).rotation.z=Math.PI/2;
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      box(hubParts,.031,.212,.075,.009,silver,s*.133,.202*Math.cos(a),.202*Math.sin(a)).rotation.x=a;
    }
    cylinder(knuckles,.083,.34,silver,s*1.021,.439,.027);
    robotLink(knuckles,[s*1.021,.431,.023],[s*.904,.388,.306],.086,.105,silver);
    make(rodEnds,new T.SphereGeometry(.055,16,10),bright,s*.906,.383,.319);
    axial(rodEnds,.046,.15,silver,s*.821).position.set(s*.821,.383,.319);
  }
  axial(rods,.032,1.78,silver,0).position.set(0,.383,.319);
  wire(dragLink,[[.219,.525,.312],[.24,.457,.338],[.31,.385,.319]],.030,bright);
  return m;
}

function cutawayRotaryJoint() {
  const m=new T.Group(), left=group(m,'left'), right=group(m,'right'), casePart=group(m,'case'), bearing=group(m,'bearing');
  const balls=group(m,'balls'), motor=group(m,'motor'), drive=group(m,'drive'), flange=group(m,'flange'), screws=group(m,'screws'), wiring=group(m,'wiring');
  const armBolts=group(m,'arm-bolts');
  const blue=material('#243852',.47,.42);
  const y=.89;
  const milledFace=material('#b6bec5',.51,.40);
  make(casePart,new T.CylinderGeometry(.57,.57,.51,56,1,true,0,Math.PI*1.54),blue,0,y,0).rotation.x=Math.PI/2;
  box(casePart,.76,.141,.46,.041,blue,0,.399,-.027);
  machinedRing(bearing,0,y,.279,.535,.445,.090,silver);
  machinedRing(bearing,0,y,.306,.358,.255,.115,silver);
  for(let i=0;i<30;i++){
    const a=i*Math.PI/15;
    make(balls,new T.SphereGeometry(.036,18,12),bright,.403*Math.cos(a),y+.403*Math.sin(a),.35);
  }
  cylinder(flange,.245,.171,silver,0,y,.421).rotation.x=Math.PI/2;
  cylinder(flange,.219,.046,blue,0,y,.518).rotation.x=Math.PI/2;
  box(motor,.38,.32,.38,.037,dark,-.435,y,-.081);
  for(const x of [-.626,-.244]) box(motor,.028,.319,.384,.006,silver,x,y,-.081);
  cylinder(drive,.091,.327,silver,-.092,y,-.077).rotation.z=Math.PI/2;
  for(const r of [.201,.253]) make(drive,new T.TorusGeometry(r,.019,8,36),bright,0,y,.035);
  robotLink(left,[-.25,.56,-.05],[-1.17,.114,-.04],.31,.216,silver,.83);
  robotLink(right,[.05,y,.546],[1.22,1.56,.57],.311,.223,milledFace,.87);
  robotLink(right,[.445,1.106,.669],[1.11,1.473,.68],.113,.021,dark,.81);
  for(const [x,yy] of [[.34,1.058],[1.11,1.476]]) {
    cylinder(armBolts,.035,.012,bright,x,yy,.678).rotation.x=Math.PI/2;
  }
  flangeBolts(armBolts,.12,.922,.698,.089,4,dark,true);
  flangeBolts(screws,0,y,.335,.496,16,dark,true);
  wire(wiring,[[-.74,.42,-.19],[-.68,.70,-.15],[-.65,.93,-.19],[-.55,1.10,-.13],[-.32,1.15,-.07]],.022,blue);
  return m;
}

function cutawayElectricGearmotor() {
  const m=new T.Group(), casing=group(m,'casing'), stator=group(m,'stator'), rotor=group(m,'rotor'), pcb=group(m,'pcb');
  const connector=group(m,'connector'), gears=group(m,'gears'), bearings=group(m,'bearings'), output=group(m,'output'), plate=group(m,'plate');
  const ringGear=group(m,'ring-gear');
  const blue=material('#263951',.48,.44), copper=material('#b56936',.73,.40);
  const y=.63;
  for(const [x,l,r] of [[-.56,1.41,.442],[.59,.89,.404]]) make(casing,new T.CylinderGeometry(r,r,l,48,1,true,.75,Math.PI*1.33),blue,x,y,0).rotation.z=Math.PI/2;
  for(const x of [-1.25,.14,1.01]) box(plate,.081,.808,.767,.029,silver,x,y,0);
  box(connector,.30,.142,.28,.023,dark,-1.02,1.10,-.06);
  for(let i=0;i<4;i++) box(connector,.026,.024,.087,.004,boardGold,-1.115+i*.065,1.176,-.06);
  box(pcb,.044,.603,.582,.016,material('#206047',.12,.56),-1.185,y,.015);
  for(let i=0;i<8;i++) box(pcb,.020,.047,.028,.003,white,-1.156,.38+i*.063,.237);
  for(const x of [-.96,-.34]) for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const coil=make(stator,new T.TorusGeometry(.062,.022,8,28),copper,x,y+.306*Math.cos(a),.306*Math.sin(a));
    coil.rotation.x=a-Math.PI/2;
  }
  for(const [x,len,r,finish] of [[-.67,.62,.205,silver],[-.70,.94,.091,bright]]){
    const part=axial(rotor,r,len,finish,x);part.position.y=y;
  }
  const gearCenters=[[.41,y,0,.091,12]];
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    gearCenters.push([.41,y+.175*Math.cos(a),.175*Math.sin(a),.087,12]);
  }
  machinedRing(ringGear,.409,y,0,.300,.260,.146,silver).rotation.y=Math.PI/2;
  for(let i=0;i<36;i++){
    const a=i*Math.PI/18;
    box(ringGear,.132,.022,.020,.003,silver,.409,y+.259*Math.cos(a),.259*Math.sin(a)).rotation.x=a;
  }
  for(const [x,cy,cz,r,n] of gearCenters){
    cylinder(gears,r-.021,.132,silver,x,cy,cz).rotation.z=Math.PI/2;
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n;
      box(gears,.132,.025,.023,.004,bright,x,cy+r*Math.cos(a),cz+r*Math.sin(a)).rotation.x=a;
    }
  }
  for(const x of [.17,.951]) machinedRing(bearings,x,y,0,.153,.076,.080,silver).rotation.y=Math.PI/2;
  axial(output,.092,.69,bright,1.18).position.y=y;
  return m;
}

function pneumaticCylinderAndValve() {
  const m=new T.Group(), barrel=group(m,'barrel'), ends=group(m,'ends'), rod=group(m,'rod'), supports=group(m,'supports');
  const fittings=group(m,'fittings'), tubing=group(m,'tubing'), valve=group(m,'valve'), solenoids=group(m,'solenoids'), ports=group(m,'ports');
  const tieRods=group(m,'tie-rods'), clevis=group(m,'rod-fitting');
  const blue=material('#254263',.51,.42), hose=material('#237bbf',.14,.43);
  const y=.68,z=-.17;
  axial(barrel,.271,1.83,silver,0).position.set(0,y,z);
  for(const x of [-.954,.954]){
    box(ends,.19,.61,.67,.033,blue,x,y,z);
    box(supports,.34,.073,.74,.014,silver,x,.248,z);
    box(supports,.073,.31,.58,.011,silver,x,.410,z);
    for(const dz of [-.269,.269]) cylinder(supports,.038,.024,dark,x,.296,z+dz);
    cylinder(fittings,.062,.131,silver,x,.998,z);
    box(fittings,.172,.10,.090,.019,dark,x+Math.sign(x)*.038,1.084,z);
  }
  for(const dy of [-.235,.235]) for(const dz of [-.258,.258]){
    axial(tieRods,.019,1.81,bright,0).position.set(0,y+dy,z+dz);
    for(const x of [-1.053,1.053]) make(tieRods,new T.CylinderGeometry(.032,.032,.019,6),silver,x,y+dy,z+dz).rotation.z=Math.PI/2;
  }
  axial(rod,.116,.071,silver,-1.064).position.set(-1.064,y,z);
  axial(rod,.079,.63,bright,-1.39).position.set(-1.39,y,z);
  make(clevis,new T.CylinderGeometry(.111,.111,.099,6),silver,-1.71,y,z).rotation.z=Math.PI/2;
  machinedRing(clevis,-1.765,y,z,.079,.040,.027,silver).rotation.y=Math.PI/2;
  box(valve,.78,.31,.40,.026,silver,.65,.229,.71);
  box(valve,.83,.063,.46,.011,silver,.65,.067,.71);
  for(const x of [.39,.92]){
    box(solenoids,.21,.22,.25,.022,dark,x,.493,.71);
    box(solenoids,.104,.094,.16,.013,blue,x,.624,.71);
  }
  for(const x of [.42,.70,.97]) cylinder(ports,.050,.077,bright,x,.206,.94).rotation.x=Math.PI/2;
  wire(tubing,[[-1.01,1.09,z],[-1.23,1.06,z],[-1.26,.51,.02],[-.99,.26,.31],[-.53,.13,.88],[-.12,.136,1.07],[.42,.204,.982]],.030,hose);
  wire(tubing,[[1.01,1.09,z],[.82,1.17,z],[.42,1.094,z],[.06,1.07,z],[-.37,1.072,z],[-.78,1.031,-.05],[-.84,.63,.12],[-.77,.22,.49],[-.42,.13,1.02],[.70,.204,.982]],.030,hose);
  return m;
}

function parallelLinkGripper() {
  const m=new T.Group(), flange=group(m,'flange'), body=group(m,'body'), cover=group(m,'cover'), rods=group(m,'rods');
  const links=group(m,'links'), pins=group(m,'pins'), jaws=group(m,'jaws'), pads=group(m,'pads'), block=group(m,'block'), lead=group(m,'lead');
  const inlet=group(m,'inlet');
  const navy=material('#253a55',.49,.41);
  machinedRing(flange,0,1.95,0,.37,.115,.106,silver).rotation.x=Math.PI/2;
  cylinder(flange,.286,.174,navy,0,1.806,0);
  flangeBolts(flange,0,1.993,0,.273,7,dark);
  box(body,.85,.42,.56,.059,navy,0,1.555,0);
  box(cover,.56,.315,.053,.017,silver,0,1.567,.295);
  for(const x of [-.23,.23]) for(const y of [1.45,1.68]) cylinder(cover,.022,.012,dark,x,y,.327).rotation.x=Math.PI/2;
  axial(rods,.050,.59,silver,0).position.set(0,1.197,.056);
  box(rods,.222,.105,.152,.016,silver,0,1.197,.056);
  for(const s of [-1,1]){
    const a=[s*.328,1.46,.24],b=[s*.488,1.15,.25],c=[s*.329,.948,.25];
    robotLink(links,a,b,.096,.100,silver);
    robotLink(links,b,c,.095,.102,silver);
    for(const p of [a,b,c]){
      cylinder(pins,.061,.044,bright,p[0],p[1],.315).rotation.x=Math.PI/2;
      cylinder(pins,.027,.012,dark,p[0],p[1],.341).rotation.x=Math.PI/2;
    }
    box(jaws,.225,.441,.27,.035,silver,s*.326,.722,.229);
    box(pads,.066,.342,.279,.014,dark,s*.224,.667,.233);
  }
  box(block,.385,.34,.30,.012,silver,0,.570,.235);
  cylinder(inlet,.052,.064,silver,.385,1.759,.034);
  make(inlet,new T.CylinderGeometry(.046,.046,.028,6),bright,.385,1.797,.034);
  wire(lead,[[.36,1.68,.04],[.52,1.94,-.04],[.66,1.99,-.09],[.73,1.79,-.13],[.58,1.52,-.17]],.031,dark);
  return m;
}

function servoFeedbackBench() {
  const m=new T.Group(), base=group(m,'base'), motor=group(m,'motor'), encoder=group(m,'encoder'), cover=group(m,'cover');
  const shaft=group(m,'shaft'), support=group(m,'support'), disc=group(m,'disc'), controller=group(m,'controller');
  const ports=group(m,'ports'), cables=group(m,'cables');
  const strainRelief=group(m,'strain-relief');
  const navy=material('#233b57',.47,.44), green=material('#27704e',.14,.52);
  box(base,2.75,.15,1.64,.039,silver,0,.139,0);
  box(base,2.74,.064,1.62,.031,navy,0,.062,0);
  for(const x of [-1.20,1.20]) for(const z of [-.65,.65]) cylinder(base,.069,.05,dark,x,.033,z);
  const y=.62,z=.24;
  box(motor,.66,.62,.59,.040,dark,-.92,y,z);
  for(const dz of [-.306,.306]) for(let i=0;i<8;i++) box(motor,.58,.019,.025,.004,dark,-.92,.36+i*.071,z+dz);
  box(motor,.097,.65,.63,.022,navy,-.568,y,z);
  axial(shaft,.086,1.38,bright,.04).position.set(.04,y,z);
  for(const x of [-.43,-.16,.06]){
    machinedRing(encoder,x,y,z,.242,.076,.052,green).rotation.y=Math.PI/2;
    for(let i=0;i<16;i++){
      const a=i*Math.PI/8;
      make(encoder,new T.SphereGeometry(.015,8,6),boardGold,x+.038,y+.20*Math.cos(a),z+.20*Math.sin(a));
    }
  }
  const glass=new T.MeshPhysicalMaterial({color:'#b1c9cb',roughness:.19,transmission:.73,thickness:.047,side:T.DoubleSide});
  const glazing=make(cover,new T.CylinderGeometry(.277,.277,.51,46,1,true),glass,-.18,y,z);
  glazing.rotation.z=Math.PI/2;
  glazing.userData.cycleThrough=true;
  box(support,.40,.075,.65,.016,navy,.41,.254,z);
  box(support,.151,.47,.23,.026,navy,.41,.461,z-.17);
  machinedRing(support,.40,y,z,.279,.147,.152,navy).rotation.y=Math.PI/2;
  axial(disc,.252,.157,silver,.59).position.set(.59,y,z);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    cylinder(disc,.021,.012,dark,.675,y+.190*Math.cos(a),z+.190*Math.sin(a)).rotation.z=Math.PI/2;
  }
  box(controller,.73,.74,.55,.024,navy,.68,.603,-.425);
  box(controller,.735,.69,.057,.014,silver,.68,.600,-.137);
  for(let i=0;i<8;i++) box(controller,.029,.007,.38,.002,dark,.42+i*.073,.978,-.433);
  for(const [y,f] of [[.785,green],[.695,green],[.55,dark],[.446,dark]]) box(ports,.158,.068,.025,.006,f,.858,y,-.103);
  for(const z of [.081,.239]){
    cylinder(strainRelief,.052,.103,silver,-1.03,.974,z);
    make(strainRelief,new T.CylinderGeometry(.054,.054,.022,6),bright,-1.03,1.007,z);
  }
  for(const k of [-1,1]) wire(cables,[[-1.03,.99,.16+k*.079],[-.95,1.29,.11+k*.11],[-.54,1.30,.06+k*.079],[-.11,1.10,-.04+k*.073],[.30,.83,-.10+k*.052]],.027,dark);
  return m;
}

function robotPowerDistribution() {
  const m=new T.Group(), frame=group(m,'frame'), cage=group(m,'cage'), pack=group(m,'pack'), strap=group(m,'strap');
  const cables=group(m,'cables'), board=group(m,'board'), fuses=group(m,'fuses'), shield=group(m,'shield'), ports=group(m,'ports');
  const buckle=group(m,'buckle'), connectorPlate=group(m,'connector-plate');
  const navy=material('#263c56',.49,.42), black=material('#24262a',.08,.68), gold=material('#e6b62d',.10,.47);
  box(frame,2.10,.115,1.51,.028,silver,0,.098,0);
  for(const x of [-.96,.96]) for(const z of [-.65,.65]) cylinder(frame,.042,.022,dark,x,.166,z);
  box(pack,1.10,.65,.97,.060,black,-.39,.555,-.20);
  for(const x of [-.72,-.38,-.04]) box(pack,.019,.658,.971,.006,dark,x,.553,-.20);
  box(strap,.215,.041,1.02,.009,dark,-.37,.892,-.20);
  box(strap,.218,.67,.041,.010,dark,-.37,.552,.302);
  box(buckle,.25,.052,.14,.013,black,-.37,.928,-.12);
  for(const x of [-.454,-.286]) box(buckle,.036,.011,.104,.004,silver,x,.957,-.12);
  for(const x of [-.981,.18]){
    box(cage,.085,.82,.054,.013,navy,x,.529,.322);
    box(cage,.086,.055,1.05,.012,navy,x,.936,-.195);
    for(const y of [.26,.77]) cylinder(cage,.024,.012,silver,x,y,.357).rotation.x=Math.PI/2;
  }
  box(cage,1.17,.101,.061,.014,navy,-.40,.224,.34);
  const circuit=material('#2a485d',.15,.57);
  box(board,.89,.071,1.11,.012,circuit,.54,.416,.12);
  for(const x of [.19,.89]) for(const z of [-.36,.58]) cylinder(shield,.033,.204,bright,x,.516,z);
  box(shield,.91,.038,1.105,.014,new T.MeshPhysicalMaterial({color:'#b9ccd6',roughness:.18,transmission:.83,thickness:.04}),.54,.636,.12).userData.cycleThrough=true;
  for(let i=0;i<8;i++){
    const x=.33+(i%2)*.26,z=-.26+Math.floor(i/2)*.25;
    box(fuses,.144,.074,.119,.008,material(i>5?'#dcad26':i%2?'#aa4236':'#2c5996',.13,.44),x,.493,z);
  }
  box(connectorPlate,1.84,.235,.079,.018,navy,.056,.263,.699);
  for(const x of [-.813,.925]) for(const y of [.182,.345]) cylinder(connectorPlate,.022,.012,bright,x,y,.746).rotation.x=Math.PI/2;
  for(const [i,x] of [-.70,-.40,-.10,.20,.50,.80].entries()){
    box(ports,.219,.147,.129,.014,i<2?gold:i<4?silver:dark,x,.269,.763);
    for(const dx of [-.048,.048]) box(ports,.050,.062,.012,.005,dark,x+dx,.270,.834);
  }
  for(const [i,color] of ['#c64034','#22252a'].entries()){
    const off=i*.074;
    wire(cables,[[-.83+off,.385,.293],[-.80+off,.213,.474],[-.62+off,.204,.583],[-.14+off,.235,.533],[.14+off,.50,.32],[.19+off,.76,-.23],[.32+off,.70,-.43],[.35+off,.47,-.38]],.042,material(color,.04,.52));
  }
  return m;
}

function softBerryGripper() {
  const m=new T.Group(), pedestal=group(m,'pedestal'), joints=group(m,'joints'), links=group(m,'links'), wrist=group(m,'wrist');
  const manifold=group(m,'manifold'), hoses=group(m,'hoses'), fingers=group(m,'fingers'), berry=group(m,'berry');
  const couplers=group(m,'couplers');
  const navy=material('#253b57',.45,.43), silicone=new T.MeshPhysicalMaterial({color:'#d0e0e4',roughness:.33,transmission:.45,thickness:.10});
  const a=[.64,.55,0],b=[.92,1.68,-.04],c=[-.17,1.91,.03],w=[-.69,1.51,.08];
  cylinder(pedestal,.402,.118,silver,.64,.079,0);
  cylinder(pedestal,.33,.233,navy,.64,.245,0);
  for(const p of [a,b,c]) factoryAxis(joints,p,.178,.248,navy);
  const brushedAlloy=material('#b9bfc2',.51,.40);
  robotLink(links,a,b,.26,.27,brushedAlloy,.88);
  robotLink(links,b,c,.226,.223,brushedAlloy,.86);
  robotLink(wrist,c,w,.161,.170,brushedAlloy,.70);
  cylinder(manifold,.266,.091,silver,w[0],1.419,.08);
  cylinder(manifold,.172,.075,bright,w[0],1.345,.08);
  for(const [x,z] of [[-.89,.06],[-.48,.07],[-.69,-.10]]){
    cylinder(couplers,.033,.103,navy,x,1.488,z);
    make(couplers,new T.CylinderGeometry(.043,.043,.031,6),bright,x,1.484,z);
    cylinder(couplers,.038,.016,navy,x,1.547,z);
    wire(hoses,[[x,1.50,z],[x-.045,1.71,z],[-.67,1.84,z],[-.54,1.72,z]],.016,silicone);
  }
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3+.24,cos=Math.cos(a),sin=Math.sin(a);
    const curve=new T.CatmullRomCurve3([[.16,1.35],[.26,1.19],[.32,.98],[.28,.77],[.17,.64]].map(([r,y])=>new T.Vector3(w[0]+r*cos,y,.08+r*sin)));
    make(fingers,new T.TubeGeometry(curve,36,.081,15,false),silicone);
    for(let j=0;j<8;j++){
      const t=.045+j*.129,p=curve.getPoint(t);
      make(fingers,new T.TorusGeometry(.074,.019,7,24),silicone,...p.toArray()).quaternion.setFromUnitVectors(new T.Vector3(0,0,1),curve.getTangent(t));
    }
  }
  const red=material('#b52f2d',.03,.57);
  make(berry,new T.SphereGeometry(.119,22,16),red,w[0],.783,.086).scale.y=1.11;
  for(let i=0;i<34;i++){
    const a=i*2.399,v=1-2*i/33,r=Math.sqrt(1-v*v);
    make(berry,new T.SphereGeometry(.034,12,9),red,w[0]+.102*r*Math.cos(a),.781+v*.13,.086+.103*r*Math.sin(a));
  }
  return m;
}

function reconfigurableBlockWalker() {
  const m=new T.Group(), torso=group(m,'torso'), neck=group(m,'neck'), head=group(m,'head'), legs=group(m,'legs');
  const feet=group(m,'feet'), tail=group(m,'tail'), faces=group(m,'faces'), contacts=group(m,'contacts'), joints=group(m,'joints');
  const latches=group(m,'latches');
  const navy=material('#293b55',.47,.44);
  const module=(part,p,a=0)=>{
    const [x,y,z]=p;
    box(part,.30,.292,.30,.052,navy,x,y,z).rotation.z=a;
    for(const [dx,dy,dz,yaw,pitch] of [[0,0,.151,0,0],[.151,0,0,Math.PI/2,0],[-.151,0,0,-Math.PI/2,0],[0,.149,0,0,-Math.PI/2]]){
      const face=box(faces,.223,.217,.031,.015,silver,x+dx,y+dy,z+dz);
      face.rotation.set(pitch,yaw,a);
      const pad=box(contacts,.092,.085,.018,.007,dark,x+dx*1.13,y+dy*1.13,z+dz*1.13);
      pad.rotation.copy(face.rotation);
      for(const lateral of [-.071,.071]){
        const offset=new T.Vector3(lateral,0,.020).applyEuler(face.rotation);
        const latch=box(latches,.021,.044,.016,.004,dark,face.position.x+offset.x,face.position.y+offset.y,face.position.z+offset.z);
        latch.rotation.copy(face.rotation);
      }
      for(const tx of [-.021,.021]) for(const ty of [-.019,.019]){
        const offset=new T.Vector3(tx,ty,.013).applyEuler(face.rotation);
        const pin=box(contacts,.013,.012,.008,.002,boardGold,pad.position.x+offset.x,pad.position.y+offset.y,pad.position.z+offset.z);
        pin.rotation.copy(face.rotation);
      }
    }
  };
  for(const z of [-.50,-.14,.22,.58]) for(const x of [-.18,.18]) module(torso,[x,1.03,z]);
  module(neck,[0,1.30,.72],-.16);module(head,[0,1.60,.89]);
  module(tail,[0,1.18,-.78],.26);module(tail,[0,1.34,-1.04],.35);
  for(const s of [-1,1]) for(const z of [-.48,.51]){
    for(const [x,y] of [[.37,.88],[.49,.62],[.60,.35]]) module(legs,[s*x,y,z],s*.25);
    module(feet,[s*.65,.126,z+.028]);
    robotPivot(joints,[s*.475,.742,z+.032],.092,.130,navy);
    robotPivot(joints,[s*.578,.484,z+.032],.085,.119,navy);
  }
  return m;
}

function tabletopRobotSwarm() {
  const m=new T.Group(), surface=group(m,'surface'), outer=group(m,'outer'), inner=group(m,'inner');
  const rims=group(m,'rims'), caps=group(m,'caps'), windows=group(m,'windows'), drives=group(m,'drives');
  const indicators=group(m,'indicators');
  const navy=material('#25384e',.43,.44);
  box(surface,3.80,.062,3.07,.032,material('#7b8489',.46,.56),0,.016,0);
  for(const [count,radius,r,phase,part] of [[16,1.34,.178,.12,outer],[9,.62,.132,.32,inner]]) for(let i=0;i<count;i++){
    const a=phase+i*Math.PI*2/count,x=Math.cos(a)*radius,z=Math.sin(a)*radius*.86;
    cylinder(part,r,.093,navy,x,.12,z);
    cylinder(rims,r*1.018,.047,silver,x,.104,z);
    cylinder(caps,r*.457,.015,bright,x,.176,z);
    const beacon=new T.MeshStandardMaterial({color:'#aadcf1',emissive:'#4487ac',emissiveIntensity:.6,roughness:.30});
    for(const phase of [0,Math.PI]){
      const t=a+phase;
      cylinder(indicators,r*.104,.008,beacon,x+r*.25*Math.cos(t),.186,z+r*.25*Math.sin(t));
    }
    for(const s of [-1,1]){
      const t=a+s*.32;
      box(windows,r*.43,.040,.024,.007,dark,x+r*.996*Math.cos(t),.114,z+r*.996*Math.sin(t)).rotation.y=Math.PI/2-t;
      cylinder(drives,r*.235,.041,dark,x+s*r*.55,.057,z).rotation.z=Math.PI/2;
    }
  }
  return m;
}

function miniatureQuadruped() {
  const m=new T.Group(), frame=group(m,'frame'), board=group(m,'board'), cover=group(m,'cover'), leads=group(m,'leads');
  const battery=group(m,'battery'), sensor=group(m,'sensor'), drives=group(m,'drives'), links=group(m,'links'), feet=group(m,'feet'), coin=group(m,'coin');
  const standoffs=group(m,'standoffs');
  const navy=material('#243953',.51,.42);
  box(frame,.98,.149,.94,.031,navy,-.30,.70,.02);
  box(battery,.53,.16,.49,.019,silver,-.30,.61,.03);
  boardPlate(board,.72,.60,[],material('#272c31',.14,.54));board.position.set(-.30,.78,-.048);
  surfaceChip(board,0,0,.195,.21,5);
  for(let i=0;i<16;i++) box(board,.025,.014,.025,.003,boardGold,-.31+i%8*.081,.077,i<8?-.23:.23);
  box(cover,.76,.044,.65,.018,new T.MeshPhysicalMaterial({color:'#b1c6d3',roughness:.22,transmission:.71,thickness:.041}),-.30,.921,-.05).userData.cycleThrough=true;
  for(const x of [-.64,.04]) for(const z of [-.32,.23]){
    cylinder(standoffs,.025,.131,silver,x,.865,z);
    make(standoffs,new T.CylinderGeometry(.025,.025,.012,6),bright,x,.952,z);
  }
  box(sensor,.24,.16,.13,.022,dark,-.30,.69,.561);
  cylinder(sensor,.051,.023,material('#315267',.45,.17),-.30,.695,.633).rotation.x=Math.PI/2;
  for(const s of [-1,1]) for(const d of [-1,1]){
    const a=[-.30+s*.47,.69,d*.34],b=[-.30+s*.63,.41,d*.48],c=[-.30+s*.74,.097,d*.61];
    robotPivot(drives,a,.078,.094,navy);
    robotLink(links,a,b,.061,.078,silver,.75);
    robotPivot(drives,b,.048,.074,silver);
    robotLink(links,b,c,.052,.066,silver,.64);
    box(feet,.071,.091,.083,.015,dark,c[0],.066,c[2]);
  }
  for(const color of ['#d78a32','#aa5739']) wire(leads,[[.11,.87,-.04],[.23,.83,-.04],[.25,.65,-.06],[.11,.59,-.04]],.014,material(color,.16,.48));
  cylinder(coin,.403,.054,silver,.94,.039,.35);
  make(coin,new T.TorusGeometry(.373,.009,7,60),bright,.94,.068,.35).rotation.x=Math.PI/2;
  for(let i=0;i<62;i++){
    const a=i*Math.PI*2/62;
    box(coin,.016,.040,.009,.002,bright,.94+.402*Math.cos(a),.039,.35+.402*Math.sin(a)).rotation.y=-a;
  }
  return m;
}

function visionGuidedShelfPicker() {
  const m=new T.Group(), base=group(m,'base'), wheels=group(m,'wheels'), sensor=group(m,'sensor'), mount=group(m,'mount');
  const joints=group(m,'joints'), links=group(m,'links'), head=group(m,'head'), jaws=group(m,'jaws'), loom=group(m,'loom');
  const rack=group(m,'rack'), shelves=group(m,'shelves'), cartons=group(m,'cartons'), target=group(m,'target');
  const lights=group(m,'lights'), beamHoles=group(m,'beam-holes');
  const navy=material('#253a58',.47,.43), paper=material('#a98663',.04,.79);
  box(base,1.20,.35,1.22,.09,navy,-.94,.296,.15);
  box(base,1.22,.132,1.24,.049,silver,-.94,.520,.15);
  for(const x of [-1.49,-.39]) for(const z of [-.25,.55]){
    cylinder(wheels,.152,.105,dark,x,.156,z).rotation.z=Math.PI/2;
    cylinder(wheels,.122,.022,silver,x+Math.sign(x+.94)*.057,.156,z).rotation.z=Math.PI/2;
  }
  box(sensor,.43,.085,.028,.013,dark,-.94,.435,.773);
  for(const x of [-1.05,-.94,-.83]) cylinder(sensor,.023,.014,navy,x,.435,.794).rotation.x=Math.PI/2;
  for(const x of [-1.45,-.43]) box(lights,.101,.026,.018,.008,white,x,.423,.778);
  cylinder(mount,.272,.105,navy,-.95,.638,.10);
  const a=[-.95,.84,.10],b=[-.78,1.83,.09],c=[.11,1.42,.14],w=[.56,1.47,.16];
  for(const p of [a,b,c]) factoryAxis(joints,p,.137,.211,navy);
  robotLink(links,a,b,.207,.209,silver,.84);
  robotLink(links,b,c,.175,.180,silver,.76);
  robotLink(links,c,w,.121,.137,silver);
  box(head,.298,.135,.156,.023,dark,-.65,2.108,.13);
  for(const x of [-.726,-.574]) cylinder(head,.028,.015,navy,x,2.108,.219).rotation.x=Math.PI/2;
  robotLink(head,[-.74,1.89,.08],[-.65,2.07,.13],.041,.057,silver);
  box(jaws,.175,.23,.26,.027,navy,.57,1.47,.17);
  for(const y of [1.34,1.59]) robotLink(jaws,[.61,y,.17],[.84,y,.17],.063,.095,silver);
  wire(loom,[[-1.11,.66,-.01],[-1.19,.97,-.01],[-1.03,1.47,-.02],[-.94,1.91,-.01],[-.72,2.02,.04],[-.25,1.75,.04],[.12,1.54,.03],[.51,1.57,.04]],.029,dark);
  for(const x of [.81,1.66]) for(const z of [-.64,.58]) box(rack,.064,2.38,.065,.007,silver,x,1.196,z);
  for(const x of [.81,1.66]) for(let slot=0;slot<20;slot++){
    box(beamHoles,.018,.031,.010,.003,dark,x,.20+slot*.107,.615);
  }
  for(const y of [.29,1.24,2.19]){
    box(shelves,.94,.074,1.28,.009,navy,1.235,y,-.03);
    for(const z of [-.44,-.025,.39]) if(y!==1.24||z!==.39) box(cartons,.57,.35,.36,.009,paper,1.27,y+.22,z);
  }
  box(target,.59,.285,.36,.009,paper,1.035,1.47,.17);
  return m;
}

function anatomyOptic(parent,x,y,z,r) {
  const optical=material('#152e40',.48,.16), blue=material('#285678',.55,.24);
  machinedRing(parent,x,y,z,r,r*.78,r*.28,silver);
  make(parent,new T.TorusGeometry(r*.74,r*.051,8,48),blue,x,y,z+r*.17);
  const glass=make(parent,new T.SphereGeometry(r*.71,36,22),optical,x,y,z+r*.13);
  glass.scale.z=.40;
  const glint=make(parent,new T.SphereGeometry(r*.094,16,9),material('#7496a5',.38,.15),x+r*.27,y+r*.25,z+r*.389);
  glint.scale.set(1,.74,.29);
}

function skeletalRobotHead() {
  const m=new T.Group(), base=group(m,'base'), neck=group(m,'neck'), cage=group(m,'cage'), mounts=group(m,'mounts');
  const eyes=group(m,'eyes'), jaw=group(m,'jaw'), gears=group(m,'gears'), leads=group(m,'leads'), mask=group(m,'mask');
  const maskMounts=group(m,'mask-mounts'), skullPanels=group(m,'skull-panels');
  const frame=material('#aeb4b7',.52,.43);
  box(base,1.43,.16,1.16,.050,silver,-.51,.083,-.11);
  cylinder(neck,.211,.64,dark,-.51,.49,-.08);
  for(const y of [.195,.292,.641,.785]) cylinder(neck,.234,.070,silver,-.51,y,-.08);
  for(const x of [-.98,-.04]) robotLink(neck,[x,.16,.18],[-.51+(x+.51)*.42,.68,.012],.102,.115,frame);
  const cx=-.51,cy=1.69;
  for(const s of [-1,1]){
    wire(cage,[[cx+s*.29,1.10,.38],[cx+s*.44,1.32,.20],[cx+s*.53,1.72,-.12],[cx+s*.38,2.17,-.20],[cx+s*.20,2.27,-.05],[cx+s*.13,2.19,.34]],.048,frame);
    wire(cage,[[cx+s*.19,1.16,-.44],[cx+s*.40,1.57,-.49],[cx+s*.41,1.97,-.40],[cx+s*.23,2.22,-.24],[cx+s*.10,2.24,.12],[cx+s*.12,1.95,.404]],.035,silver);
    const panel=box(skullPanels,.066,.214,.277,.020,dark,cx+s*.415,1.912,.108);
    panel.rotation.z=-s*.29;
    for(const z of [-.006,.216]) cylinder(skullPanels,.024,.014,bright,cx+s*.452,1.923,z).rotation.z=Math.PI/2;
    box(mounts,.29,.30,.19,.021,dark,cx+s*.229,cy,.28);
    flangeBolts(mounts,cx+s*.229,cy,.388,.141,5,bright,true);
    anatomyOptic(eyes,cx+s*.229,cy,.402,.111);
    robotPivot(gears,[cx+s*.339,1.25,.252],.111,.148);
    wire(leads,[[cx+s*.14,.36,-.035],[cx+s*.18,.69,.061],[cx+s*.27,1.00,.034],[cx+s*.386,1.39,.22],[cx+s*.23,1.69,.16]],.016,material('#294b69',.34,.49));
  }
  wire(cage,[[cx-.48,1.95,-.02],[cx-.29,2.15,-.003],[cx,2.23,0],[cx+.29,2.15,-.003],[cx+.48,1.95,-.02]],.041,silver);
  for(const side of [-1,1]) {
    wire(cage,[[cx+side*.36,1.33,.29],[cx+side*.42,1.47,.40],
      [cx+side*.38,1.57,.48],[cx+side*.23,1.54,.53]],.028,frame);
    wire(cage,[[cx+side*.43,1.94,.08],[cx+side*.32,2.01,.35],
      [cx+side*.19,1.92,.48],[cx+side*.08,1.85,.46]],.030,frame);
  }
  robotLink(cage,[cx,1.39,.45],[cx,2.15,.33],.091,.082,frame);
  wire(jaw,[[cx-.36,1.33,.23],[cx-.26,1.13,.38],[cx,1.06,.44],[cx+.26,1.13,.38],[cx+.36,1.33,.23]],.056,frame);
  box(jaw,.424,.10,.14,.02,dark,cx,1.275,.366);
  for(let i=0;i<8;i++) box(jaw,.036,.058,.05,.006,silver,cx-.143+i*.041,1.289,.446);
  const shellGeometry=new T.SphereGeometry(1,52,36,0,Math.PI,0,Math.PI);
  const position=shellGeometry.getAttribute('position');
  const bump=(x,y,px,py,sx,sy)=>Math.exp(-(((x-px)/sx)**2+((y-py)/sy)**2));
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const depth=z>0?z*(.13*bump(x,y,0,.02,.17,.29)+.059*bump(x,y,0,-.40,.34,.075)-.09*bump(Math.abs(x),y,.40,.21,.23,.12)):z*.26;
    position.setXYZ(i,x*.468*(1+.18*y),y*.64,z*.29+depth);
  }
  shellGeometry.computeVertexNormals();
  const maskFinish=material('#b9bbbc',.53,.50);maskFinish.side=T.DoubleSide;
  make(mask,shellGeometry,maskFinish,.58,.803,.29).rotation.y=.66;
  for(const [x,y,z] of [[.32,1.29,.36],[.214,1.08,.45],[.19,.82,.48],[.24,.59,.44],[.38,.39,.36]]){
    box(maskMounts,.071,.051,.027,.010,silver,x,y,z).rotation.y=.66;
    cylinder(maskMounts,.011,.010,dark,x+.009,y,z+.017).rotation.x=Math.PI/2;
  }
  return m;
}

function stereoEyeAssembly() {
  const m=new T.Group(), frame=group(m,'frame'), brackets=group(m,'brackets'), left=group(m,'left'), right=group(m,'right');
  const drives=group(m,'drives'), pitch=group(m,'pitch'), yaw=group(m,'yaw'), base=group(m,'base'), leads=group(m,'leads');
  const crossbrace=group(m,'crossbrace');
  const cx=.59, y=1.38, navy=material('#254c71',.47,.42);
  cylinder(base,.59,.13,silver,0,.12,-.09);
  cylinder(yaw,.31,.222,dark,0,.282,-.09);
  cylinder(yaw,.331,.037,navy,0,.412,-.09);
  for(const s of [-1,1]) robotLink(base,[s*.44,.16,-.12],[s*.16,.46,-.06],.15,.18,silver);
  robotPivot(pitch,[0,.62,-.04],.162,.48,navy);
  box(frame,.21,.59,.19,.025,silver,0,.967,-.03);
  wire(frame,[[-.95,1.14,-.033],[-1.08,1.52,-.031],[-.91,1.91,-.067],[-.49,2.019,-.080],[0,1.926,-.06],[.49,2.019,-.080],[.91,1.91,-.067],[1.08,1.52,-.031],[.95,1.14,-.033]],.054,silver);
  box(crossbrace,.14,.61,.092,.011,silver,0,1.60,.161);
  for(const side of [-1,1]){
    robotLink(crossbrace,[0,1.59,.161],[side*.24,1.86,.131],.075,.070,silver);
    cylinder(crossbrace,.024,.017,dark,side*.153,1.768,.212).rotation.x=Math.PI/2;
  }
  for(const [s,part] of [[-1,left],[1,right]]){
    const x=s*cx;
    box(brackets,.76,.77,.15,.063,dark,x,y,.023);
    box(brackets,.64,.61,.13,.049,silver,x,y,.099);
    cylinder(part,.282,.205,dark,x,y,.22).rotation.x=Math.PI/2;
    anatomyOptic(part,x,y,.349,.261);
    for(const [dx,dy] of [[-.26,-.25],[.26,-.25],[-.26,.25],[.26,.25]]) cylinder(brackets,.026,.022,bright,x+dx,y+dy,.197).rotation.x=Math.PI/2;
    robotPivot(drives,[s*.945,y,.043],.126,.21,navy);
    wire(leads,[[x,1.23,-.16],[x,1.06,-.16],[s*.43,.91,-.038],[s*.24,.98,.07],[s*.20,1.64,.047],[s*.34,1.94,-.091]],.019,navy);
  }
  return m;
}

function acousticEarCutaway() {
  const m=new T.Group(), horn=group(m,'horn'), grille=group(m,'grille'), array=group(m,'array'), sensors=group(m,'sensors');
  const board=group(m,'board'), chassis=group(m,'chassis'), cable=group(m,'cable'), connector=group(m,'connector');
  const retaining=group(m,'retaining');
  const alloy=material('#9da4a7',.66,.44), navy=material('#253d59',.49,.40);
  const flare=new T.LatheGeometry([[.24,0],[.28,.08],[.34,.16],[.42,.27],[.54,.36],[.62,.40]].map(p=>new T.Vector2(...p)),56);
  const hornFinish=alloy.clone();hornFinish.side=T.DoubleSide;
  make(horn,flare,hornFinish,-.38,.81,.04).rotation.set(Math.PI/2,-.14,.04);
  make(horn,new T.TorusGeometry(.610,.026,9,56),silver,-.38,.81,.444).scale.y=1.09;
  for(let i=0;i<83;i++){
    const a=i*2.399,r=.17+.39*Math.sqrt(i/83);
    const z=.08+(r-.20)*.84;
    make(grille,new T.SphereGeometry(.012,7,5),dark,-.38+r*Math.cos(a),.81+r*Math.sin(a),z);
  }
  machinedRing(retaining,-.38,.81,.270,.226,.192,.026,silver);
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3;
    cylinder(retaining,.016,.009,bright,-.38+.212*Math.cos(angle),.81+.212*Math.sin(angle),.290).rotation.x=Math.PI/2;
  }
  cylinder(array,.223,.093,silver,-.38,.81,.223).rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const x=-.38+.144*Math.cos(a),y=.81+.144*Math.sin(a);
    cylinder(sensors,.030,.022,dark,x,y,.278).rotation.x=Math.PI/2;
    cylinder(sensors,.017,.012,navy,x,y,.290).rotation.x=Math.PI/2;
  }
  box(chassis,.80,.88,.36,.064,alloy,.16,.82,-.119);
  box(board,.54,.61,.055,.018,material('#1f4651',.14,.50),.27,.83,.105);
  for(const [x,y,r] of [[.24,.94,.109],[.34,.72,.135],[.11,1.06,.059]]) box(board,r,.125,.025,.008,dark,x,y,.148);
  for(let i=0;i<17;i++) box(board,.022,.027,.012,.003,i%3?boardGold:white,.089+i%5*.070,.58+Math.floor(i/5)*.044,.141);
  robotLink(chassis,[.13,.24,.06],[.61,.48,.055],.093,.094,silver);
  robotLink(chassis,[.08,1.39,.069],[.62,1.15,.06],.091,.092,silver);
  axial(connector,.204,.248,silver,.63).position.set(.63,.81,-.052);
  axial(connector,.143,.151,navy,.795).position.set(.795,.81,-.052);
  wire(cable,[[.34,.55,.12],[.52,.51,.15],[.62,.63,.15],[.62,.98,.15],[.52,1.104,.15]],.026,navy);
  return m;
}

function expressiveFaceMechanism() {
  const m=new T.Group(), shell=group(m,'shell'), bezel=group(m,'bezel'), eyes=group(m,'eyes'), lids=group(m,'lids');
  const link=group(m,'link'), drives=group(m,'drives'), mouth=group(m,'mouth'), ears=group(m,'ears'), neck=group(m,'neck');
  const brow=group(m,'brow');
  const navy=material('#253752',.50,.45), iris=new T.MeshStandardMaterial({color:'#388ed4',emissive:'#164a89',emissiveIntensity:.7,roughness:.22});
  box(shell,1.93,1.36,.78,.251,navy,0,1.27,-.17);
  box(shell,1.70,1.17,.026,.013,dark,0,1.28,.232);
  for(const x of [-.817,.817]) box(bezel,.151,1.145,.105,.041,silver,x,1.29,.293);
  for(const y of [.731,1.837]) box(bezel,1.65,.135,.101,.042,silver,0,y,.291);
  for(const x of [-.61,0,.61]) for(const y of [.735,1.834]) cylinder(bezel,.025,.017,dark,x,y,.350).rotation.x=Math.PI/2;
  for(const s of [-1,1]){
    const x=s*.39;
    make(eyes,new T.SphereGeometry(.265,36,22),white,x,1.30,.270);
    make(eyes,new T.SphereGeometry(.139,26,16),iris,x,1.30,.501).scale.z=.30;
    make(eyes,new T.SphereGeometry(.067,22,13),dark,x,1.30,.544).scale.z=.30;
    make(eyes,new T.SphereGeometry(.027,15,9),white,x+.032,1.339,.561).scale.z=.33;
    make(lids,new T.SphereGeometry(.273,32,18,0,Math.PI*2,0,.38*Math.PI),silver,x,1.30,.270);
    robotLink(link,[x+s*.12,1.72,.32],[x+s*.065,1.50,.37],.060,.051,silver);
    cylinder(link,.041,.018,dark,x+s*.12,1.72,.354).rotation.x=Math.PI/2;
    box(drives,.298,.088,.121,.015,navy,x,1.744,.288);
    const cover=box(brow,.141,.093,.086,.011,silver,x,1.745,.377);
    cover.rotation.z=s*.10;
    cylinder(brow,.023,.011,dark,x,1.745,.426).rotation.x=Math.PI/2;
    cylinder(ears,.239,.137,silver,s*.953,1.30,-.04).rotation.z=Math.PI/2;
    make(ears,new T.TorusGeometry(.202,.017,8,40),iris,s*1.026,1.30,-.04).rotation.y=Math.PI/2;
  }
  box(mouth,.491,.172,.078,.026,dark,0,.933,.298);
  wire(mouth,[[-.155,.960,.344],[-.081,.919,.345],[0,.903,.345],[.081,.919,.345],[.155,.960,.344]],.017,iris);
  cylinder(neck,.228,.37,dark,0,.511,-.054);
  for(const y of [.36,.62]) cylinder(neck,.249,.072,silver,0,y,-.054);
  box(neck,.72,.14,.51,.045,navy,0,.264,-.055);
  return m;
}

function robotNeckGimbal() {
  const m=new T.Group(), base=group(m,'base'), yaw=group(m,'yaw'), column=group(m,'column'), yoke=group(m,'yoke');
  const pitch=group(m,'pitch'), head=group(m,'head'), eyes=group(m,'eyes'), motors=group(m,'motors'), wires=group(m,'wires');
  const trunnions=group(m,'trunnions'), headPorts=group(m,'head-ports');
  const blue=material('#2362a0',.47,.38);
  box(base,1.42,.36,.75,.12,silver,0,.265,-.08);
  for(const s of [-1,1]) box(base,.38,.28,.45,.072,dark,s*.68,.237,-.11);
  cylinder(yaw,.377,.162,silver,0,.478,-.05);
  cylinder(yaw,.385,.046,blue,0,.538,-.05);
  flangeBolts(yaw,0,.572,-.05,.301,9,bright);
  cylinder(column,.175,.40,dark,0,.748,-.05);
  box(motors,.31,.173,.291,.019,dark,-.27,.686,-.03);
  box(yoke,.54,.115,.32,.036,silver,0,.965,-.05);
  for(const s of [-1,1]){
    robotLink(yoke,[s*.22,.979,-.045],[s*.40,1.252,-.047],.114,.157,silver);
    robotPivot(pitch,[s*.39,1.269,-.057],.133,.168,blue);
    cylinder(trunnions,.112,.056,silver,s*.486,1.269,-.057).rotation.z=Math.PI/2;
    cylinder(trunnions,.058,.018,bright,s*.52,1.269,-.057).rotation.z=Math.PI/2;
    wire(wires,[[s*.12,.533,-.05],[s*.14,.801,-.12],[s*.36,.902,-.14],[s*.48,1.109,-.12],[s*.43,1.28,-.12]],.019,s===1?blue:dark);
  }
  axial(pitch,.069,.54,bright,0).position.set(0,1.27,-.057);
  box(head,.97,.59,.64,.187,silver,0,1.634,-.02);
  for(const s of [-1,1]){
    cylinder(headPorts,.110,.037,blue,s*.473,1.633,-.014).rotation.z=Math.PI/2;
    cylinder(headPorts,.082,.025,bright,s*.501,1.633,-.014).rotation.z=Math.PI/2;
  }
  box(head,.36,.023,.24,.007,dark,0,1.940,-.02);
  box(eyes,.71,.318,.046,.020,dark,0,1.634,.304);
  for(const x of [-.204,.204]) anatomyOptic(eyes,x,1.63,.326,.096);
  return m;
}

function multiAxisShoulderCutaway() {
  const m=new T.Group(), ribs=group(m,'ribs'), neck=group(m,'neck'), yaw=group(m,'yaw'), bracket=group(m,'bracket');
  const motor=group(m,'motor'), windings=group(m,'windings'), bearing=group(m,'bearing'), arm=group(m,'arm'), wires=group(m,'wires');
  const blue=material('#23598b',.43,.43), copper=material('#b57b43',.64,.41);
  for(const z of [-.23,.23]){
    robotLink(ribs,[-.67,.18,z],[-.54,1.78,z],.126,.101,silver,1.25);
    robotLink(ribs,[-.53,1.29,z],[-.93,1.66,z],.121,.085,silver);
    robotLink(ribs,[-.64,.69,z],[-.91,.33,z],.135,.089,silver);
  }
  box(neck,.80,.14,.55,.034,silver,-.40,1.90,0);
  cylinder(yaw,.217,.25,dark,-.33,1.704,0);
  cylinder(yaw,.244,.052,blue,-.33,1.746,0);
  robotLink(bracket,[-.32,1.57,.11],[.43,1.42,.13],.24,.28,silver,.80);
  const x=.50,y=1.424;
  cylinder(motor,.287,.325,dark,x,y,.052).rotation.x=Math.PI/2;
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    box(windings,.058,.039,.065,.008,copper,x+.265*Math.cos(a),y+.265*Math.sin(a),.220).rotation.z=a;
  }
  machinedRing(bearing,x,y,.250,.256,.163,.069,blue);
  cylinder(bearing,.145,.106,silver,x,y,.303).rotation.x=Math.PI/2;
  robotLink(arm,[.50,1.38,.30],[.98,.40,.26],.23,.199,silver,.77);
  const armRing=group(m,'arm-ring');
  const armEnd=machinedRing(armRing,.982,.393,.259,.134,.066,.075,silver);
  armEnd.rotation.set(Math.PI*.43,0,.43);
  robotLink(arm,[.66,1.12,.407],[.89,.60,.366],.079,.025,dark);
  wire(wires,[[-.71,.34,.02],[-.68,.91,.069],[-.78,1.37,.105],[-.69,1.79,.08],[-.45,1.98,.045]],.023,blue);
  wire(wires,[[.61,1.29,.396],[.73,1.05,.415],[.83,.73,.389],[.93,.55,.358]],.015,blue);
  return m;
}

function trussedUpperArm() {
  const m=new T.Group(), large=group(m,'large'), small=group(m,'small'), braces=group(m,'braces');
  const rails=group(m,'rails'), sleeves=group(m,'sleeves'), bolts=group(m,'bolts'), channel=group(m,'channel');
  const blue=material('#2162a0',.46,.41);
  const a=-1.00,b=1.12,y=.64;
  machinedRing(large,a,y,.24,.409,.239,.176,silver);
  machinedRing(small,b,y,.24,.281,.158,.16,silver);
  machinedRing(sleeves,a,y,.103,.371,.234,.123,blue);
  machinedRing(sleeves,b,y,.115,.248,.150,.093,blue);
  flangeBolts(bolts,a,y,.34,.339,10,dark,true);
  flangeBolts(bolts,b,y,.334,.224,8,dark,true);
  for(const z of [-.155,.176]){
    const top=[[-.99,.988,z],[-.49,.914,z],[.15,.871,z],[.64,.850,z],[1.13,.856,z]];
    const bottom=[[-.99,.294,z],[-.47,.363,z],[.11,.437,z],[.67,.475,z],[1.12,.467,z]];
    for(let i=0;i<4;i++){
      robotLink(rails,top[i],top[i+1],.086,.096,silver,1);
      robotLink(rails,bottom[i],bottom[i+1],.095,.092,silver,1);
      robotLink(braces,i%2?bottom[i]:top[i],i%2?top[i+1]:bottom[i+1],.10,.085,silver,1);
    }
  }
  for(const x of [-.70,.17,.76]) box(braces,.086,.111,.356,.012,silver,x,.873,.013);
  const clevis=group(m,'clevis');
  for(const z of [-.117,.153]){
    box(clevis,.176,.168,.090,.019,silver,-.906,1.047,z);
    cylinder(clevis,.044,.012,dark,-.906,1.087,z+.05).rotation.x=Math.PI/2;
  }
  box(channel,1.65,.073,.111,.012,blue,.025,.399,.033);
  return m;
}

function gearedElbowCutaway() {
  const m=new T.Group(), housing=group(m,'housing'), upper=group(m,'upper'), forearm=group(m,'forearm'), ring=group(m,'ring');
  const gears=group(m,'gears'), hub=group(m,'hub'), cover=group(m,'cover'), cable=group(m,'cable'), bolts=group(m,'bolts');
  const blue=material('#2461a1',.48,.40), alloy=material('#a0a5a7',.67,.43);
  const x=-.16,y=.85;
  machinedRing(housing,x,y,-.10,.443,.348,.29,silver);
  machinedRing(ring,x,y,.084,.371,.313,.093,alloy);
  for(let i=0;i<46;i++){
    const a=i*Math.PI/23;
    box(ring,.043,.032,.082,.005,silver,x+.313*Math.cos(a),y+.313*Math.sin(a),.092).rotation.z=a;
  }
  for(const [gx,gy,r] of [[-.30,1.00,.114],[-.30,.69,.112],[.02,.85,.119]]){
    cylinder(gears,r-.016,.10,silver,gx,gy,.079).rotation.x=Math.PI/2;
    for(let i=0;i<15;i++){
      const a=i*Math.PI*2/15;
      box(gears,.024,.023,.099,.003,bright,gx+r*Math.cos(a),gy+r*Math.sin(a),.08).rotation.z=a;
    }
  }
  cylinder(hub,.201,.16,silver,x,y,.20).rotation.x=Math.PI/2;
  machinedRing(hub,x,y,.305,.221,.179,.037,blue);
  cylinder(cover,.168,.075,alloy,x,y,.342).rotation.x=Math.PI/2;
  flangeBolts(bolts,x,y,.348,.198,7,dark,true);
  robotLink(upper,[-.44,1.11,-.063],[-.89,2.0,-.09],.33,.268,silver,.91);
  robotLink(forearm,[.13,.78,-.038],[1.11,.47,.007],.36,.291,silver,.81);
  robotLink(forearm,[.40,.69,.139],[1.01,.50,.160],.098,.029,dark,1);
  const gland=group(m,'gland');
  const collar=cylinder(gland,.185,.046,blue,.283,.731,.002);
  collar.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(.98,-.31,.045).normalize());
  wire(cable,[[.04,.637,.342],[.19,.541,.301],[.33,.559,.219],[.45,.633,.14],[.63,.572,.142]],.024,blue);
  return m;
}

function serviceableForearm() {
  const m=new T.Group(), shell=group(m,'shell'), hatch=group(m,'hatch'), hinges=group(m,'hinges'), collar=group(m,'collar');
  const board=group(m,'board'), drives=group(m,'drives'), loom=group(m,'loom'), wrist=group(m,'wrist'), hand=group(m,'hand');
  const blue=material('#235881',.49,.42);
  for(const y of [-.267,.267]) robotLink(shell,[-1.18,y,0],[.53,y*.71,0],.115,.40,silver,.78);
  box(shell,1.61,.51,.077,.025,silver,-.28,0,-.205);
  const cover=box(hatch,1.30,.042,.43,.024,silver,-.32,.51,-.245);cover.rotation.x=-.82;
  for(const x of [-.85,.20]) {
    robotLink(hinges,[x,.26,-.18],[x,.54,-.269],.038,.046,bright);
    cylinder(hinges,.036,.115,dark,x,.27,-.18).rotation.z=Math.PI/2;
  }
  for(const x of [-1.23,.61]) {
    const part=x<0?collar:wrist;
    machinedRing(part,x,0,0,x<0?.335:.244,.148,.118,silver).rotation.y=Math.PI/2;
    machinedRing(part,x+.065,0,0,x<0?.331:.242,.147,.035,blue).rotation.y=Math.PI/2;
  }
  box(board,.38,.31,.053,.018,material('#28424b',.14,.55),-.825,0,.049);
  for(let i=0;i<10;i++) box(board,.031,.042,.021,.004,i%2?white:dark,-.974+(i%5)*.067,-.078+Math.floor(i/5)*.15,.09);
  for(const y of [-.119,.12]){
    axial(drives,.092,.51,silver,.014).position.set(.014,y,.074);
    axial(drives,.067,.47,dark,.24).position.set(.24,y,.075);
  }
  for(const [i,color] of ['#286797','#bf632a','#272a2d'].entries()) {
    const d=(i-1)*.034;
    wire(loom,[[-.97,-.11,.094+d],[-.65,-.203,.128+d],[-.41,-.174,.127+d],[-.27,.154,.129+d],[.19,.158,.138+d],[.52,.091,.14+d]],.015,material(color,.10,.53));
  }
  const hatchRibs=group(m,'hatch-ribs');
  for(const x of [-.74,-.32,.10]){
    box(hatchRibs,.024,.018,.34,.004,silver,x,.537,-.245).rotation.x=-.82;
  }
  box(hand,.364,.36,.139,.039,dark,.85,0,.01);
  for(let i=0;i<4;i++){
    const y=(i-1.5)*.087;
    robotLink(hand,[.996,y,.006],[1.24,y*1.31,.06],.044,.049,silver);
    robotLink(hand,[1.24,y*1.31,.06],[1.41-(i===3?.067:0),y*1.47,.118],.047,.049,silver);
  }
  robotLink(hand,[.75,.13,.016],[1.02,.36,.10],.069,.075,silver);
  return m;
}

function threeAxisWrist() {
  const m=new T.Group(), base=group(m,'base'), yaw=group(m,'yaw'), yoke=group(m,'yoke'), pitch=group(m,'pitch');
  const rotor=group(m,'rotor'), casing=group(m,'casing'), flange=group(m,'flange'), leads=group(m,'leads');
  const blue=material('#235a89',.49,.42);
  cylinder(base,.60,.133,silver,0,.091,0);
  flangeBolts(base,0,.167,0,.502,9,dark);
  cylinder(yaw,.425,.385,dark,0,.335,0);
  cylinder(yaw,.439,.049,blue,0,.505,0);
  for(const s of [-1,1]){
    robotLink(yoke,[s*.295,.475,0],[s*.432,1.13,.04],.185,.203,silver);
    robotPivot(pitch,[s*.43,1.125,.046],.218,.18,blue);
  }
  box(yoke,.67,.122,.302,.026,silver,0,.611,.01);
  const tool=new T.Group();tool.position.set(.15,1.13,.135);tool.rotation.set(.11,.51,-.15);m.add(tool);
  tool.add(rotor,casing,flange);
  cylinder(rotor,.234,.47,silver,0,0,.21).rotation.x=Math.PI/2;
  machinedRing(casing,0,0,.17,.329,.248,.105,dark);
  machinedRing(casing,0,0,.47,.329,.249,.097,dark);
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]) box(casing,.125,.121,.288,.026,silver,.286*Math.cos(a),.286*Math.sin(a),.32).rotation.z=a;
  machinedRing(flange,0,0,.568,.282,.075,.103,silver);
  flangeBolts(flange,0,0,.628,.195,8,dark,true);
  const clamps=group(m,'clamps');
  for(const [x,y,z] of [[-.217,.663,-.045],[.161,.791,-.053]]){
    make(clamps,new T.TorusGeometry(.029,.010,8,28),silver,x,y,z).rotation.x=Math.PI/2;
  }
  wire(leads,[[-.22,.48,.03],[-.21,.67,-.04],[-.07,.74,-.08],[.15,.78,-.05],[.25,.95,-.028]],.026,blue);
  return m;
}

function exposedRoboticPalm() {
  const m=new T.Group(), frame=group(m,'frame'), fingers=group(m,'fingers'), thumb=group(m,'thumb'), pivots=group(m,'pivots');
  const actuators=group(m,'actuators'), rods=group(m,'rods'), drives=group(m,'drives'), brace=group(m,'brace'), mount=group(m,'mount');
  const blue=material('#285d89',.49,.44);
  wire(frame,[[-.27,.214,.06],[-.60,.39,.08],[-.80,.80,.08],[-.91,1.09,.08],[-.70,1.39,.06],[-.60,1.86,.04],[.77,1.81,.04],[.65,1.00,.04],[.44,.41,.06],[.27,.214,.06],[-.27,.214,.06]],.060,silver);
  box(brace,1.21,.113,.27,.023,dark,.032,.784,.01);
  const detail=group(m,'drive-guards');
  for(let i=0;i<4;i++){
    const x=-.48+i*.356,y=1.81+Math.sin((i+.2)*.86)*.15;
    robotLink(frame,[x-.132,.41,-.03],[x-.132,y-.078,-.018],.069,.116,silver,1);
    box(fingers,.236,.18,.205,.025,silver,x,y+.077,.05);
    box(fingers,.121,.10,.024,.007,dark,x,y+.099,.155);
    cylinder(pivots,.045,.22,bright,x,y+.127,.143).rotation.z=Math.PI/2;
    cylinder(actuators,.084,.36,silver,x,1.234,.09);
    cylinder(actuators,.087,.047,blue,x,1.354,.09);
    const guard=box(detail,.090,.275,.078,.012,dark,x-.103,1.233,.124);
    guard.rotation.z=-.045;
    for(const h of [1.12,1.345]) cylinder(detail,.016,.012,bright,x-.103,h,.168).rotation.x=Math.PI/2;
    cylinder(rods,.032,.219,bright,x,1.54,.09);
    robotPivot(drives,[x,.582,.07],.094,.188,blue);
  }
  robotLink(thumb,[-.59,.57,.08],[-1.067,1.274,.052],.174,.18,silver,.85);
  robotPivot(pivots,[-.962,1.14,.053],.099,.163,blue);
  box(thumb,.21,.16,.23,.021,silver,-1.067,1.274,.052).rotation.z=.62;
  cylinder(mount,.249,.175,silver,0,.106,.029);
  cylinder(mount,.241,.033,blue,0,.203,.029);
  return m;
}

function articulatedFingerHand() {
  const m=new T.Group(), wrist=group(m,'wrist'), palm=group(m,'palm'), knuckles=group(m,'knuckles'), proximal=group(m,'proximal');
  const middle=group(m,'middle'), tips=group(m,'tips'), hinges=group(m,'hinges'), tendons=group(m,'tendons'), thumb=group(m,'thumb');
  const blue=material('#255c8b',.45,.42), metal=material('#a6adaf',.67,.41);
  cylinder(wrist,.269,.271,silver,0,.214,-.04);
  cylinder(wrist,.287,.045,blue,0,.355,-.04);
  robotLink(palm,[0,.40,-.046],[0,.955,-.065],.60,.32,dark,1.23);
  const detail=group(m,'tip-pads');
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.231,dx=(i-1.5)*.072,len=[.84,1,.94,.75][i],y=.978+(.06*Math.sin(i));
    const a=[x,y,.012],b=[x+dx*.48,y+.39*len,.087],c=[x+dx*.84,y+.64*len,.207],d=[x+dx,y+.783*len,.378];
    robotPivot(knuckles,a,.108,.174,blue);
    robotLink(proximal,a,b,.151,.130,metal,.81);
    robotLink(middle,b,c,.128,.113,silver,.79);
    robotLink(tips,c,d,.105,.111,metal,.62);
    const cap=box(detail,.083,.081,.031,.014,dark,d[0],d[1]-.020,d[2]+.056);
    cap.rotation.x=.43;
    robotPivot(hinges,b,.065,.105,blue);robotPivot(hinges,c,.056,.099,blue);
    wire(tendons,[[x*.73,.52,.163],[x*.90,.72,.146],[a[0],a[1],.139],[b[0],b[1],.151],[c[0],c[1],.258]],.012,blue);
  }
  const a=[.32,.61,.068],b=[.615,.719,.129],c=[.775,.919,.234],d=[.803,1.102,.346];
  robotLink(thumb,a,b,.186,.161,metal);
  robotLink(thumb,b,c,.136,.125,silver);
  robotLink(thumb,c,d,.103,.106,metal,.65);
  robotPivot(thumb,b,.084,.125,blue);
  robotPivot(thumb,c,.061,.102,blue);
  m.rotation.z=-.32;
  m.position.y=.23;
  return m;
}

function oppositionHand() {
  const m=new T.Group(),w=group(m,'wrist'),p=group(m,'palm'),f=group(m,'fingers'),b=group(m,'base'),j=group(m,'joints'),t=group(m,'thumb'),pad=group(m,'pad'),c=group(m,'cables');
  const blue=material('#235c8c',.45,.41);
  for(const [x,r] of [[-1.05,.36],[-.92,.32],[-.78,.29]]) machinedRing(w,x,.51,0,r,.174,.12,silver).rotation.y=Math.PI/2;
  robotLink(p,[-.76,.48,0],[-.27,1.03,0],.51,.45,dark);
  const detail=group(m,'knuckle-caps');
  for(let i=0;i<4;i++){
    const z=(i-1.5)*.15,y=1.02+Math.sin(i*.82)*.16;
    const points=[[-.38,y,z],[.05,y+.36,z],[.40,y+.31,z],[.58,y+.05,z]];
    for(let k=0;k<3;k++) robotLink(f,points[k],points[k+1],.123-k*.016,.121,silver);
    cylinder(detail,.049,.018,silver,points[0][0],points[0][1],z+.072).rotation.x=Math.PI/2;
    cylinder(detail,.022,.010,dark,points[0][0],points[0][1],z+.084).rotation.x=Math.PI/2;
    for(const q of points.slice(0,3)) robotPivot(f,q,.065,.118,blue);
  }
  factoryAxis(b,[-.46,.46,.276],.231,.18,blue);
  const q=[[-.42,.47,.32],[-.07,.45,.37],[.32,.66,.37],[.55,.93,.32]];
  for(let k=0;k<3;k++) robotLink(t,q[k],q[k+1],.215-k*.038,.174,silver,.69);
  for(const pt of q.slice(1,3)) factoryAxis(j,pt,.096,.132,blue);
  box(pad,.164,.078,.146,.027,dark,.546,.908,.365).rotation.z=.66;
  wire(c,[[-.68,.54,.23],[-.44,.32,.38],[-.15,.38,.46],[.11,.48,.474],[.35,.64,.441]],.016,blue);
  return m;
}

function tendonFingerBench() {
  const m=new T.Group(), plate=group(m,'plate'), bracket=group(m,'bracket'), motors=group(m,'motors'), drums=group(m,'drums'), pulley=group(m,'pulley');
  const cords=group(m,'cords'), links=group(m,'links'), pins=group(m,'pins'), tip=group(m,'tip');
  const blue=material('#205d9a',.46,.43);
  box(plate,1.50,.105,1.0,.020,silver,-.58,.079,0);
  for(const x of [-1.24,.08]) for(const z of [-.40,.40]) cylinder(plate,.039,.030,dark,x,.143,z);
  for(const z of [-.18,.18]){
    robotLink(bracket,[-.16,.14,z],[.10,.82,z],.101,.068,dark);
    robotLink(bracket,[.21,.14,z],[.10,.82,z],.095,.068,silver);
  }
  const detail=group(m,'motor-rack');
  for(const y of [.30,.53]){
    axial(motors,.096,.48,silver,-.85).position.set(-.85,y,0);
    axial(drums,.110,.114,blue,-.54).position.set(-.54,y,0);
    axial(drums,.063,.149,dark,-.45).position.set(-.45,y,0);
  }
  for(const x of [-1.12,-.625]){
    box(detail,.055,.448,.330,.015,dark,x,.367,0);
    for(const z of [-.135,.135]) for(const y of [.185,.551]) cylinder(detail,.023,.012,bright,x-.034,y,z).rotation.z=Math.PI/2;
  }
  const points=[[.10,.80,0],[.37,1.32,0],[.78,1.60,0],[1.14,1.69,0]];
  for(let i=0;i<3;i++) {
    for(const z of [-.09,.09]) robotLink(links,[points[i][0],points[i][1],z],[points[i+1][0],points[i+1][1],z],.127-i*.015,.066,silver);
    factoryAxis(pins,points[i],.071,.21,blue);
    cylinder(pulley,.051,.060,dark,points[i][0],points[i][1]+.075,.12).rotation.x=Math.PI/2;
  }
  box(tip,.286,.129,.190,.055,dark,1.24,1.662,0).rotation.z=-.19;
  for(const s of [-1,1]) wire(cords,[[-.54,.415+s*.115,.14],[-.21,.45+s*.10,.147],[.04,.78+s*.074,.146],[.28,1.29+s*.043,.148],[.76,1.69+s*.026,.145],[1.14,1.76,.144]],.014,s===1?blue:bright);
  return m;
}

function interchangeableToolRack() {
  const m=new T.Group(), base=group(m,'base'), uprights=group(m,'uprights'), rail=group(m,'rail'), locks=group(m,'locks');
  const collars=group(m,'collars'), vacuum=group(m,'vacuum'), jaw=group(m,'jaw'), tool=group(m,'tool'), docks=group(m,'docks'), hose=group(m,'hose');
  const blue=material('#215e90',.44,.45);
  box(base,2.88,.22,1.06,.037,silver,0,.135,0);
  box(base,2.76,.045,.91,.017,dark,0,.046,0);
  for(const x of [-1.34,1.34]) box(uprights,.107,1.76,.107,.011,silver,x,1.095,-.08);
  box(rail,2.78,.132,.129,.013,silver,0,1.867,-.08);
  const detail=group(m,'dock-latches');
  for(const x of [-.89,0,.89]){
    box(locks,.42,.196,.37,.022,dark,x,1.875,.046);
    box(locks,.195,.047,.181,.015,blue,x,1.991,.049);
    cylinder(collars,.178,.183,silver,x,1.692,.064);
    cylinder(collars,.171,.048,blue,x,1.576,.064);
    machinedRing(docks,x,.307,.066,.192,.094,.093,silver).rotation.x=Math.PI/2;
    box(docks,.39,.067,.36,.012,dark,x,.257,.065);
    box(detail,.087,.073,.062,.009,blue,x+.131,.293,.241);
    cylinder(detail,.020,.010,bright,x+.131,.293,.276).rotation.x=Math.PI/2;
  }
  cylinder(vacuum,.111,.378,silver,-.89,1.353,.064);
  make(vacuum,new T.CylinderGeometry(.084,.225,.153,48,1,true),blue,-.89,1.090,.064);
  make(vacuum,new T.TorusGeometry(.222,.013,8,46),blue,-.89,1.016,.064).rotation.x=Math.PI/2;
  box(jaw,.47,.299,.31,.036,silver,0,1.398,.065);
  for(const x of [-.168,.168]){
    robotLink(jaw,[x,1.365,.074],[x*.86,.912,.074],.082,.106,silver);
    box(jaw,.051,.149,.103,.007,dark,x*.82,.970,.074);
  }
  cylinder(tool,.150,.214,silver,.89,1.455,.064);
  machinedRing(tool,.89,1.311,.064,.216,.078,.096,silver).rotation.x=Math.PI/2;
  flangeBolts(tool,.89,1.257,.064,.15,6,dark);
  wire(hose,[[-1.08,1.72,.03],[-1.16,1.53,.063],[-1.15,1.33,.081],[-1.02,1.28,.083]],.022,blue);
  return m;
}

function openedHumanoidTorso() {
  const m=new T.Group(), shell=group(m,'shell'), frame=group(m,'frame'), braces=group(m,'braces'), shoulders=group(m,'shoulders');
  const arms=group(m,'arms'), pelvis=group(m,'pelvis'), spine=group(m,'spine'), neck=group(m,'neck'), cables=group(m,'cables'), equipment=group(m,'equipment');
  const blue=material('#275c8b',.46,.45);
  for(const s of [-1,1]){
    robotLink(frame,[-.46+s*.29,.57,0],[-.46+s*.49,1.78,0],.115,.18,silver,1);
    robotLink(frame,[-.46+s*.49,1.78,0],[-.46+s*.21,1.92,0],.102,.16,silver);
    robotLink(braces,[-.46+s*.33,.84,.126],[-.46-s*.38,1.50,.126],.069,.068,silver);
    robotPivot(shoulders,[-.46+s*.59,1.70,0],.167,.179,blue);
    const a=[-.46+s*.64,1.65,0],b=[-.46+s*.76,1.23,.03],c=[-.46+s*.91,.79,.064];
    robotLink(arms,a,b,.18,.16,silver,.82);robotPivot(arms,b,.087,.12,blue);robotLink(arms,b,c,.149,.14,silver,.68);
    robotHand(arms,[-.46+s*.935,.692,.065],s,silver);
    robotLink(pelvis,[-.46+s*.29,.59,0],[-.46+s*.30,.17,.036],.212,.20,silver);
    wire(cables,[[-.46+s*.30,.57,.07],[-.46+s*.26,.92,.13],[-.46+s*.37,1.33,.09],[-.46+s*.35,1.75,.10],[-.46+s*.08,1.89,.07]],.020,blue);
  }
  for(const y of [.67,.91,1.51,1.79]) box(braces,.72,.053,.12,.010,silver,-.46,y,.094);
  cylinder(spine,.103,1.31,dark,-.46,1.21,-.045);
  for(let i=0;i<7;i++) cylinder(spine,.124,.033,silver,-.46,.64+i*.171,-.045);
  for(const x of [-.67,-.25]) box(equipment,.163,.48,.18,.017,dark,x,1.24,-.025);
  box(pelvis,.63,.23,.32,.040,silver,-.46,.51,.018);
  cylinder(neck,.121,.234,silver,-.46,1.99,0);
  box(neck,.48,.42,.37,.103,dark,-.46,2.29,0);
  const shellTabs=group(m,'shell-tabs');
  shellTabs.position.set(.95,1.12,.22);
  shellTabs.rotation.y=.26;
  const cover=new T.Group();cover.position.set(.95,1.12,.22);cover.rotation.y=.26;shell.add(cover);
  const profile=new T.Shape().moveTo(-.23,-.46).lineTo(.23,-.46)
    .quadraticCurveTo(.38,-.20,.36,.04).quadraticCurveTo(.44,.35,.31,.45)
    .quadraticCurveTo(0,.32,-.31,.45).quadraticCurveTo(-.44,.35,-.36,.04)
    .quadraticCurveTo(-.38,-.20,-.23,-.46).closePath();
  make(cover,new T.ExtrudeGeometry(profile,{depth:.14,bevelEnabled:true,
    bevelSegments:4,bevelSize:.035,bevelThickness:.025}),material('#b9c0c4',.50,.42),0,0,-.041);
  for(const s of [-1,1]){
    robotLink(cover,[s*.24,-.32,.061],[s*.355,.32,.063],.081,.113,silver);
    robotLink(cover,[s*.22,-.36,.138],[s*.28,-.07,.140],.032,.019,blue);
    for(const y of [-.32,.27]){
      box(shellTabs,.110,.086,.060,.009,dark,s*.329,y,-.068);
      cylinder(shellTabs,.021,.014,silver,s*.348,y,-.104).rotation.x=Math.PI/2;
    }
  }
  return m;
}

function segmentedRobotSpine() {
  const m=new T.Group(),base=group(m,'base'),links=group(m,'links'),joints=group(m,'joints'),bands=group(m,'bands'), tendons=group(m,'tendons'), guides=group(m,'guides'), top=group(m,'top');
  const blue=material('#235d90',.51,.44);
  box(base,.76,.095,.65,.022,silver,0,.059,0);
  for(const s of [-1,1]) robotLink(base,[s*.31,.109,0],[s*.14,.31,0],.075,.085,silver);
  const guideRollers=group(m,'guide-rollers');
  const backbone=new T.CatmullRomCurve3([[0,.17,0],[.12,.53,0],[.05,.94,0],[-.22,1.31,0],[-.16,1.59,0],[.18,1.92,0],[.25,2.22,0],[.10,2.62,0]].map(p=>new T.Vector3(...p)));
  for(let i=0;i<12;i++){
    const t=(i+.4)/12,p=backbone.getPointAt(t),v=backbone.getTangentAt(t);
    const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v);
    cylinder(joints,.163,.113,dark,...p.toArray()).quaternion.copy(q);
    const end=p.clone().addScaledVector(v,.072);
    cylinder(links,.218,.050,silver,...end.toArray()).quaternion.copy(q);
    cylinder(bands,.183,.022,blue,...p.clone().addScaledVector(v,.029).toArray()).quaternion.copy(q);
    for(const z of [-.142,.142]){
      box(guides,.192,.044,.068,.013,silver,p.x-.20,p.y+.074,z).quaternion.copy(q);
      cylinder(guideRollers,.034,.048,dark,p.x-.259,p.y+.078,z+.032).rotation.x=Math.PI/2;
    }
  }
  for(const [z,finish] of [[-.169,dark],[.164,blue],[.117,silver]]){
    const points=Array.from({length:24},(_,i)=>{const p=backbone.getPointAt(i/23);return [p.x+.136,p.y,z]});
    wire(tendons,points,.017,finish);
  }
  const p=backbone.getPointAt(1);
  box(top,.53,.090,.45,.019,silver,p.x,p.y,p.z);
  return m;
}

function waistHipCutaway() {
  const m=new T.Group(), torso=group(m,'torso'), yaw=group(m,'yaw'), teeth=group(m,'teeth'), drive=group(m,'drive'), pelvis=group(m,'pelvis'), hip=group(m,'hip'), legs=group(m,'legs'), arms=group(m,'arms'), cable=group(m,'cable');
  const hipShield=group(m,'hip-shield');
  const blue=material('#205f94',.49,.43);
  for(const s of [-1,1]){
    robotLink(torso,[s*.38,1.31,.06],[s*.65,2.24,.04],.159,.249,silver,1.2);
    robotLink(torso,[s*.21,1.36,-.13],[s*.30,2.25,-.13],.075,.101,dark);
    const a=[s*.84,2.16,0],b=[s*.98,1.68,.04],c=[s*1.10,1.10,.06];
    robotPivot(arms,a,.117,.16,blue);robotLink(arms,a,b,.137,.128,silver);
    robotLink(arms,b,c,.112,.133,silver,.79);robotHand(arms,[s*1.12,1.0,.06],s,silver);
    robotLink(pelvis,[0,.75,.17],[s*.59,1.01,.16],.174,.132,silver);
    robotPivot(hip,[s*.42,.712,0],.207,.215,blue);
    robotLink(legs,[s*.45,.646,.075],[s*.55,.194,.08],.285,.25,silver,1.15);
  }
  box(torso,.82,.12,.35,.026,silver,0,1.424,0);
  cylinder(yaw,.451,.211,dark,0,1.185,0);
  cylinder(yaw,.481,.064,blue,0,1.056,0);
  for(let i=0;i<68;i++){
    const a=i*Math.PI/34;
    box(teeth,.028,.107,.059,.004,silver,.449*Math.cos(a),1.162,.449*Math.sin(a)).rotation.y=-a;
  }
  axial(drive,.137,.28,silver,.57).position.set(.57,1.223,0);
  axial(drive,.147,.075,blue,.718).position.set(.718,1.223,0);
  box(hipShield,.46,.43,.14,.054,dark,0,.775,.244);
  for(const x of [-.17,.17]) for(const y of [.642,.902]){
    cylinder(hipShield,.020,.016,silver,x,y,.322).rotation.x=Math.PI/2;
  }
  wire(cable,[[.41,1.20,-.08],[.42,1.44,-.08],[.32,1.61,-.031],[.32,2.00,.016]],.022,blue);
  return m;
}

function routedElectronicsTorso() {
  const m=new T.Group(), frame=group(m,'frame'), shoulders=group(m,'shoulders'), limbs=group(m,'limbs'), board=group(m,'board'), sink=group(m,'sink');
  const bays=group(m,'bays'), power=group(m,'power'), plugs=group(m,'plugs'), harness=group(m,'harness'), clips=group(m,'clips'), waist=group(m,'waist');
  const powerGrille=group(m,'power-grille');
  const blue=material('#23669d',.41,.45);
  box(frame,1.48,1.55,.108,.052,dark,0,1.245,-.19);
  wire(frame,[[-.59,.466,.052],[-.78,.615,.052],[-.91,1.105,.038],[-.87,1.76,.042],[-.54,2.085,.051],[.54,2.085,.051],[.87,1.76,.042],[.91,1.105,.038],[.78,.615,.052],[.59,.466,.052],[-.59,.466,.052]],.072,silver);
  for(const s of [-1,1]){
    robotPivot(shoulders,[s*.99,1.75,-.03],.204,.247,blue);
    robotLink(limbs,[s*1.03,1.66,0],[s*1.21,1.01,.021],.192,.191,silver,.79);
    robotPivot(limbs,[s*1.22,.96,.021],.107,.134,blue);
    robotLink(limbs,[s*1.22,.92,.021],[s*1.33,.57,.05],.14,.139,silver);
  }
  box(board,.61,.63,.041,.018,material('#234148',.13,.54),-.132,1.54,-.047);
  box(sink,.374,.443,.045,.009,silver,-.132,1.58,-.009);
  for(let i=0;i<14;i++) box(sink,.013,.406,.049,.003,bright,-.301+i*.026,1.582,.032);
  for(const y of [.94,1.24,1.54,1.83]) box(bays,.33,.189,.13,.024,dark,.467,y,.027);
  box(power,.62,.282,.165,.025,silver,-.143,.782,.025);
  cylinder(powerGrille,.104,.020,dark,.023,.776,.119).rotation.x=Math.PI/2;
  for(const radius of [.037,.064,.089]) make(powerGrille,new T.TorusGeometry(radius,.004,7,24),silver,.023,.776,.133);
  for(const angle of [0,Math.PI/2]) box(powerGrille,.18,.010,.007,.002,silver,.023,.776,.133).rotation.z=angle;
  for(let i=0;i<6;i++) box(power,.126,.012,.011,.002,dark,-.336,.710+i*.025,.116);
  for(const x of [-.57,-.26,-.08,.12,.43,.55,.68]) box(plugs,.083,.107,.067,.011,silver,x,1.133,.106);
  for(const offset of [-.034,0,.034]) for(const s of [-1,1]){
    wire(harness,[[s*.18,.493,.132+offset],[s*.50,.526,.138+offset],[s*.70,.637,.145+offset],[s*.753,1.16,.127+offset],[s*.70,1.78,.126+offset],[s*.36,1.907,.115+offset],[s*.16,1.918,.117+offset]],.016,s===1?blue:dark);
  }
  for(const x of [-.48,-.20,.26,.53]) box(clips,.057,.093,.052,.009,silver,x,.529,.156);
  cylinder(waist,.266,.26,silver,0,.335,-.03);
  cylinder(waist,.273,.032,blue,0,.25,-.03);
  return m;
}

function forcedAirCoolingModule() {
  const m=new T.Group(), frame=group(m,'frame'), fins=group(m,'fins'), pipes=group(m,'pipes'), block=group(m,'block'), board=group(m,'board');
  const shrouds=group(m,'shrouds'), blades=group(m,'blades'), hubs=group(m,'hubs'), wiring=group(m,'wiring'), feet=group(m,'feet');
  const fanFasteners=group(m,'fan-fasteners');
  const blue=material('#275b86',.43,.40), copper=material('#c1855b',.54,.35);
  box(frame,2.08,.104,1.43,.025,silver,0,.173,0);
  for(const x of [-.935,.935]) for(const z of [-.608,.608]){
    cylinder(feet,.090,.112,dark,x,.080,z);cylinder(feet,.091,.027,blue,x,.050,z);
    box(frame,.109,1.05,.105,.014,silver,x,.735,z);
  }
  box(board,1.89,.045,1.25,.013,material('#29474a',.11,.58),0,.275,0);
  for(let i=0;i<32;i++) box(fins,.019,.52,1.04,.002,silver,-.873+i*.056,1.092,-.077);
  box(fins,1.81,.069,1.04,.013,dark,0,.802,-.077);
  box(block,.569,.098,.606,.015,silver,-.545,.335,.131);
  for(let i=0;i<4;i++){
    const z=.38-i*.19;
    wire(pipes,[[-.68,.388,z],[-.94,.40,z],[-1.047,.53,z],
      [-1.045,.89,z],[-1.018,1.11,z],[-.89,1.23,z],[-.54,1.25,z]],.032,copper);
  }
  for(const x of [-.427,.468]){
    machinedRing(shrouds,x,.818,.657,.421,.367,.129,dark);
    for(const dx of [-.369,.369]) for(const dy of [-.369,.369]){
      box(shrouds,.092,.092,.132,.010,dark,x+dx,.818+dy,.655);
      make(fanFasteners,new T.CylinderGeometry(.025,.025,.018,6),bright,x+dx,.818+dy,.735).rotation.x=Math.PI/2;
      box(fanFasteners,.023,.006,.004,.001,dark,x+dx,.818+dy,.746);
    }
    cylinder(hubs,.118,.145,dark,x,.818,.658).rotation.x=Math.PI/2;
    cylinder(hubs,.091,.016,blue,x,.818,.739).rotation.x=Math.PI/2;
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;
      const blade=new T.Shape().moveTo(.071,.019).quadraticCurveTo(.22,.056,.351,.117).quadraticCurveTo(.367,.033,.337,-.049).quadraticCurveTo(.19,-.018,.085,-.064).closePath();
      make(blades,new T.ExtrudeGeometry(blade,{depth:.041,bevelEnabled:true,bevelThickness:.008,bevelSize:.009,bevelSegments:2}),dark,x,.818,.645).rotation.z=a;
    }
  }
  wire(wiring,[[-.79,.365,.592],[-.49,.315,.710],[.18,.310,.714],[.66,.352,.691],[.75,.490,.657]],.019,blue);
  return m;
}

function twinHipPelvis() {
  const m=new T.Group(),bridge=group(m,'bridge'),truss=group(m,'truss'),waist=group(m,'waist'),motors=group(m,'motors');
  const bearings=group(m,'bearings'),flanges=group(m,'flanges'),harness=group(m,'harness'),tabs=group(m,'tabs');
  const blue=material('#236199',.48,.41);
  box(bridge,.49,.435,.37,.050,silver,0,.88,.003);
  const bridgeCover=group(m,'bridge-cover');
  box(bridgeCover,.287,.289,.079,.027,silver,0,.96,.221);
  for(const x of [-.101,.101]) for(const y of [.869,1.054]) cylinder(bridgeCover,.019,.014,dark,x,y,.267).rotation.x=Math.PI/2;
  box(waist,.62,.137,.43,.031,dark,0,1.166,-.08);
  for(const s of [-1,1]){
    const x=s*1.03,y=.575;
    for(const z of [-.155,.18]){
      robotLink(truss,[s*.14,1.05,z],[s*.93,1.33,z],.115,.115,silver);
      robotLink(truss,[s*.14,.727,z],[s*.92,.55,z],.123,.115,silver);
      robotLink(truss,[s*.38,.763,z],[s*.72,1.25,z],.114,.106,silver);
    }
    cylinder(motors,.340,.51,dark,x,y,0).rotation.x=Math.PI/2;
    machinedRing(bearings,x,y,.278,.335,.217,.115,blue);
    for(let i=0;i<14;i++){
      const a=i*Math.PI/7;make(bearings,new T.SphereGeometry(.023,10,8),bright,x+.216*Math.cos(a),y+.216*Math.sin(a),.343);
    }
    machinedRing(flanges,x,y,.34,.302,.179,.083,silver);
    flangeBolts(flanges,x,y,.393,.264,10,dark,true);
    box(tabs,.207,.207,.175,.021,silver,s*.93,1.34,.09);
    wire(harness,[[s*.28,1.121,-.09],[s*.59,1.103,-.07],[s*.87,1.19,.05],[s*1.06,1.03,.081],[s*1.09,.89,.121]],.020,blue);
  }
  robotLink(tabs,[0,.70,.098],[0,.27,.098],.194,.166,silver,1.11);
  return m;
}

function openTrussThigh() {
  const m=new T.Group(),hip=group(m,'hip'),knee=group(m,'knee'),bearings=group(m,'bearings'),motor=group(m,'motor'),rails=group(m,'rails'),ribs=group(m,'ribs'),cables=group(m,'cables');
  const blue=material('#235e8c',.51,.45);
  const a=[-1.08,1.12,0],b=[1.10,.47,0];
  machinedRing(hip,a[0],a[1],.175,.357,.138,.162,silver);
  machinedRing(knee,b[0],b[1],.178,.306,.126,.165,silver);
  flangeBolts(hip,a[0],a[1],.268,.303,8,dark,true);
  flangeBolts(knee,b[0],b[1],.275,.256,7,dark,true);
  for(const [x,y,r] of [[a[0],a[1],.177],[b[0],b[1],.164]]) machinedRing(bearings,x,y,.270,r,r*.59,.038,blue);
  cylinder(motor,.253,.37,dark,a[0],a[1],-.076).rotation.x=Math.PI/2;
  const motorHousing=group(m,'motor-housing');
  for(const x of [-1.31,-.91]){
    box(motorHousing,.086,.18,.259,.021,silver,x,1.415,.012);
    cylinder(motorHousing,.020,.016,dark,x,1.46,.149).rotation.x=Math.PI/2;
  }
  robotLink(motorHousing,[-1.30,1.49,.104],[-.92,1.45,.104],.062,.060,silver);
  for(const z of [-.17,.17]){
    const top=[[-1.03,1.47,z],[-.52,1.33,z],[.10,1.13,z],[.61,.92,z],[1.12,.74,z]];
    const bottom=[[-1.05,.79,z],[-.52,.674,z],[.10,.514,z],[.65,.29,z],[1.12,.205,z]];
    for(let i=0;i<4;i++){
      robotLink(rails,top[i],top[i+1],.091,.091,silver);
      robotLink(rails,bottom[i],bottom[i+1],.096,.096,silver);
      robotLink(ribs,i%2?bottom[i]:top[i],i%2?top[i+1]:bottom[i+1],.089,.078,silver);
    }
  }
  for(const x of [-.53,.09,.61]) box(ribs,.092,.083,.35,.014,silver,x,.987-x*.36,0);
  for(const z of [-.067,.07]) wire(cables,[[-1.12,1.37,z],[-.95,1.54,z],[-.66,1.46,z],[-.51,1.20,z],[-.44,.87,z],[.16,.65,z],[.85,.49,z]],.022,blue);
  return m;
}

function encoderKneeAssembly() {
  const m=new T.Group(),upper=group(m,'upper'),lower=group(m,'lower'),casePart=group(m,'case'),hinge=group(m,'hinge');
  const drive=group(m,'drive'),rod=group(m,'rod'),encoder=group(m,'encoder'),limit=group(m,'limit'),wirePart=group(m,'wire');
  const blue=material('#2365a0',.48,.44), green=material('#24634a',.14,.54);
  const x=.19,y=1.03;
  robotLink(upper,[-1.02,1.86,-.08],[x,y,-.07],.347,.29,silver,.81);
  robotLink(lower,[x,y,-.04],[-.21,.133,-.025],.351,.31,silver,1.13);
  machinedRing(casePart,x,y,.096,.346,.223,.155,dark);
  cylinder(hinge,.234,.149,silver,x,y,.239).rotation.x=Math.PI/2;
  machinedRing(hinge,x,y,.319,.228,.192,.025,blue);
  cylinder(hinge,.089,.052,bright,x,y,.329).rotation.x=Math.PI/2;
  flangeBolts(hinge,x,y,.325,.17,7,dark,true);
  robotLink(drive,[-.82,1.736,.066],[-.29,1.36,.07],.195,.176,dark);
  robotLink(rod,[-.41,1.44,.07],[.106,1.306,.079],.074,.074,bright);
  factoryAxis(rod,[.104,1.306,.081],.063,.095,blue);
  box(limit,.124,.107,.116,.017,silver,.382,1.28,.132).rotation.z=-.42;
  machinedRing(encoder,.435,y,.083,.223,.084,.037,green);
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5;box(encoder,.031,.046,.019,.003,i%2?white:boardGold,.435+.139*Math.cos(a),y+.139*Math.sin(a),.111).rotation.z=a;
  }
  const encoderWindow=group(m,'encoder-window');
  machinedRing(encoderWindow,.435,y,.148,.225,.183,.028,silver);
  const glazing=cylinder(encoderWindow,.181,.018,new T.MeshPhysicalMaterial({color:'#b6c9cd',transmission:.78,roughness:.20}),.435,y,.166);
  glazing.rotation.x=Math.PI/2;
  glazing.userData.cycleThrough=true;
  wire(wirePart,[[.61,1.105,.10],[.58,.868,.109],[.39,.767,.148],[.22,.680,.154],[.06,.476,.152]],.017,blue);
  return m;
}

function lowerLegAndFootCutaway() {
  const m=new T.Group(),knee=group(m,'knee'),rails=group(m,'rails'),drive=group(m,'drive'),rod=group(m,'rod');
  const guards=group(m,'guards'),wiring=group(m,'wiring'),ankle=group(m,'ankle'),foot=group(m,'foot'),sole=group(m,'sole');
  const blue=material('#236397',.48,.44);
  cylinder(knee,.221,.113,silver,0,2.38,0);
  cylinder(knee,.185,.086,dark,0,2.295,0);
  wire(rails,[[-.119,.49,.02],[-.177,.80,.02],[-.24,1.26,.017],[-.27,1.72,.02],[-.19,2.09,.01],[-.102,2.31,0]],.063,silver);
  wire(rails,[[.083,.48,.01],[.153,.85,.02],[.222,1.34,.02],[.278,1.77,0],[.199,2.09,.01],[.10,2.31,0]],.067,silver);
  robotLink(guards,[.093,.75,.091],[.206,1.55,.08],.128,.095,silver,1.16);
  cylinder(drive,.123,.41,dark,.024,1.79,.057);
  cylinder(drive,.127,.047,blue,.024,1.93,.057);
  cylinder(rod,.051,.99,bright,.01,1.18,.061);
  wire(wiring,[[-.079,2.26,.097],[-.22,2.09,.113],[-.244,1.78,.114],[-.16,1.38,.125],[-.087,1.11,.108],[-.073,.59,.095]],.022,blue);
  robotPivot(ankle,[-.01,.44,0],.125,.172,blue);
  const anklePlate=group(m,'ankle-plate');
  cylinder(anklePlate,.090,.033,silver,-.01,.44,.111).rotation.x=Math.PI/2;
  cylinder(anklePlate,.044,.018,dark,-.01,.44,.134).rotation.x=Math.PI/2;
  robotLink(foot,[-.06,.42,.014],[.066,.212,.213],.16,.162,silver);
  box(foot,.344,.119,.67,.048,silver,.038,.168,.19);
  box(sole,.349,.073,.695,.024,dark,.038,.086,.19);
  for(const z of [-.06,.07,.21,.35,.48]) box(sole,.29,.021,.052,.005,dark,.039,.046,z);
  return m;
}

function articulatedAnkleFoot(){
 const m=new T.Group(),shin=group(m,'shin'),pitch=group(m,'pitch'),roll=group(m,'roll'),pushrod=group(m,'pushrod'),arch=group(m,'arch'),toe=group(m,'toe'),sole=group(m,'sole'),pads=group(m,'pads');
 const blue=material('#235d90',.47,.43);
 box(shin,.42,.40,.34,.033,silver,0,1.57,-.24);
 factoryAxis(pitch,[0,1.045,-.24],.192,.35,silver);
 for(const x of [-.18,.18]) robotLink(pitch,[x,1.06,-.25],[x,.823,.035],.113,.12,silver);
 robotPivot(roll,[0,.731,.053],.135,.41,blue);
 cylinder(roll,.177,.058,blue,0,.56,.025);
 for(const x of [-.16,.16]) {
  robotLink(pushrod,[x,1.50,-.21],[x,1.04,.12],.079,.083,dark);
  robotLink(pushrod,[x,1.12,.06],[x,.865,.213],.040,.044,bright);
  robotLink(arch,[x,.31,.44],[x,.61,-.12],.14,.103,silver);
 }
 box(arch,.49,.19,.75,.047,silver,0,.344,-.02);
 box(toe,.56,.157,.51,.053,silver,0,.271,.455);
 box(toe,.402,.025,.25,.010,dark,0,.358,.458);
  const toeInsert=group(m,'toe-insert');
 for(const x of [-.109,.109]) for(let i=0;i<4;i++){
  box(toeInsert,.17,.021,.026,.004,dark,x,.376,.362+i*.056);
 }
 box(sole,.60,.114,1.19,.054,dark,0,.151,.212);
 for(const x of [-.164,.164]) for(let i=0;i<6;i++) box(pads,.222,.029,.111,.009,dark,x,.079,-.24+i*.179);
 return m;
}

function hubMotorWheelCutaway(){
 const m=new T.Group(),tire=group(m,'tire'),rim=group(m,'rim'),stator=group(m,'stator'),rotor=group(m,'rotor'),bearing=group(m,'bearing'),axle=group(m,'axle'),cover=group(m,'cover'),wires=group(m,'wires');
 const hubFasteners=group(m,'hub-fasteners');
 const blue=material('#235e94',.49,.42), copper=material('#be733b',.73,.40), rubber=material('#222427',.05,.80);
 const y=.966;
 machinedRing(tire,0,y,0,.951,.752,.391,rubber);
 for(let i=0;i<36;i++) for(const z of [-.104,.104]){
  const a=i*Math.PI/18+z;
  box(tire,.107,.047,.183,.013,rubber,.945*Math.sin(a),y+.945*Math.cos(a),z).rotation.z=-a;
 }
 machinedRing(rim,0,y,.139,.762,.684,.121,silver);
 for(let i=0;i<6;i++){
  const a=(i-2.5)*.56;
  robotLink(rim,[.330*Math.cos(a),y+.330*Math.sin(a),.137],[.689*Math.cos(a),y+.689*Math.sin(a),.174],.106,.083,silver);
 }
 machinedRing(stator,0,y,-.022,.561,.457,.25,dark);
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12;
  box(stator,.081,.105,.207,.012,copper,.480*Math.cos(a),y+.48*Math.sin(a),.052).rotation.z=a;
 }
 cylinder(rotor,.412,.334,silver,0,y,.09).rotation.x=Math.PI/2;
 machinedRing(cover,0,y,.277,.394,.249,.068,blue);
 machinedRing(bearing,0,y,.331,.234,.122,.101,silver);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8;make(bearing,new T.SphereGeometry(.022,10,8),bright,.174*Math.cos(a),y+.174*Math.sin(a),.389);
 }
 flangeBolts(hubFasteners,0,y,.328,.319,8,bright,true);
 cylinder(axle,.105,.50,bright,0,y,.39).rotation.x=Math.PI/2;
 wire(wires,[[-.50,1.47,.16],[-.38,1.55,.19],[-.07,1.55,.19],[.05,1.45,.18],[.13,1.34,.18]],.022,blue);
 return m;
}

function exposedCrawlerDrive(){
 const m=new T.Group(),frame=group(m,'frame'),track=group(m,'track'),sprocket=group(m,'sprocket'),idler=group(m,'idler'),rollers=group(m,'rollers'),shocks=group(m,'shocks'),tension=group(m,'tension'),hubs=group(m,'hubs');
 const hubBolts=group(m,'hub-bolts');
 const blue=material('#23598a',.50,.43),rubber=material('#242528',.06,.78);
 const outline=new T.CatmullRomCurve3([[-1.28,.41,0],[-1.13,.77,0],[-.58,1.02,0],[.47,1.16,0],[1.08,1.23,0],[1.37,1.00,0],[1.35,.54,0],[1.05,.19,0],[.44,.126,0],[-.55,.116,0],[-1.08,.18,0]].map(p=>new T.Vector3(...p)),true);
 for(let i=0;i<66;i++){
  const t=i/66,p=outline.getPointAt(t),v=outline.getTangentAt(t),a=Math.atan2(v.y,v.x);
  box(track,.105,.077,.32,.009,rubber,p.x,p.y,0).rotation.z=a;
  box(track,.067,.047,.245,.006,dark,p.x-v.y*.052,p.y+v.x*.052,0).rotation.z=a;
 }
 for(const z of [-.096,.10]){
  robotLink(frame,[-.99,.46,z],[.98,.84,z],.175,.087,silver);
  robotLink(frame,[-.92,.43,z],[.88,.35,z],.107,.089,silver);
  for(const x of [-.68,-.19,.40]) robotLink(frame,[x,.37,z],[x+.26,.67,z],.086,.086,silver);
 }
 for(const [part,x,y,r] of [[sprocket,1.02,.781,.393],[idler,-.97,.423,.251]]){
  cylinder(part,r,.257,silver,x,y,0).rotation.x=Math.PI/2;
  machinedRing(hubs,x,y,.163,r*.59,r*.30,.049,blue);
  cylinder(hubs,r*.29,.054,bright,x,y,.199).rotation.x=Math.PI/2;
 }
 flangeBolts(hubBolts,1.02,.781,.224,.164,8,dark,true);
 for(let i=0;i<19;i++){
  const a=i*2*Math.PI/19;
  box(sprocket,.072,.089,.249,.009,silver,1.02+.385*Math.cos(a),.781+.385*Math.sin(a),0).rotation.z=a;
 }
 for(const [x,y] of [[-.57,.279],[-.17,.254],[.28,.255],[.71,.27],[-.48,.91],[.44,1.05]]){
  cylinder(rollers,.123,.242,dark,x,y,0).rotation.x=Math.PI/2;
  cylinder(rollers,.081,.04,silver,x,y,.142).rotation.x=Math.PI/2;
 }
 robotLink(tension,[-.97,.45,.171],[-.59,.59,.171],.076,.091,blue);
 for(const x of [-.57,.31]){
  cylinder(shocks,.043,.29,silver,x,.49,.138);
  const coil=axialHelix(shocks,-.126,.126,.065,5,.014,blue);coil.rotation.z=Math.PI/2;coil.position.set(x,.50,.138);
 }
 return m;
}

function independentSteeringSuspension(){
 const m=new T.Group(),bridge=group(m,'bridge'),tires=group(m,'tires'),hubs=group(m,'hubs'),upper=group(m,'upper'),lower=group(m,'lower');
 const shocks=group(m,'shocks'),rack=group(m,'rack'),ties=group(m,'ties'),column=group(m,'column');
 const shockMounts=group(m,'shock-mounts');
 const blue=material('#2166a7',.45,.41),rubber=material('#262729',.07,.81);
 box(bridge,1.37,.135,.285,.029,silver,0,1.247,-.091);
 box(bridge,.79,.109,.293,.024,silver,0,.400,-.062);
 axial(rack,.079,1.29,silver,0).position.set(0,.64,.137);
 for(const x of [-.414,.414]) for(let i=0;i<7;i++) axial(rack,.097-i*.003,.027,dark,x+(i-3)*.028).position.set(x+(i-3)*.028,.64,.137);
 cylinder(column,.047,.55,bright,0,.976,.127);
 for(const y of [.762,1.172]) cylinder(column,.068,.081,dark,0,y,.127);
 for(const s of [-1,1]){
  const x=s*1.13;
  cylinder(tires,.525,.274,rubber,x,.541,0).rotation.z=Math.PI/2;
  for(let i=0;i<30;i++) for(const dx of [-.061,.061]){
   const a=i*Math.PI/15+dx;
   box(tires,.13,.037,.083,.007,rubber,x+dx,.541+.523*Math.cos(a),.523*Math.sin(a)).rotation.z=s*.13;
   const lug=tires.children.at(-1);lug.rotation.x=a;
  }
  for(const off of [-.142,.142]) machinedRing(hubs,x+off,.541,0,.362,.22,.045,silver).rotation.y=Math.PI/2;
  robotPivot(hubs,[s*.987,.578,0],.154,.19,blue);
  for(const z of [-.15,.124]){
   robotLink(upper,[s*.59,1.16,z],[s*.98,.737,z*.39],.083,.095,silver);
   robotLink(lower,[s*.38,.407,z],[s*.969,.397,z*.39],.092,.094,silver);
  }
  robotLink(ties,[s*.55,.64,.137],[s*.992,.579,.128],.044,.056,bright);
  const a=[s*.53,1.211,.089], b=[s*.792,.48,.09];
  for(const [x,y,z] of [a,b]){
   cylinder(shockMounts,.069,.032,silver,x,y,z+.048).rotation.x=Math.PI/2;
   cylinder(shockMounts,.031,.012,dark,x,y,z+.071).rotation.x=Math.PI/2;
  }
  robotLink(shocks,a,b,.076,.074,silver);
  const mid=new T.Vector3(...a).lerp(new T.Vector3(...b),.5),v=new T.Vector3(...a).sub(new T.Vector3(...b)).normalize();
  const spring=axialHelix(shocks,-.251,.251,.079,7,.019,blue);
  spring.position.copy(mid);spring.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),v);
 }
 return m;
}

function quadrupedUnderside(){
 const m=new T.Group(),body=group(m,'body'),pan=group(m,'pan'),vents=group(m,'vents'),hips=group(m,'hips'),thigh=group(m,'thigh'),knees=group(m,'knees'),shin=group(m,'shin'),ankles=group(m,'ankles'),feet=group(m,'feet');
 const toeCaps=group(m,'toe-caps');
 const blue=material('#244e72',.47,.42);
 box(body,1.38,.52,1.73,.122,silver,0,1.24,0);
 box(pan,.83,.074,1.41,.057,dark,0,.957,.03);
 for(let i=0;i<11;i++) box(vents,.46,.013,.025,.004,dark,0,.910,-.55+i*.077);
 for(const s of [-1,1]) for(const z of [-.62,.62]){
  const a=[s*.742,1.22,z],b=[s*.98,.76,z-.10],c=[s*1.08,.205,z+.05];
  robotPivot(hips,a,.178,.25,blue);
  robotLink(thigh,a,b,.187,.174,silver,.80);
  robotPivot(knees,b,.093,.148);
  robotLink(shin,b,c,.132,.135,silver,.59);
  robotPivot(ankles,c,.071,.11,blue);
  box(toeCaps,.158,.058,.173,.020,silver,c[0],.145,c[2]+.026);
  box(feet,.226,.109,.257,.033,dark,c[0],.073,c[2]+.024);
 }
 return m;
}

function ductedPropulsorCutaway(){
 const m=new T.Group(),duct=group(m,'duct'),motor=group(m,'motor'),cooling=group(m,'cooling'),supports=group(m,'supports'),blades=group(m,'blades'),hub=group(m,'hub'),mount=group(m,'mount'),wirePart=group(m,'wire');
 const liftTabs=group(m,'lift-tabs');
 const blue=material('#21639b',.49,.42),metal=material('#606367',.65,.42);
 const y=.77;
 machinedRing(duct,.40,y,.15,.659,.596,.59,metal);
 cylinder(motor,.421,.68,dark,.40,y,-.50).rotation.x=Math.PI/2;
 machinedRing(motor,.40,y,-.881,.391,.299,.054,blue);
 for(let i=0;i<23;i++){
  const a=i*2*Math.PI/23;
  box(cooling,.035,.063,.622,.009,dark,.40+.418*Math.cos(a),y+.418*Math.sin(a),-.50).rotation.z=a-Math.PI/2;
 }
 for(const a of [.51,2.60,4.70]) robotLink(supports,[.40+.13*Math.cos(a),y+.13*Math.sin(a),-.03],[.40+.59*Math.cos(a),y+.59*Math.sin(a),-.03],.063,.078,silver);
 const shape=new T.Shape().moveTo(.105,.035).quadraticCurveTo(.30,.20,.54,.205).quadraticCurveTo(.592,.13,.561,-.007).quadraticCurveTo(.42,-.092,.16,-.058).closePath();
 const bladeGeometry=new T.ExtrudeGeometry(shape,{
  depth:.034,bevelEnabled:true,bevelThickness:.010,bevelSize:.012,bevelSegments:3,curveSegments:24,
 });
 const bladeVertices=bladeGeometry.getAttribute('position');
 for(let i=0;i<bladeVertices.count;i++){
  const radius=bladeVertices.getX(i),chord=bladeVertices.getY(i);
  const pitch=.64-.48*radius;
  bladeVertices.setZ(i,bladeVertices.getZ(i)+(chord-.033)*pitch-.08*radius*radius);
 }
 bladeGeometry.computeVertexNormals();
 for(let i=0;i<4;i++) make(blades,bladeGeometry,blue,.40,y,.226).rotation.z=i*Math.PI/2;
 cylinder(hub,.131,.251,silver,.40,y,.254).rotation.x=Math.PI/2;
 make(hub,new T.ConeGeometry(.136,.179,38),bright,.40,y,.436).rotation.x=Math.PI/2;
 for(const x of [.004,.794]){
  box(mount,.244,.073,.444,.012,silver,x,.084,-.228);
  robotLink(mount,[x,.118,-.26],[.40+(x-.40)*.88,.455,-.29],.128,.111,silver);
 }
 for(const x of [.22,.57]){
  robotLink(liftTabs,[x,1.209,-.48],[x,1.446,-.22],.083,.076,silver);
  machinedRing(liftTabs,x,1.454,-.212,.066,.028,.039,silver);
 }
 wire(wirePart,[[.35,.92,-.86],[.23,.83,-1.01],[-.06,.70,-1.04],[-.35,.52,-.89],[-.59,.35,-.74]],.034,dark);
 return m;
}

function splinedServoActuator(){
 const m=new T.Group(),casePart=group(m,'case'),cap=group(m,'cap'),fins=group(m,'fins'),seal=group(m,'seal'),spline=group(m,'spline'),horn=group(m,'horn'),ears=group(m,'ears'),connector=group(m,'connector'),leads=group(m,'leads');
 const blue=material('#2262a0',.47,.43);
 box(casePart,1.37,.694,.83,.067,silver,0,.519,0);
 box(cap,1.42,.278,.868,.074,dark,0,.981,0);
 box(seal,1.41,.050,.848,.016,blue,0,.839,0);
 box(fins,1.08,.482,.061,.028,dark,0,.511,.431);
 const finFinish=material('#adb6ba',.49,.44);
 for(let i=0;i<7;i++) box(fins,.983,.024,.035,.004,finFinish,0,.338+i*.056,.468);
 for(const x of [-.59,.59]) for(const y of [.282,.735]){
  cylinder(casePart,.026,.012,bright,x,y,.428).rotation.x=Math.PI/2;
  box(casePart,.027,.006,.004,.001,dark,x,y,.436).rotation.z=.4;
 }
 for(const x of [-.66,.66]){
  box(ears,.391,.084,.85,.039,dark,x,.126,0);
  for(const z of [-.28,.28]) cylinder(ears,.061,.016,silver,x+Math.sign(x)*.149,.178,z);
 }
 machinedRing(spline,0,1.186,-.058,.215,.117,.174,silver).rotation.x=Math.PI/2;
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12;
  box(spline,.021,.143,.018,.003,dark,.122*Math.cos(a),1.198,-.058+.122*Math.sin(a)).rotation.y=-a;
 }
 box(horn,1.04,.097,.248,.041,silver,.374,1.322,-.058);
 for(const x of [.32,.50,.68,.84]) cylinder(horn,.035,.015,dark,x,1.379,-.058);
 const hornClamp=group(m,'horn-clamp');
 cylinder(hornClamp,.043,.031,dark,.068,1.235,.148).rotation.x=Math.PI/2;
 make(hornClamp,new T.CylinderGeometry(.022,.022,.011,6),silver,.068,1.235,.170).rotation.x=Math.PI/2;
 box(connector,.054,.191,.285,.020,white,-.713,.56,.153);
 for(const [i,color] of ['#dca336','#b94432','#292b2b'].entries()){
  const z=.10+i*.042;
  wire(leads,[[-.74,.559,z],[-.83,.448,z],[-.87,.264,z+.02],[-.99,.12,z+.10],[-1.22,.10,z+.29]],.016,material(color,.06,.53));
 }
 return m;
}

function threeMotorComparison(){
 const m=new T.Group(),dc=group(m,'dc'),dcShaft=group(m,'dc-shaft'),bldc=group(m,'bldc'),windings=group(m,'windings'),bldcShaft=group(m,'bldc-shaft'),stepper=group(m,'stepper'),stepShaft=group(m,'step-shaft'),wires=group(m,'wires');
 const blue=material('#1661a8',.48,.40),copper=material('#c17843',.70,.38);
 cylinder(dc,.298,.55,silver,-1.03,.361,0).rotation.x=Math.PI/2;
 cylinder(dc,.284,.074,bright,-1.03,.361,.288).rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;box(dc,.048,.087,.017,.006,dark,-1.03+.221*Math.cos(a),.361+.221*Math.sin(a),.331).rotation.z=a;
 }
 cylinder(dcShaft,.052,.284,bright,-1.03,.361,.416).rotation.x=Math.PI/2;
 machinedRing(bldc,0,.322,.01,.332,.250,.38,dark).rotation.x=Math.PI/2;
 for(const y of [.127,.528]) machinedRing(bldc,0,y,.01,.336,.253,.053,blue).rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6;
  const coil=make(windings,new T.TorusGeometry(.061,.020,8,22),copper,.213*Math.cos(a),.438,.01+.213*Math.sin(a));coil.rotation.x=Math.PI/2;
  box(bldc,.171,.029,.039,.006,blue,.143*Math.cos(a),.534,.01+.143*Math.sin(a)).rotation.y=-a;
 }
 cylinder(bldcShaft,.047,.557,bright,0,.536,.01);
 box(stepper,.658,.65,.58,.038,dark,1.015,.376,.006);
 for(const z of [-.288,.302]) box(stepper,.662,.654,.091,.020,silver,1.015,.376,z);
 for(const x of [.758,1.271]) for(const y of [.120,.629]) cylinder(stepper,.028,.014,dark,x,y,.355).rotation.x=Math.PI/2;
 cylinder(stepShaft,.129,.047,dark,1.015,.376,.366).rotation.x=Math.PI/2;
 cylinder(stepShaft,.058,.272,bright,1.015,.376,.492).rotation.x=Math.PI/2;
 for(const [x,colors] of [[-1.03,['#c94439','#24262a']],[0,['#282b31','#c79b3b','#31769e']],[1.015,['#2b593e','#bc4736','#215c8b','#242426']]]) for(const [i,color] of colors.entries()){
  const d=(i-(colors.length-1)*.5)*.032;
  wire(wires,[[x+d,.529,-.18],[x+d,.727,-.29],[x+d+.091,.82,-.35],[x+d+.23,.786,-.39]],.014,material(color,.06,.51));
 }
 const terminals=group(m,'terminals');
 for(let i=0;i<3;i++){
  const d=(i-1)*.032;
  robotLink(terminals,[d+.192,.804,-.383],[d+.268,.775,-.411],.043,.043,boardGold);
 }
 return m;
}

function openPlanetaryTransmission(){
 const m=new T.Group(), casePart=group(m,'case'), ring=group(m,'ring'), sun=group(m,'sun'), planets=group(m,'planets'), pins=group(m,'pins'), carrier=group(m,'carrier'), shaft=group(m,'shaft'), seals=group(m,'seals'), rear=group(m,'rear');
 const blue=material('#2464a0',.47,.43);
 const y=.72;
 box(casePart,1.73,.151,.70,.028,silver,0,.145,-.15);
 box(casePart,1.73,.126,.70,.024,silver,0,1.332,-.15);
 for(const x of [-.78,.78]) box(casePart,.173,1.18,.63,.035,silver,x,.726,-.16);
 const caseBolts=group(m,'case-bolts');
 for(const x of [-.78,.78]) for(const y of [.281,.486,.977,1.214]){
  cylinder(caseBolts,.038,.021,dark,x,y,.168).rotation.x=Math.PI/2;
  make(caseBolts,new T.CylinderGeometry(.024,.024,.016,6),silver,x,y,.184).rotation.x=Math.PI/2;
 }
 const gear=(part,x,y,z,r,n)=> {
  cylinder(part,r-.017,.124,silver,x,y,z).rotation.x=Math.PI/2;
  for(let i=0;i<n;i++){
   const a=i*2*Math.PI/n;
   box(part,.029,.033,.121,.004,bright,x+r*Math.cos(a),y+r*Math.sin(a),z).rotation.z=a;
  }
 };
 machinedRing(ring,0,y,.255,.567,.490,.173,dark);
 // The 60-tooth ring matches the 18-tooth sun and two 21-tooth planet radii.
 for(let i=0;i<60;i++){
  const a=i*Math.PI/30;
  box(ring,.039,.023,.16,.003,silver,.483*Math.cos(a),y+.483*Math.sin(a),.255).rotation.z=a;
 }
 gear(sun,0,y,.30,.142,18);
 machinedRing(carrier,0,y,.163,.166,.093,.072,silver);
 for(let i=0;i<3;i++){
  const a=.41+i*Math.PI*2/3,x=.309*Math.cos(a),h=y+.309*Math.sin(a);
  gear(planets,x,h,.304,.163,21);
  robotLink(carrier,[0,y,.162],[x,h,.162],.103,.071,silver);
  cylinder(pins,.074,.162,bright,x,h,.322).rotation.x=Math.PI/2;
  machinedRing(pins,x,h,.411,.067,.030,.018,dark);
 }
 cylinder(shaft,.093,.45,silver,0,y,.448).rotation.x=Math.PI/2;
 machinedRing(seals,0,y,-.18,.207,.128,.053,blue);
 box(rear,.961,1.09,.20,.071,dark,0,.728,-.59);
 machinedRing(rear,0,y,-.452,.284,.141,.13,silver);
 return m;
}

function braidedAndSoftMuscle(){
 const m=new T.Group(),sleeve=group(m,'sleeve'),braid=group(m,'braid'),anchors=group(m,'anchors'),fittings=group(m,'fittings'),tubes=group(m,'tubes'),soft=group(m,'soft'),chambers=group(m,'chambers'),manifold=group(m,'manifold');
 const blue=material('#235c8d',.39,.45);
 const silicone=new T.MeshPhysicalMaterial({color:'#b5d0df',roughness:.32,transparent:true,opacity:.34,depthWrite:false});
 const chamberFinish=material('#8da9ba',.07,.59);
 const blackBraid=material('#2b2e33',.15,.52);
 const curve=new T.CatmullRomCurve3([[-1.15,.55,-.23],[-.69,.98,-.22],[-.06,1.15,-.22],[.61,1.12,-.22],[1.13,.82,-.22]].map(p=>new T.Vector3(...p)));
 make(sleeve,new T.TubeGeometry(curve,76,.169,38,false),material('#1e242a',.03,.79));
 for(const s of [-1,1]) for(let i=0;i<11;i++){
  const points=Array.from({length:221},(_,j)=>{
   const t=j/220,p=curve.getPointAt(t),v=curve.getTangentAt(t),angle=i*Math.PI*2/11+s*t*Math.PI*13;
   const radius=.182+.007*Math.cos(143*Math.PI*t+i*Math.PI)*s;
   return p.add(new T.Vector3(-v.y,v.x,0).multiplyScalar(Math.cos(angle)*radius)).add(new T.Vector3(0,0,Math.sin(angle)*radius));
  });
  make(braid,new T.TubeGeometry(new T.CatmullRomCurve3(points),260,.011,7,false),i%4?blackBraid:blue);
 }
 for(const [x,y] of [[-1.18,.527],[1.17,.786]]){
  cylinder(anchors,.19,.228,silver,x,y,-.22).rotation.z=Math.PI/2;
  machinedRing(anchors,x+Math.sign(x)*.16,y,-.22,.111,.052,.069,silver);
  cylinder(fittings,.045,.133,silver,x,y+.214,-.22);
  wire(tubes,[[x,y+.267,-.22],[x-.05,y+.423,-.22],[x-.33,y+.467,-.25]],.017,blue);
 }
 const endBands=group(m,'end-bands');
 for(const [x,y] of [[-1.077,.595],[1.060,.86]]){
  machinedRing(endBands,x,y,-.22,.192,.161,.053,blue).rotation.y=Math.PI/2;
 }
 const lower=new T.CatmullRomCurve3([[-.93,.29,.49],[-.55,.49,.49],[.12,.56,.49],[.68,.48,.49],[1.08,.31,.49]].map(p=>new T.Vector3(...p)));
 make(soft,new T.TubeGeometry(lower,64,.136,32,false),silicone).userData.cycleThrough=true;
 const end=lower.getPoint(1), direction=lower.getTangent(1);
 const endCap=make(soft,new T.SphereGeometry(.136,32,18,0,2*Math.PI,0,Math.PI/2),silicone,...end.toArray());
 endCap.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);
 endCap.userData.cycleThrough=true;
 for(let i=0;i<11;i++){
  const t=.10+i*.082,p=lower.getPoint(t);
  make(chambers,new T.TorusGeometry(.103,.018,9,32),chamberFinish,...p.toArray()).quaternion.setFromUnitVectors(new T.Vector3(0,0,1),lower.getTangent(t));
 }
 box(manifold,.23,.23,.25,.021,silver,-1.012,.262,.49);
 wire(tubes,[[-1.13,.262,.49],[-1.30,.182,.49],[-1.55,.13,.57]],.016,blue);
 return m;
}

function cylinderDrivenManipulator(){
 const m=new T.Group(),base=group(m,'base'),links=group(m,'links'),pivots=group(m,'pivots'),barrel=group(m,'barrel'),rod=group(m,'rod'),mounts=group(m,'mounts'),hoses=group(m,'hoses'),wrist=group(m,'wrist'),jaws=group(m,'jaws');
 const blue=material('#2468aa',.5,.39);
 const a=[-.88,.51,0],b=[.60,1.83,0],c=[1.05,1.11,0];
 cylinder(base,.42,.136,silver,-.88,.086,0);
 cylinder(base,.30,.29,dark,-.88,.295,0);
 flangeBolts(base,-.88,.165,0,.37,9,bright);
 for(const z of [-.128,.128]){
  robotLink(links,a.map((v,i)=>i===2?z:v),[b[0],b[1],z],.160,.096,silver,1.09);
  robotLink(links,[b[0],b[1],z],[c[0],c[1],z],.149,.084,silver);
 }
 for(const p of [a,b]) factoryAxis(pivots,p,.168,.37,silver);
 robotLink(barrel,[-.66,.85,.26],[-.01,1.35,.27],.185,.165,blue);
 robotLink(rod,[-.03,1.35,.27],[.54,1.77,.18],.063,.073,bright);
 for(const p of [[-.66,.85,.26],[.54,1.77,.18]]) factoryAxis(mounts,p,.081,.133,silver);
 factoryAxis(wrist,c,.106,.21,blue);
 box(jaws,.216,.095,.211,.022,dark,1.075,1.01,.04);
 for(const x of [.99,1.17]) robotLink(jaws,[x,1.02,.04],[x+.073,.736,.07],.072,.080,silver,.75);
 for(const z of [-.16,-.24]) wire(hoses,[[-1.14,.28,z],[-1.18,.65,z],[-.83,1.24,z],[-.43,1.64,z],[.21,1.88,z],[.62,1.99,z],[.84,1.76,z]],.027,dark);
 const hoseClips=group(m,'hose-clips');
 for(const [x,y] of [[-1.11,.55],[-.77,1.31],[-.24,1.735],[.51,1.978]]){
  box(hoseClips,.060,.044,.158,.009,silver,x,y,-.198).rotation.z=-.43;
 }
 return m;
}

function ruggedRobotComputer(){
 const m=new T.Group(),tray=group(m,'tray'), handles=group(m,'handles'),mounts=group(m,'mounts'),casePart=group(m,'case'),fins=group(m,'fins'),fan=group(m,'fan'),ports=group(m,'ports'),lock=group(m,'lock'),cables=group(m,'cables');
 const blue=material('#255d8d',.48,.41);
 box(tray,2.16,.15,1.64,.036,silver,0,.144,0);
 for(const x of [-1.02,1.02]) box(tray,.091,.26,1.64,.023,silver,x,.279,0);
 for(const x of [-.77,.77]) for(const z of [-.57,.57]){
  cylinder(mounts,.090,.089,blue,x,.257,z);
  cylinder(mounts,.070,.031,silver,x,.311,z);
 }
 box(casePart,1.78,.545,1.22,.052,silver,0,.605,0);
 for(let i=0;i<29;i++) box(fins,.021,.137,1.15,.004,dark,-.812+i*.058,.941,0);
 const fanRetainer=group(m,'fan-retainer');
 machinedRing(fanRetainer,.48,1.057,-.218,.217,.177,.024,silver).rotation.x=Math.PI/2;
 for(const x of [.303,.657]) for(const z of [-.395,-.041]) cylinder(fanRetainer,.023,.023,dark,x,1.042,z);
 cylinder(fan,.206,.039,dark,.48,1.021,-.218);
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7;
  box(fan,.105,.026,.065,.012,silver,.48+.123*Math.cos(a),1.048,-.218+.123*Math.sin(a)).rotation.y=-a-.63;
 }
 cylinder(fan,.059,.031,dark,.48,1.064,-.218);
 for(const [x,w,h] of [[-.68,.218,.150],[-.39,.157,.078],[-.20,.146,.074],[.006,.145,.083],[.25,.153,.115],[.69,.158,.132]]){
  box(ports,w+.023,h+.026,.028,.007,dark,x,.639,.620);
  box(ports,w*.64,.024,.029,.005,x<-.22?blue:bright,x,.610,.639);
 }
 machinedRing(ports,.47,.635,.645,.075,.048,.045,bright);
 for(const x of [-.67,.67]) wire(handles,[[x-.17,.249,.829],[x-.16,.204,.911],[x,.197,.937],[x+.16,.204,.911],[x+.17,.249,.829]],.031,blue);
 box(lock,.23,.26,.076,.019,silver,0,.218,.831);
 box(lock,.117,.091,.022,.007,blue,0,.205,.879);
 for(const x of [-.89,-.96]) wire(cables,[[x,.745,-.52],[x-.068,.64,-.61],[x-.10,.45,-.34],[x-.05,.36,.19],[x,.45,.51]],.023,dark);
 return m;
}

function realTimeTeachingRover(){
 const m=new T.Group(),chassis=group(m,'chassis'),deck=group(m,'deck'),controller=group(m,'controller'),ports=group(m,'ports'),driver=group(m,'driver'),battery=group(m,'battery'),wires=group(m,'wires'),wheels=group(m,'wheels'),motors=group(m,'motors'),range=group(m,'range'),caster=group(m,'caster');
 const blue=material('#21629d',.42,.42);
 for(const [p,y] of [[chassis,.38],[deck,.91]]) {
  box(p,1.34,.085,1.37,.036,silver,0,y,0);
  for(const x of [-.55,.55]) for(const z of [-.55,.55]) cylinder(p,.033,.025,dark,x,y+.048,z);
 }
 for(const x of [-.55,.55]) for(const z of [-.55,.55]) cylinder(deck,.032,.51,silver,x,.655,z);
 for(const s of [-1,1]){
  cylinder(wheels,.359,.175,dark,s*.73,.385,-.07).rotation.z=Math.PI/2;
  for(let i=0;i<28;i++){
   const a=i*Math.PI/14;
   box(wheels,.167,.029,.049,.006,dark,s*.73,.386+.358*Math.cos(a),-.07+.358*Math.sin(a)).rotation.x=a;
  }
  machinedRing(wheels,s*.827,.385,-.07,.27,.205,.031,blue).rotation.y=Math.PI/2;
  cylinder(wheels,.087,.041,blue,s*.83,.385,-.07).rotation.z=Math.PI/2;
  axial(motors,.151,.29,silver,s*.495).position.set(s*.495,.57,-.07);
 }
 box(battery,.87,.198,.37,.032,dark,0,1.088,-.44);
 const batteryStrap=group(m,'battery-strap');
 box(batteryStrap,.111,.026,.40,.008,blue,0,1.200,-.44);
 for(const z of [-.637,-.241]) box(batteryStrap,.112,.184,.028,.008,blue,0,1.105,z);
 const pcb=new T.Group();pcb.position.y=.96;controller.add(pcb);
 boardPlate(pcb,.65,.59,[],boardBlue);
 squareChip(pcb,0,.023,.19,4);
 for(const x of [-.254,.254]) {
  box(ports,.062,.091,.49,.008,dark,x,1.064,.01);
  for(let i=0;i<10;i++) box(ports,.016,.023,.018,.002,boardGold,x,1.119,-.20+i*.046);
 }
 box(ports,.169,.081,.13,.012,silver,-.02,1.057,.27);
 for(const x of [-.49,.49]){
  box(driver,.196,.095,.34,.009,blue,x,1.011,-.011);
  for(let i=0;i<5;i++) box(driver,.014,.089,.154,.004,dark,x-.07+i*.034,1.102,-.082);
  for(const [i,color] of ['#cf4634','#d3a534','#235c8f'].entries()){
   const d=i*.023;
   wire(wires,[[x,.99,.14+d],[x,.77,.46+d],[x*.68,.59,.45+d],[x*.50,.61,.26+d]],.013,material(color,.06,.52));
  }
 }
 box(range,.55,.267,.064,.021,blue,0,.592,.65);
 for(const x of [-.13,.13]){
  machinedRing(range,x,.60,.708,.092,.069,.081,silver);
  cylinder(range,.068,.019,dark,x,.60,.737).rotation.x=Math.PI/2;
 }
 box(caster,.188,.18,.15,.019,silver,0,.243,.526);
 cylinder(caster,.116,.088,dark,0,.13,.534).rotation.z=Math.PI/2;
 return m;
}

function twinMotorDriverAssembly(){
 const m=new T.Group(),board=group(m,'board'),sink=group(m,'sink'),transistors=group(m,'transistors'),controller=group(m,'controller'),terminals=group(m,'terminals'),capacitors=group(m,'capacitors'),headers=group(m,'headers'),motors=group(m,'motors'),wires=group(m,'wires');
 const blue=material('#235c90',.44,.43);
 const holes=[[-.72,-.49,.052],[.72,-.49,.052],[-.72,.49,.052],[.72,.49,.052]];
 boardPlate(board,1.68,1.24,holes,material('#24282c',.11,.54));
 for(const [x,z,r] of holes){platedHole(board,x,z,r);cylinder(board,r,.144,silver,x,-.067,z)}
 squareChip(controller,.14,.19,.253,5);
 box(sink,1.05,.095,.43,.014,silver,-.046,.325,-.31);
 for(let i=0;i<9;i++) box(sink,.033,.366,.43,.008,silver,-.53+i*.12,.542,-.31);
 for(let i=0;i<6;i++) box(transistors,.120,.154,.144,.010,dark,-.455+i*.167,.183,-.31);
 for(const [x,z] of [[-.68,.09],[.69,-.22],[.69,.20]]){
  box(terminals,.19,.197,.29,.015,blue,x,.165,z);
  for(const d of [-.07,.07]) cylinder(terminals,.036,.017,silver,x,.272,z+d);
 }
 for(const z of [-.41,-.18]){
  cylinder(capacitors,.097,.234,dark,-.657,.178,z);
  cylinder(capacitors,.081,.016,silver,-.657,.30,z);
 }
 for(const x of [-.37,-.06,.29]) sideSocket(headers,x,.49,0,{pins:4,width:.21,depth:.14,height:.103});
 const shafts=group(m,'shafts');
 for(const z of [-.47,.38]){
  axial(motors,.193,.40,silver,1.52).position.set(1.52,.235,z);
  axial(motors,.179,.063,blue,1.47).position.set(1.47,.235,z);
  axial(motors,.177,.113,dark,1.25).position.set(1.25,.235,z);
  axial(shafts,.042,.191,bright,1.80).position.set(1.80,.235,z);
  for(const [i,color] of ['#c74334','#26282c'].entries()) wire(wires,[[.76,.161,z+.19+i*.048],[.91,.212,z+.15+i*.047],[1.04,.270,z+.02+i*.042],[1.20,.255,z+i*.049]],.018,material(color,.06,.52));
 }
 return m;
}

function torsoNetworkStack(){
 const m=new T.Group(),frame=group(m,'frame'),trays=group(m,'trays'),modules=group(m,'modules'),ports=group(m,'ports'),bus=group(m,'bus'),power=group(m,'power'),arms=group(m,'arms'),neck=group(m,'neck');
 const blue=material('#246ca4',.42,.42);
 box(frame,1.39,1.75,.122,.061,dark,0,1.17,-.19);
 for(const s of [-1,1]){
  wire(frame,[[s*.38,.36,.058],[s*.71,.60,.050],[s*.86,1.21,.039],[s*.75,1.94,.041],[s*.45,2.14,.043]],.081,silver);
  robotPivot(arms,[s*.93,1.72,-.015],.181,.22,blue);
  robotLink(arms,[s*.96,1.64,0],[s*1.19,.97,.02],.196,.18,silver);
  robotPivot(arms,[s*1.19,.93,.02],.102,.13,blue);
 }
 cylinder(neck,.184,.223,silver,0,2.184,-.035);
 cylinder(neck,.253,.21,silver,0,.345,-.037);
 const bootCovers=group(m,'boot-covers');
 for(const y of [.68,1.20,1.72]){
  box(bootCovers,.065,.076,.052,.009,blue,.184,y-.103,.245).rotation.x=-.31;
  for(let ridge=0;ridge<3;ridge++) box(bootCovers,.070,.012,.052,.003,blue,.184,y-.088-ridge*.017,.249);
 }
 for(const y of [.68,1.20,1.72]){
  box(trays,1.09,.077,.44,.018,silver,0,y-.159,-.05);
  box(modules,.835,.338,.391,.033,silver,0,y,-.017);
  for(let i=0;i<15;i++) box(modules,.014,.139,.013,.003,dark,-.235+i*.033,y+.066,.184);
  for(const x of [-.24,.18,.34]) box(ports,.121,.082,.035,.008,dark,x,y-.079,.194);
  wire(bus,[[.18,y-.079,.226],[.209,y-.16,.261],[.33,y-.206,.265],[.53,y-.19,.25],[.61,y-.034,.231],[.62,y+.29,.219]],.021,blue);
  wire(power,[[-.37,y,.101],[-.58,y+.013,.066],[-.69,y+.071,.079],[-.71,y+.238,.068]],.020,dark);
 }
 return m;
}

function visionControlWorkbench(){
 const m=new T.Group(),frame=group(m,'frame'),surface=group(m,'surface'),camera=group(m,'camera'),arm=group(m,'arm'),tool=group(m,'tool'),objects=group(m,'objects'),display=group(m,'display'),computer=group(m,'computer'),rack=group(m,'rack'),wiring=group(m,'wiring');
 const blue=material('#214d76',.43,.45);
 box(surface,3.15,.122,1.34,.022,silver,0,.741,0);
 for(const x of [-1.47,1.47]) for(const z of [-.57,.57]){
  box(frame,.075,.67,.082,.010,silver,x,.382,z);
  cylinder(frame,.059,.040,dark,x,.042,z);
 }
 for(const x of [-1.42,1.42]) box(frame,.067,1.63,.074,.008,silver,x,1.59,-.53);
 box(frame,2.92,.064,.077,.008,silver,0,2.415,-.53);
 box(camera,.59,.147,.172,.024,dark,0,2.309,-.46);
 for(const x of [-.17,.17]) anatomyOptic(camera,x,2.31,-.361,.047);
 const a=[-1.22,.969,.14],b=[-1.02,1.97,.10],c=[-.54,1.734,.19];
 cylinder(arm,.173,.13,silver,-1.22,.869,.14);
 for(const p of [a,b,c]) factoryAxis(arm,p,.111,.14,blue);
 robotLink(arm,a,b,.121,.126,silver);robotLink(arm,b,c,.109,.105,silver);
 robotLink(tool,c,[-.49,1.462,.19],.090,.104,silver);
 for(const x of [-.55,-.43]) box(tool,.037,.136,.053,.006,dark,x,1.41,.19);
 box(objects,.162,.167,.159,.009,blue,-.89,.886,.36);
 cylinder(objects,.077,.27,silver,-.66,.941,.35);
 make(objects,new T.SphereGeometry(.085,21,12),white,-.48,.89,.35);
 make(objects,new T.ConeGeometry(.081,.187,26),blue,-.29,.91,.35);
 box(display,1.31,.82,.105,.033,dark,.79,1.761,-.31);
 for(const x of [.474,1.105]) for(const y of [1.57,1.947]) {
  box(display,.575,.344,.019,.007,material(y>1.8?'#243e38':'#19467a',.18,.42),x,y,-.251);
  for(let i=0;i<3;i++){
   const color=material(y>1.8?'#5b8869':['#388b80','#ca8b27','#c65738'][i],.05,.58);
   box(display,.104,.06+i*.043,.013,.004,color,x-.185+i*.155,y-.055+i*.014,-.239);
  }
 }
 cylinder(display,.067,.454,dark,.79,1.126,-.31);
 box(display,.71,.065,.38,.017,dark,.79,.846,-.30);
 box(computer,.58,.226,.376,.021,silver,.46,.917,.17);
 for(let i=0;i<5;i++) box(computer,.056,.036,.014,.003,dark,.24+i*.105,.92,.366);
 for(const x of [-.93,-.31,.72]) box(rack,.51,.21,.42,.013,dark,x,.365,.07);
 box(rack,2.93,.066,1.21,.012,silver,0,.225,0);
 const controls=group(m,'controls');
 box(controls,.276,.071,.235,.016,dark,1.19,.839,.367);
 cylinder(controls,.054,.023,material('#e6ae24',.09,.51),1.25,.881,.363);
 cylinder(controls,.039,.033,material('#b7322e',.13,.47),1.25,.906,.363);
 box(controls,.057,.086,.054,.012,dark,1.106,.914,.363);
 wire(wiring,[[0,2.39,-.51],[.30,2.47,-.53],[.56,2.38,-.56],[1.41,2.39,-.54],[1.43,1.85,-.56],[1.42,.82,-.54],[1.32,.33,-.49]],.021,dark);
 return m;
}

function exposedJointEncoder(){
 const m=new T.Group(),casePart=group(m,'case'), bearing=group(m,'bearing'),disc=group(m,'disc'),marks=group(m,'marks'),shaft=group(m,'shaft'),reader=group(m,'reader'),bracket=group(m,'bracket'),wires=group(m,'wires');
 const blue=material('#226bab',.45,.38), y=.79;
 machinedRing(casePart,.14,y,.085,.678,.568,.285,silver);
 machinedRing(casePart,.14,y,-.094,.653,.544,.044,blue);
 robotLink(casePart,[-.34,.91,-.14],[-1.20,1.19,-.27],.48,.49,silver);
 cylinder(casePart,.41,.262,dark,.02,.18,-.16);
 machinedRing(bearing,.14,y,.234,.492,.416,.102,silver);
 cylinder(disc,.447,.068,dark,.14,y,.301).rotation.x=Math.PI/2;
 for(let i=0;i<88;i++){
  const a=i*Math.PI/44;
  box(marks,.011,.096,.008,.001,bright,.14+.377*Math.sin(a),y+.377*Math.cos(a),.341).rotation.z=-a;
 }
 cylinder(shaft,.226,.195,silver,.14,y,.411).rotation.x=Math.PI/2;
 cylinder(shaft,.131,.146,bright,.14,y,.548).rotation.x=Math.PI/2;
 flangeBolts(shaft,.14,y,.517,.172,5,dark,true);
 box(bracket,.398,.096,.167,.013,silver,.14,1.324,.289);
 box(reader,.226,.15,.147,.016,dark,.14,1.222,.325);
 box(reader,.084,.031,.040,.004,blue,.14,1.144,.347);
 const readerPlug=group(m,'reader-plug');
 box(readerPlug,.116,.063,.077,.010,blue,.265,1.239,.351);
 for(let i=0;i<3;i++) box(readerPlug,.012,.060,.080,.003,dark,.295-i*.019,1.239,.351);
 wire(wires,[[.25,1.237,.311],[.47,1.258,.29],[.62,1.132,.269],[.69,.874,.268],[.61,.665,.269]],.021,dark);
 flangeBolts(casePart,.14,y,.24,.63,10,dark,true);
 return m;
}

function balanceSensorRover(){
 const m=new T.Group(),frame=group(m,'frame'),cross=group(m,'cross'),imu=group(m,'imu'),mount=group(m,'mount'),computer=group(m,'computer'),battery=group(m,'battery'),wires=group(m,'wires'),wheels=group(m,'wheels'),drives=group(m,'drives');
 const blue=material('#246498',.42,.43);
 for(const x of [-.60,.60]){
  box(frame,.123,.133,1.79,.019,silver,x,.418,0);
  for(let i=0;i<10;i++) cylinder(frame,.021,.008,dark,x,.487,-.76+i*.16);
 }
 for(const z of [-.82,0,.82]) box(cross,1.26,.121,.144,.019,silver,0,.429,z);
 for(const s of [-1,1]) for(const z of [-.63,.63]){
  const x=s*.76;
  cylinder(wheels,.321,.227,dark,x,.333,z).rotation.z=Math.PI/2;
  for(let i=0;i<24;i++){
   const a=i*Math.PI/12;
   box(wheels,.220,.040,.073,.009,dark,x,.332+.317*Math.cos(a),z+.317*Math.sin(a)).rotation.x=a;
  }
  machinedRing(wheels,x+s*.123,.333,z,.205,.115,.039,silver).rotation.y=Math.PI/2;
  axial(drives,.111,.262,silver,s*.566).position.set(s*.566,.333,z);
  axial(drives,.123,.038,blue,s*.679).position.set(s*.679,.333,z);
 }
 box(mount,.42,.064,.38,.020,blue,0,.538,.111);
 const board=new T.Group();board.position.set(0,.582,.11);imu.add(board);
 boardPlate(board,.324,.297,[],boardBlue);squareChip(board,0,.007,.105,3);
 for(const x of [-.129,.129]) for(const z of [-.108,.108]) cylinder(imu,.023,.016,boardGold,x,.658,.11+z);
 const computerStandoffs=group(m,'computer-standoffs');
 for(const x of [-.48,-.025]) for(const z of [-.68,-.31]){
  cylinder(computerStandoffs,.040,.109,silver,x,.505,z);
  cylinder(computerStandoffs,.025,.016,bright,x,.662,z);
 }
 box(computer,.57,.13,.48,.016,dark,-.252,.587,-.49);
 for(let i=0;i<7;i++) box(computer,.035,.013,.041,.003,boardGold,-.45+i*.059,.659,-.275);
 box(battery,.443,.17,.45,.028,dark,.285,.59,-.47);
 for(const [i,f] of ['#b94136','#242626','#256691'].entries()) wire(wires,[[.42,.64,-.62+i*.034],[.39,.752,-.71+i*.034],[.04,.751,-.697+i*.034],[-.16,.66,-.52+i*.034],[-.22,.65,-.181+i*.034],[0,.647,.006+i*.034]],.014,material(f,.05,.51));
 return m;
}

function tactileWristGripper(){
 const m=new T.Group(),arm=group(m,'arm'),joint=group(m,'joint'),collar=group(m,'collar'),sensor=group(m,'sensor'),tool=group(m,'tool'),links=group(m,'links'),pads=group(m,'pads'),cells=group(m,'cells'),wires=group(m,'wires');
 const blue=material('#255f93',.45,.42);
 const a=[-.68,.73,-.09],b=[-.42,1.79,-.11],c=[.25,1.87,-.025];
 robotLink(arm,a,b,.33,.36,silver);
 robotLink(arm,b,c,.322,.307,silver);
 for(const p of [a,b]) factoryAxis(joint,p,.239,.244,blue);
 cylinder(collar,.256,.206,silver,.28,1.651,-.025);
 cylinder(collar,.260,.043,blue,.28,1.527,-.025);
 cylinder(sensor,.227,.152,dark,.28,1.418,-.025);
 cylinder(sensor,.237,.055,silver,.28,1.334,-.025);
 flangeBolts(sensor,.28,1.367,-.025,.200,8,bright);
 const toolPlate=group(m,'tool-plate');
 box(toolPlate,.421,.099,.048,.012,silver,.28,1.224,.173);
 for(const x of [.127,.433]) cylinder(toolPlate,.025,.015,dark,x,1.224,.205).rotation.x=Math.PI/2;
 box(tool,.463,.19,.36,.037,silver,.28,1.189,-.025);
 for(const s of [-1,1]){
  const p=[.28+s*.178,1.105,.021],q=[.28+s*.28,.866,.021],r=[.28+s*.234,.549,.047];
  robotLink(links,p,q,.108,.133,dark);robotLink(links,q,r,.135,.131,silver);
  factoryAxis(links,q,.057,.155,silver);
  box(pads,.112,.246,.148,.025,blue,r[0],.577,.06).rotation.z=s*.13;
  for(let i=0;i<6;i++) for(let j=0;j<3;j++) box(cells,.021,.024,.014,.003,dark,r[0]-s*.055,.49+i*.032,.021+j*.041);
 }
 wire(wires,[[.14,1.687,-.12],[-.05,1.544,-.13],[-.028,1.419,-.14],[.12,1.405,-.099]],.020,dark);
 return m;
}

function multiSensorRangeHead(){
 const m=new T.Group(),base=group(m,'base'),gimbal=group(m,'gimbal'),bar=group(m,'bar'),sensors=group(m,'sensors'),lidar=group(m,'lidar'),optic=group(m,'optic'),vents=group(m,'vents'),ends=group(m,'ends'),cables=group(m,'cables');
 const blue=material('#1a5e9b',.51,.38);
 box(base,.83,.088,.56,.019,dark,0,.070,0);
 for(const x of [-.333,.333]) for(const z of [-.21,.21]) cylinder(base,.030,.033,silver,x,.135,z);
 box(gimbal,.347,.39,.33,.028,dark,0,.338,0);
 robotPivot(gimbal,[0,.491,.015],.112,.43,silver);
 box(bar,2.15,.416,.33,.074,silver,0,.805,.019);
 for(const x of [-.977,.977]){
  box(ends,.23,.387,.349,.060,dark,x,.806,.019);
  box(ends,.048,.363,.354,.013,blue,x*.938,.806,.021);
 }
 for(const x of [-.722,.722]){
  box(sensors,.324,.313,.059,.019,dark,x,.808,.203);
  machinedRing(sensors,x,.808,.248,.119,.091,.053,silver);
  cylinder(sensors,.086,.029,dark,x,.808,.277).rotation.x=Math.PI/2;
 }
 for(const x of [-.382,.382]) for(const y of [.747,.864]) box(vents,.227,.049,.017,.005,dark,x,y,.189);
 const scannerBracket=group(m,'scanner-bracket');
 for(const x of [-.31,.31]){
  box(scannerBracket,.103,.063,.225,.012,silver,x,1.043,.019);
  for(const z of [-.054,.094]) cylinder(scannerBracket,.021,.014,dark,x,1.081,z);
 }
 cylinder(lidar,.318,.129,dark,0,1.080,.008);
 cylinder(optic,.296,.265,material('#17436a',.58,.19),0,1.26,.008);
 cylinder(lidar,.317,.099,dark,0,1.419,.008);
 for(const x of [-.14,.14]) wire(cables,[[x,.35,-.08],[x*2.9,.432,-.019],[x*4.9,.489,.018],[x*5.2,.641,.023]],.027,dark);
 return m;
}

function stereoDepthHead(){
 const m=new T.Group(), hood=group(m,'hood'), bezel=group(m,'bezel'), left=group(m,'left'), right=group(m,'right'), emitter=group(m,'emitter'), vents=group(m,'vents'), yoke=group(m,'yoke'), pivots=group(m,'pivots'), base=group(m,'base'), cable=group(m,'cable');
 const blue=material('#20629e',.48,.37),glow=new T.MeshStandardMaterial({color:'#388dcc',emissive:'#2169cc',emissiveIntensity:1.1});
 box(hood,2.05,.83,.67,.16,silver,0,1.25,-.10);
 box(bezel,1.87,.646,.097,.065,dark,0,1.252,.247);
 for(const [part,x] of [[left,-.55],[right,.55]]) anatomyOptic(part,x,1.251,.314,.241);
 box(emitter,.34,.234,.074,.021,dark,0,1.228,.319);
 for(let i=0;i<9;i++) for(let j=0;j<5;j++) box(emitter,.017,.016,.013,.002,glow,-.087+i*.021,1.190+j*.019,.363);
 const bezelBolts=group(m,'bezel-bolts');
 for(const x of [-.773,.773]) for(const y of [1.002,1.507]){
  cylinder(bezelBolts,.023,.014,silver,x,y,.308).rotation.x=Math.PI/2;
 }
 for(let i=0;i<12;i++) box(vents,.046,.019,.196,.007,dark,-.42+i*.076,1.674,-.11).rotation.y=.21;
 for(const s of [-1,1]){
  robotLink(yoke,[s*.30,.432,-.099],[s*.76,.552,-.097],.106,.174,silver);
  robotLink(yoke,[s*.76,.552,-.097],[s*.91,.938,-.074],.12,.167,silver);
  robotPivot(pivots,[s*.891,.964,-.070],.128,.141,blue);
 }
 cylinder(base,.37,.14,silver,0,.227,-.10);
 cylinder(base,.31,.21,dark,0,.377,-.10);
 cylinder(base,.323,.041,blue,0,.445,-.10);
 wire(cable,[[-.67,.95,-.20],[-.59,.75,-.22],[-.47,.59,-.21],[-.28,.42,-.20]],.033,dark);
 return m;
}

function torsoBatteryExchange(){
 const m=new T.Group(), frame=group(m,'frame'), arms=group(m,'arms'), rails=group(m,'rails'), bay=group(m,'bay'), socket=group(m,'socket'), pack=group(m,'pack'), handle=group(m,'handle'), fingers=group(m,'fingers'), waist=group(m,'waist');
 const blue=material('#235c8d',.44,.42);
 const cx=-.32;
 box(bay,1.06,1.17,.228,.054,dark,cx,1.22,-.19);
 for(const x of [-.861,.221]) box(frame,.18,1.21,.514,.042,silver,x,1.27,-.035);
 for(const y of [.672,1.89]) box(frame,1.18,.158,.52,.037,silver,cx,y,-.035);
 box(socket,.32,.153,.061,.012,dark,cx,1.524,-.060);
 for(let i=0;i<8;i++) box(socket,.019,.031,.016,.003,boardGold,cx-.109+i*.031,1.52,-.021);
 for(const x of [-.72,.06]) box(rails,.078,.071,.75,.013,silver,x,.938,.172);
 box(pack,.729,.483,1.25,.065,silver,cx,1.194,.495);
 box(pack,.73,.477,.192,.042,dark,cx,1.195,1.108);
 for(const x of [-.65,.01]) box(pack,.038,.044,.83,.008,blue,x,1.37,.471);
 const handleMounts=group(m,'handle-mounts');
 for(const x of [-.56,-.08]){
  box(handleMounts,.116,.124,.088,.018,silver,x,1.16,1.204);
  cylinder(handleMounts,.018,.014,dark,x,1.196,1.256).rotation.x=Math.PI/2;
 }
 wire(handle,[[-.56,1.16,1.18],[-.54,1.16,1.34],[-.32,1.16,1.37],[-.11,1.16,1.34],[-.08,1.16,1.18]],.041,blue);
 cylinder(waist,.265,.39,dark,cx,.491,-.038);
 cylinder(waist,.279,.038,blue,cx,.315,-.038);
 for(const s of [-1,1]){
  const a=[cx+s*.70,1.69,-.05],b=[cx+s*.85,1.14,-.013],c=[cx+s*.97,.56,.054];
  robotPivot(arms,a,.146,.19,blue);
  make(arms,new T.SphereGeometry(.15,24,16),material('#a7afb4',.54,.43),
    a[0]+s*.038,a[1]+.047,a[2]+.011).scale.set(1.12,.71,.84);
  robotLink(arms,a,b,.18,.17,silver);
  robotPivot(arms,b,.104,.13,blue);robotLink(arms,b,c,.153,.143,silver,.77);
 }
 robotLink(fingers,[1.14,1.0,1.36],[.32,1.24,1.36],.196,.174,silver);
 for(const dy of [-.076,.076]) robotLink(fingers,[.32,1.24+dy,1.36],[.04,1.16+dy,1.356],.075,.073,dark);
 return m;
}

function batteryDockWithBms(){
 const m=new T.Group(), shell=group(m,'shell'), handle=group(m,'handle'), rails=group(m,'rails'), pack=group(m,'pack'), connector=group(m,'connector'), pins=group(m,'pins'), board=group(m,'board'), panel=group(m,'panel'), wiring=group(m,'wiring'), led=group(m,'led');
 const blue=material('#206598',.46,.42), green=material('#2d674f',.13,.53);
 box(shell,2.13,.236,1.54,.071,dark,0,.187,0);
 box(shell,1.22,1.09,.22,.054,silver,-.40,.795,-.622);
 box(shell,1.02,.91,.14,.036,dark,-.40,.827,-.487);
 wire(handle,[[-.91,1.222,-.65],[-.77,1.493,-.65],[-.40,1.529,-.65],[-.022,1.494,-.65],[.11,1.227,-.65]],.069,dark);
 for(const x of [-.922,.118]){
  box(rails,.127,.23,1.31,.031,silver,x,.376,.036);
  box(rails,.049,.067,1.24,.012,blue,x,.508,.05);
 }
 box(pack,.846,.334,1.13,.048,silver,-.40,.501,.16);
 box(pack,.851,.328,.17,.041,dark,-.40,.50,.697);
 const release=group(m,'release');
 box(release,.222,.082,.041,.010,blue,-.40,.503,.801);
 box(release,.128,.017,.010,.003,bright,-.40,.516,.826);
 machinedRing(connector,-.40,1.039,-.391,.138,.082,.063,silver);
 cylinder(connector,.080,.041,dark,-.40,1.039,-.36).rotation.x=Math.PI/2;
 for(let i=0;i<7;i++) box(pins,.024,.060,.084,.004,boardGold,-.61+i*.069,.727,-.348);
 box(board,.539,.635,.048,.016,green,.625,.697,-.255);
 for(let i=0;i<14;i++) box(board,.044,.046,.018,.006,i%3?dark:silver,.438+i%4*.112,.49+Math.floor(i/4)*.113,-.216);
 for(const x of [.326,.925]) box(panel,.057,.764,.155,.013,silver,x,.701,-.276);
 for(const y of [.32,1.084]) box(panel,.642,.057,.155,.013,silver,.626,y,-.276);
 box(panel,.61,.744,.034,.027,new T.MeshStandardMaterial({color:'#b8ccd9',roughness:.18,transparent:true,opacity:.20,depthWrite:false}),.626,.700,-.136).userData.cycleThrough=true;
 for(let i=0;i<6;i++) wire(wiring,[[.418+i*.065,.470,-.194],[.42+i*.062,.382,-.179],[.44+i*.061,.299,-.203]],.012,material(i%2?'#27272b':'#b34035',.07,.55));
 box(led,.234,.027,.012,.004,blue,-.40,.223,.778);
 return m;
}

function fusedPowerPanel(){
 const m=new T.Group(), frame=group(m,'frame'), switchPart=group(m,'switch'), fuses=group(m,'fuses'), terminals=group(m,'terminals'), converters=group(m,'converters'), harness=group(m,'harness'), clamps=group(m,'clamps'), studs=group(m,'studs');
 const blue=material('#235d92',.44,.41),red=material('#c24435',.12,.48);
 const brushedPanel=material('#b4bcc0',.45,.46);
 box(frame,2.25,1.71,.112,.058,brushedPanel,0,.938,-.06);
 for(const x of [-1.02,1.02]) for(const y of [.19,1.68]){
  box(frame,.234,.167,.101,.023,brushedPanel,x,y,-.054);
  cylinder(studs,.042,.017,dark,x,y,.008).rotation.x=Math.PI/2;
 }
 box(switchPart,.43,.41,.158,.032,dark,-.81,1.48,.079);
 cylinder(switchPart,.121,.046,red,-.81,1.48,.188).rotation.x=Math.PI/2;
 box(switchPart,.087,.189,.045,.013,red,-.81,1.48,.213).rotation.z=.38;
 box(fuses,.632,.45,.102,.027,dark,-.152,1.433,.061);
 for(const y of [1.366,1.537]) for(let i=0;i<8;i++) box(fuses,.049,.092,.075,.007,y>1.4?red:blue,-.411+i*.074,y,.14);
 for(const [i,y] of [1.61,1.374,1.139].entries()){
  box(terminals,.553,.155,.181,.020,dark,.731,y,.088);
  for(let j=0;j<4;j++) box(terminals,.104,.11,.073,.008,[blue,material('#d5a936',.13,.50),silver][i],.552+j*.121,y,.192);
 }
 const terminalScrews=group(m,'terminal-screws');
 for(const y of [1.61,1.374,1.139]) for(let i=0;i<4;i++){
  const x=.552+i*.121;
  cylinder(terminalScrews,.022,.015,silver,x,y,.235).rotation.x=Math.PI/2;
  box(terminalScrews,.021,.005,.005,.001,dark,x,y,.244);
 }
 for(const [x,w] of [[-.71,.58],[-.023,.48],[.65,.36]]){
  box(converters,w,.49,.183,.025,dark,x,.546,.101);
  for(let i=0;i<10;i++) box(converters,.022,.416,.041,.003,brushedPanel,x-w*.423+i*w*.094,.546,.213);
  for(const dx of [-w*.31,w*.31]) box(clamps,.049,.067,.026,.004,blue,x+dx,.294,.183);
 }
 for(const [i,f] of [red,dark,blue,red,dark,blue,red,dark].entries()){
  const x=-.403+i*.072;
  wire(harness,[[x,1.23,.149],[x,1.057,.146],[x+.02,.91,.143],[x+.32,.872,.143],[x+.42,.815,.147]],.016,f);
 }
 for(const [x,offset] of [[-.81,0],[.72,.052]]) wire(harness,[[x,1.27,.155],[x-.09,1.11,.151],[x-.22,.91,.142],[x-.18,.29,.141],[x-.05,.204,.154],[.61+offset,.203,.154]],.024,red);
 return m;
}

function guardedRobotCell(){
 const m=new T.Group(),frame=group(m,'frame'),panels=group(m,'panels'),door=group(m,'door'),interlock=group(m,'interlock'),stop=group(m,'stop'),beacon=group(m,'beacon'),cabinet=group(m,'cabinet'),arm=group(m,'arm'),bench=group(m,'bench');
 const blue=material('#246297',.47,.41),glass=new T.MeshStandardMaterial({color:'#c4d4de',roughness:.17,transparent:true,opacity:.19,depthWrite:false});
 for(const x of [-.95,.95]) for(const z of [-.72,.72]){
  box(frame,.087,2.20,.089,.010,silver,x,1.21,z);
  cylinder(frame,.071,.075,dark,x,.05,z);
  for(const y of [.155,2.31]) box(frame,.102,.104,.105,.010,blue,x,y,z);
 }
 for(const y of [.17,.65,2.29]){
  for(const x of [-.95,.95]) box(frame,.080,.071,1.46,.009,silver,x,y,0);
  for(const z of [-.72,.72]) box(frame,1.91,.074,.083,.009,silver,0,y,z);
 }
 for(const x of [-.947,.947]) box(panels,.029,1.63,1.35,.010,glass,x,1.46,0).userData.cycleThrough=true;
 box(panels,1.80,1.63,.028,.010,glass,0,1.46,-.72).userData.cycleThrough=true;
 box(panels,1.81,.455,.055,.012,dark,0,.400,.718);
 box(door,1.74,1.59,.030,.013,glass,0,1.462,.73).userData.cycleThrough=true;
 for(const x of [-.883,.883]) box(door,.052,1.61,.055,.006,silver,x,1.463,.73);
 const hinges=group(m,'hinges');
 for(const y of [.94,1.995]){
  box(hinges,.112,.139,.050,.010,silver,-.896,y,.773);
  cylinder(hinges,.031,.149,dark,-.912,y,.802);
 }
 wire(door,[[.70,1.30,.771],[.70,1.34,.86],[.70,1.53,.86],[.70,1.57,.771]],.022,dark);
 box(interlock,.155,.16,.078,.014,material('#c99d3d',.28,.46),.941,1.416,.784);
 box(cabinet,.40,.59,.291,.020,silver,1.16,1.63,.74);
 box(cabinet,.43,.62,.35,.022,silver,1.16,.66,.66);
 box(stop,.219,.204,.039,.010,material('#e6b73c',.07,.53),1.16,1.78,.905);
 cylinder(stop,.070,.074,material('#bd2627',.09,.44),1.16,1.78,.963).rotation.x=Math.PI/2;
 for(const [i,c] of ['#27934f','#d8a336','#a63131'].entries()) cylinder(beacon,.059,.073,material(c,.13,.43),1.15,2.19+i*.078,.73);
 cylinder(beacon,.055,.20,dark,1.15,2.067,.73);
 const a=[-.52,.94,-.17],b=[-.35,1.67,-.16],c=[.286,1.42,-.10];
 cylinder(arm,.20,.17,silver,-.52,.77,-.17);
 for(const p of [a,b,c]) factoryAxis(arm,p,.11,.143,blue);
 robotLink(arm,a,b,.137,.139,silver);robotLink(arm,b,c,.137,.141,silver);
 box(arm,.101,.124,.104,.011,dark,.31,1.26,-.10);
 for(const x of [.271,.35]) box(arm,.023,.112,.045,.004,silver,x,1.172,-.10);
 box(bench,.81,.089,.64,.012,silver,.40,.736,-.01);
 for(const x of [.10,.62]) cylinder(bench,.085,.16,silver,x,.846,.006);
 return m;
}

function sealedElectronicsCutaway(){
 const m=new T.Group(),tub=group(m,'tub'),lid=group(m,'lid'),seal=group(m,'seal'),corners=group(m,'corners'),board=group(m,'board'),heat=group(m,'heat'),gland=group(m,'gland'),lead=group(m,'lead'),mounts=group(m,'mounts');
 const blue=material('#1d65a0',.43,.41);
 box(tub,2.03,.114,1.38,.04,silver,0,.16,0);
 for(const x of [-.991,.991]) box(tub,.106,.49,1.40,.028,silver,x,.39,0);
 for(const z of [-.681,.681]) box(tub,2.03,.49,.105,.027,silver,0,.39,z);
 for(const x of [-.961,.961]) for(const z of [-.63,.63]){
  box(corners,.259,.49,.257,.057,dark,x,.393,z);
  box(mounts,.24,.062,.27,.011,silver,x*1.105,.112,z*1.10);
  cylinder(mounts,.040,.013,dark,x*1.14,.15,z*1.12);
 }
 for(const z of [-.650,.650]) box(seal,1.94,.033,.032,.009,blue,0,.655,z);
 for(const x of [-.961,.961]) box(seal,.032,.033,1.30,.009,blue,x,.655,0);
 const cap=new T.Group();cap.position.set(-.13,1.30,-.18);cap.rotation.x=-.22;lid.add(cap);
 box(cap,2.06,.135,1.43,.064,silver,0,0,0);
 box(cap,1.80,.039,1.18,.034,silver,0,.085,0);
 const lidScrews=group(m,'lid-screws');
 lidScrews.position.copy(cap.position);
 lidScrews.rotation.copy(cap.rotation);
 for(const x of [-.88,.88]) for(const z of [-.57,.57]){
  make(lidScrews,new T.CylinderGeometry(.040,.040,.027,6),bright,x,.084,z);
 }
 const circuit=new T.Group();circuit.position.y=.258;board.add(circuit);
 boardPlate(circuit,1.75,1.09,[],material('#24604b',.14,.56));squareChip(circuit,-.24,.03,.275,6);
 for(const [x,z] of [[-.68,-.22],[-.49,.36],[.47,.34],[.67,-.29]]) surfaceChip(circuit,x,z,.145,.11,3);
 box(heat,.44,.067,.36,.011,silver,.43,.35,-.26);
 for(let i=0;i<9;i++) box(heat,.020,.111,.32,.004,silver,.241+i*.047,.437,-.26);
 machinedRing(gland,.63,.399,.735,.154,.070,.13,silver);
 cylinder(gland,.106,.16,dark,.63,.399,.837).rotation.x=Math.PI/2;
 wire(lead,[[.63,.40,.907],[.73,.38,1.03],[.94,.28,1.19],[1.36,.25,1.29]],.057,dark);
 return m;
}

function seriesElasticBenchJoint(){
 const m=new T.Group(),base=group(m,'base'),mount=group(m,'mount'),motor=group(m,'motor'),coupler=group(m,'coupler'),shaft=group(m,'shaft'),spring=group(m,'spring'),frame=group(m,'frame'),output=group(m,'output'),lever=group(m,'lever'),wires=group(m,'wires');
 const blue=material('#205f9e',.48,.41),y=.86;
 box(base,2.23,.149,.88,.030,silver,-.10,.093,0);
 for(const x of [-.77,.67]) for(const z of [-.19,.19]) robotLink(mount,[x,.174,z],[x*.92,.64,z],.106,.122,silver);
 axial(motor,.32,.62,dark,-1.05).position.y=y;
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12;box(motor,.51,.027,.04,.005,dark,-1.09,y+.313*Math.cos(a),.313*Math.sin(a)).rotation.x=a;
 }
 axial(coupler,.260,.169,silver,-.68).position.y=y;
 axial(shaft,.079,1.28,bright,.05).position.y=y;
 const springSeats=group(m,'spring-seats');
 for(const x of [-.437,.416]) machinedRing(springSeats,x,y,0,.221,.087,.042,silver).rotation.y=Math.PI/2;
 axialHelix(spring,-.42,.40,.175,6,.036,blue).position.y=y;
 for(const z of [-.19,.19]) for(const d of [-.225,.225]) axial(frame,.031,1.03,silver,-.02).position.set(-.02,y+d,z);
 for(const x of [-.52,.48]) machinedRing(frame,x,y,0,.267,.207,.062,silver).rotation.y=Math.PI/2;
 factoryAxis(output,[.79,y,.027],.295,.234,blue);
 robotLink(lever,[.81,y,.163],[1.31,1.64,.169],.219,.143,silver,.78);
 robotLink(lever,[.973,1.11,.24],[1.23,1.51,.25],.071,.018,dark);
 machinedRing(lever,1.31,1.64,.171,.114,.051,.151,silver);
 wire(wires,[[-1.31,1.02,-.09],[-1.24,1.27,-.10],[-.96,1.39,-.09],[-.66,1.26,-.09]],.028,dark);
 return m;
}

function adaptiveGraspHand(){
 const m=new T.Group(),wrist=group(m,'wrist'),palm=group(m,'palm'),bases=group(m,'bases'),fingers=group(m,'fingers'),hinges=group(m,'hinges'),pads=group(m,'pads'),thumb=group(m,'thumb'),tendons=group(m,'tendons'),object=group(m,'object');
 const blue=material('#24619a',.45,.43);
 cylinder(wrist,.231,.274,silver,-.39,.17,-.08);
 cylinder(wrist,.235,.035,blue,-.39,.296,-.08);
 const wristClamp=group(m,'wrist-clamp');
 cylinder(wristClamp,.258,.074,silver,-.39,.329,-.08);
 for(const x of [-.54,-.24]) cylinder(wristClamp,.025,.013,dark,x,.329,.117).rotation.x=Math.PI/2;
 robotLink(palm,[-.39,.31,-.08],[-.24,.946,-.13],.545,.32,dark,1.05);
 for(let i=0;i<4;i++){
  const x=-.57+i*.218,y=.998+Math.sin(i*.92+.59)*.127;
  const p=[x,y,-.09],q=[x+.12,y+.292,.116],r=[x+.26,y+.234,.40],t=[x+.33,y+.033,.50];
  robotPivot(bases,p,.071,.123,blue);
  robotLink(fingers,p,q,.116,.115,silver);robotLink(fingers,q,r,.108,.105,silver);robotLink(fingers,r,t,.103,.103,silver);
  for(const pt of [q,r]) robotPivot(hinges,pt,.058,.093,dark);
  box(pads,.108,.12,.058,.024,dark,t[0],t[1]-.022,t[2]+.035);
  wire(tendons,[[-.40+i*.087,.382,.092],[x*.91,.735,.083],[x,y,.031],[q[0],q[1],q[2]+.04]],.011,blue);
 }
 const a=[-.59,.58,.014],b=[-.35,.68,.398],c=[.025,.755,.579];
 robotLink(thumb,a,b,.151,.141,silver);robotPivot(thumb,b,.065,.112,blue);robotLink(thumb,b,c,.123,.129,silver);
 box(pads,.125,.124,.077,.026,dark,c[0],c[1],c[2]+.037);
 const g=new T.SphereGeometry(.38,36,26),positions=g.getAttribute('position');
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),k=1+.16*Math.sin(x*9+y*8)*Math.cos(z*8-y*10);
  positions.setXYZ(i,x*k,y*k*1.16,z*k*.77);
 }
 g.computeVertexNormals();make(object,g,material('#4e89ad',.05,.89),.26,.909,.44);
 m.rotation.z=-.26;
 return m;
}

function adjustableStiffnessJoint(){
 const m=new T.Group(),frame=group(m,'frame'),base=group(m,'base'),hub=group(m,'hub'),springs=group(m,'springs'),guides=group(m,'guides'),lever=group(m,'lever'),screw=group(m,'screw'),knob=group(m,'knob');
 const blue=material('#21639c',.49,.40), y=.86, springDepth=.131;
 cylinder(base,.45,.121,silver,0,.085,0);cylinder(base,.29,.17,dark,0,.228,0);
 for(const h of [.38,1.35]) box(frame,1.17,.117,.34,.039,dark,-.02,h,-.043);
 for(const s of [-1,1]) for(const d of [-1,1]) robotLink(frame,[s*.51,y,0],[s*.34,y+d*.46,0],.15,.25,dark);
 const springCollars=group(m,'spring-collars');
 for(const h of [.57,1.15]) for(const x of [-.40,.40]){
  axial(springCollars,.105,.075,silver,x).position.set(x,h,springDepth);
  axial(springCollars,.094,.027,blue,x*.905).position.set(x*.905,h,springDepth);
 }
 for(const h of [.57,1.15]){
  axial(guides,.042,.86,silver,0).position.set(0,h,springDepth);
  axialHelix(springs,-.365,.35,.086,8,.019,blue).position.set(0,h,springDepth);
  robotLink(lever,[-.43,h,.15],[.055,y,.179],.079,.075,silver);
 }
 machinedRing(hub,-.62,y,.02,.286,.109,.12,silver).rotation.y=Math.PI/2;
 for(let index=0;index<8;index++){
  const angle=index*Math.PI/4;
  make(hub,new T.CylinderGeometry(.025,.025,.025,6),dark,-.686,y+.224*Math.cos(angle),.02+.224*Math.sin(angle)).rotation.z=Math.PI/2;
 }
 machinedRing(hub,-.684,y,.02,.152,.095,.043,blue).rotation.y=Math.PI/2;
 axial(lever,.139,.113,silver,.09).position.set(.09,y,.027);
 axial(screw,.064,.78,silver,.42).position.y=y;
 axialHelix(screw,.22,.81,.064,12,.009,bright).position.y=y;
 axial(knob,.134,.144,blue,.91).position.y=y;
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6;box(knob,.131,.024,.036,.005,blue,.91,y+.13*Math.cos(a),.13*Math.sin(a)).rotation.x=a;
 }
 return m;
}

function interchangeableLimbTorso(){
 const m=new T.Group(),base=group(m,'base'),body=group(m,'body'),head=group(m,'head'),socket=group(m,'socket'),contacts=group(m,'contacts'),arm=group(m,'arm'),loose=group(m,'loose'),plug=group(m,'plug'),hands=group(m,'hands');
 const blue=material('#235b8d',.49,.41),cx=-.42;
 box(base,1.24,.109,.84,.024,silver,cx,.081,0);
 for(const x of [-.91,.06]) robotLink(base,[x,.15,.07],[cx+(x-cx)*.48,.49,0],.08,.099,silver);
 robotLink(body,[cx,.42,0],[cx,1.43,0],.53,.37,silver,1.55);
 box(body,.35,.304,.067,.019,dark,cx,.791,.211);
 cylinder(head,.09,.19,silver,cx,1.55,0);
 box(head,.429,.34,.33,.082,dark,cx,1.76,0);
 for(const x of [-.105,.105]) anatomyOptic(head,cx+x,1.767,.17,.069);
 machinedRing(socket,.052,1.312,0,.163,.098,.117,silver).rotation.y=Math.PI/2;
 const latch=group(m,'latch');
 for(const z of [-.145,.145]){
  box(latch,.073,.061,.062,.010,dark,.092,1.332,z);
  box(latch,.061,.026,.045,.006,blue,.127,1.347,z);
 }
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  make(contacts,new T.SphereGeometry(.018,12,8),boardGold,.121,1.312+.079*Math.cos(a),.079*Math.sin(a));
 }
 const a=[-.92,1.32,0],b=[-1.04,.91,.071],c=[-1.15,.51,.14];
 robotPivot(arm,a,.131,.146,blue);robotLink(arm,a,b,.169,.173,silver);robotPivot(arm,b,.084,.123,blue);robotLink(arm,b,c,.147,.143,silver);
 robotHand(hands,[-1.15,.37,.144],-1,silver);
 const d=[.47,.24,.31],e=[.96,.24,.49],f=[.79,.24,.85];
 robotLink(loose,d,e,.158,.165,silver);robotPivot(loose,e,.11,.14,blue);robotLink(loose,e,f,.151,.147,silver);
 machinedRing(plug,.47,.24,.31,.138,.081,.102,silver).rotation.y=Math.PI/2;
 const hand=new T.Group();hand.position.set(...f);hand.rotation.x=-Math.PI/2;hands.add(hand);robotHand(hand,[0,-.10,0],1,silver);
 return m;
}

function bioInspiredHindLimb(){
 const m=new T.Group(),mount=group(m,'mount'),hip=group(m,'hip'),upper=group(m,'upper'),knee=group(m,'knee'),shin=group(m,'shin'),tendon=group(m,'tendon'),muscle=group(m,'muscle'),ankle=group(m,'ankle'),claw=group(m,'claw');
 const blue=material('#235f95',.47,.41);
 const a=[-1.08,.97,0],b=[.47,1.94,0],c=[.96,.53,.025],d=[1.33,.16,.085];
 box(mount,.19,.72,.45,.037,silver,-1.25,.99,0);
 const mountFasteners=group(m,'mount-fasteners');
 for(const y of [.724,1.25]) for(const z of [-.164,.164]){
  make(mountFasteners,new T.CylinderGeometry(.028,.028,.021,6),bright,-1.352,y,z).rotation.z=Math.PI/2;
 }
 factoryAxis(hip,a,.209,.35,blue);
 for(const z of [-.14,.14]){
  robotLink(upper,[a[0],a[1]-.11,z],[b[0],b[1]-.095,z],.10,.09,silver);
  robotLink(upper,[a[0],a[1]+.12,z],[b[0],b[1]+.078,z],.11,.09,silver);
  robotLink(upper,[-.47,1.19,z],[-.20,1.59,z],.10,.087,silver);
  robotLink(shin,[b[0]+.07,b[1]-.11,z],[c[0],c[1],z*.57],.092,.072,silver);
 }
 factoryAxis(knee,b,.164,.232,silver);
 robotLink(muscle,[-.81,1.04,.064],[-.13,1.54,.066],.146,.138,blue);
 wire(tendon,[[-1.13,1.29,.19],[-.61,1.42,.174],[-.11,1.77,.16],[.49,2.027,.11],[.71,1.51,.13],[.87,.92,.13],[.97,.55,.098]],.024,dark);
 factoryAxis(ankle,c,.080,.133,blue);
 robotLink(claw,c,[1.12,.31,.073],.086,.084,silver);robotLink(claw,[1.12,.31,.073],d,.073,.077,dark);
 for(const z of [-.060,.075]) robotLink(claw,[d[0],d[1],d[2]+z],[1.48,.075,.082+z],.039,.045,dark,.43);
 return m;
}

function completeHumanoidSkeleton(){
 const m=new T.Group(),skull=group(m,'skull'),spine=group(m,'spine'),rib=group(m,'rib'),pelvis=group(m,'pelvis'),joints=group(m,'joints'),arms=group(m,'arms'),hands=group(m,'hands'),legs=group(m,'legs'),feet=group(m,'feet'),cables=group(m,'cables');
 const blue=material('#25567e',.43,.43);
 for(const s of [-1,1]) {
  wire(skull,[[s*.12,3.46,.13],[s*.22,3.62,.04],[s*.23,3.83,-.02],[s*.12,3.97,-.035],[0,3.99,.017]],.030,silver);
  machinedRing(skull,s*.106,3.75,.126,.078,.056,.062,silver);
  for(const y of [2.55,2.77,2.99,3.18]) wire(rib,[[0,y,-.12],[s*.24,y,.025],[s*.36,y-.042,.12],[s*.24,y-.09,.19],[0,y-.10,.18]],.034,silver);
  const p=[s*.47,3.22,0],q=[s*.62,2.67,.055],r=[s*.72,2.13,.095];
  for(const [v,k] of [[p,.137],[q,.093],[r,.062]]) robotPivot(joints,v,k,k*1.3,blue);
  for(const z of [-.066,.066]){
   robotLink(arms,[p[0],p[1],z],[q[0],q[1],z+.055],.081,.073,silver);
   robotLink(arms,[q[0],q[1],z+.055],[r[0],r[1],z+.095],.073,.066,silver);
  }
  robotHand(hands,[s*.728,2.03,.105],s,silver);
  const h=[s*.254,2.17,0],k=[s*.302,1.23,.04],f=[s*.324,.286,-.03];
  for(const [v,z] of [[h,.144],[k,.117],[f,.074]]) robotPivot(joints,v,z,z*1.37,blue);
  for(const d of [-.061,.061]){
   robotLink(legs,[h[0]+d,h[1],0],[k[0]+d,k[1],.04],.079,.083,silver);
   robotLink(legs,[k[0]+d,k[1],.04],[f[0]+d,f[1],-.03],.074,.079,silver);
  }
  for(const d of [-.077,0,.077]) robotLink(feet,[f[0]+d,.178,-.07],[f[0]+d,.099,.305],.058,.078,silver);
  wire(cables,[[s*.30,3.21,-.067],[s*.17,2.89,-.078],[s*.12,2.60,-.069],[s*.17,2.24,-.068],[s*.27,1.98,-.038]],.013,blue);
 }
 const sternum=group(m,'sternum');
 robotLink(sternum,[0,2.60,.199],[0,3.18,.199],.073,.057,silver,1);
 for(const y of [2.69,2.89,3.09]) cylinder(sternum,.019,.014,dark,0,y,.233).rotation.x=Math.PI/2;
 for(let i=0;i<11;i++) cylinder(spine,.093,.102,i%2?silver:dark,0,2.22+i*.112,0);
 wire(pelvis,[[-.31,2.22,0],[-.24,2.40,-.02],[0,2.43,-.02],[.24,2.40,-.02],[.31,2.22,0],[0,2.09,.12],[-.31,2.22,0]],.066,silver);
 return m;
}

function mixedAxisTrainingRig(){
 const m=new T.Group(),base=group(m,'base'),tower=group(m,'tower'),joint=group(m,'joint'),link=group(m,'link'),wrist=group(m,'wrist'),jaws=group(m,'jaws'),rails=group(m,'rails'),slider=group(m,'slider'),screw=group(m,'screw'),motor=group(m,'motor');
 const blue=material('#225e93',.47,.42);
 box(base,2.93,.156,1.05,.028,silver,0,.13,0);
 for(const x of [-1.25,1.25]) for(const z of [-.39,.39]) cylinder(base,.062,.053,dark,x,.044,z);
 box(tower,.246,.94,.33,.031,silver,-.99,.679,-.14);
 robotLink(tower,[-1.34,.22,-.14],[-1.07,.59,-.14],.113,.169,silver);
 factoryAxis(joint,[-.99,1.17,-.14],.284,.22,blue);
 robotLink(link,[-.99,1.17,-.05],[.34,1.70,-.05],.25,.161,dark);
 for(let i=0;i<3;i++) box(link,.217,.105,.025,.008,silver,-.63+i*.285,1.307+i*.112,.045).rotation.z=.38;
 factoryAxis(wrist,[.385,1.70,-.05],.109,.176,silver);
 box(wrist,.25,.19,.26,.023,blue,.58,1.65,-.05);
 for(const z of [-.19,.095]) robotLink(jaws,[.69,1.65,z],[.99,1.56,z],.091,.101,silver);
 for(const z of [-.26,.17]) axial(rails,.044,1.64,silver,.22).position.set(.22,.410,z);
 box(slider,.55,.13,.54,.019,silver,.21,.51,-.047);
 for(const z of [-.26,.17]) box(slider,.437,.13,.11,.016,blue,.21,.423,z);
 axial(screw,.047,1.61,dark,.22).position.set(.22,.383,-.046);
 axialHelix(screw,-.57,1.01,.050,27,.008,bright).position.set(0,.383,-.046);
 const screwSupport=group(m,'screw-support');
 for(const x of [-.59,1.02]){
  box(screwSupport,.105,.283,.29,.019,silver,x,.363,-.046);
  machinedRing(screwSupport,x-.063,.383,-.046,.088,.051,.042,blue).rotation.y=Math.PI/2;
 }
 box(motor,.29,.29,.35,.019,dark,1.19,.414,-.046);
 return m;
}

function explodedRobotJoint(){
 const m=new T.Group(),arm=group(m,'arm'),harness=group(m,'harness'),stator=group(m,'stator'),rotor=group(m,'rotor'),transmission=group(m,'transmission'),bearing=group(m,'bearing'),housing=group(m,'housing'),flange=group(m,'flange'),hardware=group(m,'hardware');
 const blue=material('#20619c',.46,.43),copper=material('#b37142',.72,.44),y=.84;
 robotLink(arm,[-1.68,1.14,0],[-1.26,y,0],.44,.36,silver);
 machinedRing(arm,-1.24,y,0,.32,.189,.125,silver).rotation.y=Math.PI/2;
 wire(harness,[[-1.34,1.00,.09],[-1.15,.93,.13],[-1.05,.76,.09],[-.94,.76,.03]],.023,blue);
 machinedRing(stator,-.83,y,0,.27,.177,.144,dark).rotation.y=Math.PI/2;
 for(let i=0;i<18;i++){
  const a=i*Math.PI/9;box(stator,.120,.045,.051,.006,copper,-.80,y+.208*Math.cos(a),.208*Math.sin(a)).rotation.x=a;
 }
 axial(rotor,.152,.219,silver,-.49).position.y=y;
 axial(rotor,.082,.287,bright,-.48).position.y=y;
 machinedRing(transmission,-.10,y,0,.259,.094,.14,silver).rotation.y=Math.PI/2;
 for(let i=0;i<18;i++){
  const a=i*Math.PI/9;box(transmission,.101,.031,.041,.004,silver,-.10,y+.254*Math.cos(a),.254*Math.sin(a)).rotation.x=a;
 }
 machinedRing(bearing,.263,y,0,.225,.13,.105,silver).rotation.y=Math.PI/2;
 machinedRing(bearing,.333,y,0,.215,.176,.031,blue).rotation.y=Math.PI/2;
 machinedRing(housing,.662,y,0,.319,.246,.25,dark).rotation.y=Math.PI/2;
 machinedRing(flange,1.012,y,0,.251,.067,.12,silver).rotation.y=Math.PI/2;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  cylinder(flange,.018,.014,dark,1.078,y+.192*Math.cos(a),.192*Math.sin(a)).rotation.z=Math.PI/2;
 }
 for(let i=0;i<12;i++){
  const x=-1.2+i*.116;
  cylinder(hardware,.014,.097,silver,x,.103,.50).rotation.x=Math.PI/2;
  cylinder(hardware,.025,.024,dark,x,.103,.553).rotation.x=Math.PI/2;
 }
 const retainers=group(m,'retainers');
 for(let i=0;i<5;i++) make(retainers,new T.TorusGeometry(.043+i*.004,.008,6,24),i===3?blue:silver,.25+i*.16,.078,.50).rotation.x=Math.PI/2;
 return m;
}

function prototypeHandWorkbench(){
 const m=new T.Group(),base=group(m,'base'),wrist=group(m,'wrist'),palm=group(m,'palm'),digits=group(m,'digits'),joints=group(m,'joints'),thumb=group(m,'thumb'),tendons=group(m,'tendons'),board=group(m,'board'),panel=group(m,'panel'),tools=group(m,'tools');
 const blue=material('#246597',.45,.42),copper=material('#b16c3b',.54,.47);
 box(base,1.13,.095,.77,.021,silver,-.14,.082,.14);
 cylinder(wrist,.207,.434,dark,-.14,.344,.10);cylinder(wrist,.217,.045,blue,-.14,.513,.10);
 wire(palm,[[-.33,.57,.19],[-.55,.83,.19],[-.54,1.245,.18],[.23,1.34,.18],[.31,.94,.18],[.04,.57,.19],[-.33,.57,.19]],.038,silver);
 for(let i=0;i<4;i++){
  const x=-.50+i*.237,d=(i-1.5)*.083,y=1.256+i*.019,l=[.64,.75,.81,.72][i];
  const p=[x,y,.17],q=[x+d*.41,y+l*.39,.21],r=[x+d*.81,y+l*.77,.24],t=[x+d,y+l,.25];
  robotLink(digits,p,q,.088,.092,silver);robotLink(digits,q,r,.073,.078,silver);
  robotLink(digits,r,t,.079,.087,dark,.86);
  for(const v of [p,q,r]) robotPivot(joints,v,.055,.090,blue);
  wire(tendons,[[-.16+(i-1.5)*.063,.54,.235],[x*.78,.88,.221],[x,1.20,.233],[q[0],q[1],.270]],.010,copper);
 }
 robotLink(thumb,[.135,.68,.17],[.453,.894,.23],.119,.112,silver);
 robotPivot(thumb,[.453,.894,.23],.061,.097,blue);
 robotLink(thumb,[.453,.894,.23],[.65,1.21,.26],.099,.10,silver,.72);
 const pcb=new T.Group();pcb.position.set(-1.06,.12,.26);board.add(pcb);
 boardPlate(pcb,.68,.40,[],boardBlue);squareChip(pcb,0,0,.159,4);
 for(const z of [.12,.17,.22]) wire(board,[[-1.01,.21,z],[-.79,.40,z],[-.54,.29,z],[-.29,.33,z]],.013,copper);
 box(panel,.62,.063,.43,.012,white,.91,.09,.26);
 const terminalPosts=group(m,'terminal-posts');
 for(const x of [.72,.92,1.12]) cylinder(terminalPosts,.034,.076,blue,x,.15,.27);
 for(const [x,z,a] of [[.88,.69,.26],[-.91,.75,-.32],[1.02,-.38,.4]]) {
  const t=new T.Group();t.position.set(x,.075,z);t.rotation.y=a;tools.add(t);
  axial(t,.039,.34,blue,-.08);axial(t,.015,.29,bright,.194);
 }
 return m;
}

const dest=new URL('../public/models/hardware/',import.meta.url);
await mkdir(dest,{recursive:true});
for(const [id,create] of [['components-01',resistor],['components-02',capacitor],['components-03',ferriteInductor],['components-04',dualWinding],['components-05',trimmer],['components-06',tactileSwitch],['components-07',relay],['components-08',thumbJoystick],['components-09',touchBreakout],['components-10',diode],['components-11',powerMosfet],['components-12',studThyristor],['components-13',()=>throughHoleIc({shiftRegister:true})],['components-14',()=>throughHoleIc({timer:false})],['components-15',()=>throughHoleIc({timer:true})],['components-16',eepromBreakout],['components-17',adcBreakout],['components-18',serialAdapter],['components-19',linearRegulator],['components-20',redLed],['components-21',characterLcd],['components-22',pinBuzzer],['components-23',coinVibrationMotor],['components-24',ribbonCable],['components-25',breadboard],['components-26',headers],['components-27',solderReel],['components-28',pouchBattery],['components-29',inlineBuck],['components-30',chargeBreakout],['components-31',fuse],['components-32',currentSenseBoard],['components-33',stepper],['components-34',motorDriver],['components-35',wirelessBreakout],['components-36',noirCamera],['components-37',singleTransducer],['components-38',gpsPatch],['components-39',rtcBreakout],['components-40',crickitBoard],['sensors-01',ds18Probe],['sensors-02',aht20Demo],['sensors-03',bmp388Breakout],['sensors-04',scd40Breakout],['sensors-05',pmsa003iBreakout],['sensors-06',guvaUvBreakout],['sensors-07',weatherMeter],['sensors-09',sharpIr],['sensors-10',gravityTof],['sensors-11',tfminiRangefinder],['sensors-12',presenceRadar],['sensors-13',pirMotion],['sensors-14',adxl345],['sensors-15',mpu6050Demo],['sensors-16',bno055],['sensors-17',lis3mdl],['sensors-18',gpsDemo],['sensors-19',as5600Breakout],['sensors-20',tiltSwitch],['sensors-21',cdsCell],['sensors-22',as7341Breakout],['sensors-23',max4466Microphone],['sensors-24',mpr121Breakout],['sensors-25',beamLoadCell],['sensors-26',flexStrip],['sensors-27',soilMoistureDemo],['sensors-28',contactlessLevelKit],['sensors-29',waterFlowMeter],['sensors-30',analogPhKit],['sensors-31',mq2Module],['sensors-32',gravityFlameModule],['sensors-33',gravityPressureTransducer],['sensors-34',ina260PowerMonitor],['sensors-35',us5881HallSwitch],['sensors-36',oxygenSensorKit],['sensors-37',cameraModuleThreeDemo],['sensors-38',mlx90640ThermalArray],['sensors-39',oakDStereoCamera],['sensors-40',pulseSensorKit],['sensors-41',opticalFingerprintReader],['sensors-42',tinyPicoV3Radio],['sensors-43',espC6RadioDevKit],['sensors-44',rfm95LoRaBreakout],['sensors-45',nordicThingy91],['sensors-46',pn532NfcBoard],['sensors-47',canPalTransceiver],['sensors-48',magTagDashboard],['sensors-49',relayOutletModule],['sensors-50',nanoBleSenseRevTwo],['robots-01',fullBodyHumanoid],['robots-02',classroomHumanoid],['robots-03',mobileSocialRobot],['robots-04',bipedalResearchPlatform],['robots-05',manipulationTorso],['robots-06',orangeIndustrialArm],['robots-07',whiteCollaborativeArm],['robots-08',desktopServoArm],['robots-09',blueScaraRobot],['robots-10',deltaPickAndPlace],['robots-11',cartesianGantry],['robots-12',twoWheelTeachingRobot],['robots-13',fourWheelRover],['robots-14',trackedInspectionRobot],['robots-15',mecanumPlatform],['robots-16',warehouseMobileRobot],['robots-17',palletGuidedVehicle],['robots-18',rockerBogieExplorer],['robots-19',inspectionQuadruped],['robots-20',sixLegWalkingPlatform],['robots-21',octopodRobot],['robots-22',serpentineRobot],['robots-23',bioInspiredRobotFish],['robots-24',cameraQuadcopter],['robots-25',surveyVtolAircraft],['robots-26',cagedInspectionRov],['robots-27',yellowSurveyAuv],['robots-28',orbitalServiceArm],['robots-29',precisionAssemblyCell],['robots-30',arcWeldingCell],['robots-31',vehicleCoatingCell],['robots-32',cartonPalletizingCell],['robots-33',warehouseRackCarrier],['robots-34',discCleaningRobot],['robots-35',restaurantDeliveryRobot],['robots-36',indoorPatrolRobot],['robots-37',surgicalManipulatorSuite],['robots-38',standingRehabExoskeleton],['robots-39',fieldMonitoringRover],['robots-40',fruitPickingRover],['robots-41',trackedBricklayingRobot],['robots-42',rubbleInspectionCrawler],['robots-43',cutawaySpurGearbox],['robots-44',fourBarLinkageDemo],['robots-45',mountedShaftCoupling],['robots-46',timingBeltBench],['robots-47',ballScrewLinearStage],['robots-48',coiloverDamper],['robots-49',steeringAxleDemo],['robots-50',cutawayRotaryJoint],['robots-51',cutawayElectricGearmotor],['robots-52',pneumaticCylinderAndValve],['robots-53',parallelLinkGripper],['robots-54',servoFeedbackBench],['robots-55',robotPowerDistribution],['robots-56',softBerryGripper],['robots-57',reconfigurableBlockWalker],['robots-58',tabletopRobotSwarm],['robots-59',miniatureQuadruped],['robots-60',visionGuidedShelfPicker],['anatomy-01',skeletalRobotHead],['anatomy-02',stereoEyeAssembly],['anatomy-03',acousticEarCutaway],['anatomy-04',expressiveFaceMechanism],['anatomy-05',robotNeckGimbal],['anatomy-06',multiAxisShoulderCutaway],['anatomy-07',trussedUpperArm],['anatomy-08',gearedElbowCutaway],['anatomy-09',serviceableForearm],['anatomy-10',threeAxisWrist],['anatomy-11',exposedRoboticPalm],['anatomy-12',articulatedFingerHand],['anatomy-13',oppositionHand],['anatomy-14',tendonFingerBench],['anatomy-15',interchangeableToolRack],['anatomy-16',openedHumanoidTorso],['anatomy-17',segmentedRobotSpine],['anatomy-18',waistHipCutaway],['anatomy-19',routedElectronicsTorso],['anatomy-20',forcedAirCoolingModule],['anatomy-21',twinHipPelvis],['anatomy-22',openTrussThigh],['anatomy-23',encoderKneeAssembly],['anatomy-24',lowerLegAndFootCutaway],['anatomy-25',articulatedAnkleFoot],['anatomy-26',hubMotorWheelCutaway],['anatomy-27',exposedCrawlerDrive],['anatomy-28',independentSteeringSuspension],['anatomy-29',quadrupedUnderside],['anatomy-30',ductedPropulsorCutaway],['anatomy-31',splinedServoActuator],['anatomy-32',threeMotorComparison],['anatomy-33',openPlanetaryTransmission],['anatomy-34',braidedAndSoftMuscle],['anatomy-35',cylinderDrivenManipulator],['anatomy-36',ruggedRobotComputer],['anatomy-37',realTimeTeachingRover],['anatomy-38',twinMotorDriverAssembly],['anatomy-39',torsoNetworkStack],['anatomy-40',visionControlWorkbench],['anatomy-41',exposedJointEncoder],['anatomy-42',balanceSensorRover],['anatomy-43',tactileWristGripper],['anatomy-44',multiSensorRangeHead],['anatomy-45',stereoDepthHead],['anatomy-46',torsoBatteryExchange],['anatomy-47',batteryDockWithBms],['anatomy-48',fusedPowerPanel],['anatomy-49',guardedRobotCell],['anatomy-50',sealedElectronicsCutaway],['anatomy-51',seriesElasticBenchJoint],['anatomy-52',adaptiveGraspHand],['anatomy-53',adjustableStiffnessJoint],['anatomy-54',interchangeableLimbTorso],['anatomy-55',bioInspiredHindLimb],['anatomy-56',completeHumanoidSkeleton],['anatomy-57',mixedAxisTrainingRig],['anatomy-59',explodedRobotJoint],['anatomy-60',prototypeHandWorkbench],['sensors-08',ultrasonic],['boards-01',unoMinima],['boards-02',espH2DevKit],['boards-03',picoTwo],['boards-04',microBit],['boards-05',qtPyS3],['boards-06',trinket85],['boards-07',featherM0],['boards-08',nucleo64],['boards-09',rt1060Kit],['boards-10',c3RustKit],['boards-11',kalam8051],['boards-12',c2000LaunchPad],['boards-13',msp430LaunchPad],['boards-14',nordicDk],['boards-15',s32k144Evb],['boards-16',pi5],['boards-17',beagleboneBlack],['boards-18',lattePandaDelta],['boards-19',computeModuleFour],['boards-20',imxPlusKit],['boards-21',orinNanoKit],['boards-22',hailoHat],['boards-23',tinyFpgaBx],['boards-24',c6748Kit],['boards-25',openCr],['boards-26',pixhawk6c],['boards-27',odriveS1],['boards-28',optaPlc],['boards-29',thingsGateway],['boards-30',floraWearable]]){
  const buffer=await new GLTFExporter().parseAsync(create(),{binary:true});
  await writeFile(new URL(id+'.glb',dest),Buffer.from(buffer));
}
