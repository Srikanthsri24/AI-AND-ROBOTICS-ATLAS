import type {Build} from './guided-projects';

export const sandySoilCalibration:Build={
  id:'sandy-soil-calibration',
  title:'Sandy soil calibration',
  outcome:'Measure one probe in three portions of the same sandy mix. Use the dry and wet readings as endpoints and check how close the middle dose comes to the middle of the scale.',
  parts:[
    ['Arduino Uno R3','1','Reads the probe and reports the calibration through USB.'],
    ['SEN0193 capacitive soil probe','1','Gives an analog reading at the marked depth.'],
    ['Sandy mix and identical sample cups','3 equal portions','Keep soil type, cup shape and fill depth the same across the three water doses.'],
    ['Graduated cylinder','1','Measures 15 mL and 30 mL of water for the two damp samples.'],
    ['Breadboard and jumper wires','1 set','Connects the probe to A0 and to power and ground.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries readings to the computer.'],
  ],
  assembly:[
    ['Prepare the sample cups','Fill three identical cups with equal portions of the same dry sandy mix. Use deep cups and enough mix to cover the sensing area at a consistent depth. Label the cups 0, 15 and 30 mL.','Fill height and packing are comparable across all cups.',[1,2]],
    ['Measure water and mix evenly','Leave the first cup dry. Add 15 mL to the second and 30 mL to the third, stirring each separately. If water pools, use larger equal portions and restart.','The samples differ in added water and have no standing water.',[2,3]],
    ['Wire the probe','With USB unplugged, connect the probe supply and ground to 5 V and GND. Connect the analog output to A0. Keep the connector and controller on the dry side of the bench.','Supply, ground and output match the markings on the probe.',[0,1,4]],
    ['Capture the endpoints and check the middle','Upload the sketch and open Serial Monitor. Measure the dry cup and send d. Wipe the blade, measure the wetter cup and send w. Wipe the blade again and measure the 15 mL cup with m. Use the same insertion depth and wait for each reading to settle.','The two endpoints are distinct. The middle reading normally falls between them and can differ from an index of 50.',[0,1,2,5]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC','Sensor power'],
    ['Uno GND','Probe GND','Signal return'],
    ['Uno A0','Probe analog output','Raw ADC count from the sandy mix'],
  ],
  test:'Record dry and wetter endpoints, then compare the 15 mL reading to the average of the raw endpoints. Repeat the middle test at the same depth and log the spread.',
  demo:['Three doses','Dry endpoint','Wetter endpoint','Midpoint comparison','Relative index'],
};
