import {raArmMechanicalFits,type RaArmAssembly} from './rover-arm-assembly';
import {raArmWiringInitial,type RaArmWiring} from './rover-arm-world';
import {raArmSupplyInitial,raArmSupplyEnable,type RaArmSupply} from './rover-arm-supply';
import {raArmJoints} from './rover-arm-mechanics';
export type RaArmConnectionStep={id:string;part:string;title:string;instruction:string;why:string;check:string};
/** Final assembled-arm wiring, after separate unloaded calibration. Not the
 * rover wiring or the temporary calibration-bench topology. */
export const raArmConnectionSteps:readonly RaArmConnectionStep[]=[
 ...[
 ['ground','GND → GND','GND-P1','GND','Establishes a common reference for I²C commands.'],
 ['vcc','5V → VCC','5V','VCC','Powers driver logic independently of the servo V+ rail.'],
 ['sda','A4 → SDA','A4','SDA','Carries channel settings from Uno to the PWM controller.'],
 ['scl','A5 → SCL','A5','SCL','Clocks each I²C transfer; data alone cannot deliver a command.'],
 ].map(([key,label,uno,pca,why])=>({id:'logic-'+key,part:'ra-arm-logic-'+key+'-wire',title:label,instruction:`With both sources off, connect Uno ${uno} to driver ${pca}. Check the printed socket labels rather than wire colour alone.`,why,check:`Both connector ends are seated in ${uno} and ${pca}; no adjacent socket is used.`})),
 ...raArmJoints.map((j,ch)=>({id:'servo-'+ch,part:`ra-arm-cable-${ch}-plug`,title:`Channel ${ch} · ${j.label}`,instruction:`Connect this joint's three-wire extension to output ${ch}. Brown goes to GND, red to V+, orange to signal. Align all three contacts; do not offset the housing by one pin.`,why:'The signal sets position while the separate V+ and return conductors carry actuator power.',check:`Trace the lead from ${j.label} to channel ${ch}; verify polarity against the driver row labels.`})),
 ...(['positive','negative']as const).flatMap(p=>[
 {id:p+'-source',part:`ra-supply-${p}-plug`,title:`Seat ${p} source plug`,instruction:`Keep output off. Seat the ${p==='positive'?'red plug in the positive':'black plug in the return'} socket.`,why:'This lead belongs to the independent actuator source, not the Uno 5V rail.',check:'The plug is fully seated in its matching source socket.'},
 {id:p+'-terminal',part:`ra-supply-${p}-tip`,title:`Insert ${p} driver conductor`,instruction:`With the clamp released, insert the short stripped end into driver ${p==='positive'?'V+':'GND'}. The insulation must reach inside the entry.`,why:'The metal contact must clamp bare copper, with no exposed conductor outside the housing.',check:'Correct terminal, complete insertion and no loose exposed strands.'},
 {id:p+'-clamp',part:p==='positive'?'ra-pca-terminal-positive':'ra-pca-terminal-return',title:`Retain ${p} conductor`,instruction:'Tighten the pressure clamp onto the inserted conductor. Keep the source output off.',why:'The pressure plate retains the conductor against the terminal contact floor.',check:'The conductor stays seated and the insulation remains at the entry.'},
 ]),
 {id:'usb-host',part:'ra-arm-usb-a-grip',title:'Seat the computer end',instruction:'Keep the virtual host off and insert the Type-A end in its receptacle.',why:'USB provides the upload/serial path and controller logic power.',check:'The connector shell is aligned and fully seated.'},
 {id:'usb-uno',part:'ra-arm-usb-b-grip',title:'Seat the Uno end',instruction:'Insert the Type-B end in the Uno USB socket. Keep the source output off.',why:'The controller can start only after its USB path is complete. USB does not supply the servo V+ rail.',check:'Both USB ends are seated; A2 remains open to select arm mode.'},
];
export type RaArmConnections={completed:readonly string[];active:string|null;progress:number;controllerOn:boolean;actuatorsOn:boolean};
export const raArmConnectionsInitial=():RaArmConnections=>({completed:[],active:null,progress:0,controllerOn:false,actuatorsOn:false});
export function raArmConnectionStart(s:RaArmConnections,id:string,assembly:RaArmAssembly,boards:readonly string[]):RaArmConnections{
 if(s.controllerOn||s.actuatorsOn)throw Error('Disconnect both sources before changing connections');
 if(assembly.active||raArmMechanicalFits.some(f=>!assembly.completed.includes(f.id)))throw Error('Finish the mechanical assembly first');
 if(!boards.includes('uno')||!boards.includes('pca'))throw Error('Secure both boards on their spacers first');
 const i=raArmConnectionSteps.findIndex(f=>f.id===id);
 if(i<0)throw RangeError('Unknown connection');
 if(s.active||s.completed.includes(id)||raArmConnectionSteps.slice(0,i).some(f=>!s.completed.includes(f.id)))throw Error('Complete connections in the displayed order');
 return {...s,active:id,progress:0};
}
export function raArmConnectionAdvance(s:RaArmConnections,ms:number):RaArmConnections{
 if(!Number.isFinite(ms)||ms<0)throw RangeError('Invalid connection interval');
 if(!s.active)return s;
 const elapsed=s.progress+ms/1000,progress=elapsed>=1-1e-12?1:elapsed;
 return progress===1?{...s,active:null,progress:0,completed:[...s.completed,s.active]}:{...s,progress};
}
export function raArmConnectionView(s:RaArmConnections):{wiring:RaArmWiring;supply:RaArmSupply;unoWithdrawal:number;hostWithdrawal:number}{
 const done=(id:string)=>s.completed.includes(id),fraction=(id:string)=>done(id)?1:s.active===id?s.progress:0;
 const wiring=raArmWiringInitial(),supply=raArmSupplyInitial();
 wiring.logicGround=done('logic-ground');wiring.logicVcc=done('logic-vcc');wiring.sda=done('logic-sda');wiring.scl=done('logic-scl');
 wiring.leads=raArmJoints.map((_,ch)=>({signal:done('servo-'+ch),power:done('servo-'+ch),ground:done('servo-'+ch)}));
 for(const p of ['positive','negative']as const)supply[p]={source:12*(1-fraction(p+'-source')),terminal:12*(1-fraction(p+'-terminal')),tight:done(p+'-clamp')};
 const unoWithdrawal=12*(1-fraction('usb-uno')),hostWithdrawal=12*(1-fraction('usb-host'));
 wiring.usb=s.controllerOn&&unoWithdrawal===0&&hostWithdrawal===0;
 const enabled=raArmSupplyEnable(supply,s.actuatorsOn);wiring.servoSupply=enabled.on;
 return{wiring,supply:enabled,unoWithdrawal,hostWithdrawal};
}
export function raArmConnectionPower(s:RaArmConnections,source:'controller'|'actuators',on:boolean):RaArmConnections{
 if(on&&(s.active||raArmConnectionSteps.some(f=>!s.completed.includes(f.id))))throw Error('Complete and check every connection before enabling power');
 if(source==='actuators'&&on&&!s.controllerOn)throw Error('Start the controller with actuator output off first');
 if(source==='controller'&&!on&&s.actuatorsOn)throw Error('Switch actuator output off before disconnecting the controller');
 const next={...s,[source==='controller'?'controllerOn':'actuatorsOn']:on};raArmConnectionView(next);return next;
}
