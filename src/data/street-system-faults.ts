import type {StreetSystemSettings} from './street-system-workshop';
export const streetSystemFaults=[
 {id:'none',name:'All connections seated',cable:''},
 {id:'a0',name:'A0 jumper open',cable:'street-a0'},
 ...[1,2,3].flatMap(n=>[
  {id:`drive-${n}`,name:`Lamp ${n} drive jumper open`,cable:`street-lamp-${n}-drive`},
  {id:`return-${n}`,name:`Lamp ${n} return jumper open`,cable:`street-lamp-${n}-return`},
 ]),
] as const;
export function streetFaultSettings(settings:StreetSystemSettings,id:string):StreetSystemSettings{
 if(!streetSystemFaults.some(f=>f.id===id))throw new Error('Unknown street-system fault '+id);
 const outputs:[boolean,boolean,boolean]=[true,true,true],returns:[boolean,boolean,boolean]=[true,true,true];
 if(id.startsWith('drive-'))outputs[Number(id.at(-1))-1]=false;
 if(id.startsWith('return-'))returns[Number(id.at(-1))-1]=false;
 return {...settings,usb:false,sensorConnected:id!=='a0',outputs,returns};
}
export function streetCableWithdrawal(id:string,settings:Pick<StreetSystemSettings,'sensorConnected'|'outputs'|'returns'>):number{
 if(id==='street-a0'&&!settings.sensorConnected)return 8;
 for(let n=0;n<3;n++)if(id===`street-lamp-${n+1}-drive`&&!settings.outputs[n]||id===`street-lamp-${n+1}-return`&&!settings.returns[n])return 8;
 return 0;
}
