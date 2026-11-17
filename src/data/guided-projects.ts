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
    id:'hand-project', title:'Tendon-driven robotic hand', outcome:'Build a two-joint demonstration finger that curls as a servo pulls its tendon and opens when the elastic return takes over.',
    parts:[uno,servo,['Hinged finger and palm frame','1 set','Cut two light card finger links and a palm, and use short smooth pins for the two pivots.'],['Nylon cord and elastic return','1 set','Cord pulls on the palm side. Elastic stretches along the back as the finger curls, then pulls it open.'],supply,wires],
    assembly:[
      ['Fit the two finger hinges','Cut a palm and two finger links out of doubled card. Use smooth pin joints through overlapping tabs. Space the tabs so each joint can flex without dragging.','Both joints move freely without the cord.',[2]],
      ['Route the tendon and return','Anchor the cord near the tip. Guide it along the palm side across both joints. Attach the elastic from the back of the palm to the back of the tip.','Hand-pulling the cord curls both links. Releasing it returns them open.',[2,3]],
      ['Mount the servo and wire its signal','Secure the servo at the wrist. With power off, connect signal and the separate supply using the wiring map. Leave the cord off the horn for the first power-up.','The horn travels freely between the two test positions.',[0,1,2,4,5]],
      ['Set slack and test the travel','Command 0 to open. Power off and tie the tendon to the horn with a little slack. Run 1 to curl and 0 to release. Adjust the cord length or reduce the sweep if the servo strains.','The cord pulls across both pivots, and the elastic returns the finger without binding.',[0,1,2,3]],
    ],wiring:servoWiring,test:'Test the servo unloaded at 80° and 105°. Attach the tendon with power off. Send 1 to curl and 0 to open. Verify both hinges move and the return elastic straightens the finger. If either joint stops before the horn finishes its sweep, cut power and reduce the travel.',
    demo:['Finger command','Open','Curl','Elastic returns the finger to its resting position','The servo pulls the tendon and bends the finger'],
  },
  {
    id:'soil-observer',title:'Soil moisture detector',outcome:'Calibrate a capacitive probe on two samples of the same soil, then use an LED to flag a third sample below the relative midpoint.',
    parts:[uno,['SEN0193 capacitive soil probe','1','Gives an analog reading that changes with contact and moisture. Keep the upper electronics dry.'],['Dry and damp soil samples','3 cups','Use the same soil and packing for the dry reference, damp reference and test cup.'],led,wires],
    assembly:[
      ['Prepare three matching cups','Put similar amounts of the same soil into each cup. Leave one dry, dampen the second evenly, and set aside the third for testing. Mark the same insertion depth in each cup.','The probe fits at the same depth without burying its upper circuitry.',[1,2]],
      ['Wire the analog input and LED','Unplug USB. Connect the probe’s supply, ground and signal, and wire the LED with its series resistor. Keep the board and cable connectors above the cups.','A0 receives the probe signal and D8 controls the indicator.',[0,1,3,4]],
      ['Capture dry and damp references','Run the sketch and move the probe from the dry reference to the damp reference. Let each raw value settle. Send D for dry and W for damp in Serial Monitor.','The references differ by at least 20 ADC counts. The serial output now shows a relative score.',[0,1,2]],
      ['Check a separate sample','Insert the probe in the test cup. Add a small amount of water, mix it evenly and let the reading settle. Verify that the LED changes around the midpoint.','Dry reference is near 0%, damp is near 100%, and the LED lights below 50%.',[1,2,3]],
    ],wiring:[['Uno 5 V / GND','SEN0193 VCC / GND','Use the connector labels, and keep the upper board dry.'],['SEN0193 analog signal','Uno A0','Raw ADC reading'],...ledWiring],
    test:'Capture stable dry and damp readings, then check that they report approximately 0% and 100%. Move to the separate test cup and verify that the LED lights only below the midpoint. Reset with R, capture both references in the same cup, and confirm the sketch asks for distinct readings.',
    demo:['Soil sample','Damp','Dry','Above the calibrated moisture midpoint','Dry indicator on'],
  },
  {
    id:'home-project',title:'Room climate monitor',outcome:'Read room temperature with a TMP36, set a warning temperature, and use a one-degree gap between switch points to keep the LED from flickering.',
    parts:[uno,['TMP36 analog temperature sensor','1','Produces an analog voltage that rises with temperature. Keep it away from the Uno’s heat sources.'],led,wires],
    assembly:[
      ['Identify each sensor lead','Find the flat face on the TMP36. With the flat face toward you and the legs down, identify supply, signal and ground from left to right. Confirm against the component diagram.','The three leads each occupy a separate breadboard row.',[1,3]],
      ['Connect the sensor and indicator','With USB unplugged, wire the sensor to 5 V, A0 and ground. Add the series resistor and warning LED to D8.','D8 goes through the 330 Ω resistor to the LED anode. The cathode returns to ground.',[0,1,2,3]],
      ['Check a stable reading','Upload the sketch and open Serial Monitor. Let the sensor settle, then compare against a room thermometer placed alongside it.','The reading settles near the reference thermometer. Adjust referenceVolts if you measure a different 5 V rail.',[0,1]],
      ['Check switch-on and switch-off','Set a warning point slightly above room temperature with + or −. Warm the sensor gently between your fingers, then let it cool.','The LED comes on at the setpoint and clears one degree below it. Within that gap it retains its last state.',[0,1,2]],
    ],
    wiring:[['Uno 5 V','TMP36 left lead','Supply, flat face toward you and leads down.'],['Uno A0','TMP36 middle lead','Analog temperature output.'],['Uno GND','TMP36 right lead','Ground return.'],...ledWiring],
    test:'Check a steady room reading against a thermometer. Warm the sensor gently until it reaches the selected setpoint. Watch the LED hold on during cooldown until the reading reaches one degree below the setpoint. Repeat at a different setpoint.',
    demo:['Room reading','23 °C','32 °C','Normal range','Temperature is above the 28 °C limit'],
  },
  {
    id:'ambient-light',title:'Automatic night light',outcome:'Use a photoresistor to switch an LED on at dusk and off at daylight. Compare the two directions through the gap between switch points.',
    parts:[uno,['Photoresistor','1','Detects light. In this divider, brighter light raises the A0 reading.'],['10 kΩ divider resistor','1','Pairs with the photoresistor to turn its resistance change into a voltage.'],led,wires],
    assembly:[
      ['Build the light divider','With USB off, connect the photoresistor between 5 V and A0. Connect the 10 kΩ resistor between A0 and ground.','Both components meet at A0, and the other ends go to separate power rails.',[0,1,2,4]],
      ['Aim the lamp away from the sensor','Connect D8 through the 330 Ω resistor to the LED anode, then put the cathode on ground. Place a small card shade between the LED and the sensor.','The lamp does not shine directly on the photoresistor.',[0,1,3,4]],
      ['Measure the ambient range','Upload the sketch and note A0 in daylight and with the photoresistor shaded. Choose two counts between those reference readings.','Bright light gives the higher value. The threshold named brightOff is above darkOn.',[0,1,2]],
      ['Check both directions through dusk','Shade the sensor until the lamp switches on. Uncover it slowly and pause between the two thresholds. Repeat in the opposite direction.','The same dusk reading can leave the lamp on or off depending on its previous state.',[0,1,3]],
    ],
    wiring:[['Uno 5 V','Photoresistor outer lead','Supply side'],['A0 junction','Photoresistor other lead and one end of 10 kΩ','Measure the divider midpoint.'],['Uno GND','Other end of 10 kΩ','Divider ground'],...ledWiring],
    test:'Record bright and shaded A0 values. Shade to or below the lower threshold, then restore light until the upper threshold is reached. Pause between thresholds on the way down and up, and verify the lamp keeps its previous state.',
    demo:['Ambient light','Bright','Dark','Lamp off above the upper threshold','Lamp on below the lower threshold'],
  },
  {
    id:'traffic-sequencer',title:'Miniature traffic signal',outcome:'Build a USB-powered tabletop traffic signal. Follow the timer from red to green to amber, and verify that only one lamp lights at a time.',
    parts:[uno,['Red, amber and green LEDs','3','One diffused LED per phase. Arrange them red, amber and green from top to bottom.'],['330 Ω resistors','3','One in series with each LED to limit current. An axial resistor has no polarity.'],wires,['Cardstock for signal head and road','2 pieces','Hold the three lamps and mark the model stop line.'],['USB-A to USB-B data cable','1','Power the Uno and upload the sketch.']],
    assembly:[
      ['Mount three lamps in a vertical signal head','Make three holes in a card panel. Place red at the top, amber in the middle and green at the bottom. Mark the color and the shorter cathode leg before fitting each LED.','The three pairs of leads stay separate and do not touch.',[1,4]],
      ['Fit the current-limiting resistors','Unplug USB. Put three 330 Ω resistors on different breadboard rows. Link each resistor to its matching LED anode using a colored jumper.','Each anode connects through its own resistor.',[1,2,3]],
      ['Connect the Uno and shared return','Run D8 to the red resistor, D9 to amber and D10 to green. Connect each cathode to the same ground rail, then connect the rail to Uno GND.','Every color has a separate output path and all three cathodes return to ground.',[0,1,2,3]],
      ['Mark the model stop line and inspect the layout','Set the head upright beside a paper road. Draw a white stop line. Before plugging USB back in, trace the path for each LED from its output pin through the resistor and back to ground.','The LEDs face the stop line and no output pins share a row.',[4,0,1,2,3,5]],
    ],
    wiring:[['Uno D8','330 Ω → red anode','Upper lamp'],['Uno D9','330 Ω → amber anode','Middle lamp'],['Uno D10','330 Ω → green anode','Lower lamp'],['All three cathodes','Breadboard ground rail → Uno GND','Shared return']],
    test:'Reset the Uno and observe two cycles. Red should last 3 seconds, green 3 seconds, and amber 1 second. Confirm that only one lamp is on through each phase.',
    demo:['Signal control','Hold red','Run cycle','Red lamp on','Red → green → amber sequence'],
  },
  {
    id:'button-indicator',title:'Push-button status panel',outcome:'Build a tabletop status indicator that lights only while a button is held. Compare the switch position, input voltage state and LED output.',
    parts:[uno,['Momentary tactile button','1','Opens when released and joins the two contact sides when held.'],['Diffused green LED','1','Shows that the controller recognized a press.'],['330 Ω series resistor','1','Limits current through the LED. Brown multiplier after two orange bands identifies 330 Ω on a four-band resistor.'],wires,['USB-A to USB-B data cable','1','Powers the Uno and connects it to Arduino IDE.']],
    assembly:[
      ['Find the normally open contacts','With USB disconnected, seat the switch across the breadboard’s center gap. Use continuity mode to find a pair of terminals that connect only while pressed. The two pins on the same contact side are usually already joined.','The selected terminals show open at rest and continuity only while held.',[1,4]],
      ['Wire the active-low input','Run a yellow jumper from D2 to one selected switch terminal and a dark jumper from the other terminal to the breadboard ground rail. Link that rail to Arduino GND.','D2 reaches ground only while the switch is pressed.',[0,1,4]],
      ['Connect the green indicator','Connect D8 to one end of the 330 Ω resistor. Connect the other resistor end to the long LED leg. Connect the short leg, on the flat side, to the shared ground rail.','The LED has its own series resistor and shares the ground return with the button.',[2,3,0,4]],
      ['Power and check the input','Compare each wire against the connection map below, then attach the USB cable. Upload the sketch and release the button before resetting the Uno.','The status LED is off at rest. The Serial Monitor shows D2 HIGH.',[5,0,1,2]],
    ],
    wiring:[['Uno D2','One switch contact side','Yellow input jumper, internal pull-up enabled'],['Opposite switch contact side','Breadboard GND rail','Button return'],['Uno D8','330 Ω resistor → green LED anode','Current-limited indicator output'],['Green LED cathode','Breadboard GND rail','LED return'],['Breadboard GND rail','Uno GND','Shared reference']],
    test:'Press, hold and release. D2 should read HIGH → LOW → HIGH while the LED goes off → on → off. Each change should add exactly one Serial Monitor line.',
    demo:['Button position','Released','Pressed','Pull-up holds D2 HIGH','Switch pulls D2 LOW and the LED lights'],
  },
  {
    id:'mechanism-study',title:'Hand-cranked gear reducer',outcome:'Build a hand-driven pair of spur gears. Measure three input turns for one output turn and verify the direction reverses.',
    parts:[
      ['12-tooth spur gear','1','Drives the mesh. Choose the same tooth pitch and pressure angle as the driven gear.'],
      ['36-tooth spur gear','1','Turns at one-third of input speed. Choose a secure hub that matches its mounting pattern.'],
      ['Matching shafts and bearings','2 sets','Match each bearing and collar to its shaft diameter. The shafts can have different diameters as long as their centers are parallel.'],
      ['Base, hand crank and hardware','1 set','Use a rigid base with one adjustable bearing mount, a crank arm, free-turning handle, fitted hubs, spacers and fasteners.'],
    ],
    assembly:[
      ['Lay out the two shaft centers','Check that both gears have the same pitch and pressure angle. Mark the shaft distance as half the sum of the pitch diameters. Slot one support or use adjustable brackets so that distance can be fine-tuned.','Measure between shaft centers, using the pitch diameters in the gear specifications rather than the outside diameters.',[0,1,2,3]],
      ['Mount parallel shafts and align the faces','Fasten the bearing supports to the base. Slide the shafts through and retain them with collars. Secure the smaller gear to the input shaft and mount the larger gear on its matching hub. Use spacers to align the faces.','The shafts turn freely. The gear teeth overlap across the narrower face and the two wheels do not rub against the base.',[0,1,2,3]],
      ['Set the mesh and attach the crank','Move the adjustable mount until the teeth have a slight amount of free play. Tighten the support and secure the crank on the input shaft. Rotate slowly by the handle and keep fingers clear of the mesh.','The gears complete a full revolution without binding or skipping teeth.',[0,1,2,3]],
      ['Add witness marks and fixed references','Put a colored tape mark on each gear face. Align each with a separate fixed reference on the support. Use these as starting points for counting turns.','Both marks start aligned with their reference and remain visible without reaching into the gear mesh.',[0,1,3]],
    ],
    wiring:[['Hand crank','Input shaft and pinion','The shaft and pinion turn together.'],['Pinion teeth','Driven gear teeth','The mesh transfers motion and reverses its direction.'],['Driven hub','Output shaft','The hub carries the slower rotation to the output.'],['Bearing supports','Rigid base','Keep the shaft axes parallel at the correct spacing.']],
    test:'Turn the crank exactly three times. The driven gear should complete one opposite-direction turn and both witness marks should return to their references.',
    demo:['Crank','Stopped','Turning','Both gears at rest','The 36-tooth gear turns at one-third speed'],
  },
  {
    id:'desktop-arm',title:'Desktop servo arm',outcome:'Build an unloaded single-joint servo arm with a marked angle scale. Compare the 70° and 110° commands with the position the arm reaches.',
    parts:[uno,servo,['Arm link and base fixture','1 set','A broad base and mounted servo support an unloaded cardboard pointer. Add the horn, its center screw and a fixed paper angle scale.'],supply,wires,['USB-A to USB-B data cable','1','Powers the Uno and connects it to the IDE and Serial Monitor.']],
    assembly:[
      ['Fix the servo and place the angle scale','Fasten the servo by its mounting tabs to a firm support on a broad base, with its shaft pointing up. Align the center of a supported paper scale directly under the shaft. Position the scale just below the pointer’s sweep and mark 70°, 90° and 110°. Leave the horn off initially.','The servo case cannot twist, and the sweep has enough clearance for an unloaded link.',[1,2]],
      ['Connect the signal and separate power','Switch off and unplug before wiring. Connect D9 to servo signal, the external regulated 5 V output to servo positive, and supply negative to servo ground and Uno GND. Confirm the connector pinout for the actual servo.','The grounds are joined. The servo positive lead goes only to the external supply.',[0,1,3,4,5]],
      ['Center the bare shaft, then fit the pointer','Upload the sketch, power the servo without the horn and send C to center. With all power disconnected, attach the horn near 90°, secure its center screw, and tape a light pointer along the horn.','The pointer starts near the center mark and does not touch the scale.',[0,1,2,5]],
      ['Check the two marks and record landings','Power up and try L and R one at a time. With the link unloaded, watch for clearance and record each physical angle, then use T to repeat the sequence.','The arm clears the bench and both endpoints are repeatable across three cycles.',[0,1,2]],
    ],
    wiring:servoWiring,test:'Alternate between 70° and 110° with the link unloaded. Use a protractor to record all six landings over three cycles. Check clearance and compare each reading with the 5° classroom tolerance.',
    demo:['Waypoint command','70°','110°','Arm at the first mark','Arm at the second mark'],
  },
  {
    id:'vision-counter',title:'Camera object counter',outcome:'Build a local vision pipeline that counts bright regions against a dark background. Compare separated targets, touching targets and a change in lighting.',
    parts:[['USB webcam','1','Captures a fixed view of the target card. A saved overhead photo also works for the first trial.'],['Computer with webcam support','1','Runs Python and OpenCV or the browser demo.'],['Matte dark card and bright targets','1 set','Use a dark backing and three white or cream disks of similar size.'],['Fixed stand and diffuse lamp','1 set','Holds the camera above the card and lights the field evenly.']],
    assembly:[
      ['Frame a fixed overhead field','Secure the webcam so the lens points down at the center of the card. Connect USB. Keep the card and its three targets inside the middle of the frame, with space around the edges.','The webcam stays still as targets move. The entire trial field fits the center crop.',[0,2,3]],
      ['Set up the target contrast','Use a matte dark backing and three bright disks. Position the lamp off-axis with diffuse light. Leave space between the disks for the baseline sample.','The backing stays dark and no bright glare touches the disks.',[2,3]],
      ['Check the binary mask','Run the webcam program or try the built-in browser scenes. Adjust threshold until the bright disks show white in the mask and the background stays dark.','Each of the three separated disks has its own outline.',[0,1,2]],
      ['Compare touching objects and noise','Bring two disks together until their white pixels join. Keep the third disk separate. Try the same test under dimmer light and compare settings before moving the camera.','At matching lighting and cutoff, touching two disks changes the reported count from three regions to two.',[1,2,3]],
    ],
    wiring:[['USB webcam','Computer USB port','Transfers camera frames and powers the camera'],['Camera lens','Matte target field','Keeps all targets within the center crop'],['Diffuse lamp','Target field','Lights the card from an angle to reduce glare']],
    test:'Record the results for an empty card, one target, three separated targets and two of the three touching. The expected count is 0, 1, 3, then 2. Change the cutoff or lighting and explain an incorrect count from the mask.',
    demo:['Target spacing','Separated','Touching','Three distinct bright regions','Two bright regions because two targets touch'],
  },
];
