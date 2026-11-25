import{binOnLid,type BinPoint}from'./smart-bin-sensor';
export const binLidPassages=[-58,-52,-46,-40].map((x,lane)=>({x,z:-100,lane,inner:.9,barrel:2,hole:2.05,flange:2.7}));
const add=(a:BinPoint,b:BinPoint):BinPoint=>a.map((v,k)=>v+b[k]) as BinPoint,scale=(a:BinPoint,n:number):BinPoint=>a.map(v=>v*n) as BinPoint;
export function binBezier(points:BinPoint[],t:number):BinPoint{const u=1-t;return[0,1,2].map(k=>u*u*u*points[0][k]+3*u*u*t*points[1][k]+3*u*t*t*points[2][k]+t*t*t*points[3][k]) as BinPoint;}
export function binLoopLength(points:BinPoint[],segments=256){let length=0,last=points[0];for(let n=1;n<=segments;n++){const p=binBezier(points,n/segments);length+=Math.hypot(...p.map((v,k)=>v-last[k]));last=p;}return length;}
/** Four separate, fixed nominal 180 mm service loops. Control distance is
 * solved from arc length, rather than stretching a cable as the lid opens.
 * This is an authored flex shape, not a cable stiffness / fatigue simulation.
 */
export function binHingeLoop(lane:number,degrees:number){const passage=binLidPassages[lane];if(!passage)throw Error('Unknown sensor cable lane');const t=degrees*Math.PI/180,p0=binOnLid([passage.x,574,-100],degrees),p3:BinPoint=[passage.x,535,-174],normal:BinPoint=[0,Math.cos(t),-Math.sin(t)],make=(h:number):BinPoint[]=>[p0,add(p0,scale(normal,h)),add(p3,[0,h,0]),p3];let low=0,high=400;for(let n=0;n<22;n++){const mid=(low+high)/2;if(binLoopLength(make(mid))<180)low=mid;else high=mid;}return make((low+high)/2);}
export const binLoomParts=[
 ['bin-lid-grommets','Four protected lid passages','Each sensor lead crosses the real lid through its own bored rubber grommet.','The open passages protect the insulation at the plastic edge. They are inside the gasket line, away from the hinge pinch point.'],
 ['bin-lid-wire-guides','Moving cable-guide collars','Bored collars above the lid constrain the four outgoing leads before their flexible service loops.','The collars move with the lid and leave the insulated wire free to flex behind the hinge.'],
 ['bin-rear-wire-guides','Fixed rear cable-guide bracket','A bonded rear bracket holds the fixed end of each separate service loop outside the bin.','Sensor leads descend behind the bin towards the dry controller. Keep the loops clear of moving hinge sleeves.'],
 ...['VCC','TRIG','ECHO','GND'].map((name,lane)=>['bin-wire-sonar-'+name.toLowerCase(),`Flexible sensor ${name} lead`, 'An insulated lead passes from its actual sensor header through a separate protected lid passage and a fixed-length illustrated hinge loop.',`${name==='VCC'?'Uno 5 V':name==='GND'?'Uno ground':name==='TRIG'?'Uno D2':'Uno D3'} connects to sensor ${name}. The rear lead seats in its actual dry-bench shield socket or sensor power / ground tie.`]),
] as const;

export function binInnerWirePoints(lane:number):BinPoint[]{const x=binLidPassages[lane]?.x,pin=[-3.81,-1.27,1.27,3.81][lane];if(x===undefined)throw Error('Unknown sensor cable lane');return[[pin,534,-17.5],[pin,534,-28],[x,545,-60],[x,546,-88],[x,548,-100],[x,552,-100],[x,562,-100],[x,574,-100]];}
