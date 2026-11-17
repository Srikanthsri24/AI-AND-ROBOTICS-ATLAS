import type { Build } from './guided-projects';

export const swarmTurnMs = 1600;
export const swarmGapMs = 450;
export const swarmHeartbeatMs = 100;
export const swarmTimeoutMs = 350;

export const swarmCoordination: Build = {
  id:'directory-95',
  title:'Multi Robot Coordination For Swarm Robotics',
  outcome:'Build two tabletop robot drive rigs and use a shared token to take turns. See how periodic messages keep both robots coordinated and why they stop if either rig loses contact.',
  parts:[
    ['Arduino Mega 2560 Rev3','2','Robot A schedules each turn. Robot B answers its messages and drives only while it holds the token.'],
    ['Adafruit DRV8833 motor breakout','2','Each board drives a single TT motor and goes to sleep when its robot is waiting. Keep the current limit enabled.'],
    ['6 V geared DC motors and wheels','2 sets','Use one motor and wheel on each raised rig so students can see which robot is moving.'],
    ['Switched 3×AA holder and matching lead','2 sets','Each rig has an independently switched 4.5 V motor supply.'],
    ['Chassis and caster','2 sets','Use both chassis as stable, stationary rigs. Clamp them to the bench with wheels clear.'],
    ['Breadboard and jumper wires','2 sets','Connect each motor driver and link the two controllers through Serial1 at 57600 baud.'],
    ['USB-A to USB-B data cable','2','Program each controller and open Robot A’s console to run the trials.'],
  ],
  assembly:[
    ['Build and label the two rigs','Clamp each chassis to a stable bench stand with its wheel raised. Label one A and the other B. Set both motor switches to off.','Both wheels rotate freely by hand and stay clear of wires.',[2,3,4]],
    ['Wire a drive channel on each rig','Use the wiring map to connect D4 and D5 to the driver inputs. Keep the current limit enabled and connect the pack through its switch.','With the motor packs off, verify each ground and check there is no short between motor power and ground.',[0,1,2,3,5]],
    ['Link the controllers','Cross A TX1 to B RX1 and B TX1 to A RX1. Join the two controller grounds. Route the jumpers away from both wheels.','Trace each transmit connection to the opposite receive pin.',[0,5,6]],
    ['Load the two robot roles','Upload the same sketch with robotA set to true on A and false on B. Open the USB Serial Monitor for A and check communication before switching on the motors.','A reports the link is ready and neither wheel moves before a start command.',[0,6]],
    ['Trace a handoff and a link failure','Switch on both low-voltage motor packs. Send g to begin. During the B turn, open either signal jumper while keeping the grounds connected. Reconnect and send g to repeat.','Only one wheel turns at a time. Both stop on link loss and stay stopped until the next start command.',[0,1,2,3,5]],
  ],
  wiring:[
    ['A TX1 D18','B RX1 D19','A sends a fresh sequenced command every 100 ms.'],
    ['B TX1 D18','A RX1 D19','B echoes the command sequence number after applying its new output.'],
    ['A GND','B GND','Shared reference for the two UART signals.'],
    ['Each Mega D4 / D5','Local DRV8833 SLP / AIN1','Motor enable and forward PWM. Keep AIN2 at local GND.'],
    ['Each driver AOUT1 / AOUT2','Local TT motor leads','Only motor channel A is used.'],
    ['Each switched pack + / −','Local driver VM / local common GND','Keep the positive terminals of the two packs separate.'],
    ['Each Mega USB-B','Computer USB','Logic power, upload and Robot A’s command console.'],
  ],
  test:'Send g and watch A move, both stop for the handoff, then B move. During B’s turn, disconnect one UART signal lead. Watch A report a fault and both wheels stop. Reconnect the lead, check that neither robot restarts automatically, then send a fresh g. Send x to stop a normal trial.',
  demo:['Two-robot drive bench','Robot A turn','All-stop handoff','Robot B turn','Heartbeat timeout'],
};
