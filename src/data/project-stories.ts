type StoryBeat = [label: string, caption: string, part: number];
export const projectStories: Record<string, [StoryBeat, StoryBeat, StoryBeat, StoryBeat]> = {
  'rover-project': [
    ['Clear path','The rover rolls forward while the path is clear.',3],
    ['Obstacle moves closer','The two round sensor heads send out sound and listen for its echo.',1],
    ['Too close','A quick echo tells the controller that the obstacle is closer than 20 cm.',0],
    ['Wheels stop','The controller switches off the motor driver. Watch the wheels stop.',3],
  ],
  'hand-project': [
    ['Finger open','The stretchy return cord holds the finger open.',2],
    ['Curl command','The controller tells the small servo motor to turn.',0],
    ['Cord pulls','The servo pulls the cord, like a tendon pulling a finger.',3],
    ['Finger curls','The joints bend together. The cord carries the pull from the motor to the finger.',2],
  ],
  'soil-observer': [
    ['Damp soil','In damp soil, the dry-soil light stays off.',2],
    ['Probe reads the soil','The probe sends a different reading when the soil is dry.',1],
    ['Compare readings','The controller compares the reading with the dry and damp samples.',0],
    ['Dry-soil light turns on','The light tells you this sample may need water.',3],
  ],
  'home-project': [
    ['Room at 23 °C','At this temperature the warning light is off.',1],
    ['Room warms up','The temperature sensor sends a changing voltage as the room warms.',1],
    ['Past 28 °C','The controller checks whether the reading has passed the warning temperature.',0],
    ['Warning light turns on','At 32 °C the LED lights up to show the room is too warm.',2],
  ],
  'ambient-light': [
    ['Bright room','When there is enough light, the night light stays off.',1],
    ['Room gets darker','The light sensor changes its resistance as less light reaches it.',1],
    ['Check the light level','The controller decides whether the room is dark enough to need the lamp.',0],
    ['Night light turns on','The lamp turns on. It stays on until the room gets bright enough again.',3],
  ],
  'traffic-sequencer': [
    ['Red means stop','The red LED is lit. The other two stay off.',1],
    ['The timer starts','The controller counts how long each light should stay on.',0],
    ['Watch the lamps','One light switches off before the next one turns on.',1],
    ['Red, green, amber','Watch a full cycle. Red and green last three seconds each. Amber lasts one second.',1],
  ],
  'button-indicator': [
    ['Button released','The light is off. The button is open, like a break in a wire.',1],
    ['Press the button','Pushing the cap closes the switch.',1],
    ['Controller reads the press','The closed switch pulls the input down to ground. The controller reads this as a press.',0],
    ['Light turns on','The controller turns on the LED to show the button has been pressed.',2],
  ],
  'mechanism-study': [
    ['Gears at rest','The small gear has 12 teeth. The large one has 36.',0],
    ['Turn the crank','Turning the handle makes the small gear turn.',3],
    ['Teeth push together','Each tooth pushes the next gear in the opposite direction.',1],
    ['Three turns become one','Follow the marks. The small gear makes three turns for every one turn of the large gear.',1],
  ],
  'desktop-arm': [
    ['Arm at 70°','The arm starts at its first mark.',2],
    ['Choose 110°','The controller sends the servo a new position to aim for.',0],
    ['Servo turns','The small motor turns the joint and lifts the arm.',1],
    ['Arm reaches 110°','The arm stops at the second mark and holds its position.',2],
  ],
  'vision-counter': [
    ['Three separate objects','The camera sees three bright shapes on the dark mat.',0],
    ['Move two shapes together','Slide two shapes until their edges touch.',2],
    ['Computer groups the bright areas','Touching bright shapes appear as one connected patch in the image.',1],
    ['The count drops to two','There are still three objects on the mat. The program counts two bright patches.',1],
  ],
};

type DemoReading = [input: string, output: string, reacting?: boolean];

export const demoReadings: Record<string, [DemoReading, DemoReading, DemoReading, DemoReading]> = {
  'rover-project': [['45 cm ahead','Wheels turning'],['Obstacle approaching','Sensor checks distance'],['12 cm ahead','Wheels stopped',true],['12 cm ahead','Wheels stopped',true]],
  'hand-project': [['Open command','Finger straight'],['Curl command','Servo receives command'],['Cord pulls','Finger starts to bend',true],['Cord held tight','Finger curled',true]],
  'soil-observer': [['Damp soil','Dry-soil light off'],['Probe in dry soil','Reading changes'],['Reading compared','Dry soil detected'],['Dry soil','Dry-soil light on',true]],
  'home-project': [['23 °C','Warning light off'],['Room warming','Sensor reading rises'],['Above 28 °C','Threshold crossed'],['32 °C','Warning light on',true]],
  'ambient-light': [['Bright room','Lamp off'],['Room darkening','Sensor reading changes'],['Dark enough','Controller enables lamp'],['Dark room','Lamp on',true]],
  'traffic-sequencer': [['Hold red','Red means stop'],['Start timer','Lamps cycling',true],['Timer running','One lamp at a time',true],['Timer running','Red → green → amber',true]],
  'button-indicator': [['Button released','LED off'],['Button pressed','Switch closes'],['Input reads LOW','Press detected'],['Button held down','LED on',true]],
  'mechanism-study': [['Crank still','Both gears still'],['Crank turning','Small gear turns',true],['Teeth engage','Large gear turns back',true],['3 small gear turns','1 large gear turn',true]],
  'desktop-arm': [['70° target','Arm at first mark'],['110° command','Servo receives command'],['Servo turning','Arm lifts',true],['110° target','Arm at second mark',true]],
  'vision-counter': [['Shapes apart','3 bright patches'],['Shapes slide together','Edges meet',true],['Shapes touch','2 connected patches',true],['3 objects on mat','2 patches counted',true]],
};
