import {streetSystemCables,type StreetPoint as P} from './street-system-layout';
const smooth=(n:number)=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
/** Each wire appears held above its own sockets; end A seats before end B. */
export function streetJumperSeating(index:number,progress:number){
 if(!Number.isInteger(index)||index<0||index>=streetSystemCables.length)throw new RangeError('Unknown street jumper');
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Assembly progress must be 0–8.');
 const chapter=index<5?5:6,local=index<5?index:index-5,count=index<5?5:12,phase=Math.round(((progress-chapter)*count-local)*1e10)/1e10;
 return {visible:phase>0,aWithdrawal:16*(1-smooth(phase*2)),bWithdrawal:16*(1-smooth(phase*2-1)),seated:phase>=1};
}
export function streetJumperRoute(index:number,aWithdrawal=0,bWithdrawal=0):P[]{
 const w=streetSystemCables[index];if(!w)throw new RangeError('Unknown street jumper');
 if(![aWithdrawal,bWithdrawal].every(n=>Number.isFinite(n)&&n>=0&&n<=16))throw new RangeError('Jumper withdrawal must be 0–16 mm.');
 const a:P=[w.a[0],w.a[1]+7.5+aWithdrawal,w.a[2]],b:P=[w.b[0],w.b[1]+7.5+bWithdrawal,w.b[2]];
 return [a,[a[0],Math.max(a[1]+5,35+index*.5),a[2]],...(w.route.length?w.route:[[a[0]+(b[0]-a[0])*.5,40+index*.6,(a[2]+b[2])*.5] as P]),[b[0],Math.max(b[1]+5,35+index*.5),b[2]],b];
}
export function streetActiveJumper(progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Invalid assembly progress');
 if(progress<5||progress>=7)return null;
 const chapter=progress<6?5:6,count=chapter===5?5:12,cursor=Math.round((progress-chapter)*count*1e10)/1e10,index=Math.min(count-1,Math.floor(cursor)),fraction=cursor-index;
 return {index:index+(chapter===5?0:5),end:fraction<.5?'a' as const:'b' as const};
}
export function streetJumperEndLabel(index:number,end:'a'|'b'){
 streetJumperSeating(index,8);
 const first=[['Uno 5 V','divider supply · front column 1'],['Uno GND (power header)','common ground · front column 11'],['Uno A0','divider junction · front column 6'],['5 V strip · front column 1','photoresistor positive contact'],['A0 junction · front column 6','photoresistor junction contact']];
 let names:string[];
 if(index<5)names=first[index];else {const branch=Math.floor((index-5)/4),kind=(index-5)%4,n=branch+1;names=[['Uno D'+(branch+5),`lamp ${n} resistor input · rear column ${branch*5+1}`],[`lamp ${n} resistor output · rear column ${branch*5+4}`,`lamp ${n} red anode lead`],[`lamp ${n} black cathode lead`,`lamp ${n} return · rear column ${branch*5+5}`],[`lamp ${n} return · rear column ${branch*5+5}`,'common ground · front column 11']][kind];}
 return names[end==='a'?0:1];
}
