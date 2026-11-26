/** Grove Water Sensor 101020018: 40 × 20 mm body from Seeed's product page.
 * Placement / ears are photo-estimated, not fabrication CAD. The wiki's legacy
 * Eagle download is binary; no exact copper coordinates are claimed here.
 * https://www.seeedstudio.com/Grove-Water-Sensor.html
 * https://wiki.seeedstudio.com/Grove-Water_Sensor/ */
export const rainWaterSensor={width:40,depth:20,thickness:1.6,pullupOhms:1000000,
 holes:[[10,0],[10,20],[40,10]] as const,
 pins:['GND','VCC','NC','SIG'] as const,pinX:4,pinZ:[7,9,11,13] as const,
 electrodes:Array.from({length:11},(_,n)=>({index:n,net:n%2?'signal' as const:'ground' as const,x0:17.5,x1:37.2,z:3.5+n*1.3,width:.6})),
};
export type RainWaterDrop=Readonly<{x:number;z:number;radius:number}>;
/** Ideal geometric contact demonstration only: real response also depends on
 * conductivity, contamination, power and wiring. Tangency alone has no contact area. */
export function rainGeometricBridge(drops:readonly RainWaterDrop[]){
 for(const d of drops)if(![d.x,d.z,d.radius].every(Number.isFinite)||d.radius<=0)throw new RangeError('Water drops need finite coordinates and a positive radius');
 const parents=drops.map((_,n)=>n),root=(n:number):number=>parents[n]===n?n:(parents[n]=root(parents[n]));
 for(let a=0;a<drops.length;a++)for(let b=a+1;b<drops.length;b++)if(Math.hypot(drops[a].x-drops[b].x,drops[a].z-drops[b].z)<drops[a].radius+drops[b].radius)parents[root(b)]=root(a);
 const contacts=new Map<number,Set<string>>();
 drops.forEach((d,n)=>{const r=root(n),nets=contacts.get(r)??new Set<string>();for(const e of rainWaterSensor.electrodes){const x=Math.max(e.x0,Math.min(e.x1,d.x)),z=Math.max(e.z-e.width/2,Math.min(e.z+e.width/2,d.z));if(Math.hypot(d.x-x,d.z-z)<d.radius)nets.add(e.net);}contacts.set(r,nets);});
 return [...contacts.values()].some(nets=>nets.has('signal')&&nets.has('ground'));
}
