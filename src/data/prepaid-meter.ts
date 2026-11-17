import type { Build } from './guided-projects';

export const creditTopUp = .30;
export const meterPeriod = 100;
export const faultSamples = 4;
export const differenceLimit = 10;
export const billedCurrent = 5 / 220 * 1000;
export type MeterState = {credit:number; strikes:number; alarm:boolean; faultPath:boolean};
export const initialMeter:MeterState={credit:0,strikes:0,alarm:false,faultPath:false};

export function meterSample(state:MeterState,elapsed:number):MeterState{
  const hasLoad=state.credit>0&&!state.alarm;
  const strikes=state.faultPath?Math.min(faultSamples,state.strikes+1):0;
  const credit=hasLoad?Math.max(0,state.credit-5*billedCurrent*elapsed/3_600_000):state.credit;
  return {...state,credit,strikes,alarm:state.alarm||strikes>=faultSamples};
}

export const prepaidMeter:Build={
  id:'directory-89',
  title:'Prepaid Energy Meter With Theft Detection',
  outcome:'Build a 5 V classroom meter with prepaid energy credit. Compare total supply current with the billed branch. A dedicated test load creates a mismatch and exercises the alarm and cutoff.',
  parts:[
    ['Arduino Uno R3','1','Integrates billed power, applies test credit and controls the load cutoff.'],
    ['Adafruit INA219 current monitor','2','Set the upstream unit to 0x40 and the billed unit to 0x41.'],
    ['Regulated 5 V supply and adapter','1 set','Supplies the low-voltage resistor circuit. Use a current-limited 5 V bench source and keep its positive rail separate from USB.'],
    ['STEMMA MOSFET driver and lead','1 set','Switches the return of the billed load. The logic and driver power come from the Uno.'],
    ['220 Ω axial resistors','2','Use ¼ W or greater. One resistor represents the billed load. The other is a dedicated switched test load.'],
    ['Momentary tactile start button','3','Label them TOP UP, RESET and TEST LOAD. The first two are logic buttons. The third switches the 5 V test resistor.'],
    ['Green and red LEDs with 220 Ω resistors','1 set','Green indicates the billed output is enabled. Red indicates a latched mismatch or meter fault.'],
    ['Breadboard and jumper wires','1 set','Keeps the two current paths, supply connections and shared ground accessible for inspection.'],
    ['USB-A to USB-B data cable','1','Powers the controller and carries meter readings to Serial Monitor.'],
  ],
  assembly:[
    ['Address and label the two INA219 boards','Leave the upstream board at 0x40. With power off, bridge the A0 address pads on the billed board to set 0x41. Wire each board’s logic pins to the same I²C bus.','Both boards have distinct addresses, and the shunt terminals are separate from their I²C pins.',[0,1,7]],
    ['Build the billed load path','Connect supply + to the upstream shunt and take its VIN− to a junction. Run the billed branch from the junction through the second shunt, a 220 Ω resistor and the MOSFET return. Join supply negative and Uno ground.','The billed branch passes through both current shunts. Bench +5 V never connects to the Uno 5 V rail.',[0,1,2,3,4,7]],
    ['Add the dedicated mismatch test branch','Connect the fixed second 220 Ω resistor and TEST LOAD switch in series from the junction to bench negative. Keep this resistor path clearly marked and open except during the test.','This branch draws about 23 mA only while its switch is held. The upstream meter sees this current.',[1,2,4,5,7]],
    ['Connect the controls and indicators','Wire the TOP UP and RESET buttons to D2 and D3. Connect green at D5 and red at D6. Supply the driver from the Uno and connect D9 to the driver’s input. Leave the driver OUT+ terminal unused.','At startup both current channels are near zero and the billed branch is disabled.',[0,3,5,6,8]],
    ['Compare normal billing, cutoff and mismatch','Upload and open Serial Monitor. Use TOP UP to grant 0.30 mWh. After testing normal cutoff, top up again and hold TEST LOAD for about one second. Release it before pressing RESET.','Four consecutive differences over 10 mA latch the alarm. Releasing the test switch alone leaves the billed load off until reset.',[0,1,3,4,5,6,8]],
  ],
  wiring:[
    ['Bench +5 V','Upstream INA219 VIN+','Upstream INA219 address 0x40'],
    ['Upstream INA219 VIN−','Junction → billed INA219 VIN+','Billed INA219 address 0x41'],
    ['Billed INA219 VIN−','220 Ω billed resistor → driver OUT−','Keep driver OUT+ open'],
    ['Meter junction','220 Ω test resistor → TEST LOAD button → bench GND','Normally open, dedicated classroom mismatch stimulus'],
    ['Uno 5 V / GND','Both INA219 logic VCC / GND and driver V+ / GND','Join bench negative to Uno ground'],
    ['Uno A4 / A5','Both INA219 SDA / SCL','Shared I²C bus'],
    ['Uno D9','Driver SIG','Billed output cutoff'],
    ['Uno D2 / D3','TOP UP / RESET buttons → Uno GND','Internal pull-ups'],
    ['Uno D5 / D6','Each → 220 Ω → green / red LED anode','LED cathodes to Uno GND'],
  ],
  test:'Start at zero credit. Top up and compare the upstream and billed readings near 23 mA. Watch the 0.30 mWh credit reach zero and the billed load cut off. Top up again, then hold TEST LOAD. The mismatch should trip the alarm. Release the switch, confirm the alarm stays latched, and press RESET. Confirm the remaining credit is preserved.',
  demo:['Upstream and billed current','Zero credit','Billed load on','Mismatch latched','Manual reset after the currents match'],
};
