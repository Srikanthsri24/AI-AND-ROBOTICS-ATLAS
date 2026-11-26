export type ParkingCarPoint=readonly[number,number,number];
export const trafficParkingCars=[{id:'tp-car-1',label:'Violet model car',color:'#8059ad'},{id:'tp-car-2',label:'Teal model car',color:'#3a9a96'},{id:'tp-car-3',label:'Coral model car',color:'#c96c72'},{id:'tp-car-4',label:'Gold model car',color:'#ba9755'}] as const;
export const trafficParkingCarDimensions={halfLength:18.3,halfWidth:10.75,height:17.2,wheelRadius:3.6} as const;
export const trafficParkingCarBays=[-110,-80,-50] as const;
export type ParkingCarPose={position:ParkingCarPoint;yaw:number;distance:number;visible:boolean};
/** A hand-moved teaching model, not a vehicle driven/detected by the Uno.
 * Northbound entry, a 15 mm quarter turn, then west into a reserved bay.
 * Departure follows the clear west/north perimeter and the separate east-side exit. */
export function trafficParkingCarPath(bay:number,direction:'entry'|'exit',progress:number):ParkingCarPose{
 if(!Number.isInteger(bay)||bay<0||bay>2||!Number.isFinite(progress)||progress<0||progress>1||!['entry','exit'].includes(direction))throw new RangeError('Invalid model car route');
 const z=trafficParkingCarBays[bay],r=15,arc=r*Math.PI/2;
 if(direction==='entry'){
  const first=44-(z+r),last=101-70,total=first+arc+last,d=progress*total;
  if(d<=first)return {position:[116,0,44-d],yaw:0,distance:d,visible:true};
  if(d<=first+arc){const a=(d-first)/r;return {position:[101+r*Math.cos(a),0,z+r-r*Math.sin(a)],yaw:a,distance:d,visible:true};}
  return {position:[101-(d-first-arc),0,z],yaw:Math.PI/2,distance:d,visible:true};
 }
 const north=z+112,total=25+3*arc+north+90+171,d=progress*total;let left=d;
 if(left<=25)return {position:[70-left,0,z],yaw:Math.PI/2,distance:d,visible:true};left-=25;
 if(left<=arc){const a=left/r;return {position:[45-r*Math.sin(a),0,z-r+r*Math.cos(a)],yaw:Math.PI/2-a,distance:d,visible:true};}left-=arc;
 if(left<=north)return {position:[30,0,z-r-left],yaw:0,distance:d,visible:true};left-=north;
 if(left<=arc){const a=left/r;return {position:[45-r*Math.cos(a),0,-127-r*Math.sin(a)],yaw:-a,distance:d,visible:true};}left-=arc;
 if(left<=90)return {position:[45+left,0,-142],yaw:-Math.PI/2,distance:d,visible:true};left-=90;
 if(left<=arc){const a=left/r;return {position:[135+r*Math.sin(a),0,-127-r*Math.cos(a)],yaw:-Math.PI/2-a,distance:d,visible:true};}left-=arc;
 return {position:[150,0,-127+left],yaw:-Math.PI,distance:d,visible:true};
}
export function trafficParkingCarParked(bay:number):ParkingCarPose{return trafficParkingCarPath(bay,'entry',1);}
export const trafficParkingVehicleParts=trafficParkingCars.flatMap(car=>[
 {id:car.id+'-body',label:car.label+' · body and chassis',what:'A hand-moved tabletop car demonstrates one physical arrival or departure.',connection:'The Uno neither drives nor detects this model. Press Entry once, wait for the raised barrier, then move one car into a free bay. Only confirm Exit after a departure.'},
 {id:car.id+'-cabin',label:car.label+' · cabin and glazing',what:'The raised roof makes the barrier clearance visible. Windows, pillars and sloped windscreens show which way the car faces.',connection:'Wait until the arm physically clears the roof before entering. A logical open command is not the same as a raised arm if the servo supply or common ground is missing.'},
 ...['front-left','front-right','rear-left','rear-right'].map(wheel=>({id:car.id+'-'+wheel,label:car.label+' · '+wheel.replace('-',' ')+' wheel',what:'A rubber tyre, recessed alloy hub and tread rotate with the model’s illustrated travel.',connection:'These are free-rolling model wheels, not motors connected to the Uno. The 3.6 mm rolling radius sets the animation; turning is an authored tabletop route, not a measured steering model.'})),
]);

/** Painted 22 mm perimeter lane follows the same departure route as the cars. */
export function trafficParkingExitRoad(){const total=trafficParkingCarPath(0,'exit',1).distance,start=(25+15*Math.PI/2+trafficParkingCarBays[0]+112)/total;return [{position:[30,0,-40] as ParkingCarPoint,yaw:0},...Array.from({length:241},(_,n)=>trafficParkingCarPath(0,'exit',start+(1-start)*n/240))];}
