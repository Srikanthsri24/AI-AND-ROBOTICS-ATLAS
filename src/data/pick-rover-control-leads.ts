import{CatmullRomCurve3,Vector3}from'three';import{pickUnoPin,pickDriverPin}from'./pick-rover-electronics';
/** Rendered seat clearance avoids the existing socket's padded outer face;
 * a short exposed core joins each plug throat to its insulation. */
export const pickControlGeometry={unoSeatClearance:.001,coreExit:.05};
export const pickControlLinks=[
 {id:'pwma',uno:'D5',driver:'PWMA',color:'#4685c9',why:'Carries left-wheel PWM speed requests from Uno D5 to the motor driver. It supplies a control signal, not wheel-motor current.'},
 {id:'pwmb',uno:'D6',driver:'PWMB',color:'#399b82',why:'Carries right-wheel PWM speed requests from Uno D6. A separate channel lets a wiring fault affect one wheel independently.'},
 {id:'ain1',uno:'D4',driver:'AIN1',color:'#d89436',why:'The first left-bridge direction input. The sketch sets it together with AIN2 to select the left motor polarity.'},
 {id:'ain2',uno:'D7',driver:'AIN2',color:'#d2b344',why:'The second left-bridge direction input. Both direction inputs must follow the exact guide wiring.'},
 {id:'bin1',uno:'D8',driver:'BIN1',color:'#8e61b7',why:'The first right-bridge direction input. It is independent from the left motor channel.'},
 {id:'bin2',uno:'D12',driver:'BIN2',color:'#c06999',why:'The second right-bridge direction input. In this sketch D12 is BIN2; D2 handles standby.'},
 {id:'standby',uno:'D2',driver:'STBY',color:'#459fae',why:'Connects the Uno standby command to both bridges. This carrier also has a pull-up, so removing this wire does not guarantee that the bridges are disabled.'},
]as const;
export function pickControlRoute(index:number){const link=pickControlLinks[index];if(!link)throw new RangeError('Unknown control lead');const a=pickUnoPin(link.uno),b=pickDriverPin(link.driver),start=new Vector3(a[0],a[1]+pickControlGeometry.unoSeatClearance+8+pickControlGeometry.coreExit,a[2]),end=new Vector3(b[0],b[1]+5.25+pickControlGeometry.coreExit,b[2]),height=74+index*2.2;return{link,uno:a,driver:b,start,end,curve:new CatmullRomCurve3([start,new Vector3(start.x,start.y+6,start.z),new Vector3(start.x,height,start.z),new Vector3(start.x,height,90),new Vector3(23,height,end.z),new Vector3(end.x,height,end.z),new Vector3(end.x,end.y+8,end.z),end],false,'catmullrom',.12)};}
export const pickControlParts=pickControlLinks.flatMap(link=>(['wire','uno','driver']as const).map(end=>({id:`pick-control-${link.id}-${end}`,label:`${link.uno} → ${link.driver} · ${end==='wire'?'insulated signal lead':end==='uno'?'Uno male plug':'driver female plug'}`,description:link.why+(end==='uno'?` The square male pin enters the actual ${link.uno} female socket.`:end==='driver'?` Two spring strips seat against the actual ${link.driver} header pin.`:' The elevated route keeps this conductor above the board components.')})));
