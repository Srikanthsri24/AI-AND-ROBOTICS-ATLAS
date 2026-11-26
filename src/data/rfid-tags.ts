export type RfidTagName='A'|'B';
export const rfidClassroomTags={A:{uid:[4,42,49,124],name:'Classroom card A'},B:{uid:[4,94,24,146],name:'Classroom key fob B'}} as const;
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Authored presentation path / capture position, not a calibrated RF field model.
 * Lift clear of the reader, move above the antenna, then lower for presentation. */
export function rfidTagPose(tag:RfidTagName,progress:number){
 if(!(tag in rfidClassroomTags)||!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Invalid classroom tag pose');
 const start=tag==='A'?[84,4,-95]:[145,4,-26],move=smooth((progress-.25)/.55),height=progress<.25?4+24*smooth(progress/.25):progress<.8?28:28-(tag==='A'?18:10)*smooth((progress-.8)/.2);
 return {position:[start[0]+(84-start[0])*move,height,start[2]+(-26-start[2])*move] as const,presented:progress===1};
}
export function rfidPresentedTag(a:number,b:number):RfidTagName|null{rfidTagPose('A',a);rfidTagPose('B',b);return a===1&&b!==1?'A':b===1&&a!==1?'B':null;}
