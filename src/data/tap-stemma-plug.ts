import type{TapPoint}from'./tap-plumbing';
export const tapStemmaChannels=[{name:'ground',z:2,color:'#303b49'},{name:'vin',z:0,color:'#c6505a'},{name:'signal',z:-2,color:'#e2dfcf'}]as const;
export function tapStemmaOffset(phase:number){if(!Number.isFinite(phase)||phase<0||phase>1)throw new RangeError('Invalid STEMMA fitting phase');return -12*(1-phase*phase*(3-2*phase));}
export function tapStemmaPose(phase:number){const x=tapStemmaOffset(phase),t=Math.max(0,Math.min(1,(-x-8)/4));return{offset:[x,6*t*t*(3-2*t),0]as TapPoint,seated:phase===1};}
export function tapStemmaTail(name:typeof tapStemmaChannels[number]['name'],phase=1):TapPoint{const c=tapStemmaChannels.find(c=>c.name===name);if(!c)throw new RangeError('Unknown STEMMA channel');const p=tapStemmaPose(phase).offset;return[189+p[0],233.4+p[1],-66+c.z];}
export const tapStemmaPlugParts=[
 ['tap-stemma-plug','Motor harness · keyed JST PH plug','The complete three-position plug fits the driver socket as one unit. Align the keyed top rib and slide straight in; the three wires stay factory attached.'],
 ['tap-stemma-key','Motor harness · alignment rib','This raised guide identifies the top of the plug. It clears the socket’s side retainers when correctly aligned; it is not an electrical contact.'],
 ...tapStemmaChannels.map(c=>['tap-stemma-contact-'+c.name,'STEMMA contact · '+({ground:'GND',vin:'VIN',signal:'SIG'}[c.name]),'The two metal leaves grip the actual driver pin inside this open channel. Unplug the housing before inspecting the contact; do not push a bare wire directly into the socket.']),
 ...tapStemmaChannels.map(c=>['tap-stemma-tail-'+c.name,'STEMMA factory tail · '+({ground:'black GND',vin:'red VIN',signal:'white SIG'}[c.name]),'This coloured lead remains crimped into the plug. Moving the whole plug moves all three attached tails together. The reference cable has male headers on its free ends.']),
]as const;
