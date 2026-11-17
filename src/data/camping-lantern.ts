import type {Build} from './guided-projects';

export const campingLantern:Build={
  id:'camping-model-lantern',title:'Camping model lantern',
  outcome:'Build a USB-powered tabletop lantern that turns on at dusk and lets you override it with one button.',
  parts:[
    ['Arduino Uno R3','1','Reads the light level and the mode button.'],
    ['Photoresistor','1','Measures room light outside the lantern.'],
    ['10 kΩ divider resistor','1','Converts the photoresistor response into an analog reading.'],
    ['Momentary tactile button','1','Cycles the lantern through Auto, On and Off.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Lights the lantern. The resistor limits LED current.'],
    ['Lantern shell, diffuser and campsite base','1 set','A clean translucent plastic container and a card base spread and support the light.'],
    ['Breadboard and jumper wires','1 set','Holds the divider and connects the switch and lamp.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to Arduino IDE.'],
  ],
  assembly:[
    ['Build the model lantern','Mount one white LED beneath a translucent container or add a paper diffuser to a clear container. Run the two insulated leads through the base.','The lamp lights the diffuser evenly and the leads cannot touch.',[4,5]],
    ['Position and connect the ambient sensor','Place the sensor outside the diffuser’s light pool. With USB unplugged, connect it from 5 V to A0 and put the 10 kΩ resistor from A0 to ground.','Shading the sensor lowers A0 and switching the lantern on does not brighten the sensor.',[0,1,2,5,6]],
    ['Wire the lamp and mode button','Connect D8 through 220 Ω to the LED anode and its cathode to ground. Connect the button from D2 to ground. The sketch supplies a pull-up for D2.','Each press connects D2 to ground. The LED branch has its own resistor.',[0,3,4,6]],
    ['Calibrate and check all modes','Upload, take shaded and bright A0 readings, and enter the references in the sketch. Start in Auto, then press and release once for each override.','Auto responds to dusk. On holds the lamp on, Off holds it off, and the next press returns to Auto.',[0,1,3,4,7]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor supply lead','Powers the light divider'],
    ['Uno A0','Other photoresistor lead and one end of 10 kΩ','Ambient reading'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D2','Mode button → GND','Active-low input'],
    ['Uno D8','220 Ω resistor → white LED anode','Lantern output'],
  ],
  test:'In Auto the lantern comes on at 35% or below and clears at 45% or above. Check that On stays lit in daylight, Off stays dark at dusk, and returning to Auto uses the current light state.',
  demo:['Room light','Daylight','Dusk','Auto lamp off','Auto lamp on'],
};
