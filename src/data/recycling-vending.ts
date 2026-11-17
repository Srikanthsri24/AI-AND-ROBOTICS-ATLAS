import type { Build } from './guided-projects';
export const recyclingTypes=[
  {name:'Blue-tagged bottle',color:'#579bc3',route:'Bottle bin',shape:'bottle'},
  {name:'Green-tagged can',color:'#61a786',route:'Can bin',shape:'can'},
  {name:'Untagged sample',color:'#d0a267',route:'Return tray',shape:'can'},
] as const;
export const recyclingVending:Build={
  id:'directory-82',title:'Waste and Garbage Recycling Vending Machine',
  outcome:'Build a tabletop reverse vending machine that reads classroom color tags, routes clean sample containers, and awards a point only after the chosen bin detects a drop.',
  parts:[
    ['Arduino Uno R3','1','Checks the intake, reads the color and controls the two servo outputs and point counter.'],
    ['Adafruit APDS9960 color breakout','1','Reads the blue or green tag under a fixed white light. It classifies classroom tags.'],
    ['Diffused white LEDs and 220 Ω resistors','1 of each','Lights the tag in the shaded reading chamber.'],
    ['3 mm IR break-beam pair','4 pairs','One intake pair and one detector in each of the three exit paths.'],
    ['Positional micro servo','2','One holds the sample while it is read. The other aligns a deflector with the selected bin or return tray.'],
    ['Corrugated sorting chute and clean samples','1 set','Make a shaded intake, three exit paths and removable trays. Use dry, lightweight bottles and cans with wide matte blue or green paper bands.'],
    ['External regulated arm servo supply','1 set','Use regulated 5 V with enough current for two servos at stall. Share ground with the Uno.'],
    ['Breadboard and jumper wires','1 set','Routes the four inputs and white light circuit. Use rated terminals for servo power.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and provides access to the classification and points log.'],
  ],
  assembly:[
    ['Build the reading chamber','Make a short covered chute that guides one sample at a time. Point the sensor across the chamber at tag height. Mount the white LED to illuminate the tag without shining directly into the sensor.','A tagged sample always stops in the same place and distance from the sensor.',[1,2,5]],
    ['Build the hold gate and diverter','Fit one servo gate below the reading point. Use the second servo to steer an inclined flap between bottle, can and return exits. Test clearances with power off before securing the horns.','A lightweight sample rolls along only the chosen path when the gate opens.',[4,5,6]],
    ['Align intake and exit beams','Mount an IR pair at the intake and at each of the three exits. Shield nearby receivers from the wrong emitter. Pass a card through each pair individually.','Each passage interrupts one corresponding input.',[0,3,5,7]],
    ['Wire the controller and calibrate tags','With power off, wire the sensors, lamp and servos. Upload the sketch, then bring up servo power. Run the three labeled samples and compare the four logged color channels.','Strong blue and green tags classify, and an untagged neutral sample goes to Return.',[0,1,2,3,4,6,7,8]],
    ['Verify points and a failed drop','Try one sample per route and check which exit logs a passage. Temporarily retain a lightweight sample in a test chute before the exit beam. Turn off both supplies before clearing it.','Only a confirmed bottle or can adds a point. An unconfirmed or wrong exit locks the mechanism.',[0,3,4,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','APDS9960 VIN / GND and all IR pair power leads','Logic power and ground'],
    ['Uno A4 / A5','APDS9960 SDA / SCL','I²C address 0x39'],
    ['Uno 5 V','220 Ω → white LED anode, cathode → GND','Fixed reading light'],
    ['Intake / bottle / can / return receiver signals','Uno D2 / D3 / D4 / D5','Active-low signals with pull-ups'],
    ['Uno D9 / D10','Hold gate / diverter servo signals','Set each mechanical endpoint before loading'],
    ['External 5 V and negative','Both servo power leads','Share negative with Uno GND'],
    ['Computer USB','Uno USB-B','Power, upload and diagnostics'],
  ],
  test:'Insert a blue-tagged bottle, a green-tagged can and an untagged neutral sample. Confirm the exit after each drop. Accepted samples add one point each. The untagged sample returns without a point. An unconfirmed or wrong exit should lock further sorting.',
  demo:['Tagged-container sorting','Waiting','Drop confirmed','No points until an exit triggers','The selected exit decides the next action'],
};
