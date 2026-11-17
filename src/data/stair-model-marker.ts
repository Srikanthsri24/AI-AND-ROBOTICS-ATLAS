import type {Build} from './guided-projects';

export const stairModelMarker:Build={
  id:'stair-model-marker',title:'Stair model marker',
  outcome:'Build a tabletop staircase whose three step markers switch on from bottom to top as the room darkens.',
  parts:[
    ['Arduino Uno R3','1','Reads ambient light and sequences three marker outputs.'],
    ['Photoresistor','1','Measures room light away from the markers.'],
    ['10 kΩ divider resistor','1','Forms the sensor voltage divider.'],
    ['Diffused white LEDs and 220 Ω resistors','3 pairs','Each step uses one white LED and its own current-limiting resistor.'],
    ['Card stair model and mounting strips','1 set','Three stacked steps hold the markers on their front edges.'],
    ['Breadboard and jumper wires','1 set','Connect the sensor, the three lamps and the shared ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the miniature staircase','Stack three card platforms on a flat base. Label them bottom, middle and top. Fix a diffused LED at each front edge with its leads insulated and accessible.','Each marker identifies a different edge and the model rests flat.',[3,4]],
    ['Put the light sensor beside the steps','Place the photoresistor outside the beam. Connect it from 5 V to A0 and connect the 10 kΩ resistor from A0 to ground.','A shadow over the sensor lowers the A0 reading, and the step LEDs face away from it.',[0,1,2,5]],
    ['Connect three independent marker branches','Disconnect USB. Use D8 for the bottom marker, D9 for the middle and D10 for the top. Each pin feeds its own 220 Ω resistor and LED anode. Connect all cathodes to the same ground rail.','The three output pins are separate. Every LED has a resistor and a ground return.',[0,3,5]],
    ['Calibrate and check the order','Upload the sketch, record a bright and shaded A0 reference, and enter those values. Shade the sensor. Watch the bottom edge light first, then the middle and top.','The sequence runs once and leaves all three markers on until daylight returns.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor supply lead','Ambient sensor supply'],
    ['Uno A0','Photoresistor other lead and one end of 10 kΩ','Divider midpoint'],
    ['Uno GND','Other end of 10 kΩ and three LED cathodes','Shared return'],
    ['Uno D8','220 Ω resistor → bottom LED anode','First edge'],
    ['Uno D9','220 Ω resistor → middle LED anode','Second edge'],
    ['Uno D10','220 Ω resistor → top LED anode','Third edge'],
  ],
  test:'At 45% room light or below, the bottom, middle, and top edges light in order, 250 ms apart. At 50% all stay lit. At 55% or above all turn off. Dimming again restarts at the bottom.',
  demo:['Ambient light','Daylight','Dark','All edges off','Bottom, middle, and top illuminated'],
};
