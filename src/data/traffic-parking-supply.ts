import {trafficParkingCircuitLayout,type ParkingPoint} from './traffic-parking-circuit-layout';
export const trafficParkingSupplyTerminals=[{polarity:'positive',index:0,x:-9},{polarity:'positive',index:1,x:-3},{polarity:'negative',index:0,x:3},{polarity:'negative',index:1,x:9}] as const;
/** Front-inserted bare conductor seats under the clamp at Z=30 mm.
 * The endpoint is the rear end of the stripped conductor, not the housing face. */
export function trafficParkingSupplyContact(polarity:'positive'|'negative',index:number):ParkingPoint{const p=trafficParkingSupplyTerminals.find(p=>p.polarity===polarity&&p.index===index);if(!p)throw new RangeError('Unknown parking supply terminal');const at=trafficParkingCircuitLayout.supply;return [at[0]+p.x,at[1]+4.17,at[2]+27.5];}
export const trafficParkingSupplyParts=[
 {id:'tp-supply-case',label:'Separate regulated 5 V DC supply',what:'Represents an enclosed low-voltage source sized for the servo load.',connection:'Supplies the red servo lead independently of Uno USB power. Join its negative to Uno ground for the D9 reference. Internal regulation is not exposed or simulated.'},
 {id:'tp-supply-switch',label:'Servo supply · output switch',what:'Enables the illustrated 5 V output without changing Uno logic power.',connection:'Switch off before assembling or changing conductors. The signal lamps can run with this supply off while the barrier stays still.'},
 {id:'tp-supply-display',label:'Servo supply · voltage display',what:'Shows the commanded nominal 5.00 V when this low-voltage source is enabled.',connection:'This is an educational nominal-value indication, not a measured load-voltage, current or stall test.'},
 {id:'tp-supply-terminal-housing',label:'Servo supply · insulated terminal block',what:'Separates two positive outputs from two negative outputs with real front wire openings and top screw bores.',connection:'Only the metal clamps carry current. The green housing and purple work mat are not ground conductors.'},
 ...trafficParkingSupplyTerminals.flatMap(t=>[
  {id:`tp-supply-${t.polarity}-${t.index}`,label:`Supply ${t.polarity==='positive'?'+5 V':'negative / GND'} · terminal ${t.index+1}`,what:'An individual brass terminal barrel receives the stripped wire end.',connection:t.polarity==='positive'?'Both positive terminals share the regulated servo output. Keep them separate from Uno 5 V and every ground contact.':'Both negative terminals share the supply return. One serves the brown servo lead; the other joins the Uno ground bus.'},
  {id:`tp-supply-${t.polarity}-${t.index}-screw`,label:`Supply ${t.polarity==='positive'?'+':'−'}${t.index+1} · clamp screw`,what:'The slotted screw clamps bare conductor against the lower terminal barrel.',connection:'Insert only the stripped conductor into the front opening with power off. Tighten the clamp; keep insulation outside the metal contact and avoid loose strands.'},
 ]),
];
