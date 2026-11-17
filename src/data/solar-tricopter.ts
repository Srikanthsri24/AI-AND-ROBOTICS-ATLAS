import type { Build } from './guided-projects';

export const solarTricopter:Build={
  id:'directory-73',title:'Sun-Tracking Panel and Tricopter Camera Workbench',
  outcome:'Build a solar-panel tracker and a propeller-free tricopter control model. Compare differential light tracking with tail-servo steering, then frame a picture in the virtual flight test.',
  parts:[
    ['Arduino Uno R3','1','Runs the two bench mechanisms and shows the current mode over USB.'],
    ['Pair of CdS photoresistors','2','Mount one on either side of an opaque shade fin.'],
    ['10 kΩ divider resistors','2','One resistor per light divider.'],
    ['Positional micro servo','2','One turns the solar carrier and one tilts the tricopter tail pod.'],
    ['Voltaic P123 mini solar panel','1','Mount the lightweight panel on its carrier with the output connector insulated.'],
    ['Cardboard turntable carrier and light hood','1 set','Use lightweight stiff card for a balanced solar carrier and a rigid Y-shaped tricopter frame. The bench model uses marker disks in place of propellers.'],
    ['10 kΩ rotary test potentiometers','1','Commands left or right tail tilt in the tricopter bench test.'],
    ['External regulated arm servo supply','1 set','Supply regulated 5 V sized for the two servos, with a separate positive rail and shared ground.'],
    ['Breadboard and jumper wires','1 set','Holds jumpers, the two divider circuits and the yaw test knob.'],
    ['USB-A to USB-B data cable','1','Powers the controller and connects to Serial Monitor.'],
  ],
  assembly:[
    ['Make two independent fixtures','Secure a light panel on a centered servo carrier. Build a Y-shaped frame with two fixed front pods and a rear pod on the second servo. Mark each pod with a disk made from card.','Solar rotation and rear tilt have clear travel and do not interfere.',[3,4,5]],
    ['Align the light pair','Put the photoresistors on either side of the shade fin, oriented toward the light. Wire each to its own 10 kΩ divider.','Moving the light to one side raises that side’s count.',[0,1,2,5,8]],
    ['Wire the tail command','Put the outer potentiometer terminals between 5 V and ground. Wire the wiper to A2. Keep the center position accessible.','Centering the knob holds the tail pod upright.',[0,3,6,8]],
    ['Join grounds and check neutral','Wire the two servo signals and switch on USB before enabling the external servo rail. With horns detached, verify both neutral outputs before installing the horns with power off.','The two servos start near center and their wires stay clear of moving joints.',[0,3,7,9]],
    ['Test the motions independently','Select S in Serial Monitor and move a lamp. Select T and turn the yaw knob. Set both back to center before folding down either fixture.','The solar carrier follows directional light. The tricopter model only tilts its tail pod in T mode.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V → CdS → A0 / A1','Left / right light divider junction','One 10 kΩ from each junction to ground'],
    ['Uno 5 V / GND','Yaw knob outer terminals','Knob wiper connects to A2'],
    ['Uno D9 / D10','Solar pan / rear pod signal','Two servo channels'],
    ['External 5 V and negative','Both servo power leads','Provide rated distribution and share negative with Uno GND'],
    ['Computer USB','Uno USB-B','Select mode and read telemetry'],
  ],
  test:'Use S to follow a lamp left and right. Balance both readings or cover both sensors and confirm the panel stops changing angle. Switch to T, turn the knob in both directions and confirm only the rear pod moves. The in-browser tricopter uses a separate simulated flight controller.',
  demo:['Solar or tricopter mode','Balanced','Turning','The servo holds position','The selected mechanism responds'],
};
