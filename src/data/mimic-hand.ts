import type { Build } from './guided-projects';

export const digitNames=['Thumb','Index','Middle','Ring','Little'] as const;
export const mimicServoPins=[3,5,6,9,10] as const;
export const mimicGestures=[
  {name:'Open hand',curl:[0,0,0,0,0]},
  {name:'Point',curl:[.8,0,1,1,1]},
  {name:'Pinch',curl:[.85,.65,0,0,0]},
  {name:'Fist',curl:[1,1,1,1,1]},
] as const;

export const mimicHand:Build={
  id:'directory-63',title:'Animatronic Hand That Mimics Human Gestures',
  outcome:'Build five independently driven fingers and a wired flex-sensor glove. Calibrate your open and curled hand, then watch the model follow each finger.',
  parts:[
    ['Arduino Uno R3','1','Reads five analog dividers and sends a separate angle to each servo. Power from USB.'],
    ['Adafruit short flex sensors and 10 kΩ resistors','5 of each','One flex strip and one divider resistor per digit. Brace each strip’s connector where it leaves the glove.'],
    ['Positional micro servo','5','Mount the five 5 V servos on the bench beside the hand. Their horns pull individual tendons.'],
    ['External regulated arm servo supply','1 set','Provide regulated 5 V sized for the combined stall current of all five servos. Use rated power distribution terminals.'],
    ['Cardboard fingers and palm backing','1 set','Cut a rigid palm and short articulated digits from layered card. Bring fabric tape for hinges, smooth eyelets or straw guides, nylon thread and soft elastic return bands.'],
    ['Momentary tactile start button','1','Records the open and curled glove positions. After calibration, a new press starts another calibration.'],
    ['Breadboard and jumper wires','1 set','Use a snug cloth glove with five taped sleeves, flexible leads and a strain-relieved tether. Keep the servo power leads off the breadboard.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Make five hinged digits','Cut a palm and finger links from layered card. Join each digit with fabric-tape hinges on the back so it bends toward the palm. Mount the thumb at an angle. Fasten the palm to a bench stand.','Each digit moves freely. Short stops prevent the hinges from bending backward.',[4]],
    ['Fit the tendons and returns','Thread nylon cord along the palm side through smooth guides and tie it to the last link. Add a loose elastic return along the back. Route each cord to its own servo horn, leaving slack until the servos are centered.','Pulling a cord bends only its own digit. Releasing it lets the elastic straighten that finger.',[2,4]],
    ['Assemble the sensor glove','Slide one strip into each sleeve on the back of the glove. Route the strip over a knuckle without kinking it. Anchor the connector end near the wrist, then mark the five signals Thumb through Little.','You can curl your fingers without stretching a wire or driving a strip into a sharp bend.',[1,6]],
    ['Wire the controller and supply','Connect the five voltage dividers and calibration button. With power off, wire the servos to their signal pins and the rated 5 V terminals. Tie the servo supply negative to Uno ground.','The two positive rails stay separate. Signal order matches the thumb-to-little labels.',[0,1,2,3,5,6,7]],
    ['Center, calibrate and tune','Upload with the tendons detached. With servo power on, check the resting angles. Power down to connect the cords. Start with minimal tension and calibrate the glove. If a finger pulls too far, shorten that channel’s angle span in the sketch.','Each model finger follows its matching glove digit through a small, smooth range without binding.',[0,1,2,4,5]],
  ],
  wiring:[
    ['Uno A0–A4','Thumb, index, middle, ring, little divider junctions','For each channel use 10 kΩ to Uno 5 V and the flex sensor to GND'],
    ['Uno D3 / D5 / D6 / D9 / D10','Thumb / index / middle / ring / little servo signal','One channel per digit'],
    ['Uno D2','Calibrate switch → GND','Internal pull-up'],
    ['External regulated 5 V / negative','Five servo V+ / ground leads','Use rated terminals rather than breadboard rails'],
    ['External supply negative','Uno GND','Shared signal reference'],
    ['Computer USB','Uno USB-B','Programming and diagnostics'],
  ],
  test:'At the first prompt, hold your hand open and press Calibrate. At the second, curl it comfortably and press again. If any channel has less than 25 counts of travel, repeat after checking the strip. After a successful calibration, try one digit, a point, a pinch and a gentle fist.',
  demo:['Five calibrated flex inputs','Open hand','Curling','Servo horns release the tendons','Each servo pulls its own tendon'],
};
