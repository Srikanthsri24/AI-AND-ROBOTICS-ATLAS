import type {Build} from './guided-projects';

export const aquariumTemperature:Build={
  id:'aquarium-model-temperature-alert',title:'Aquarium model temperature alert',
  outcome:'Compare a model tank’s water reference and a dry sensor on the outside wall. Light the warning when the wall reading reaches 28 °C.',
  parts:[
    ['Arduino Uno R3','1','Converts the wall sensor voltage and switches the warning LED.'],
    ['TMP36 analog temperature sensor','1','Measures from a dry contact pad against the outside of the tank.'],
    ['LED and 330 Ω resistor','1 pair','Indicates that the wall reading has crossed the high threshold.'],
    ['Clear model tank and dry sensor pad','1 set','A small clear container, insulating foam and tape position the probe against the outer wall.'],
    ['Digital reference thermometer','1','Use a thermometer rated for water to check the test water independently.'],
    ['Breadboard and jumper wires','1 set','Keeps the electrical connections on the dry side.'],
    ['USB-A to USB-B data cable','1','Provides power and connects the Uno to Serial Monitor.'],
  ],
  assembly:[
    ['Set up the model tank and dry pad','Place a clear container on a spill tray. Tape the TMP36 body flat against the outside wall below the test-water line. Cover its outward-facing side with dry foam. Keep the leads and breadboard outside the spill tray.','The sensing package contacts the outer wall without putting any electronics in the water.',[1,3,5]],
    ['Connect the sensor and warning','With USB unplugged, check the TMP36 pinout. Connect supply to 5 V, signal to A0, and ground to GND. Route D8 through 330 Ω to the LED anode and tie its cathode to ground.','The dry wall sensor is the only input to the Arduino.',[0,1,2,5]],
    ['Compare steady readings','With the circuit away from the tank, prepare the test water. Dry the outside, reconnect, then compare the settled wall reading with a water-rated thermometer. Use a steady offset only to correct a settled comparison.','The water reference and wall reading are recorded separately.',[0,1,3,4,6]],
    ['Observe the response to a change','Disconnect USB before changing the test water. Dry the outside and reconnect. Warm above the threshold, then compare the warm reading with a cooler trial. Use the browser to see the uninterrupted transition.','In the model, the water reference changes before the outside sensor. The flag follows the wall reading.',[1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Powers the dry sensor'],
    ['Uno A0','TMP36 output','Wall temperature signal'],
    ['Uno GND','TMP36 ground and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','High wall-temperature flag'],
  ],
  test:'Warm the model and follow the wall reading, which rises more slowly than the water reference. The LED turns on at 28 °C and stays on at 27 °C until the wall cools to 26 °C or below.',
  demo:['Water reference','Cool','Warm','Wall flag clear','Wall warning after warming'],
};
