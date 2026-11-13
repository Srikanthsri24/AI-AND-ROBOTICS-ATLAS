export type Part = [name: string, quantity: string, purpose: string];
export type Assembly = [title: string, instruction: string, check: string, parts: number[]];
export type Build = {
  id: string;
  title: string;
  outcome: string;
  parts: Part[];
  assembly: Assembly[];
  wiring: [string, string, string][];
  test: string;
  demo: [control: string, low: string, high: string, lowResult: string, highResult: string];
};
const uno: Part = ['Arduino Uno R3','1','Reads inputs and commands outputs.'];
const wires: Part = ['Breadboard and jumper wires','1 set','Provide removable low-voltage connections.'];
const led: Part = ['LED and 330 Ω resistor','1 pair','The resistor limits LED current.'];
const servo: Part = ['Positional micro servo','1','Moves the linkage through a limited angle.'];
const supply: Part = ['Regulated 5 V servo supply','1','Powers the servo separately from the Uno. Size it for servo stall current.'];
const ledWiring: Build['wiring'] = [['D8','330 Ω resistor → LED anode','Indicator output'],['LED cathode','GND','Return path']];
const servoWiring: Build['wiring'] = [['D9','Servo signal','Position command'],['External 5 V +','Servo power','Motor supply'],['External 5 V −','Servo ground and Uno GND','Shared signal reference']];
export const guidedProjects: Build[] = [
  {
    id:'rover-project', title:'Obstacle-avoiding robotic car', outcome:'Build a two-wheel rover that drives slowly and stops when an obstacle is too close.',
    parts:[uno,['HC-SR04 ultrasonic module','1','Measures the round-trip echo time.'],['TB6612FNG breakout','1','Switches motor power from logic inputs.'],['6 V geared DC motors and wheels','2','Drive the chassis.'],['Chassis and caster','1 set','Supports the wheels and electronics.'],['Switched 4×AA holder','1','Feeds the motor driver VM input.'],wires],
    assembly:[
      ['Build the rolling chassis','Bolt the motors to the underside, fit both wheels, and attach the caster at the opposite end.','Both wheels turn freely and the frame sits level.',[3,4]],
      ['Mount the sensor and driver','Face the ultrasonic module forward, with both transducers clear of the chassis. Fasten the Uno and driver to insulated mounts.','The ultrasonic module faces straight ahead and no board touches exposed metal.',[0,1,2,4]],
      ['Connect control and motor power','Switch off and disconnect the AA holder. Wire each motor to its own driver output. Connect the logic pins and grounds before adding motor power.','Check polarity and verify the chosen motors stay within the driver current rating, including stall.',[0,1,2,3,5,6]],
    ],
    wiring:[['D2 / D3','TRIG / ECHO','Ultrasonic timing'],['D5 / D6','PWMA / PWMB','Speed commands'],['D4 / D7 and D8 / D11','AIN1 / AIN2 and BIN1 / BIN2','Motor directions'],['D12','STBY','Driver enable'],['Uno 5 V','HC-SR04 VCC and driver VCC','Logic supply'],['AA holder +','Driver VM','Motor supply'],['All grounds','Uno GND, sensor GND, driver GND and AA −','Shared return'],['AO1 / AO2 and BO1 / BO2','Left and right motor terminals','Motor outputs']],
    test:'Lift the wheels. Confirm both turn forward on a valid clear reading, stop below 20 cm, and stay stopped when no echo returns. Swap a motor’s leads with power off if its direction is reversed.',
    demo:['Obstacle position','45 cm away','12 cm away','Forward at low speed','Stopped inside the 20 cm limit'],
  },
  {
    id:'hand-project', title:'Tendon-driven robotic hand', outcome:'Build a single powered finger on a hand frame and see how tendon tension bends the joints.',
    parts:[uno,servo,['Hinged finger and palm frame','1 set','Carries the joints and servo.'],['Nylon cord and elastic return','1 set','Pulls the finger closed and reopens it when released.'],supply,wires],
    assembly:[
      ['Fit the finger to the palm','Join the finger segments with pins and fasten the base joint to the palm.','Every joint moves freely by hand.',[2]],
      ['Route the tendon','Tie the cord at the fingertip, route it along the palm side, and attach the elastic along the back.','Pulling the cord bends the finger. Releasing it straightens the finger.',[2,3]],
      ['Mount and wire the servo','Fasten the servo at the wrist. Center the horn before tying the cord. Start with slack and adjust it in small increments.','The finger can open and close without the cord pulling against a hard stop.',[0,1,2,3,4,5]],
    ],wiring:servoWiring,test:'Start with a small unloaded servo sweep. Increase the travel only while the joints stay free and the servo remains quiet at both endpoints.',
    demo:['Finger command','Open','Curl','Elastic returns the finger to its resting position','The servo pulls the tendon and bends the finger'],
  },
  {
    id:'soil-observer',title:'Soil moisture detector',outcome:'Calibrate a capacitive probe and use a light to indicate when your sample is dry.',
    parts:[uno,['5 V-compatible analog capacitive probe','1','Outputs a reading that changes with moisture.'],['Dry and damp soil samples','2 cups','Establish calibration endpoints for this soil.'],led,wires],
    assembly:[
      ['Prepare matching samples','Use the same soil in both cups. Leave one dry and dampen the other evenly.','The probe can reach the same depth in both cups.',[1,2]],
      ['Wire the analog probe','Connect the probe output to A0 with USB unplugged. Keep the connector and electronics above the soil.','The probe’s documented output stays within the Uno ADC range.',[0,1,4]],
      ['Add the dry indicator','Place the LED and resistor in series. Record the stable A0 values for both samples at the same depth.','The two readings are distinct and repeatable before setting a threshold.',[0,1,2,3,4]],
    ],wiring:[['5 V / GND / A0','Probe VCC / GND / analog output','Supply and measurement'],...ledWiring],
    test:'Calculate the midpoint between your two readings. Confirm the indicator turns on for the dry reference and off for the damp reference, regardless of which raw value is larger.',
    demo:['Soil sample','Damp','Dry','Above the calibrated moisture midpoint','Dry indicator on'],
  },
  {
    id:'home-project',title:'Room climate monitor',outcome:'Read room temperature and signal when it rises above a chosen threshold.',
    parts:[uno,['TMP36 analog temperature sensor','1','Outputs 500 mV at 0 °C and changes by 10 mV per °C.'],led,wires],
    assembly:[['Identify the sensor pins','Use the TMP36 pinout for your package to identify supply, output and ground.','Verify pin order before applying power.',[1]],['Build the sensor circuit','Put the three legs in separate breadboard rows, wire the output to A0, and keep it away from warm regulators.','The output row connects only to A0 and the sensor output.',[0,1,3]],['Install the temperature indicator','Wire the indicator to D8 and choose a threshold slightly above room temperature.','At room temperature the indicator stays off.',[0,1,2,3]]],
    wiring:[['5 V / GND / A0','TMP36 supply / ground / output','Analog reading'],...ledWiring],
    test:'Compare the stabilized reading to a room thermometer. Warm the sensor gently with your fingers and verify the alert clears again after it cools.',
    demo:['Room reading','23 °C','32 °C','Normal range','Temperature is above the 28 °C limit'],
  },
  {
    id:'ambient-light',title:'Automatic night light',outcome:'Turn an LED on in darkness using a photoresistor and a pair of thresholds.',
    parts:[uno,['Photoresistor','1','Changes resistance with incident light.'],['10 kΩ resistor','1','Forms a voltage divider with the photoresistor.'],led,wires],
    assembly:[['Build the light divider','Connect the photoresistor to 5 V and the fixed resistor to ground. Join the free leads.','The shared junction goes to A0.',[0,1,2,4]],['Mount the lamp away from the sensor','Wire the LED output and face it away from the photoresistor.','The lamp cannot shine directly on its own sensor.',[1,3,4]],['Set two thresholds','Measure A0 in light and darkness. Choose separate on and off thresholds between the readings.','Slowly change the light and confirm the output does not chatter.',[0,1,2,3,4]]],
    wiring:[['5 V → photoresistor → A0 junction','10 kΩ resistor → GND','Voltage divider'],...ledWiring],
    test:'Cover and uncover the photoresistor. Hold the light between the thresholds and confirm the lamp retains its last state.',
    demo:['Ambient light','Bright','Dark','Lamp off above the upper threshold','Lamp on below the lower threshold'],
  },
  {
    id:'traffic-sequencer',title:'Miniature traffic signal',outcome:'Build a three-lamp model and step through red, green and amber.',
    parts:[uno,['Red, amber and green LEDs','3','Show the current phase.'],['330 Ω resistors','3','One current limiter per lamp.'],wires],
    assembly:[['Arrange the lamps','Place red, amber and green in order with each leg in a separate breadboard row.','Identify the short cathode leg on every LED.',[1,3]],['Wire three outputs','Use a separate resistor between each output pin and its LED anode. Tie the cathodes to ground.','No two output pins share a breadboard row.',[0,1,2,3]],['Run one lamp at a time','Set all outputs low first, then enable one lamp per phase.','Only one lamp is on in every phase.',[0,1,2,3]]],
    wiring:[['D8 / D9 / D10','330 Ω each → red / amber / green anodes','Phase outputs'],['Three cathodes','Uno GND','Common return']],
    test:'Step through red → green → amber → red. Confirm each pin drives the intended lamp before increasing phase durations.',
    demo:['Signal control','Hold red','Run cycle','Red lamp on','Red → green → amber sequence'],
  },
  {
    id:'button-indicator',title:'Push-button status panel',outcome:'Build a momentary input with a known idle state and a visible response.',
    parts:[uno,['Momentary tactile button','1','Closes a contact when pressed.'],led,wires],
    assembly:[['Place the button','Straddle the breadboard center channel with the button. Identify the two sides with a continuity meter.','The two selected terminals connect only when pressed.',[1,3]],['Connect the active-low input','Wire one side to D2 and the other to GND. Configure D2 as INPUT_PULLUP.','D2 reads HIGH at rest and LOW while pressed.',[0,1,3]],['Install the status LED','Connect D8 through the resistor to the LED anode and program the LED to follow the pressed state.','The LED goes out on release.',[0,1,2,3]]],
    wiring:[['D2','Button terminal 1','Input with internal pull-up'],['GND','Button terminal 2','Pressed return'],...ledWiring],
    test:'Press slowly, hold, then release. The input should read HIGH → LOW → HIGH while the LED shows off → on → off.',
    demo:['Button position','Released','Pressed','Pull-up holds D2 HIGH','Switch pulls D2 LOW and the LED lights'],
  },
  {
    id:'mechanism-study',title:'Hand-cranked gear reducer',outcome:'Build a gear pair that converts three input turns into one output turn.',
    parts:[['12-tooth spur gear','1','Smaller driver gear attached to the crank.'],['36-tooth spur gear','1','Larger driven gear produces slower rotation.'],['Matching shafts and bearings','2 sets','Hold both gears parallel.'],['Base, hand crank and hardware','1 set','Supports the mechanism.']],
    assembly:[['Mark and mount the shafts','Choose two gears with the same module. Set the nominal shaft spacing to half the sum of their pitch diameters.','Both shafts are parallel and rotate independently.',[0,1,2,3]],['Align the teeth','Slide the gears onto the shafts and line up their tooth faces. Turn the crank slowly.','The teeth mesh without binding around the full turn.',[0,1,2,3]],['Add rotation marks','Mark one tooth on each gear and add fixed reference marks on the base.','Each gear returns to its starting mark after a whole turn.',[0,1,3]]],
    wiring:[],test:'Turn the crank exactly three times. The driven gear should make one turn in the opposite direction.',
    demo:['Crank','Stopped','Turning','Both gears at rest','The 36-tooth gear turns at one-third speed'],
  },
  {
    id:'desktop-arm',title:'Desktop servo arm',outcome:'Build a single-joint arm and repeat a move between two marked positions.',
    parts:[uno,servo,['Arm link and base fixture','1 set','Turns servo rotation into visible arm movement.'],supply,wires],
    assembly:[['Secure the base','Fasten the servo to a broad base and check the entire sweep area.','The base does not rock and the arm clears the bench.',[1,2]],['Fit the arm at center','Center the servo, disconnect power, and attach the horn and unloaded link.','The link points at the center mark before testing both endpoints.',[1,2]],['Wire the supply and signal','Wire the servo to its separate supply and share ground with the Uno. Start with two close target angles.','The arm moves to each mark without hitting an end stop.',[0,1,2,3,4]]],
    wiring:servoWiring,test:'Alternate between 70° and 110° with the link unloaded. Use a protractor to check repeatability over three cycles.',
    demo:['Waypoint command','70°','110°','Arm at the first mark','Arm at the second mark'],
  },
  {
    id:'vision-counter',title:'Camera object counter',outcome:'Count separated bright objects in a fixed camera view and observe when touching objects merge.',
    parts:[['USB webcam','1','Captures the counting region.'],['Computer with webcam support','1','Reads images and runs thresholding.'],['Matte dark card and bright targets','1 set','Provide a repeatable high-contrast scene.'],['Fixed stand and diffuse lamp','1 set','Keep framing and lighting stable.']],
    assembly:[['Mount the webcam overhead','Point the camera down and tape the counting region to the work surface.','The whole region stays in frame.',[0,2,3]],['Set up a contrast target','Place bright shapes on matte dark card with gaps between them. Use diffuse lighting to avoid glare.','Background and shapes have visibly different brightness.',[0,2,3]],['Connect and capture a frame','Connect the webcam to the computer, crop to the marked region, and threshold the grayscale image. Count contiguous bright regions.','An empty frame gives zero and separated targets each give one region.',[0,1,2,3]]],
    wiring:[['Webcam USB cable','Computer USB port','Power and image data']],
    test:'Try zero, one, and three separated targets. Move two targets together and observe why one connected region can contain two objects.',
    demo:['Target spacing','Separated','Touching','Three distinct bright regions','Two bright regions because two targets touch'],
  },
];
