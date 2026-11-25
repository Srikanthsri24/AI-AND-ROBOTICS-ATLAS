import type {EmergencyPoint} from './emergency-corridor';
export const emergencyBoard={at:[30,0,110] as EmergencyPoint,width:83,depth:55,top:10,pitch:2.54,columns:30};
export type EmergencyRail='front-positive'|'front-ground'|'rear-positive'|'rear-ground';
export const emergencyRails=[
 {key:'front-positive' as const,z:20,label:'5 V',color:'#bd6571',used:true},
 {key:'front-ground' as const,z:24,label:'GND',color:'#6286a9',used:true},
 {key:'rear-positive' as const,z:-20,label:'+ unused',color:'#bd6571',used:false},
 {key:'rear-ground' as const,z:-24,label:'− unused',color:'#6286a9',used:false},
];
export function emergencyBoardHole(column:number,bank:-1|1,row:number):EmergencyPoint{if(!Number.isInteger(column)||column<0||column>=30||![-1,1].includes(bank)||!Number.isInteger(row)||row<0||row>4)throw Error('Unknown emergency breadboard tie contact');return[30+(column-14.5)*2.54,10,110+(bank<0?-3.81-(4-row)*2.54:3.81+row*2.54)];}
export function emergencyRailHole(key:EmergencyRail,slot:number):EmergencyPoint{const rail=emergencyRails.find(r=>r.key===key);if(!rail||!Number.isInteger(slot)||slot<0||slot>=25)throw Error('Unknown emergency breadboard rail contact');return[30-35.56+(slot+Math.floor(slot/5))*2.54,10,110+rail.z];}
export const emergencyResistors=[
 {key:'path-1',pin:'D5',ohms:220,a:0,b:4},
 {key:'path-2',pin:'D6',ohms:220,a:5,b:9},
 {key:'path-3',pin:'D7',ohms:220,a:10,b:14},
 {key:'beacon',pin:'D8',ohms:220,a:15,b:19},
 {key:'piezo',pin:'D9',ohms:220,a:20,b:24},
 {key:'divider',pin:'A0',ohms:10000,a:26,b:29},
] as const;
export const emergencyButtons=[{key:'alarm',pin:'D2',column:2,label:'ALARM',color:'#c66c75'},{key:'reset',pin:'D3',column:12,label:'RESET',color:'#a78c56'}] as const;
export function emergencyButtonPins(key:typeof emergencyButtons[number]['key']){const b=emergencyButtons.find(b=>b.key===key);if(!b)throw Error('Unknown emergency button');return([-1,1]as const).flatMap(bank=>[-1,1].map(side=>({column:b.column+side*1,bank,row:bank<0?4:0})));}
export const emergencyBoardParts=[
 ['emergency-board-shell','400-contact breadboard shell','A real 30-column contact grid has 300 main holes and 100 power-bus holes around a recessed centre trench.','Each A–E column is one five-contact tie. Each F–J column is a different tie. Red/blue edge markings never join separate rails by themselves.'],
 ['emergency-board-ties','Independent five-contact clip strips','Sixty separate metal strips join five holes each, with visible contact mouths and spring clips inside the shell.','The centre trench separates the two tactile contact sides. The resistor ends occupy different columns so a resistor is never bypassed by a tie strip.'],
 ...emergencyRails.map(r=>[`emergency-rail-${r.key}`,`${r.label} · ${r.key.startsWith('front')?'front':'rear'} contact bus`,'One continuous metal bus joins its own 25 sockets, including the gaps between printed five-hole groups.',r.used?(r.key==='front-positive'?'Uno 5 V feeds this bus and the photoresistor supply lead.':'Uno GND, the two button returns, the 10 kΩ return and all five load returns join this bus.'):'This rail stays unused and electrically separate in this project. Its printed colour does not supply voltage.']),
 ...emergencyResistors.flatMap(r=>[
  [`emergency-${r.key}-resistor-body`,`${r.pin} · ${r.ohms===220?'220 Ω limiter':'10 kΩ divider resistor'}`,r.ohms===220?'A separate red/red/brown/gold resistor limits its own branch current.':'A brown/black/orange/gold resistor returns the A0 divider junction to ground.',r.ohms===220?`${r.pin} → column ${r.a+1} → this resistor → column ${r.b+1} → its own LED anode or piezo signal.`:'The photoresistor signal and Uno A0 share column 27. This resistor joins column 27 to the separate grounded column 30.'],
  [`emergency-${r.key}-resistor-leads`,`${r.pin} resistor · two separate inserted leads`,'Both individually bent metal leads enter different physical holes on the negative main bank.',`The tips occupy A${r.a+1} and A${r.b+1}. The command jumper and outgoing lead must use other holes of those respective ties.`],
 ]),
 ...emergencyButtons.flatMap(b=>[
  [`emergency-${b.key}-body`,`${b.label} · tactile housing`,'The momentary switch spans the centre trench; each internally joined contact pair stays on its own side.',b.key==='alarm'?'D2 INPUT_PULLUP becomes LOW immediately when ALARM joins its signal pair to the ground pair.':'D3 INPUT_PULLUP qualifies a new LOW state for 30 ms. Reset only clears the latch when ALARM is not held.'],
  [`emergency-${b.key}-cover`,`${b.label} · open retaining cover`,'The metal retaining frame has a real hole around the moving stem.','This is a mechanical retainer, not a signal terminal. The two actual contact pairs are separately selectable.'],
  [`emergency-${b.key}-cap`,`${b.label} · moving cap`,'The cap and stem depress 0.65 mm when held and return on release.',b.key==='alarm'?'ALARM captures the pulse epoch only when first latched. Holding it must not keep restarting the blink.':'A held RESET does not repeat. If its press was consumed while ALARM was held, release and press it again.'],
  [`emergency-${b.key}-signal`,`${b.label} · ${b.pin} contact pair`,'These two same-side legs are internally joined but are isolated from the opposite pair until pressed.',`${b.pin} joins the negative-bank column ${b.column} tie; the second leg is column ${b.column+2}. Keep both separate from the resistor branches.`],
  [`emergency-${b.key}-ground`,`${b.label} · ground contact pair`,'The other two internally joined legs enter the positive main bank across the centre trench.','A separate jumper returns this pair to the front GND bus. Sharing a column number across the trench does not already ground the signal.'],
 ]),
];
/** Reserved physical insertion holes; subsequent wires must use these exact distinct sockets. */
export const emergencyBoardWireEnds=[
 ...emergencyResistors.filter(r=>r.ohms===220).flatMap(r=>[{name:r.pin+' command',at:emergencyBoardHole(r.a,-1,1)},{name:r.key+' outgoing',at:emergencyBoardHole(r.b,-1,4)}]),
 {name:'LDR signal junction',at:emergencyBoardHole(26,-1,4)},{name:'Uno A0 junction',at:emergencyBoardHole(26,-1,1)},{name:'Divider ground return',at:emergencyBoardHole(29,-1,4)},
 ...emergencyButtons.flatMap(b=>[{name:b.pin+' input',at:emergencyBoardHole(b.column-1,-1,2)},{name:b.key+' ground return',at:emergencyBoardHole(b.column-1,1,4)}]),
 ...['Uno 5 V','LDR supply'].map((name,i)=>({name,at:emergencyRailHole('front-positive',i)})),
 ...['Uno GND','Alarm return','Reset return','Divider return','Path 1 cathode','Path 2 cathode','Path 3 cathode','Red cathode','Piezo return'].map((name,i)=>({name,at:emergencyRailHole('front-ground',i)})),
];
