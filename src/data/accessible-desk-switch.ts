import type {Build} from './guided-projects';

export const accessibleDeskSwitch:Build={
  id:'accessible-desk-switch',
  title:'Accessible desk switch',
  outcome:'Use a broad hinged paddle to press a small switch. Compare an indicator that follows the press with one that changes state on each press.',
  parts:[
    ['Arduino Uno R3','1','Reads the paddle and mode buttons and drives the indicator.'],
    ['Roller-lever microswitch','1','Closes when the paddle depresses its roller.'],
    ['Momentary tactile button','1','Changes between Hold and Toggle mode.'],
    ['LED and 330 Ω resistor','1 pair','Shows the output of the selected mode.'],
    ['Card paddle, hinge and travel stops','1 set','A broad hinged surface gives more room to aim and limits travel so the switch is not crushed.'],
    ['Breadboard and jumper wires','1 set','Connects both switches and the lamp to the Uno.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries the Serial Monitor output.'],
  ],
  assembly:[
    ['Build a stable paddle','Tape one edge of a broad card paddle to a rigid base to form a hinge. Mount the roller switch beneath it and add stops that allow the switch to click without forcing it past its travel.','Press and release at several points on the paddle. It returns to its resting position and the roller releases.',[1,4]],
    ['Connect the switch inputs','Unplug USB. Wire the roller COM to GND and NO to D2. Wire the mode button between D3 and GND. Keep the mode button separate from the paddle.','Both inputs read high at rest and go low only while their switch closes.',[0,1,2,5]],
    ['Wire the indicator','Connect D8 through the 330 Ω resistor to the anode. Connect the cathode to GND. Secure the breadboard and add slack to wires near moving parts.','The LED has its own current-limiting resistor and both inputs share its ground.',[0,3,5]],
    ['Compare Hold and Toggle','Power the Uno and open Serial Monitor. In Hold, press and release the paddle. Change to Toggle and use two separate paddle presses. Try changing modes during a hold, then release and press again.','Hold follows the paddle. Toggle changes once per new press. Changing modes turns the light off and waits for release before accepting a new press.',[0,1,2,3,6]],
  ],
  wiring:[
    ['Uno D2','Microswitch NO; COM → GND','Active-low paddle input'],
    ['Uno D3','Mode button → GND','Select Hold or Toggle'],
    ['Uno D8','330 Ω → LED anode','Output indicator'],
    ['Uno GND','Switch returns and LED cathode','Shared return'],
  ],
  test:'Try short and long presses in both modes. Confirm one transition per press in Toggle and test switching modes while the paddle stays down.',
  demo:['Broad paddle','Roller contact','Hold mode','Toggle mode','Release after switching'],
};
