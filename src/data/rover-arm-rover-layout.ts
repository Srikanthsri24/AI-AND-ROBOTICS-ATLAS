import uno from'./uno-r3-board-layout.json';
import{unoR3Point,unoR3HeaderPoint,bluetoothCarPlacedPoint,type CarPoint}from'./bluetooth-car-layout';
import{bluetoothBoardLayouts,bluetoothBoardPoint,bluetoothHeaderPoint,bluetoothBoardScale,bluetoothBoardTop}from'./bluetooth-board-geometry';
/** Actual common hardware with this guide's own two-board layout. No radio. */
export const raRoverLayout={uno:{at:[-.90,1.12,-1.12]as CarPoint,rotation:-Math.PI/2},driver:{at:[.74,1.12,-.50]as CarPoint,rotation:0}};
export const raRoverBoardMounts=[...uno.holes.map(h=>({name:'rover uno '+h.x+','+h.y,at:bluetoothCarPlacedPoint(raRoverLayout.uno.at,raRoverLayout.uno.rotation,unoR3Point(+h.x,+h.y,-.016)),top:raRoverLayout.uno.at[1]+.016,screwStage:4})),...bluetoothBoardLayouts.tb6612.elements.filter(e=>e.package.startsWith('MOUNTING')).map(e=>({name:'rover driver '+e.name,at:bluetoothCarPlacedPoint(raRoverLayout.driver.at,0,bluetoothBoardPoint('tb6612',+e.x,+e.y,-bluetoothBoardTop).map(n=>n*.02/bluetoothBoardScale)as CarPoint),top:raRoverLayout.driver.at[1]+.016,screwStage:6}))];
export function raRoverUnoContact(pin:string){return bluetoothCarPlacedPoint(raRoverLayout.uno.at,raRoverLayout.uno.rotation,unoR3HeaderPoint(pin));}
export function raRoverDriverContact(pin:string){return bluetoothCarPlacedPoint(raRoverLayout.driver.at,0,bluetoothHeaderPoint('tb6612',pin).map(n=>n*.02/bluetoothBoardScale)as CarPoint);}
export const raRoverUnoParts=[
 ['pcb','Rover Uno · PCB','Runs the guide’s two-mode program. The rover requires A2 grounded at startup.'],
 ['tracks','Rover Uno · copper paths','Join the processor, sockets and power circuitry at the actual reference-board positions.'],
 ['mcu','Rover Uno · controller','Samples range and sets independent wheel requests. A blind turn lasts 320 ms before another reading.'],
 ['usb','Rover Uno · USB socket','Receives 5 V logic power from the separate USB source. It does not feed the motor VM rail.'],
 ['bridge','Rover Uno · USB serial interface','Transfers the uploaded Arduino sketch and its range readings through USB.'],
 ['power','Rover Uno · supply circuitry','Includes the regulator, supply capacitors and unused barrel input. This build uses regulated USB power.'],
 ['reset','Rover Uno · reset button','The program samples A2 again when it starts. Switch off motor power before changing the selected build.'],
 ['programming','Rover Uno · programming headers','Unused by this guide’s USB upload path. Leave these contacts clear.'],
 ['leds','Rover Uno · board indicators','The ON indicator follows USB logic power. It does not prove the separate motor supply is connected.'],
].map(([id,label,description])=>({id:'ra-rover-uno-'+id,label,description}));
const uses:Record<string,string>={A0:'Connect TRIG here.',A1:'Connect ECHO here.',A2:'Ground at startup to select rover mode.',D2:'Connect driver STBY here.',D4:'Connect AIN1 here.',D5:'Connect PWMA here.',D6:'Connect PWMB here.',D7:'Connect AIN2 here.',D8:'Connect BIN1 here.',D12:'Connect BIN2 here. D11 is unused.','5V':'Supplies sonar and driver logic only.','GND-P1':'Common control reference. Motor current returns directly to the AA pack through the driver.'};
export const raRoverUnoSocketParts=uno.headers.map(h=>({id:'ra-rover-uno-socket-'+h.name,label:'Rover Uno socket · '+h.name,description:uses[h.name]??'Unused in this rover recipe. Follow the project wiring steps before adding a lead.'}));
export const raRoverMechanicalParts=[
 ['chassis','Rover · drilled chassis','Holds the two drive motors, rear caster, actual two-board mounts and anchored front sensor. No Bluetooth radio is fitted.'],
 ['left-motor','Rover · left geared motor','Driver channel A feeds its two actual rear terminals. The gearbox drives only the left wheel.'],
 ['right-motor','Rover · right geared motor','Driver channel B feeds this independent motor. The two wheels counter-rotate during the programmed turn.'],
 ['left-wheel','Rover · left tyre and hub','The treaded tyre and bored hub rotate about the actual left shaft.'],
 ['right-wheel','Rover · right tyre and hub','Matches the left wheel diameter while rotating independently.'],
 ['motor-brackets','Rover · motor clamps','Clamp each motor below the chassis without trapping its terminals or shaft.'],
 ['caster','Rover · trailing caster','Its fork swivels freely and its wheel follows floor movement. It has no motor.'],
 ['aa-holder','Rover · four-AA motor pack','Provides the separate nominal motor supply through the series switch to driver VM.'],
 ['aa-switch','Rover · motor switch','Disconnects motor supply positive independently of USB logic power.'],
 ['usb-bank','Rover · USB logic source','Supplies regulated 5 V to the Uno USB input for an untethered run.'],
 ['supports','Rover · board spacers and fasteners','Only the Uno and motor-driver mounts are fitted. They keep solder joints above the chassis.'],
 ['ground-strip','Rover · low-current distribution board','Distributes 5 V and the shared logic reference. Motor current bypasses these small ties.'],
].map(([id,label,description])=>({id:'ra-rover-'+id,label,description}));
