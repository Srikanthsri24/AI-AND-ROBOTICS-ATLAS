import type{TapPoint}from'./tap-plumbing';
/** Authored external enclosure; reference electrical interface is 5 V, centre
 * positive, 5.5 mm OD / 2.1 mm ID. No internal mains circuitry is exposed. */
export const tapPowerCableDiameter=3.5;
export const tapPowerLayout={adapter:[164,223,-60] as TapPoint,source:[230,12,130] as TapPoint,plugTravel:16};
export function tapPowerWorld(p:TapPoint):[number,number,number]{const a=tapPowerLayout.adapter;return [a[0]+p[2],a[1]+p[1],a[2]-p[0]];}
export const tapPowerTerminals=[{polarity:'positive',x:-3.5},{polarity:'negative',x:3.5}] as const;
export function tapPowerContact(polarity:'positive'|'negative'){const p=tapPowerTerminals.find(p=>p.polarity===polarity)!;return tapPowerWorld([p.x,4.17,11]);}
export function tapPowerHeaderContact(polarity:'positive'|'negative'):[number,number,number]{const p=tapPowerContact(polarity);return[p[0]+5,p[1]+.1,p[2]];}
export const tapPowerHeaderClampOffset=.1;
export function tapPowerPresent(enabled:boolean,withdrawal:number){if(!Number.isFinite(withdrawal)||withdrawal<0||withdrawal>tapPowerLayout.plugTravel)throw new RangeError('Invalid tap barrel plug travel');return enabled&&withdrawal===0;}
export const tapPowerParts=[
 ['tap-supply-case','Pump supply · enclosed regulated 5 V source','Represents the separate regulated 5 V, 2 A supply. Its closed enclosure is outside the wet apparatus. The model shows its low-voltage output, not internal mains circuitry.'],
 ['tap-supply-cord','Pump supply · low-voltage output cord','Carries the supply output to the barrel plug. Route the cord around the dry outside of the apparatus; it does not power the Uno USB circuit.'],
 ['tap-supply-grip','Pump supply · moulded barrel grip','Holds the insulated plug body and strain relief. Push the connector fully into the matching adapter; pull on this grip when disconnecting.'],
 ['tap-supply-plug-negative','Barrel plug · outer negative contact','The outer 5.5 mm metal sleeve carries the negative return. It is insulated from the inner positive contact; it is not a single solid metal tube.'],
 ['tap-supply-plug-positive','Barrel plug · inner positive contact','The inner contact fits the 2.1 mm centre pin and carries positive 5 V. It stays electrically separate from the outer negative sleeve.'],
 ['tap-supply-plug-insulator','Barrel plug · contact separator','The insulating ring separates the two metal contacts. Inspect the unplugged tip to see the positive inner sleeve and negative outer sleeve.'],
 ['tap-supply-adapter','Power adapter · moulded jack housing','Holds the centre-positive female barrel jack and two screw terminals. The mating cavity is open; disconnect the plug before changing output wires.'],
 ['tap-supply-jack-positive','Power adapter · positive centre pin','The centre pin mates with the plug inner contact and connects to the positive screw terminal. Its nominal 2.1 mm interface matches the reference adapter.'],
 ['tap-supply-jack-negative','Power adapter · negative sleeve','Spring contacts touch the outer plug sleeve and connect to the negative screw terminal. This negative must also reference Uno GND through the project wiring.'],
 ['tap-supply-terminal-housing','Power adapter · insulated terminal block','The green block keeps positive and negative clamps separate. The actual front conductor openings and top screw bores remain open in the model.'],
 ...tapPowerTerminals.flatMap(t=>[
  ['tap-supply-'+t.polarity,'Pump supply · '+(t.polarity==='positive'?'+5 V':'negative / GND')+' wire clamp',t.polarity==='positive'?'Connect this actual brass contact to driver VIN through the red STEMMA lead. Keep the independent motor-positive line separate from the Uno sensor 5 V rail.':'Connect this actual brass contact to the driver GND and shared Uno reference. It carries the motor return; the Uno D9 pin carries only the control signal.'] as const,
  ['tap-supply-'+t.polarity+'-screw','Pump supply · '+(t.polarity==='positive'?'+':'−')+' clamp screw','Loosen this slotted screw with power disconnected, insert the conductive factory male-header pin through the front opening and tighten it. Keep its insulated grip outside the clamp.'] as const,
 ]),
] as const;
