import shield from './pn532-shield-layout.json';
import uno from './uno-r3-board-layout.json';
export const pn532Stack={offsetX:16.2,baseY:12,bodyBottom:1.6,socketTop:10.1,pinBottom:-9.5,pinTop:1.8} as const;
const aliases:Readonly<Record<string,string>>={GND:'GND-D',GND1:'GND-P2',GND2:'GND-P1','3V':'3V3',RESERVED:'NC'};
export const pn532StackPins=shield.pads.filter(p=>p.element==='U3').map(p=>{
 const name=aliases[p.name]??p.name,match=uno.headers.find(h=>h.name===name);if(!match)throw Error('Unmatched PN532 stacking pin '+p.name);
 const bank=p.y>25?(p.x<27?'digital-high':'digital-low'):(p.x<32?'power':'analog');
 return {...p,unoName:name,unoX:match.x,unoY:match.y,bank};
});
