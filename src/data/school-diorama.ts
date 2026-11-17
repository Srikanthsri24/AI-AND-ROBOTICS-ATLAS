import type {Build} from './guided-projects';

export const schoolDiorama:Build={
  id:'school-diorama-night-mode',title:'School diorama night mode',
  outcome:'Build a model school whose path lights at dusk and whose classroom lights when the room gets darker.',
  parts:[
    ['Arduino Uno R3','1','Reads the outdoor sensor and controls two separate lighting zones.'],
    ['Photoresistor','1','Reads room light outside the model.'],
    ['10 kΩ divider resistor','1','Provides an analog voltage at A0.'],
    ['Diffused white LEDs and 220 Ω resistors','2 pairs','One LED and resistor per zone.'],
    ['Card school, path and window diffuser','1 set','Build a school façade, a path, and a paper diffuser behind the windows.'],
    ['Breadboard and jumper wires','1 set','Connects the divider, zone outputs and shared return.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the school and its path','Cut windows in a card façade and place translucent paper behind them. Mount one LED behind that diffuser and one beside the entrance path. Route insulated leads to the back.','The two light sources illuminate separate parts of the diorama.',[3,4]],
    ['Place and wire the outdoor sensor','With USB disconnected, mount the photoresistor beyond both light pools. Connect it from 5 V to A0 and place 10 kΩ from A0 to ground. Add a card baffle if needed.','Room light reaches the sensor and light from the two LEDs does not drive the reading.',[0,1,2,4,5]],
    ['Connect the two zone branches','Run D8 through 220 Ω to the path LED anode and D9 through a separate 220 Ω resistor to the classroom LED anode. Tie both cathodes to Uno ground.','Each zone has its own pin and resistor.',[0,3,5]],
    ['Calibrate and run a day-to-night test','Record bright and shaded A0 values, enter them in the sketch and upload. Start in daylight, drop to 45%, then drop to 28%. Restore light gradually.','The path comes on first. The classroom joins at night and switches off first when light returns.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor supply lead','Ambient light divider supply'],
    ['Uno A0','Other photoresistor lead and one end of 10 kΩ','Divider midpoint'],
    ['Uno GND','Other end of 10 kΩ and both LED cathodes','Shared return'],
    ['Uno D8','220 Ω resistor → path LED anode','Path zone'],
    ['Uno D9','220 Ω resistor → classroom LED anode','Classroom zone'],
  ],
  test:'From daylight, the path lights at 45% and the classroom joins at 28%. On the way back up the classroom clears at 38% and the path clears at 55%. Record all four transitions.',
  demo:['Room brightness','Daylight','Night','Both zones off','Path and classroom on'],
};
