import type {Build} from './guided-projects';

export const tunnelModelLight:Build={
  id:'tunnel-model-light',title:'Tunnel model light',
  outcome:'Light the entrance of a tabletop tunnel when the sensor inside stays dark. Compare a brief obstruction with sustained shade.',
  parts:[
    ['Arduino Uno R3','1','Checks the interior reading and times the entrance lamp.'],
    ['Photoresistor','1','Measures available light inside the tunnel.'],
    ['10 kΩ divider resistor','1','Converts the photoresistor response into a voltage on A0.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Illuminates the entrance through a current-limiting resistor.'],
    ['Card tunnel, movable screen and sensor hood','1 set','Forms the model, shades the interior, and blocks direct glare at the sensor.'],
    ['Breadboard and jumper wires','1 set','Connects the light divider and entrance LED.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the tunnel and fit the entrance lamp','Bend card over a marked roadway. Leave an inspection opening or a removable roof. Mount the white LED at the entrance, aimed down toward the approach.','The approach is visible and the LED wires do not cross the opening.',[3,4]],
    ['Place the sensor inside the tunnel','Set the photoresistor on the far side of the lamp with a small hood between them. Use a movable card screen over the roof opening to shade the sensor without dimming the approach.','Adding the screen lowers the sensor reading even when the entrance stays bright.',[1,4]],
    ['Wire the sensor and lamp','Unplug USB. Connect the photoresistor from 5 V to A0 and put 10 kΩ from A0 to ground. Connect D8 through 220 Ω to the LED anode and tie the cathode to ground.','The two circuits share ground and the LED has its own resistor.',[0,1,2,3,5]],
    ['Calibrate and time the response','Upload the sketch, record shaded and bright A0 values inside the tunnel, and enter them in the calibration constants. Compare a passing screen with a screen left in place.','A brief shade leaves the lamp off. Sustained interior darkness lights the entrance.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','One photoresistor lead','Sensor supply'],
    ['Uno A0','Other photoresistor lead and one end of 10 kΩ','Interior light divider midpoint'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D8','220 Ω resistor → white LED anode','Entrance lamp'],
  ],
  test:'From a bright interior, shade the sensor for less than 700 ms. Then hold the reading at 42% or below for at least 700 ms. The lamp lights only on the second trial and goes off when the interior reaches 52%.',
  demo:['Tunnel interior','Bright','Shaded','Entrance lamp off','Entrance lamp on after a delay'],
};
