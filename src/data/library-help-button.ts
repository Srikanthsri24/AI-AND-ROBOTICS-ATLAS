import type {Build} from './guided-projects';

export const libraryHelpButton:Build={
  id:'library-help-button',
  title:'Library help button',
  outcome:'Press a visitor button to light a local indicator and leave the staff request light on until someone acknowledges it.',
  parts:[
    ['Arduino Uno R3','1','Debounces both switches and remembers whether a request is waiting.'],
    ['Momentary tactile button','2','Use one button for the visitor and one for staff acknowledgment.'],
    ['LED and 330 Ω resistor','2 pairs','A visitor light follows the button. A separate staff light shows a waiting request.'],
    ['Library counter and help panel','1 set','A tabletop card model holds clearly labeled visitor and staff stations.'],
    ['Breadboard and jumper wires','1 set','Connects the switches and indicators to the Uno.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries the event log to Serial Monitor.'],
  ],
  assembly:[
    ['Set up the two stations','Put one switch and one LED on each side of a small card counter. Label the visitor switch HELP and the staff switch ACKNOWLEDGE. Set the Uno and breadboard where the wires can be reached.','Each button is next to its own indicator, and wires can move without pulling the buttons off the model.',[1,2,3]],
    ['Wire both active-low switches','Unplug USB. On each tactile switch, verify that the terminals selected connect only when pressed. Connect visitor signal to D2, staff signal to D3, and the opposite switched terminal of each to ground.','A press connects its input to GND. INPUT_PULLUP keeps it high when released.',[0,1,4]],
    ['Wire the two lights','Connect D8 through one 330 Ω resistor to the visitor LED anode. Connect D9 through a second 330 Ω resistor to the staff LED anode. Connect both cathodes to ground.','The LEDs share ground and each has its own resistor.',[0,2,4]],
    ['Test a complete request','Upload the sketch and open Serial Monitor. Press and release HELP. The visitor light follows the press. The staff light stays on until a new ACKNOWLEDGE press. Then send another request.','Each press registers once. ACKNOWLEDGE while idle has no effect. If both press edges arrive together, the request takes priority.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D2','Visitor HELP switch → GND','Active-low request input'],
    ['Uno D3','Staff ACKNOWLEDGE switch → GND','Active-low acknowledgment input'],
    ['Uno D8','330 Ω → visitor LED anode','Lights while HELP is held'],
    ['Uno D9','330 Ω → staff LED anode','Stays lit for a waiting request'],
    ['Uno GND','Both switch returns and LED cathodes','Shared return'],
  ],
  test:'Verify both indicators during a press, the persistent staff indicator after release, and that acknowledgment clears it. Holding either button should generate one press event.',
  demo:['Visitor station','Press HELP','Request waits','Staff acknowledges','Ready for another request'],
};
