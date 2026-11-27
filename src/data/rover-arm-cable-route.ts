import{CatmullRomCurve3,Vector3}from'three';
/** Authored extended servo loom: 320 mm servo lead plus 1000 mm extension.
 * 1320 mm is the complete route centreline, including connector bodies.
 * Two broad service loops store slack rather than stretching conductors. */
export const raArmLoomLength=1320;
export function raArmChannelRise(channel:number){return channel*32+(channel===5?12:0);}
const caseGuides:readonly(readonly[number,number,number])[]=[[46,-25,-18],[56,-55,26],[66,-80,34],[76,-100,42],[46,10,-140],[96,-25,40]];
export function raArmCaseGuide(channel:number){if(!Number.isInteger(channel)||channel<0||channel>5)throw new RangeError('Arm cable channel');return new Vector3(...caseGuides[channel]);}
/** Fixed guide coordinates relative to the stationary base-servo frame. */
export function raArmStorageGuide(channel:number){if(!Number.isInteger(channel)||channel<0||channel>5)throw new RangeError('Arm cable channel');return new Vector3([46,56,66,76,86,-80][channel],channel?raArmChannelRise(channel)-41:-25,[-18,-26,-110,-120,-145,40][channel]);}
export function raArmCableRoute(start:Vector3,exit:Vector3,guides:readonly Vector3[],end:Vector3,channel:number){
 if(!Number.isInteger(channel)||channel<0||channel>5)throw new RangeError('Arm cable channel');
 const rise=raArmChannelRise(channel);
 const make=(radius:number,divisions=128)=>{const points=[start.clone(),exit.clone(),...guides.map(p=>p.clone())];
  // Stagger the slack coils vertically so extension housings do not occupy
  // neighboring channel routes. Wire-pair clearance is audited separately.
  for(let n=0;n<=24;n++){const a=n/24*Math.PI*4*(channel===5?-1:1);points.push(new Vector3(-130+Math.cos(a)*radius,7+rise+n/24*16,-90+Math.sin(a)*radius));}
  const level=Math.max(90+channel*16,33+rise);
  points.push(new Vector3(-30-channel*6,23+rise,-90),new Vector3(-30-channel*6,level,-90),new Vector3(-30-channel*6,level,36+channel*4),new Vector3(-150,level,36+channel*4),new Vector3(-150,level,16+channel*4),new Vector3(end.x,level,16+channel*4),new Vector3(end.x,level-20,16+channel*4),new Vector3(end.x,60,end.z),new Vector3(end.x,45,end.z),end.clone());
  const c=new CatmullRomCurve3(points,false,'centripetal');c.arcLengthDivisions=divisions;return c;
 };
 let low=1,high=110;const shortest=make(low);if(shortest.getLength()>raArmLoomLength)throw new RangeError('Arm channel '+channel+' pose exceeds loom reach');
 for(let n=0;n<18;n++){const mid=(low+high)/2;if(make(mid).getLength()<raArmLoomLength)low=mid;else high=mid;}
 let radius=(low+high)/2;
 for(let n=0;n<2;n++){const measured=make(radius,1024).getLength(),slope=(make(radius+.1,256).getLength()-make(radius-.1,256).getLength())/.2;radius-=(measured-raArmLoomLength)/slope;}
 return make(radius,1024);
}
/** Radial ribbon orientation keeps conductors ordered around the slack coil.
 * Arc fractions are measured from the same rendered centreline curve. A caller
 * may share its 4096-division table between constraints for an unchanged route. */
export function raArmCoilRibbonConstraints(route:CatmullRomCurve3,arcLengths4096?:readonly number[]){const lengths=arcLengths4096??route.getLengths(4096),total=lengths[lengths.length-1],first=route.points.length-35,last=route.points.length-11;return Array.from({length:last-first+1},(_,n)=>{const at=(first+n)/(route.points.length-1)*4096,lo=Math.min(4095,Math.floor(at)),t=(lengths[lo]+(lengths[lo+1]-lengths[lo])*(at-lo))/total,point=route.getPointAt(t);return{t,normal:new Vector3(point.x+130,0,point.z+90).normalize()};});}
/** Keep ribbon rows parallel to the header throughout the vertical approach. */
export function raArmHeaderRibbonConstraints(route:CatmullRomCurve3,normal:Vector3,arcLengths4096?:readonly number[]){const lengths=arcLengths4096??route.getLengths(4096),total=lengths[4096];return[5,4,3,2].map(offset=>route.points.length-offset).map(index=>{const at=index/(route.points.length-1)*4096,lo=Math.min(4095,Math.floor(at));return{t:(lengths[lo]+(lengths[lo+1]-lengths[lo])*(at-lo))/total,normal:normal.clone()};});}
export function raArmCableParts(){return Array.from({length:6},(_,ch)=>[
 {id:`ra-arm-cable-${ch}-ground`,label:`Channel ${ch} · brown ground lead`,description:'Returns servo current through the brown conductor to the driver ground row. It travels with the case, with service-loop slack for the joints.'},
 {id:`ra-arm-cable-${ch}-power`,label:`Channel ${ch} · red servo power lead`,description:'Connects the separate actuator V+ rail to this servo. Do not connect this wire to Uno 5V.'},
 {id:`ra-arm-cable-${ch}-signal`,label:`Channel ${ch} · orange pulse lead`,description:'Carries only this channel’s PWM command from its signal pin to the servo input.'},
 {id:`ra-arm-cable-${ch}-extension`,label:`Channel ${ch} · extension coupling`,description:'A three-wire extension joins the nominal 320 mm servo lead to the base-mounted driver. Keep brown, red and orange in the same order.'},
 {id:`ra-arm-cable-${ch}-plug`,label:`Channel ${ch} · driver plug`,description:'The three-contact plug seats over this channel’s signal, V+ and ground pins. Its wire order must match the labeled header rows.'},
 ]).flat();}
