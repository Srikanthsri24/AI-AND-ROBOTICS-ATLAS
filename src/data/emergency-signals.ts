import {emergencyLampMounts,emergencyLampHole,emergencySensorHole,type EmergencyPoint} from './emergency-corridor';
export function emergencyLampTerminal(key:typeof emergencyLampMounts[number]['key'],kind:'anode'|'cathode'):EmergencyPoint{if(!['anode','cathode'].includes(kind))throw Error('Unknown LED terminal');const p=emergencyLampHole(key,kind==='anode'?-1:1);return[p[0],p[1]-7,p[2]];}
export function emergencyLightTerminal(kind:'supply'|'signal'):EmergencyPoint{if(!['supply','signal'].includes(kind))throw Error('Unknown photoresistor terminal');const p=emergencySensorHole(kind==='supply'?-1:1);return[p[0],120,p[2]];}
export const emergencySignalParts=[
 ...emergencyLampMounts.flatMap(m=>[
  [`emergency-${m.key}-lens`,`${m.name} · 5 mm LED lens`,m.key==='beacon'?'The red lens pulses for 500 ms on and 500 ms off while the alarm is latched.':'A warm-white LED illuminates its section of the model corridor in darkness or during a latched alarm.',`${m.pin} drives this LED through its own 220 Ω resistor. The flange flat is on the cathode / ground side.`],
  [`emergency-${m.key}-anode`,`${m.name} · anode lead`,'The separate long metal lead, internal support and fine bond connection form the positive side of the LED package.',`${m.pin} → its 220 Ω series resistor → this anode. The lead passes through the left hole of its own folded carrier.`],
  [`emergency-${m.key}-cathode`,`${m.name} · cathode and reflector`,'The other metal lead carries the internal reflector support and returns current to common ground.','This lead passes through the right carrier hole. Its flat-sided lens cue identifies the ground side; never use the cardboard as a conductor.'],
 ]),
 ['emergency-ldr-body','Photoresistor · sensing face','A separate ceramic disc and visible serpentine sensing pattern show the ambient-light input above the corridor lamps.','The browser supplies a synthetic A0 ADC count; it does not infer lux from the rendered scene. The source scales that count into a relative 0–100 index.'],
 ['emergency-ldr-supply','Photoresistor · assigned 5 V lead','This physical lead passes through the left hole of the raised support plate.','Connect it to Uno 5 V. The photoresistor has no LED-style anode/cathode polarity; these names describe this circuit assignment.'],
 ['emergency-ldr-signal','Photoresistor · A0 divider lead','The separate second lead forms the measured divider junction.','Connect it to A0 and one end of the 10 kΩ resistor; the resistor’s other end goes to ground. Covering the photoresistor lowers this divider reading.'],
];
