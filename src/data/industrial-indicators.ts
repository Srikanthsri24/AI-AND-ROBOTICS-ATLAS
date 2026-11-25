import { industrialControlHole as hole } from './industrial-controls';
export const industrialIndicators=[
 {key:'run',name:'Green RUN',pin:'D5',color:'#52dba3',off:'#3f785f',emissive:'#21cf78',anode:hole(4,-1,4),cathode:hole(5,-1,4),resistorA:hole(0,-1,0),resistorB:hole(4,-1,0)},
 {key:'trip',name:'Red TRIP',pin:'D6',color:'#ee5066',off:'#913c4a',emissive:'#ec2946',anode:hole(15,-1,4),cathode:hole(16,-1,4),resistorA:hole(11,-1,0),resistorB:hole(15,-1,0)},
] as const;
/** One physical hole per arriving lead. Each bank/column is one isolated five-contact tie. */
export const industrialControlNets={
 supply:[['Uno 5 V',0,1,0],['Temperature high',0,1,1],['Vibration high',0,1,2]],
 ground:[['Uno GND',2,1,0],['Temperature low',2,1,1],['Vibration low',2,1,2],['Stop COM',2,1,3],['Ground bridge departure',2,1,4]],
 extension:[['Ground bridge arrival',4,1,0],['Green cathode return',4,1,1],['Red cathode return',4,1,2],['Button ground return',4,1,3]],
 greenInput:[['D5 jumper',0,-1,1],['220 ohm input',0,-1,0]],
 greenAnode:[['220 ohm output',4,-1,0],['Green anode',4,-1,4]],
 greenCathode:[['Green cathode',5,-1,4],['Cathode jumper',5,-1,1]],
 redInput:[['D6 jumper',11,-1,1],['220 ohm input',11,-1,0]],
 redAnode:[['220 ohm output',15,-1,0],['Red anode',15,-1,4]],
 redCathode:[['Red cathode',16,-1,4],['Cathode jumper',16,-1,1]],
 buttonInput:[['D3 jumper',7,-1,0],['Signal leg A',7,-1,4]],
 buttonReturn:[['Button leg A',7,1,0],['Button ground jumper',7,1,4]],
} as const;
export const industrialIndicatorParts=industrialIndicators.flatMap(({key,name,pin})=>[
 [`industrial-${key}-resistor-body`,`${name} · 220 Ω resistor`,'A separate axial resistor has red, red, brown and gold bands: 220 Ω with the illustrated tolerance band.',`${pin} feeds this series resistor before the LED anode. Each indicator has its own resistor and isolated input/output columns.`],
 [`industrial-${key}-resistor-leads`,`${name} · resistor leads`,'The two bent metal legs enter different breadboard tie columns and meet the two ends of the resistor body.','Keep both legs out of the same tie group; otherwise the resistor would be bypassed. The output column also holds the anode.'],
 [`industrial-${key}-led-lens`,`${name} · indicator lens`,'The separate translucent lens and flange reveal this indicator’s actual powered state.',key==='run'?'D5 lights green only while the local model is RUNNING. A trip turns it off, even if network telemetry is unavailable.':'D6 lights red for a latched TRIPPED state. Clearing the unsafe input does not clear this lamp until a qualified acknowledgement.'],
 [`industrial-${key}-led-anode`,`${name} · anode lead`,'The anode has its own metal leg and small internal emitter support inside the lens.',`It shares the ${name} resistor-output column, not the cathode column. The lens is not the electrical connection point.`],
 [`industrial-${key}-led-cathode`,`${name} · cathode and reflector`,'The separate cathode leg joins the larger internal reflector inside the translucent lens.','Its independent column needs a jumper back to common ground. It must not share the anode column.'],
]);
