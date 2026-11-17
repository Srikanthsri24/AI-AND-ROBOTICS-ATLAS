import type { Build } from './guided-projects';

export const energyLoads=[{name:'Open circuit',ohms:0},{name:'440 Ω load',ohms:440},{name:'220 Ω load',ohms:220}] as const;
export function energyReading(ohms:number){
  const amps=ohms===0?0:5/(ohms+.1);
  return {volts:5-amps*.1,milliamps:amps*1000,watts:(5-amps*.1)*amps};
}

export const gsmEnergy:Build={
  id:'directory-65',title:'GSM Smart Energy Meter',
  outcome:'Measure voltage, current and accumulated energy in a 5 V DC load, then request an SMS snapshot. Compare how two resistor loads change the rate at which energy accumulates.',
  parts:[
    ['Arduino Uno R3','1','Reads the current monitor, accumulates watt-hours and sends a one-shot SMS request over UART.'],
    ['Adafruit INA219 current monitor','1','Measures the load-side voltage and current through its series shunt. Default address 0x40.'],
    ['Adafruit FONA 800 GSM breakout and antenna','1 set','Use the 1946 breakout, its matching u.FL GSM antenna and an activated SMS-capable SIM with verified local 2G coverage.'],
    ['Protected 3.7 V LiPo for FONA','1','Use a pack supported by the FONA and with matching connector polarity. The modem draws from this pack during transmission.'],
    ['Regulated 5 V supply and adapter','1 set','Powers only the isolated low-voltage test loop. Use the adapter to expose marked positive and negative terminals.'],
    ['220 Ω axial resistors','2','Use ¼ W or higher. Test with one resistor or two in series.'],
    ['Breadboard and jumper wires','1 set','Carries the resistor circuit, common ground and data leads.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno and carries measurement logs.'],
  ],
  assembly:[
    ['Build the 5 V load loop','With power off, insert the INA219 between the 5 V bench supply positive and one end of a 220 Ω resistor. Return the other end to supply negative. Prepare a two-resistor series chain to swap in later.','The path goes from supply positive through VIN+, VIN− and the load back to supply negative.',[1,4,5,6]],
    ['Wire the meter to the Uno','Connect INA219 VCC and GND to Uno logic power, plus SDA to A4 and SCL to A5. Join supply negative to the shared ground. Leave the bench positive separate from Uno 5 V.','The shunt is in series and every board shares the reference ground.',[0,1,4,6]],
    ['Set up the GSM breakout','With its battery disconnected, fit the antenna and SIM. Wire Vio, GND, KEY and UART. Close the SIM latch and connect the protected LiPo with matching polarity.','The modem powers up from its own battery and can register on the verified local network.',[0,2,3,6]],
    ['Check readings before messaging','Upload the sketch with the recipient blank. Open Serial Monitor at 115200 baud. Compare the open input path, the 440 Ω chain and the 220 Ω load. Switch the bench supply off whenever changing resistors.','Current is near zero with the load open. The lower resistance gives a faster energy rise.',[0,1,4,5,7]],
    ['Request a single report','Set the destination to a test number you control and upload again. With the modem registered, enter M once in Serial Monitor. Check the modem reply and compare the report with the timestamped log.','One request submits one snapshot. A modem error or timeout is reported without automatic retry.',[0,1,2,3,7]],
  ],
  wiring:[
    ['Bench +5 V','INA219 VIN+ terminal','Current enters the shunt'],
    ['INA219 VIN− terminal','Resistor chain → bench negative','Load path'],
    ['Bench negative','Uno GND and INA219 GND','Shared reference'],
    ['Uno 5 V / GND','INA219 logic VIN / GND, FONA Vio / GND','Logic power and shared ground'],
    ['Uno A4 / A5','INA219 SDA / SCL','I²C data and clock'],
    ['FONA TX / RX','Uno D3 / D2','UART at 9600 baud'],
    ['FONA KEY','GND','Power-on strap for this breakout'],
    ['Protected 3.7 V LiPo','FONA battery JST only','Verify connector polarity'],
    ['Computer USB','Uno USB-B','Power, measurements and M command'],
  ],
  test:'With a nominal 5 V source, compare approximately 11 mA for 440 Ω and 23 mA for 220 Ω. Confirm that the lower resistance accumulates watt-hours about twice as fast. Request an SMS with M. The modem reports acceptance or an error while samples continue.',
  demo:['DC load and SMS','Open circuit','Measuring','Energy stays flat','Power integrates over time'],
};
