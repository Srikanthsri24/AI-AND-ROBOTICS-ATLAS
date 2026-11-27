/** MG996R nominal body reference: https://towerpro.com.tw/product/mg996r/
 * Mount-slot and horn geometry is authored workshop hardware, not vendor CAD. */
export const raServo={length:40.7,width:19.7,height:42.9,bodyCentreX:10.5,earSpan:54,earY:-15.4,earThickness:2.4,slotLength:4.6,slotWidth:3.2,leadLength:320,plugPitch:2.54};
export const raServoMounts=[-1,1].flatMap(x=>[-1,1].map(z=>[raServo.bodyCentreX+x*24.1,raServo.earY,z*5]as const));
export const raServoCaseScrews=[-1,1].flatMap(x=>[-1,1].map(z=>[raServo.bodyCentreX+x*18,-5.5,z*8]as const));
export const raServoWires=[{id:'ground',color:'#604030',z:-1,pin:-2.54,label:'Brown · GND',why:'Returns servo current to the separate supply negative and the controller reference.'},{id:'power',color:'#c9483e',z:0,pin:0,label:'Red · servo power',why:'Receives actuator power from the PCA9685 V+ rail, supplied independently of Uno logic power.'},{id:'signal',color:'#dc9639',z:1,pin:2.54,label:'Orange · pulse signal',why:'Receives the selected PCA9685 channel pulse. This conductor commands position; it does not supply motor current.'}]as const;
export function raServoParts(prefix:string,joint:string){return[
 ['body','Motor and controller housing','The motor, feedback control and lower cover stay fixed in the bracket while the output turns. The three-wire lead brings power, ground and a position command.'],
 ['gearcase','Reduction gearbox cover','The upper housing supports the reduction gears and output bearing. Keep it clear of the rotating horn and align the bracket with the output axis.'],
 ['mounts','Slotted mounting ears','Four open slots accept the workshop bracket fasteners. Seat the ears against the matching bracket before tightening; these fix the case rather than the moving horn.'],
 ['case-screws','Case retaining screws','These four screws hold the housing sections together. They are separate from the bracket bolts and the central horn-retaining screw.'],
 ['shaft','Splined output shaft','The output spline turns the fitted horn. Check neutral with the horn removed, then fit a matching horn without forcing the spline.'],
 ['horn','Mounting horn','This workshop metal horn couples the rotating spline to the next arm bracket. Its four open bores retain that moving bracket.'],
 ['retainer','Horn retaining screw','The central screw retains the horn on the output shaft. It turns with the horn, while the case and mounting ears remain fixed.'],
 ['relief','Cable strain relief','The flexible exit supports the three conductors where they leave the case. Leave slack for the joint to move without pulling this exit.'],
 ['plug','Three-contact servo plug','Align the plug with the PCA9685 channel’s signal, V+ and ground pins. Its open contact mouths expose the individual spring contacts.'],
 ...raServoWires.flatMap(w=>[[w.id+'-lead',w.label+' lead',w.why+' The lead stays attached to the servo case.'],[w.id+'-contact',w.label+' contact',w.why+' This spring contact seats over the corresponding channel header pin.']]),
].map(([id,label,description])=>({id:prefix+'-'+id,label:joint+' · '+label,description}));}
