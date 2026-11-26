import layout from './ht16k33-sevenseg-layout.json';
export type ClockSegment='a'|'b'|'c'|'d'|'e'|'f'|'g';
const glyphs:Readonly<Record<string,string>>={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg'};
const wireOrder:readonly ClockSegment[]=['e','f','a','b','c','d','g'];
const packageData=layout.packages['microbuilder/SEGMENT-BL-Q56C43'];
/** Eagle's package artwork locates four slanted glyphs; emitter widths and
 * component depth are authored later, not inferred mechanical dimensions. */
export const schoolBellSegments=packageData.wire.filter(w=>w.layer==='51').slice(4).map((w,n)=>({id:'school-bell-digit-'+Math.floor(n/7)+'-'+wireOrder[n%7],digit:Math.floor(n/7),segment:wireOrder[n%7],from:[-(+w.x1),-(+w.y1)] as const,to:[-(+w.x2),-(+w.y2)] as const}));
export const schoolBellDisplayPins=layout.pads.filter(p=>p.element==='LED2');
export function schoolBellSegmentStates(time:string,powered:boolean){const chars=time.replace(':','').padEnd(4,' ').slice(0,4);return schoolBellSegments.map(segment=>({...segment,lit:powered&&(glyphs[chars[segment.digit]]??'').includes(segment.segment)}));}
export function schoolBellColonLit(time:string,powered:boolean){return powered&&/^\d{2}:\d{2}$/.test(time);}
