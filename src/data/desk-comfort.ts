import type {Build} from './guided-projects';

export const deskComfort:Build={
  id:'desk-comfort-monitor',title:'Desk comfort monitor',
  outcome:'Build a desk-air monitor with an adjustable temperature threshold and separate cool, in-band, and warm indicators.',
  parts:[
    ['Arduino Uno R3','1','Reads the desk sensor and threshold dial and drives one indicator at a time.'],
    ['TMP36 analog temperature sensor','1','Measures air near the study area.'],
    ['10 kΩ cutoff potentiometer','1','Sets the upper threshold between 24 °C and 32 °C.'],
    ['Red, amber and green LEDs','3','Amber means below the band, green means in range, and red means at or above the upper threshold.'],
    ['330 Ω resistors','3','Each indicator has its own series resistor.'],
    ['Digital reference thermometer','1','Checks the sensor reading at the same position.'],
    ['Breadboard and jumper wires','1 set','Supports the inputs and the three independent outputs.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to the IDE.'],
  ],
  assembly:[
    ['Place the sensor at the study spot','Mount the TMP36 in free air beside the study area. Put the reference probe next to it. Keep both away from hot equipment and direct sun during the comparison.','Both probes measure the same air without touching the desk or each other.',[1,5]],
    ['Connect the two analog inputs','With USB unplugged, wire the TMP36 supply to 5 V, its output to A0 and its ground to GND. Wire the potentiometer outer terminals to 5 V and GND and its center terminal to A1.','Turning the dial changes A1. It does not change the ambient reading on A0.',[0,1,2,6]],
    ['Wire the three indicators','Connect D8 to the amber LED, D9 to green and D10 to red. Put a separate 330 Ω resistor between each pin and its LED anode. Connect the cathodes to ground.','All three pins are independent and each branch has a resistor.',[0,3,4,6]],
    ['Calibrate and change the dial','Upload the sketch and compare the reported air temperature with the reference. Set the upper threshold to 27 °C, compare the three indicator states, then turn the dial at a fixed desk temperature.','Exactly one LED lights. Turning the dial can change the classification without changing the measured temperature.',[0,1,2,3,5,7]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply and one dial outer terminal','Supply reference'],
    ['Uno A0','TMP36 output','Desk-air temperature voltage'],
    ['Uno A1','Dial center terminal','Upper temperature threshold'],
    ['Uno GND','TMP36 ground, other dial outer terminal and three cathodes','Shared reference'],
    ['Uno D8','330 Ω → amber LED anode','Below the band'],
    ['Uno D9','330 Ω → green LED anode','Within the band'],
    ['Uno D10','330 Ω → red LED anode','At or above threshold'],
  ],
  test:'Set the dial to 27 °C. At 22 °C expect amber. At 23–26 °C expect green. At 27 °C or higher expect red. Hold the air at 26 °C and turn the threshold from 27 °C down to 26 °C. Only the classification should change.',
  demo:['Desk temperature','Cool','Warm','Below the chosen band','At or above the chosen threshold'],
};
