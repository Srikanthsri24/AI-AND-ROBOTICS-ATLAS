import type {Build} from './guided-projects';

export const modelCrossingRequest:Build={
  id:'model-crossing-request',
  title:'Model crossing request',
  outcome:'Press the pedestrian button to queue one crossing phase. Verify that the model stops traffic before showing WALK and restores traffic only after pedestrian clearance.',
  parts:[
    ['Arduino Uno R3','1','Debounces the request and sequences the lamps.'],
    ['Momentary tactile button','1','Queues a crossing request from the model curb.'],
    ['Signal LEDs and 220 Ω resistors','5 pairs','Provides vehicle green, amber and red, plus pedestrian WAIT and WALK.'],
    ['Model crossing road and signal masts','1 set','Builds a tabletop road, crossing stripes and two separate signal heads.'],
    ['Breadboard and jumper wires','1 set','Connects each lamp through its own series resistor.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects to Serial Monitor.'],
  ],
  assembly:[
    ['Build the model crossing','Mark a striped pedestrian path across a short card road. Put the three vehicle lamps beside the road and the two pedestrian lamps facing the path. Mount the pushbutton on the curb.','The signal heads face their own users and each lamp is easy to identify.',[1,2,3]],
    ['Connect the request input','Unplug USB. Identify the terminals that connect only when the button is pressed. Wire the switch between D2 and GND.','D2 is high at rest through INPUT_PULLUP and low during a stable press.',[0,1,4]],
    ['Wire the vehicle and pedestrian lamps','Connect D5, D6 and D7 through individual 220 Ω resistors to vehicle green, amber and red. Wire D8 and D9 the same way to WAIT and WALK. Connect all cathodes to GND.','Each LED has its own resistor and none of the five outputs share a signal lead.',[0,2,4]],
    ['Test the queued sequence','Upload the sketch. Press shortly after vehicle green starts. The request waits until green has run for at least three seconds. Observe amber, all-stop, WALK with vehicle red, and clearance before green returns.','Vehicle green and pedestrian WALK never light together. Holding the button or pressing during service does not start a second crossing.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D2','Crossing button → GND','Active-low request'],
    ['Uno D5','220 Ω → vehicle green anode','Vehicle proceed'],
    ['Uno D6','220 Ω → vehicle amber anode','Vehicle transition'],
    ['Uno D7','220 Ω → vehicle red anode','Vehicle stop'],
    ['Uno D8','220 Ω → pedestrian WAIT anode','Pedestrian stop'],
    ['Uno D9','220 Ω → pedestrian WALK anode','Pedestrian crossing'],
    ['Uno GND','Button return and five LED cathodes','Shared return'],
  ],
  test:'Request a walk just after green starts, then again after it has been green at least three seconds. Check the queue, phase order and locked request during service. Use only the tabletop model.',
  demo:['Press to queue','Vehicle amber','All stop','Walk phase','Pedestrian clearance'],
};
