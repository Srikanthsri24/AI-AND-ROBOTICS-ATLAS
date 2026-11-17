import type {Build} from './guided-projects';

export const displayCaseLight:Build={
  id:'display-case-light',title:'Display case light',
  outcome:'Build an automatic exhibit lamp that switches on as the room dims and brightens as the room gets darker.',
  parts:[
    ['Arduino Uno R3','1','Reads room light on A0 and dims the exhibit LED using D9.'],
    ['Photoresistor','1','Measures room light from outside the case.'],
    ['10 kΩ divider resistor','1','Converts the photoresistor response to a voltage on A0.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Lights the exhibit. The resistor limits current during each pulse.'],
    ['Clear case and exhibit plinth','1 set','A clear container, card base and small display object make the beam visible.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor, LED and ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the exhibit and mount the lamp','Place a small object on a card plinth with a clear cover. Attach the LED above the object and angle it down. Route both insulated leads along the back edge.','The lamp illuminates the object and its leads stay clear of the cover.',[3,4]],
    ['Place the sensor outside the case','Mount the photoresistor on the outer side of the base, facing the room. Add a card baffle if the exhibit LED can shine on the sensor.','The sensor sees room light while the LED lights the exhibit.',[1,4]],
    ['Wire the sensor and dimmable LED','With USB disconnected, put the photoresistor between 5 V and A0, with 10 kΩ from A0 to ground. Connect D9 through 220 Ω to the LED anode and return the cathode to ground.','Each resistor is in the correct branch and the lamp uses D9.',[0,1,2,3,5]],
    ['Calibrate and compare three light levels','Upload the sketch and record shaded and bright A0 values. Update the calibration. Then compare normal room light, dusk, and near darkness.','The lamp is off in a bright room, on at dusk, and brighter near darkness.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor supply lead','Sensor supply'],
    ['Uno A0','Photoresistor other lead and one end of 10 kΩ','Divider midpoint'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D9','220 Ω resistor → LED anode','PWM brightness output'],
  ],
  test:'Lower room light to 37% or less. Check that the lamp turns on. Reduce room light further and check that duty rises. Restore the light. The lamp stays on through twilight and goes off at 47% or above.',
  demo:['Room brightness','Bright','Dark','Exhibit lamp off','Exhibit lamp brightens'],
};
