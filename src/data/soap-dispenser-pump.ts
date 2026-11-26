export const soapPumpStroke=6;
const shoulder=(r0:number,y0:number,y1:number,y2:number,r3:number,y3:number)=>Array.from({length:25},(_,n)=>{const t=n/24,u=1-t;return [u*u*u*r0+3*u*u*t*r0+3*u*t*t*r3+t*t*t*r3,u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3] as const;});
export const soapPumpBottleProfile:readonly(readonly[number,number])[]=[[0,0],[24,0],[28,2],[30,8],[30,162],...shoulder(30,162,177,177,14,188).slice(1),[14,198],[12,198],[12,189],...shoulder(28,161,176,176,12,189).slice(0,-1).reverse(),[28,9],[26,4],[0,4],[0,0]];
export function soapPumpPose(depression:number,flow:'idle'|'press'|'refill'='idle'){
 if(!Number.isFinite(depression)||depression<0||depression>soapPumpStroke||!['idle','press','refill'].includes(flow))throw new RangeError('Invalid soap pump pose');
 return {depression,headY:229-depression,headContactY:234.75-depression,outlet:[0,224-depression,45] as const,pistonBottom:190.1-depression,springTop:189.65-depression,inletLift:flow==='refill'?.6:0,outletLift:flow==='press'?.6:0};
}
export const soapPumpParts=[
 {id:'soap-bottle-shell',label:'Bottle · hollow reservoir',what:'A hollow bottle contains the liquid and supports a threaded pump neck.',connection:'The dip tube reaches near the bottom. The bottle remains fixed while only the pump head and plunger move.'},
 {id:'soap-liquid',label:'Soap · reservoir and delivered droplets',what:'Shows remaining soap, displacement-driven drops and wet marks where they land.',connection:'The inlet draws from the reservoir on return. Wet marks stay with their receiving surface; their size is an illustration rather than a calibrated liquid volume.'},
 {id:'soap-cap',label:'Pump · threaded closure',what:'Secures the pump cartridge to the bottle neck and guides the sliding stem.',connection:'Its central bore leaves the stem free to travel. The cap stays fixed when the head is pressed.'},
 {id:'soap-pump-housing',label:'Pump · fixed chamber',what:'Holds the piston, return spring and inlet valve.',connection:'The lower inlet joins the dip tube. The upper guide supports the moving hollow stem.'},
 {id:'soap-dip-tube',label:'Pump · hollow dip tube',what:'Carries liquid from near the reservoir floor to the inlet.',connection:'Its open intake stays above the bottle bottom. Its upper end fits the chamber inlet; it is not an electrical wire.'},
 {id:'soap-inlet-seat',label:'Pump · inlet valve seat',what:'Provides a seat for the lower check ball.',connection:'During a press the inlet closes to oppose backflow. During refill the ball lifts so liquid can enter the chamber.'},
 {id:'soap-inlet-ball',label:'Pump · inlet check ball',what:'Illustrates the one-way inlet valve.',connection:'The refill illustration raises it from its seat; it rests closed during pressing. Motion is explanatory, not a pressure calculation.'},
 {id:'soap-spring-seat',label:'Pump · lower spring support',what:'Supports the lower end of the return spring.',connection:'The central opening leaves a passage around the inlet valve. It remains fixed to the cartridge.'},
 {id:'soap-return-spring',label:'Pump · return spring',what:'Compresses with the plunger and extends as the head returns.',connection:'Its lower end bears on the fixed support; its upper end meets the underside of the piston seal. No measured spring force is implied.'},
 {id:'soap-stem',label:'Pump · hollow sliding stem',what:'Transfers head movement to the piston while providing the outlet passage.',connection:'It slides through the closure and joins the hollow head. The upper check valve permits illustrated outward flow during a press.'},
 {id:'soap-piston-seal',label:'Pump · sliding piston seal',what:'Moves down inside the fixed chamber with the hollow stem.',connection:'Its outer lip meets the chamber wall. The return spring presses against its underside.'},
 {id:'soap-outlet-seat',label:'Pump · outlet valve seat',what:'Supports the upper check ball inside the hollow stem.',connection:'The outlet closes during refill and opens during the illustrated press stroke.'},
 {id:'soap-outlet-ball',label:'Pump · outlet check ball',what:'Illustrates the second one-way valve.',connection:'It lifts during pressing to open the stem passage. The two valves move in opposite phases.'},
 {id:'soap-pump-head',label:'Pump · moving press head',what:'A hollow head receives force from the servo follower and moves with the stem.',connection:'A vertical stem opening leads into its cavity, then through the real side bore into the nozzle.'},
 {id:'soap-nozzle',label:'Pump · open curved nozzle',what:'A hollow tube turns the outlet down toward the catch tray.',connection:'Its inner passage meets the head bore. The open tip moves down with the pump head; a solid decorative pipe would block this path.'},
] as const;

export function soapPumpLiquidLevel(fill:number){if(!Number.isFinite(fill)||fill<0||fill>1)throw new RangeError('Invalid illustrated soap fill');return fill===0?null:4.2+153.8*fill;}
/** A short left-pointing 12 mm horn drives an offset roller over the head.
 * This contact construction maps the sketch's 35°/65° commands to 0/6 mm.
 * It defines geometry, not available servo torque or delivered liquid volume. */
export function soapPumpFollower(angle:number){if(!Number.isFinite(angle)||angle<35||angle>65)throw new RangeError('Soap follower angle must be 35–65°');const a=(angle-35)*Math.PI/180,depression=Math.round(12*Math.sin(a)*1e10)/1e10,x=12-12*Math.cos(a);return {angle:a,depression,pivot:[12,237.25,-18] as const,roller:[x,237.25-depression,0] as const,headContact:[x,234.75-depression,0] as const,rollerRotation:-x/2.5};}
