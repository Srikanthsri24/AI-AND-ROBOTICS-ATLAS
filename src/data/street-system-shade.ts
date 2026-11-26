/** Opaque 24 × 18 mm card slides across a 6.4 mm circular sensor face. */
export const streetShadeGeometry={sensorX:-150,sensorZ:-90,radius:3.2,width:24,depth:18,height:36,thickness:.8};
export function streetShadePose(travel:number){
 if(!Number.isFinite(travel)||travel<0||travel>100)throw new RangeError('Shade travel must be 0–100.');
 const g=streetShadeGeometry,edge=g.sensorX-g.radius+2*g.radius*travel/100;
 return {x:edge-g.width/2,y:g.height,z:g.sensorZ,rightEdge:edge};
}
export function streetShadeCoverage(travel:number){
 const p=streetShadePose(travel),t=Math.max(-1,Math.min(1,(p.rightEdge-streetShadeGeometry.sensorX)/streetShadeGeometry.radius));
 // Exact circular segment area, normalized to percent of the sensing face.
 return Math.max(0,Math.min(100,100*(.5+(Math.asin(t)+t*Math.sqrt(1-t*t))/Math.PI)));
}
