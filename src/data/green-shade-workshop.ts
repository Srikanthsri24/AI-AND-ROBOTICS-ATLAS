export const greenReferenceFace:[number,number,number]=[-2.15,.672,-.70];
export const greenTrayFace:[number,number,number]=[.85,.672,.55];
export const greenScreenWidth=2.4,greenScreenDepth=1.75,greenScreenHeight=1.55,greenScreenThickness=.04,greenSourceHalfSpan=.90;
export type GreenChannel='reference'|'tray';
export type GreenReferences={refDark:number|null;refBright:number|null;trayDark:number|null;trayBright:number|null};
export const emptyGreenReferences:GreenReferences={refDark:null,refBright:null,trayDark:null,trayBright:null};
export const exampleGreenReferences:GreenReferences={refDark:170,refBright:830,trayDark:180,trayBright:820};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function greenScreenZ(extension:number){return -1.9*(1-clamp(extension,0,100)/100);}
export function greenBlockedFraction(extension:number){const center=greenScreenZ(extension),low=Math.max(center-greenScreenDepth/2,greenTrayFace[2]-greenSourceHalfSpan),high=Math.min(center+greenScreenDepth/2,greenTrayFace[2]+greenSourceHalfSpan);return clamp((high-low)/(2*greenSourceHalfSpan),0,1);}
export function greenHoodPose(channel:GreenChannel,progress:number):[number,number,number]{
 const t=clamp(progress,0,1),face=channel==='reference'?greenReferenceFace:greenTrayFace,parkX=face[0]-(channel==='reference'?.45:0),parkZ=face[2]+(channel==='tray'?.60:0);
 if(t<.25)return [parkX,.44+(.68*t/.25),parkZ];
 if(t<.75){const move=(t-.25)/.5;return [parkX+(face[0]-parkX)*move,1.12,parkZ+(face[2]-parkZ)*move];}
 return [face[0],1.12-.26*(t-.75)/.25,face[2]];
}
export function greenHoodClosed(channel:GreenChannel,progress:number){const pose=greenHoodPose(channel,progress),face=channel==='reference'?greenReferenceFace:greenTrayFace;return Math.abs(pose[0]-face[0])<=.155&&Math.abs(pose[2]-face[2])<=.155&&pose[1]-.275<=face[1]&&pose[1]-.03>face[1];}
export function greenRaw(channel:GreenChannel,light:number){const dark=channel==='reference'?170:180,span=channel==='reference'?660:640;return Math.ceil(dark+clamp(light,0,100)*span/100);}
export function greenRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return clamp(Math.floor((raw-dark)*100/(bright-dark)),0,100);}
export function greenMeasurement(room:number,extension:number,refHood:number,trayHood:number,refs:GreenReferences){
 const available=clamp(room,0,100),refLight=greenHoodClosed('reference',refHood)?0:available,trayLight=greenHoodClosed('tray',trayHood)?0:available*(1-.9*greenBlockedFraction(extension));
 const refRaw=greenRaw('reference',refLight),trayRaw=greenRaw('tray',trayLight),reference=greenRelative(refRaw,refs.refDark,refs.refBright),tray=greenRelative(trayRaw,refs.trayDark,refs.trayBright),valid=reference!==null&&tray!==null&&reference>=20;
 return {refRaw,trayRaw,reference,tray,valid,ratio:valid?Math.floor(tray!*100/reference!):null};
}
export function greenNextWarning(previous:boolean,ratio:number|null){if(ratio===null||ratio>=55)return false;if(ratio<48)return true;return previous;}
