import {raArmMechanicalFits,type RaArmAssembly} from './rover-arm-assembly';
export type RaArmBoard='uno'|'pca';
export const raArmBoardFits=(['uno','pca']as const).flatMap(board=>{const name=board==='uno'?'Uno':'PWM driver';return[
 {id:board+'-spacers',board,part:`ra-${board}-spacers`,title:`${name} · position the spacers`,instruction:'Place all four insulating spacers around the matching fixture bores. Keep their centre openings clear.',why:'The spacers support the PCB while keeping underside solder joints above the fixture.',check:'All four spacers sit flat and align with the actual board hole pattern.'},
 {id:board+'-board',board,part:board==='uno'?'ra-uno-pcb':'ra-pca-board',title:`${name} · lower the board`,instruction:'Lower the board onto the spacers, aligning all four PCB holes. Hold the board by its edges, keeping connectors accessible.',why:'Matching the real hole pattern prevents bending the board or forcing a screw through a component.',check:'The PCB sits flat on every spacer; no underside part touches the fixture.'},
 {id:board+'-bolts',board,part:`ra-${board}-fasteners`,title:`${name} · insert screws and washers`,instruction:'Insert the low-profile screws through the washers, PCB mounting holes, hollow spacers and fixture bores.',why:'The complete fastener path retains the PCB without using a solder joint or socket as a mounting point.',check:'Each washer sits on the PCB mounting ring and each screw passes freely through its aligned bore.'},
 {id:board+'-nuts',board,part:`ra-${board}-mount-nuts`,title:`${name} · retain underneath`,instruction:'Hold the top screws and fit the four underside nuts. Tighten evenly without crushing the PCB or spacers.',why:'The underside nuts and top washers retain the entire board-and-spacer stack.',check:'The PCB remains flat, the spacers stay seated and every nearby socket remains accessible.'},
 ];});
export type RaArmBoardAssembly={completed:readonly string[];active:string|null;progress:number};
export const raArmBoardAssemblyInitial=():RaArmBoardAssembly=>({completed:[],active:null,progress:0});
export function raArmBoardFitStart(s:RaArmBoardAssembly,id:string,arm:RaArmAssembly,power:{usb:boolean;servoSupply:boolean}):RaArmBoardAssembly{
 if(power.usb||power.servoSupply)throw Error('Disconnect both sources before mounting electronics');
 if(arm.active||raArmMechanicalFits.some(f=>!arm.completed.includes(f.id)))throw Error('Finish the mechanical fixture first');
 const i=raArmBoardFits.findIndex(f=>f.id===id);if(i<0)throw RangeError('Unknown board fitting');
 if(s.active||s.completed.includes(id)||raArmBoardFits.slice(0,i).some(f=>!s.completed.includes(f.id)))throw Error('Complete board fittings in the displayed order');
 return{...s,active:id,progress:0};
}
export function raArmBoardFitAdvance(s:RaArmBoardAssembly,ms:number):RaArmBoardAssembly{
 if(!Number.isFinite(ms)||ms<0)throw RangeError('Invalid board fitting interval');if(!s.active)return s;
 const progress=Math.min(1,s.progress+ms/1000);return progress===1?{completed:[...s.completed,s.active],active:null,progress:0}:{...s,progress};
}
export function raArmBoardFitPart(s:RaArmBoardAssembly,id:string){return{visible:s.completed.includes(id)||s.active===id,progress:s.completed.includes(id)?1:s.active===id?s.progress:0};}
export function raArmSecuredBoards(s:RaArmBoardAssembly):RaArmBoard[]{return(['uno','pca']as const).filter(board=>raArmBoardFits.filter(f=>f.board===board).every(f=>s.completed.includes(f.id)));}
export const raArmMountNutParts=(['uno','pca']as const).map(board=>({id:`ra-${board}-mount-nuts`,label:(board==='uno'?'Uno':'PWM driver')+' · underside retaining nuts',description:'These four nuts meet the fixture underside and retain the screws passing through the PCB, hollow spacers and fixture. Hold the screw heads and tighten evenly so the board stays flat.'}));
