import type {Build} from './guided-projects';

export const capillaryWateringModel:Build={
  id:'capillary-watering-model',
  title:'Capillary watering model',
  outcome:'Use a cotton wick to feed water from a lower reservoir into a soil cup. Compare the soil reading with the wick immersed and with its lower end held above the water.',
  parts:[
    ['Arduino Uno R3','1','Reads the probe and logs the test condition, elapsed time and change from baseline.'],
    ['SEN0193 capacitive soil probe','1','Measures local soil conditions at a fixed depth near the wick.'],
    ['Braided cotton wick','1 length','Carries water from the reservoir into the soil. Use untreated cotton.'],
    ['Clear reservoir and raised soil cup','1 set','Keeps the cup above the waterline and gives a visible path for the wick.'],
    ['Dry and damp soil samples','2 references','Set the relative index using the same soil mix as the test cup.'],
    ['Breadboard and jumper wires','1 set','Connects the probe with the board well away from the reservoir.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries its serial data.'],
  ],
  assembly:[
    ['Build the raised cup','Place the soil cup on a stable support over a clear water reservoir. Use an adult-prepared opening in the cup base and thread the cotton wick through it. Lay the upper end through the lower soil layer and leave the lower end reachable.','The cup stays above the maximum waterline and the wick can be raised without moving the cup.',[2,3]],
    ['Wire the soil probe','Unplug USB. Connect VCC to 5 V, GND to GND and the analog output to A0. Mount at a marked depth near the wick, keeping the electronics and connector dry.','The blade samples soil near the wick without touching it, and the controller sits away from drips.',[0,1,5]],
    ['Calibrate and run the control','Capture dry and damp references with d and w. Put the probe back at its marked depth in the prepared cup. Fill the reservoir and hold the wick tip above the water. Enter c to save a baseline and begin the control. Enter l at matched intervals.','The control log reports how the soil changes with no contact between wick and reservoir.',[0,1,2,3,4,6]],
    ['Repeat with the wick immersed','Use fresh soil at the same starting moisture and an identical dry wick for the second run. Lower its tip into the water, enter i promptly, and sample at the same intervals. Leave the pot above the waterline.','Compare the change from each baseline. If the immersed run rises slowly, check that the wick is absorbent and in contact with both water and soil.',[0,1,2,3,6]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC','Sensor power'],
    ['Uno GND','Probe GND','Signal reference'],
    ['Uno A0','Probe analog output','Soil beside the wick'],
    ['Reservoir water','Cotton wick → soil cup','Passive water path'],
  ],
  test:'Keep the sensor position, soil mix, starting moisture, and sampling schedule comparable. Compare index change from baseline with the wick suspended and immersed.',
  demo:['Raised soil cup','No-contact control','Wick immersed','Observe soil response','Compare logged runs'],
};
