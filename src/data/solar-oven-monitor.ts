import type {Build} from './guided-projects';

export const solarOvenMonitor:Build={
  id:'solar-oven-model-monitor',title:'Solar oven model monitor',
  outcome:'Log air temperature in a tabletop solar collector and compare how the reflector position changes its warming curve.',
  parts:[
    ['Arduino Uno R3','1','Samples the collector, records its peak and drives the warm indicator.'],
    ['TMP36 analog temperature sensor','1','Measures the air above the absorber.'],
    ['LED and 330 Ω resistor','1 pair','Indicates at least 38 °C in this exercise.'],
    ['Card box, foil reflector and clear cover','1 set','A flat foil flap redirects light toward dark card beneath a clear cover.'],
    ['Digital reference thermometer','1','Checks the collector probe in stable air.'],
    ['Breadboard and jumper wires','1 set','Keeps electronics outside the collector.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to the serial logger.'],
  ],
  assembly:[
    ['Build the collector and reflector','Line the bottom of a shallow card box with dark card. Fit a clear cover and hinge a single flat foil-covered flap to the rear. Mark two reflector angles so you can repeat them.','The angled flap can direct light into the box and the cover stays in place.',[3]],
    ['Position the air probe','Place the TMP36 just above the dark card, with a small shade so the sensor reads air away from direct glare. Keep the probe off the absorber. Position the reference thermometer beside it for a stable comparison.','Both probes are held in the air and the Uno stays outside the enclosure.',[1,3,4]],
    ['Wire the logging circuit','Unplug USB. Connect the TMP36 power to 5 V, output to A0 and return to GND. Connect D8 through 330 Ω to the LED anode and ground the cathode.','The logger reads one input and drives one current-limited LED.',[0,1,2,5]],
    ['Compare two runs under the same light','Start close to room temperature. Under the same light source, compare a well-aimed flap and an angled-away flap. Keep the cover, probe position, and run duration the same. Reset the recorded peak before each run.','The log contains elapsed time, air temperature and the highest reading in the run.',[0,1,3,4,6]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Sensor supply'],
    ['Uno A0','TMP36 signal','Collector air reading'],
    ['Uno GND','TMP36 ground and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Warm indicator'],
  ],
  test:'Run both reflector positions for the same duration from the same starting temperature. Record temperatures and peak. In the demo, watch the 38 °C warning and verify that cooling lowers the current reading while the peak is preserved.',
  demo:['Reflector position','Angled away','Aligned','Temperature rises slowly','Collector warms and the peak updates'],
};
