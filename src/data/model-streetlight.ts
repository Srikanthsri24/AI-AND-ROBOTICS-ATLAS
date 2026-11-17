import type {Build} from './guided-projects';

export const modelStreetlight:Build={
  id:'model-streetlight',
  title:'Model streetlight',
  outcome:'Build a USB-powered streetlight that lights a model pavement at dusk and ignores a passing shadow.',
  parts:[
    ['Arduino Uno R3','1','Reads ambient light on A0 and commands the lamp from D8.'],
    ['Photoresistor','1','Senses the light outside the lamp’s illumination area.'],
    ['10 kΩ divider resistor','1','Forms a voltage divider with the photoresistor so the Uno can read the light level.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Provide a small pool of light and limit the current through the LED.'],
    ['Breadboard and jumper wires','1 set','Carry the sensor, lamp and shared ground connections.'],
    ['Card base and streetlight pole','1 set','Build a road and pavement from card and hold the lamp over the pavement with a hollow paper pole.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to the computer for power, programming and calibration.'],
  ],
  assembly:[
    ['Build the pavement and lamp post','Draw a road with a marked pavement edge. Fix a paper tube upright and make a folded card lamp head that points down at the pavement. Fit the white LED and route its two insulated leads down the tube.','The lamp points at the pavement, and no exposed leads touch.',[3,5]],
    ['Place the light sensor away from the beam','Place the photoresistor beside the roadway, away from the area illuminated by the lamp. If needed, add a small card baffle on the lamp side while leaving the sensor open to room light.','A flashlight pointed at the pavement does not directly illuminate the sensor.',[1,5]],
    ['Wire the divider and lamp','Disconnect USB. Connect the photoresistor from 5 V to A0 and the 10 kΩ resistor from A0 to ground. Run D8 through the 220 Ω resistor to the LED anode. Return the cathode to the same ground.','Bright light should increase the A0 reading. The LED has a series resistor and the sensor and lamp share a ground.',[0,1,2,3,4]],
    ['Calibrate and compare two shadows','Connect USB, upload the sketch, and record shaded and bright A0 values. Enter them as the dark and bright calibration points. Cover the sensor briefly, then shade it continuously for at least one second.','A brief shadow leaves the lamp off. Sustained dusk switches it on, and the lit pavement does not make the sensor switch it off.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','One photoresistor lead','Divider supply'],
    ['Uno A0','Other photoresistor lead and one end of 10 kΩ','Measure the divider voltage'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D8','220 Ω resistor → white LED anode','Lamp drive'],
  ],
  test:'From daylight, shade the sensor for less than one second. Then hold at or below 40% for one second and confirm the lamp turns on. Pass through the 40–55% band and verify it stays on until brightness holds at 55% or above.',
  demo:['Ambient light','Daylight','Dusk','Lamp off','Pavement illuminated'],
};
