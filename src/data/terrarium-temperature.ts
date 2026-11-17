import type {Build} from './guided-projects';

export const terrariumTemperature:Build={
  id:'terrarium-temperature-flag',title:'Terrarium temperature flag',
  outcome:'Build a model terrarium that lights a warning when its air reaches 29 °C. Compare a closed lid with an open vent.',
  parts:[
    ['Arduino Uno R3','1','Converts TMP36 voltage to degrees Celsius and drives the warning.'],
    ['TMP36 analog temperature sensor','1','Measures air temperature inside the enclosure.'],
    ['LED and 330 Ω resistor','1 pair','Shows the high-temperature flag. The resistor limits current.'],
    ['Clear terrarium and movable vent','1 set','A clear model enclosure and removable card vent let you compare two airflow conditions.'],
    ['Digital reference thermometer','1','Checks the air temperature next to the TMP36.'],
    ['Breadboard and jumper wires','1 set','Holds the warning circuit outside the enclosure.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to Serial Monitor.'],
  ],
  assembly:[
    ['Prepare an empty model enclosure','Make a clear enclosure with a removable lid or a flap. Keep the breadboard and Uno outside, away from moisture. Fix the TMP36 in the air, away from the wall and any direct warm object.','Opening the vent changes airflow without moving the sensor.',[1,3,5]],
    ['Connect the sensor and warning flag','With USB unplugged, identify the TMP36 pins using its data sheet. Connect supply to 5 V, output to A0 and ground to GND. Run D8 through 330 Ω to the LED anode, and return its cathode to ground.','The sensor pinout and LED polarity match the wiring map.',[0,1,2,5]],
    ['Compare with a reference thermometer','Place the reference probe near the TMP36 without touching it. Wait for both readings to settle. Record the difference and enter the correction in the sketch if needed.','Both sensors sample the same pocket of air.',[0,1,4,6]],
    ['Warm the model, then open the vent','Place a sealed bottle of warm water in the enclosure away from both probes. Watch the temperature rise. Remove the bottle and open the vent to cool the air.','The flag turns on at 29 °C and clears at 27 °C, staying steady in between.',[1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Power for the analog sensor'],
    ['Uno A0','TMP36 output','Temperature voltage'],
    ['Uno GND','TMP36 ground and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Temperature flag'],
  ],
  test:'Warm through 29 °C to turn the flag on. Cool to 28 °C and verify it stays on. At 27 °C it clears. Observe 28 °C on the way back up to verify that it stays off until 29 °C.',
  demo:['Air temperature','Cool','Warm','Flag clear','High-temperature flag on'],
};
