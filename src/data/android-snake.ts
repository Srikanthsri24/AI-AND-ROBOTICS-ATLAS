import type { Build } from './guided-projects';

export const snakeMotion = { burstMs:4000, periodMs:2000, bend:18, stepDegrees:2 };
export const snakeCommands = [
  ['W','Send wave'],['L','Bend left'],['R','Bend right'],['S','Straighten'],
] as const;
export type SnakeCommand = typeof snakeCommands[number][0];

export const snakeAngles = (command:SnakeCommand, elapsed:number) => [0,1,2].map(index=>{
  if(command==='S'||elapsed>=snakeMotion.burstMs)return 0;
  if(command==='L'||command==='R')return command==='L'?snakeMotion.bend:-snakeMotion.bend;
  return snakeMotion.bend*Math.sin(2*Math.PI*(elapsed/snakeMotion.periodMs-index/3));
});

export const androidSnake:Build={
  id:'directory-55',
  title:'Arduino-Based Snake Robot Controlled via Android',
  outcome:'Link four segments with three servo joints. Send a command from an Android phone and follow a bending wave from the head toward the tail.',
  parts:[
    ['Arduino Uno R3','1','Decodes Bluetooth commands and generates three servo position signals. Bring a USB data cable.'],
    ['Bluefruit LE UART Friend','1','Passes characters from the Android UART terminal to the Uno. Set it to UART/Data mode.'],
    ['Positional micro servo','3','One 5 V servo, horn and horn screw per joint. The vertical shafts rotate the next link in the plane of the table.'],
    ['External regulated arm servo supply','1 set','Use a regulated 5 V supply sized for three servos’ combined stall current, with a connector and low-voltage power distribution rated for that current.'],
    ['Corrugated body links and felt skids','4 links and 1 pad set','Cut four lightweight 85 × 45 mm links from stiff card. Use pads under each link to support it at a common height.'],
    ['Breadboard and jumper wires','1 set','Routes low-current UART and logic connections. Route the combined servo power through the rated distribution block.'],
  ],
  assembly:[
    ['Cut and number the links','Cut four equal card links, then mark head, 2, 3 and tail. Reinforce the joint ends with a second layer of card. Choose a flat bench area where the four links can bend without hitting anything.','Each link lies flat with room for a servo near the tail-facing end of the first three links.',[2,4]],
    ['Center the horns','Upload the sketch before attaching the horns. Power the Uno and turn on the separate servo supply to center the three shafts at 90°. Disconnect power before fitting each horn.','Each horn points along the straight body at the neutral position.',[0,2,3]],
    ['Join the four segments','Fix each servo body to the preceding link with its shaft vertical. Fasten the horn to the next link with lightweight fasteners, then refit the horn screw. Leave a small gap between link ends and support the links on level pads.','The servo turns the next link without forcing the card to scrape or bend.',[2,4]],
    ['Route power and signals','Disconnect both supplies. Mount the Uno and Bluefruit together at the head or on a dry bench beside it. Wire D5, D6 and D9 to the servo signals. Run the red and ground leads to the external 5 V distribution block and join ground to the Uno. Leave slack at every joint.','Servo positive power stays off the Uno 5 V pin. Each signal goes to the joint labeled in the map.',[0,1,2,3,5]],
    ['Run a short bend on the bench','Power the Uno first and open Android Bluefruit LE Connect in UART mode. Turn on the servo supply. Send S, L, R and then W separately. If a joint binds or moves in the opposite direction, cut servo power and fix the setup before retrying.','The chain starts straight. W produces a wave across three joints and returns toward center after four seconds.',[0,1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V / GND','Bluefruit VIN / GND','Logic supply'],
    ['Bluefruit TXO','Uno D2','Receive the phone command at 9600 baud'],
    ['Bluefruit CTS','Uno GND','Enable the breakout’s transmit pin'],
    ['Uno D5, D6, D9','Joint 1, 2 and 3 signal wires','Head-to-tail servo commands'],
    ['Regulated 5 V / negative','Three servo V+ / GND leads through rated terminals','Independent servo supply'],
    ['External supply negative','Uno GND','Shared signal reference'],
    ['Computer USB','Uno USB','Upload and read command log'],
  ],
  test:'Power up and confirm the body is straight. Send L and R to check both bend directions. Send W and watch the joint nearest the head, then the middle and tail. Send S during a wave to recenter. Send W again and stop sending commands. The wave ends after four seconds and the joints return toward center.',
  demo:['Android UART command','Straight','Wave','All joints align','A bend travels along the chain'],
};
