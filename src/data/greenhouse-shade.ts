import type {Build} from './guided-projects';

export const greenhouseShade:Build={
  id:'greenhouse-shade-monitor',
  title:'Greenhouse shade monitor',
  outcome:'Compare light at a seedling tray with an uncovered reference and flag when shade blocks most of the available light.',
  parts:[
    ['Arduino Uno R3','1','Reads the two light channels and drives the shade warning.'],
    ['Pair of CdS photoresistors','2','One looks up from the tray. The other sits outside the shade screen as a reference.'],
    ['10 kΩ divider resistors','2','Each one converts a photoresistor response to a separate analog voltage.'],
    ['LED and 330 Ω resistor','1 pair','The LED reports a low tray-to-reference reading.'],
    ['Seedling tray and sliding shade card','1 set','A tray and movable cover let you compare covered and exposed plants.'],
    ['Breadboard and jumper wires','1 set','Holds the dividers and connects their supplies, inputs and ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Place the tray and reference sensors','Put one sensor at leaf height beside the tray. Set the reference next to the same light source, facing the same way and outside the movable cover. Keep both sensors dry.','Moving the cover shades the tray sensor without shading the reference.',[1,4]],
    ['Build two separate dividers','With USB disconnected, put both photoresistor supply leads on 5 V. Connect each remaining lead to its own 10 kΩ resistor and analog input. Ground the other end of each resistor.','The reference divider midpoint goes to A0 and the tray midpoint goes to A1.',[0,1,2,5]],
    ['Wire the warning LED','Connect D8 through 330 Ω to the LED anode and tie the cathode to the shared ground. Aim the warning lamp away from both sensors.','The warning LED stays outside the optical measurement area.',[0,3,5]],
    ['Calibrate and check three conditions','Read each sensor covered and then under the same bright light with the shade screen retracted. Enter both pairs in the sketch. Test an exposed tray, a covered tray, and reduced room light with both sensors exposed.','Only the shaded tray under a valid reference produces the warning.',[0,1,3,4,6]],
  ],
  wiring:[
    ['Uno 5 V','Supply lead on each photoresistor','Both dividers share a supply'],
    ['Uno A0','Reference sensor midpoint','Uncovered light reading'],
    ['Uno A1','Tray sensor midpoint','Seedling-level light reading'],
    ['Uno GND','Both 10 kΩ resistors and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Shade warning'],
  ],
  test:'With a reference of at least 20%, cover the tray until its reading is below 48% of the reference. The warning turns on and clears at 55% or above. Lower both readings together and check that the reference guard suppresses the warning below 20%.',
  demo:['Cover','Retracted','Extended','Tray exposed','Tray shade warning'],
};
