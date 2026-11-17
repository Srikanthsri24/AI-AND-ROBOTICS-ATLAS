import type {Build} from './guided-projects';

export const readingCorner:Build={
  id:'reading-corner-indicator',
  title:'Reading corner indicator',
  outcome:'Measure light at a page and use an adjustable cutoff to indicate when the reading surface needs more light.',
  parts:[
    ['Arduino Uno R3','1','Reads page brightness and the adjustable cutoff.'],
    ['Photoresistor','1','Senses light at the same height and angle as the page.'],
    ['10 kΩ divider resistor','1','Converts the sensor resistance into a voltage on A0.'],
    ['10 kΩ cutoff potentiometer','1','The center terminal sets the cutoff on A1.'],
    ['LED and 330 Ω resistor','1 pair','The LED gives a visible reminder. Its series resistor limits current.'],
    ['Breadboard and jumper wires','1 set','Holds the sensor circuit, dial leads and shared ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
    ['Book and shade card','1 set','Provides a repeatable reading surface and a way to shade the page.'],
  ],
  assembly:[
    ['Measure at the page','Open a book and fix the photoresistor next to the text, facing up. Keep it at page height and away from the indicator LED.','The same shadow can cover the page and the sensor.',[1,7]],
    ['Wire the page sensor and cutoff dial','With USB unplugged, connect the photoresistor from 5 V to A0 and the 10 kΩ resistor from A0 to ground. Wire the dial’s two outer terminals to 5 V and ground, and its center terminal to A1.','The sensor and dial have separate analog inputs and share ground.',[0,1,2,3,5]],
    ['Install the status light','Connect D8 through 330 Ω to the LED anode, and connect the cathode to ground. Face the LED toward the reader and away from the light sensor.','A lit status LED leaves the page sensor reading essentially unchanged.',[0,1,4,5]],
    ['Compare lighting at a chosen cutoff','Upload the sketch, calibrate bright and shaded references, and turn the dial to about 55%. Compare the exposed page, a shadow across the page, and the same page after adding light.','The status light turns on below the cutoff and clears once the page is at least five points brighter than the cutoff.',[0,1,3,4,6,7]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor outer lead and dial outer terminal','Provides both analog inputs with a supply reference'],
    ['Uno A0','Photoresistor other lead and 10 kΩ resistor','Page-light divider midpoint'],
    ['Uno A1','Dial center terminal','Adjustable cutoff'],
    ['Uno GND','Divider resistor, unused dial outer terminal and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Status light output'],
  ],
  test:'At a 55% cutoff, shade the page below 55% and check that the status light turns on. At 58% it stays on. At 60% it clears. Change the dial at fixed page brightness and repeat.',
  demo:['Page brightness','Dim','Bright','More light needed','Reading light sufficient'],
};
