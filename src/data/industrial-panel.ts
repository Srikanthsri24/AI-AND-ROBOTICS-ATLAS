/** Authored classroom control-panel geometry in mm, not manufacturer CAD. */
export type IndustrialPoint=[number,number,number];
export const industrialPanel={at:[65,37,-55] as IndustrialPoint,width:195,depth:100,thickness:3,shaftHole:3.8,postHole:1.8,posts:[[-20,-95],[-20,-15],[150,-95],[150,-15]] as [number,number][]};
export const industrialKnobs=[{key:'temperature',name:'Temperature test knob',pin:'A0',x:20,z:-55},{key:'vibration',name:'Vibration test knob',pin:'A1',x:110,z:-55}] as const;
export function industrialKnobAngle(adc:number){if(!Number.isInteger(adc)||adc<0||adc>1023)throw Error('Knob ADC must be an integer from 0 to 1023.');return(135-270*adc/1023)*Math.PI/180;}
export function industrialPotTerminal(key:typeof industrialKnobs[number]['key'],terminal:'ground'|'wiper'|'supply'):IndustrialPoint{const knob=industrialKnobs.find(k=>k.key===key);if(!knob)throw Error('Unknown knob');const dx={ground:-5,wiper:0,supply:5}[terminal];if(dx===undefined)throw Error('Unknown potentiometer terminal');return[knob.x+dx,24,knob.z+13];}
export const industrialPanelParts=[
 ['industrial-bench','Low-voltage panel base','The authored workbench base supports the classroom controls and the remaining controller and indicator circuit.','All knobs represent synthetic indices. The finished guide uses LEDs to represent conveyor state, not a mains-powered machine.'],
 ['industrial-panel','Drilled control plate','The plate has separate clear holes for both shaft bushings and four mounting fasteners.','Each potentiometer body remains below the plate. Its shaft passes through its own open bushing hole.'],
 ['industrial-panel-posts','Bored panel standoffs','Four metal spacers support the plate 37 mm above the workbench.','Their open bores align with the plate screw holes; the screw heads are fitted after the plate seats.'],
 ['industrial-panel-screws','Panel mounting screws','Four separate screw shafts and slotted heads secure the plate to its standoffs.','The shafts pass through the real open plate and standoff bores.'],
 ...industrialKnobs.flatMap(({key,name,pin})=>[
  [`industrial-${key}-body`,`${name} · 10 kΩ body`,'A separate metal can, insulating terminal carrier and rear cover represent the fixed 10 kΩ resistance track.','The two outer terminals connect to ground and 5 V. Turning the centre wiper selects a fraction of that reference.'],
  [`industrial-${key}-bushing`,`${name} · bored bushing`,'The fixed bored shoulder supports the underside of the plate; its narrower mounting bushing passes through to the top nut.','The bore clears the shaft; the washer and nut clamp the fixed body to the plate rather than rotating with the knob.'],
  [`industrial-${key}-washer`,`${name} · mounting washer`,'A separate annular washer spreads the nut load on the upper control plate.','Its open centre clears the bushing. Seat it before tightening the hex nut.'],
  [`industrial-${key}-nut`,`${name} · open hex nut`,'The six-sided mounting nut has a real central bore around the fixed bushing.','It seats above the washer and retains the potentiometer body below the plate.'],
  [`industrial-${key}-shaft`,`${name} · rotating shaft`,'The shaft rotates through a 270-degree authored test sweep, following this knob’s ADC input.','It turns only this wiper. The other test knob remains independent.'],
  [`industrial-${key}-knob`,`${name} · fluted pointer knob`,'The separate fluted knob has a blind shaft cavity and a contrasting pointer.','Clockwise travel follows increasing ADC values from 0 to 1023. The displayed 0–100 index uses the Arduino sketch’s integer rounding.'],
  [`industrial-${key}-ground`,`${name} · ground terminal`,'This outer metal terminal is the low end of the resistance track.','Connect it to the Uno common ground. It is separate from the centre wiper and the 5 V terminal.'],
  [`industrial-${key}-wiper`,`${name} · ${pin} wiper`,'The centre terminal exposes the position selected by the rotating shaft.',`Connect only this wiper to ${pin}. The firmware maps its 0–1023 ADC reading to a rounded 0–100 synthetic index.`],
  [`industrial-${key}-supply`,`${name} · 5 V terminal`,'This outer metal terminal is the high end of the resistance track.','Connect it to Uno 5 V. The opposite outer terminal goes to ground; neither outer terminal is an analogue input.'],
 ]),
];
