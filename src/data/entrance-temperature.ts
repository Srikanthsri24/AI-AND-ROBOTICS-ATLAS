import type { Build } from './guided-projects';

export const objectThreshold=30;
export const objectTrials=[
  {name:'Cool test object',temperature:23.2,color:'#6a9fb6'},
  {name:'Warm test object',temperature:33.4,color:'#cc875d'},
  {name:'Sensor unavailable',temperature:null,color:'#938d83'},
] as const;

export const entranceTemperature:Build={
  id:'directory-83',title:'Automatic Entrance Temperature Detector · Object Test Station',
  outcome:'Build a tabletop entrance that reads the surface temperature of test objects. Use a classroom threshold to control a miniature gate and see how it responds to a missing reading.',
  parts:[
    ['Arduino Uno R3','1','Waits for the object, checks three temperature samples and drives the gate and LEDs.'],
    ['5 V MLX90614 infrared thermometer','1','Use the 5 V MLX90614ESF-AAA variant. The sensor reads the surface facing it.'],
    ['10 kΩ divider resistors','2','Use these as separate SDA and SCL pull-ups for the bare 5 V sensor.'],
    ['3 mm IR break-beam pair','1 pair','Detects when a test object is seated. It triggers a measurement cycle.'],
    ['Green and red LEDs with 220 Ω resistors','1 of each','Green indicates an object below the classroom threshold. Red indicates a warm reading or a measurement fault.'],
    ['Positional micro servo','1','Moves a lightweight tabletop barrier. Use a loose horn fit until its travel is checked.'],
    ['Regulated 5 V supply and adapter','1 set','Powers the servo with a shared ground and an independent positive rail.'],
    ['Cardboard object tray and test targets','1 set','Use a flat bench, a simple tray and broad matte test objects. Keep the sensing distance fixed.'],
    ['Breadboard and jumper wires','1 set','Connects the sensors, outputs and grounds.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries the temperature log.'],
  ],
  assembly:[
    ['Build the object test fixture','Make a tray with a stop that fixes a broad target face close to the infrared sensor. Leave room for a lightweight barrier between the tray and the end of the lane.','A test object fills the thermometer’s field of view from the marked position.',[1,7]],
    ['Wire the temperature sensor','Using the 5 V variant’s datasheet pinout, identify VDD, VSS, SDA and SCL. Wire one 10 kΩ pull-up from each data line to 5 V. Check the lines before applying power.','Serial Monitor can report stable object readings from the fixed position.',[0,1,2,8,9]],
    ['Mount the trigger and indicators','Align the break-beam pair so it is interrupted when the target reaches the stop. Fit one resistor per LED and label each indicator.','Placing a target triggers a reading once. Removing it clears the trigger.',[0,3,4,7,8]],
    ['Fit the miniature barrier','Connect the servo to separate regulated 5 V with a shared ground. Test the 90° and 40° commands with the horn off. Power down, then fit the light barrier so the closed and open positions clear the fixture.','The tray barrier stays closed at idle and opens only after a below-threshold reading.',[0,5,6,7]],
    ['Test cool, warm and missing reads','Place a room-temperature matte target, then a slightly warmer one. Keep them at the same distance. With both supplies off, disconnect the thermometer and retest.','Cool opens the model gate. Warm or unavailable keeps the gate closed and lights red.',[0,1,3,4,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','5 V MLX90614 VDD / VSS and break-beam power leads','Verify sensor variant and datasheet packaging orientation'],
    ['Uno A4 / A5','MLX90614 SDA / SCL','I²C at 0x5A, each signal with a 10 kΩ pull-up to 5 V'],
    ['Break-beam receiver signal','Uno D2','Internal pull-up, low while object is present'],
    ['Uno D5 / D6','Each → 220 Ω → green / red LED anode','Cathodes go to ground'],
    ['Uno D9','Servo signal','Model barrier'],
    ['External 5 V and negative','Servo positive and ground','Share external negative with Uno GND'],
    ['Computer USB','Uno USB-B','5 V logic and diagnostics'],
  ],
  test:'Submit a matte object below 30 °C to open the model barrier. Clear the tray and try a warmer test object at the same position. Disconnect the temperature sensor with power off and reboot to check the fault response. All readings are for test objects and the threshold is a classroom setting.',
  demo:['Object temperature','Gate closed','Gate open','Warm or unavailable reading','Below classroom threshold'],
};
