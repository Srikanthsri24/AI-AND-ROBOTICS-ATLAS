export const streetFootFasteners=Array.from({length:12},(_,index)=>({index,lamp:Math.floor(index/4),dx:index%4<2?-8:8,dz:index%2?-6:6}));
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Washer first; approach without rotation, then six 0.4 mm turns over 2.4 mm. */
export function streetFootFastenerPose(index:number,progress:number){
 if(!Number.isInteger(index)||index<0||index>=12||!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Invalid street fastener pose');
 const phase=Math.round(((progress-.8)*60-index)*1e10)/1e10,washer= smooth(phase*2),screw=Math.max(0,Math.min(1,phase*2-1)),thread=smooth((screw-.65)/.35);
 return {washerVisible:phase>0,screwVisible:phase>.5,washerLift:24*(1-washer),screwLift:screw<.65?24-21.6*smooth(screw/.65):2.4*(1-thread),turn:Math.PI*12*thread,seated:phase>=1};
}

export function streetActiveFastener(progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Invalid fastener progress');
 if(progress<.8||progress>=1)return null;
 const cursor=Math.round((progress-.8)*60*1e10)/1e10,index=Math.min(11,Math.floor(cursor));
 return {...streetFootFasteners[index],part:cursor-index<.5?'washer' as const:'screw' as const};
}
