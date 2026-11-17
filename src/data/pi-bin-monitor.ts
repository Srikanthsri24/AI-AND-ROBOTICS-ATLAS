import type { Build } from './guided-projects';

export const emptyGap=500, fullGap=120;
export const piBinMonitor:Build={
  id:'directory-104',title:'IOT Garbage Monitoring Using Raspberry Pi',
  outcome:'Measure the air gap above a dry model bin, turn that distance into a calibrated fill estimate, and check the local Raspberry Pi dashboard for collection and sensor status.',
  parts:[
    ['Raspberry Pi 5','1','Runs the USB reader and local dashboard. Use normal Raspberry Pi OS boot storage and cooling.'],
    ['27 W USB-C power supply','1','Provides independent Pi power.'],
    ['Arduino Uno R3','1','Measures the 5 V sonar’s echo time and sends serial readings to the Pi.'],
    ['HC-SR04 ultrasonic module','1','Measures the gap above a clean, flat target under the top crossbar.'],
    ['Lidded waste bin','1','Use a clean dry bin with a fixed top crossbar and a movable cardboard target.'],
    ['Breadboard and jumper wires','1 set','Connect the sonar to the Uno.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries readings from the Uno to the Pi.'],
  ],
  assembly:[
    ['Build the measuring station','Fit a rigid top crossbar across a clean bin. Center the sensor facing downward. Use a flat cardboard plate that you can support at several heights.','The target stays level, with a clear path from both sonar transducers.',[3,4]],
    ['Measure both reference gaps','Measure from the sensor face to the bottom, then to your full-reference target. Keep the full-reference gap at least 100 mm.','The empty gap is larger than the full gap. Write down both values in millimeters.',[3,4]],
    ['Connect the sonar and the Pi','Disconnect power and wire the sonar to the Uno. Connect the Uno to the Pi with USB after uploading the sketch.','The 5 V echo wire goes to the Uno only. The Pi receives data over USB.',[0,1,2,3,5,6]],
    ['View the dashboard','Run the Python monitor with your serial port and reference gaps. On the Pi, open the dashboard URL and move the target upward.','A smaller gap gives a higher fill estimate. At 80% the dashboard flags collection.',[0,2,4]],
    ['Check stale and invalid readings','Remove the flat target and aim the sensor into clear space for a no-echo test. Restore the target, then unplug the Uno cable and wait three seconds.','No echo gives an unavailable reading. After USB data stops, the monitor shows stale and hides the previous estimate.',[0,2,3,4,6]],
  ],
  wiring:[
    ['Uno 5 V / GND','HC-SR04 VCC / GND','Sensor power and return.'],
    ['Uno D2','HC-SR04 TRIG','Trigger pulse.'],
    ['HC-SR04 ECHO','Uno D3','Echo pulse measurement on the 5 V board.'],
    ['Uno USB-B','Raspberry Pi USB-A','USB serial at 115200 baud.'],
    ['27 W Pi supply','Raspberry Pi USB-C','Independent Pi power.'],
  ],
  test:'Start with the empty reference, then use the full reference target. Verify approximately 0% and 100%. Move to the 80% point and check that collection is flagged. Restore a larger gap and verify the flag clears. Disconnect the Uno to check that the last reading expires.',
  demo:['Ultrasonic echo','USB serial','Calibrated fill','Collection flag','Stale reading'],
};
