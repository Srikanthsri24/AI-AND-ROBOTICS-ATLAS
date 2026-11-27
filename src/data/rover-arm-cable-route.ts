import{CatmullRomCurve3,Vector3}from'three';
/** Authored extended servo loom: 320 mm servo lead plus 500 mm extension.
 * 820 mm is the complete route centreline, including connector bodies.
 * Two service-loop turns store slack rather than stretching conductors. */
export const raArmLoomLength=820;
export function raArmCableRoute(start:Vector3,exit:Vector3,guides:readonly Vector3[],end:Vector3,channel:number){
 if(!Number.isInteger(channel)||channel<0||channel>5)throw new RangeError('Arm cable channel');
 const make=(radius:number,divisions=128)=>{const points=[start.clone(),exit.clone(),...guides.map(p=>p.clone())];
  for(let n=0;n<=24;n++){const a=n/24*Math.PI*4;points.push(new Vector3(-75+Math.cos(a)*radius,7+channel*4+n/24*4,-76+Math.sin(a)*radius));}
  points.push(new Vector3(end.x,30+channel*2,end.z),end.clone());
  const c=new CatmullRomCurve3(points,false,'centripetal');c.arcLengthDivisions=divisions;return c;
 };
 let low=1,high=110;const shortest=make(low);if(shortest.getLength()>raArmLoomLength)throw new RangeError('Arm pose exceeds loom reach');
 for(let n=0;n<18;n++){const mid=(low+high)/2;if(make(mid).getLength()<raArmLoomLength)low=mid;else high=mid;}
 let radius=(low+high)/2;
 for(let n=0;n<2;n++){const measured=make(radius,1024).getLength(),slope=(make(radius+.1,256).getLength()-make(radius-.1,256).getLength())/.2;radius-=(measured-raArmLoomLength)/slope;}
 return make(radius,1024);
}
export function raArmCableParts(){return Array.from({length:6},(_,ch)=>[
 {id:`ra-arm-cable-${ch}-ground`,label:`Channel ${ch} · brown ground lead`,description:'Returns servo current through the brown conductor to the driver ground row. It travels with the case, with service-loop slack for the joints.'},
 {id:`ra-arm-cable-${ch}-power`,label:`Channel ${ch} · red servo power lead`,description:'Connects the separate actuator V+ rail to this servo. Do not connect this wire to Uno 5V.'},
 {id:`ra-arm-cable-${ch}-signal`,label:`Channel ${ch} · orange pulse lead`,description:'Carries only this channel’s PWM command from its signal pin to the servo input.'},
 {id:`ra-arm-cable-${ch}-extension`,label:`Channel ${ch} · extension coupling`,description:'A three-wire extension joins the nominal 320 mm servo lead to the base-mounted driver. Keep brown, red and orange in the same order.'},
 {id:`ra-arm-cable-${ch}-plug`,label:`Channel ${ch} · driver plug`,description:'The three-contact plug seats over this channel’s signal, V+ and ground pins. Its wire order must match the labeled header rows.'},
 ]).flat();}
