import type{RaArmWiring}from'./rover-arm-world';
/** Virtual MG996R teaching bench setting, not a load/current simulation.
 * The physical kit's supply voltage and peak current must be matched to it. */
export type RaSupplyPolarity='positive'|'negative';
export type RaSupplyLead={source:number;terminal:number;tight:boolean};
export type RaArmSupply={on:boolean;voltage:number;positive:RaSupplyLead;negative:RaSupplyLead};
export const raArmSupplyInitial=():RaArmSupply=>({on:false,voltage:6,positive:{source:12,terminal:12,tight:false},negative:{source:12,terminal:12,tight:false}});
export function raArmSupplyReady(s:RaArmSupply){return s.voltage>=4.8&&s.voltage<=6.6&&(['positive','negative']as const).every(p=>s[p].source===0&&s[p].terminal===0&&s[p].tight);}
export function raArmSupplyEnable(s:RaArmSupply,on:boolean):RaArmSupply{if(on&&!raArmSupplyReady(s))throw new Error('Seat and clamp both supply leads at the matched voltage before enabling output');return{...s,on};}
export function raArmSupplyVoltage(s:RaArmSupply,voltage:number):RaArmSupply{if(s.on)throw new Error('Switch output off before changing the setting');if(!Number.isFinite(voltage)||voltage<0||voltage>12)throw new RangeError('Invalid virtual supply voltage');return{...s,voltage};}
export function raArmSupplyMove(s:RaArmSupply,p:RaSupplyPolarity,end:'source'|'terminal',withdrawal:number):RaArmSupply{if(s.on)throw new Error('Switch output off before moving a lead');if(!Number.isFinite(withdrawal)||withdrawal<0||withdrawal>12)throw new RangeError('Invalid supply lead travel');if(end==='terminal'&&s[p].tight)throw new Error('Release the clamp before moving this lead');return{...s,[p]:{...s[p],[end]:withdrawal}};}
export function raArmSupplyClamp(s:RaArmSupply,p:RaSupplyPolarity,tight:boolean):RaArmSupply{if(s.on)throw new Error('Switch output off before changing a clamp');if(tight&&s[p].terminal!==0)throw new Error('Insert this conductor before tightening');return{...s,[p]:{...s[p],tight}};}
export function raArmSupplyWiring(w:RaArmWiring,s:RaArmSupply):RaArmWiring{return{...w,servoSupply:s.on&&raArmSupplyReady(s)};}
export const raArmSupplyAt=[45,0,-120]as const;
export const raArmSupplyParts=[
 {id:'ra-supply-case',label:'Matched external actuator supply',description:'An enclosed regulated DC source supplies the servo V+ rail independently of USB. Match the physical kit voltage and peak-current requirement; this virtual source does not predict load current.'},
 {id:'ra-supply-display',label:'Actuator supply setting',description:'Shows the virtual output setting. This MG996R-style teaching bench uses 6.00 V; the output remains off while making connections.'},
 {id:'ra-supply-switch',label:'Actuator output switch',description:'Enables the actuator rail only after both source plugs and both clamped driver ends are ready. It does not switch the Uno USB logic supply.'},
 ...(['positive','negative']as const).flatMap(p=>[
 {id:`ra-supply-${p}-socket`,label:(p==='positive'?'Red positive':'Black return')+' supply socket',description:p==='positive'?'Feeds the driver V+ input through the red lead.':'Returns actuator current from the driver GND terminal; the driver also shares a reference with Uno ground.'},
 {id:`ra-supply-${p}-plug`,label:p+' source plug',description:'The metal pin seats in the corresponding supply socket. Move it only with output switched off.'},
 {id:`ra-supply-${p}-wire`,label:p+' actuator lead',description:'An insulated lead connects the separate DC source to the correct driver terminal. This wire does not enter the Uno 5V socket.'},
 {id:`ra-supply-${p}-tip`,label:p+' stripped conductor',description:'The short bare end enters the open driver clamp. The insulation reaches the housing, with no bare conductor left outside. Tighten only after it is fully inserted.'},
 ]),
];
