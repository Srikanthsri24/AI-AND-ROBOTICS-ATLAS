import type {Build} from './guided-projects';

export const incubatorTemperature:Build={
  id:'model-incubator-temperature-alert',title:'Model incubator temperature alert',
  outcome:'Build a classroom temperature alarm for an empty model test chamber. Acknowledge its sounder and reset the alert after cooling.',
  parts:[
    ['Arduino Uno R3','1','Reads the temperature, latches the warning, and handles the reset button.'],
    ['TMP36 analog temperature sensor','1','Measures the air in the empty model chamber.'],
    ['LED and 330 Ω resistor','1 pair','Shows a latched high-temperature alarm.'],
    ['Passive piezo sounder','1','Sounds an alert in timed bursts.'],
    ['220 Ω piezo series resistor','1','Connects D9 to the passive piezo element.'],
    ['Momentary tactile button','1','Acknowledges the sounder and resets the alarm after the model cools.'],
    ['Model chamber and dry test block','1 set','A clear container and an inert block mark the test area.'],
    ['Breadboard and jumper wires','1 set','Holds the connections outside the chamber.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the empty test chamber','Place an inert card block inside a clear container. Mount the TMP36 in the air above it. Keep the Uno, breadboard and controls outside.','The probe does not touch the block or walls.',[1,6,7]],
    ['Wire the temperature input','Unplug USB and check the TMP36 pinout. Connect supply to 5 V, signal to A0 and the ground lead to Uno GND.','The sensor is wired to A0 and shares ground with the Uno.',[0,1,7]],
    ['Connect and label the alarm panel','Wire D8 through 330 Ω to the LED anode, and D9 through 220 Ω to the passive piezo. Ground their returns. Wire the button between D2 and ground.','The button goes low on press. The LED and sounder have separate outputs.',[0,2,3,4,5,7]],
    ['Trigger, acknowledge and reset','Upload the sketch. Use the browser for the complete temperature sequence, or test the tabletop alarm with a sealed warm-water bottle near the probe and a reference thermometer. Remove the warm source before the reset test.','At 37 °C the LED and sounder start. A press silences sound. The LED remains latched until a button press at 35 °C or below.',[0,1,2,3,5,8]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Sensor power'],
    ['Uno A0','TMP36 signal','Chamber air reading'],
    ['Uno GND','TMP36 ground, LED cathode, piezo return and button return','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Latched alarm flag'],
    ['Uno D9','220 Ω resistor → passive piezo','Pulsed audible warning'],
    ['Uno D2','Acknowledge/reset button → GND','Active-low input'],
  ],
  test:'Reach 37 °C to latch the LED and sounder. Press while warm to silence only the sounder. Cool to 35 °C or below and confirm the LED stays on until a new press. Warm again to verify rearm.',
  demo:['Chamber air','Cool','Hot','Alarm ready','Alarm latched'],
};
