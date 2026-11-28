import{raArmChannelRise,raArmStorageGuide}from'./rover-arm-cable-route';
type XYZ=readonly[number,number,number];
type FrameKey='incoming'|'return'|'front';
export const raArmLoomFrames:readonly{key:FrameKey;id:string;label:string;at:XYZ;height:number;foot:number}[]=[
 {key:'incoming',id:'ra-arm-loom-frame-incoming',label:'Rear incoming-guide post',at:[65,0,-50],height:145,foot:12},
 {key:'return',id:'ra-arm-loom-frame-return',label:'Service-loop return post',at:[20,0,-76],height:200,foot:12},
 {key:'front',id:'ra-arm-loom-frame-front',label:'Front gripper-lead post',at:[-100,0,80],height:190,foot:12},
];
type Guide={id:string;label:string;description:string;at:XYZ;axis:XYZ;frame:FrameKey};
// Channel 4 follows the sampled incoming ribbon direction so its rim clears
// both the straightened extension lead and the neighbouring channel 3 run.
const inputAxes:readonly XYZ[]=[[-.5,.24,-.83],[-.8,-.32,.5],[-.82,-.53,-.22],[-.93,-.35,-.1],[-.65,-.65,.4],[-.74,-.11,-.67]];
/** Authored, preassembled teaching-fixture guides. Loose eyes preserve slack;
 * the model does not calculate friction, adhesive strength or cable gravity. */
export const raArmLoomGuides:readonly Guide[]=[
 ...inputAxes.map<Guide>((axis,ch)=>({id:`ra-arm-loom-in-${ch}`,label:`Channel ${ch} · incoming lead eye`,description:`Pass the channel ${ch} three-wire lead through this loose eye toward its service loop. Leave room for the joint to move and preserve the brown, red and orange order.`,at:(()=>{const p=raArmStorageGuide(ch);p.y+=48;return p.toArray()as[number,number,number];})(),axis,frame:ch===5?'front':'incoming'})),
 ...Array.from({length:6},(_,ch):Guide=>({id:`ra-arm-loom-out-${ch}`,label:`Channel ${ch} · service-loop return eye`,description:`This eye supports channel ${ch} at the service-loop exit. The extension rises in its own lane before approaching the driver plug; leave the cable loose inside the eye.`,at:[-30-ch*6,23+raArmChannelRise(ch),-90],axis:[1,1,0],frame:'return'})),
];
export const raArmLoomSupportParts=[
 ...raArmLoomFrames.map(f=>({id:f.id,label:f.label,description:'A preassembled guide post with an adhesive-backed foot supports the cable eyes. Its retaining collars and arms keep the service leads clear of the moving arm.'})),
 ...raArmLoomGuides.map(({id,label,description})=>({id,label,description})),
];
