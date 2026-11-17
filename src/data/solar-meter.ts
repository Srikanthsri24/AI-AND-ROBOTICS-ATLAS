import type { Build } from './guided-projects';

export const solarLoads = [440,660,0] as const;
export type SolarLoad = typeof solarLoads[number];

// A classroom approximation of a silicon panel's current plateau and voltage knee.
export function solarReading(light:number,load:SolarLoad) {
  const fraction=light/100;
  const openVoltage=fraction===0?0:Math.max(0,7.1+.65*Math.log(fraction));
  const currentLimit=.167*fraction;
  const knee=openVoltage*.82;
  const totalResistance=load+.1;
  const amps=load===0||currentLimit===0?0:Math.min(
    currentLimit, openVoltage/(totalResistance+(openVoltage-knee)/currentLimit),
  );
  const volts=load===0?openVoltage:amps*load;
  return {volts,milliamps:amps*1000,milliwatts:volts*amps*1000};
}

export const solarMeter:Build={
  id:'directory-56',
  title:'Arduino-Based Solar Power Measurement',
  outcome:'Build a meter that measures a mini solar panel under load. Record voltage, current and power, then see what changes when you cover the panel or swap the load.',
  parts:[
    ['Arduino Uno R3','1','Reads the sensor over I²C and sends one reading per second to the computer. Power it from USB.'],
    ['6 V 1 W raw solar panel','1','Use a panel with a separately accessible positive and negative lead and an open-circuit voltage of 8 V or less. Use a matching pigtail for its connector and verify polarity.'],
    ['Adafruit INA219 current monitor','1','The shunt sits in the panel’s positive lead and measures current. The chip also measures the load voltage and sends both readings over I²C.'],
    ['220 Ω axial resistors','3','Use ¼ W or higher. Two in series make 440 Ω. Three in series make 660 Ω. Never replace the chain with a jumper.'],
    ['Breadboard and jumper wires','1 set','Holds the resistor chain and joins the panel negative, sensor ground and Uno ground.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to the Arduino IDE and Serial Monitor. Use a USB-C adapter if needed.'],
  ],
  assembly:[
    ['Mount and identify the panel','Prop the small panel at a fixed angle on a dry workbench. Check its connector polarity and maximum open-circuit voltage using a multimeter. Cover the panel before wiring.','The positive lead is marked and the measured open-circuit voltage stays below 8 V.',[1]],
    ['Build the removable load','Put two 220 Ω resistors in series across three separate connected rows. Use a meter in resistance mode on the disconnected chain to check for about 440 Ω. Prepare a third resistor to add later.','The middle row joins only the adjacent resistor legs. There is no jumper across either resistor.',[3,4]],
    ['Insert the current monitor','With the panel covered and USB unplugged, run panel positive to VIN+ on the INA219 terminal block. Run VIN− to one end of the resistor chain. Join the other end to panel negative and the breadboard ground rail.','Panel current has one path through the shunt and both resistors back to panel negative.',[1,2,3,4]],
    ['Connect the data and power leads','Wire the INA219 VCC, GND, SDA and SCL pins to the Uno according to the map. Tie the panel negative rail to Uno ground. Leave the solar positive lead separate from the Uno supply. Plug in USB.','Sensor logic gets 5 V from the Uno. The solar panel supplies the resistor chain alone.',[0,2,4,5]],
    ['Change one condition at a time','With the sketch running, record a reading with the panel uncovered. Shade the panel and record another reading. Cover the panel before adding the third resistor in series, then uncover it at the same angle and compare.','Under steady bright light, the 660 Ω load usually draws less current than 440 Ω. With an open load, the meter can report voltage while current and delivered power approach zero.',[1,2,3,4]],
  ],
  wiring:[
    ['Panel positive','INA219 VIN+ (screw terminal)','Solar current enters the shunt'],
    ['INA219 VIN− (screw terminal)','First resistor lead','Measured positive output to the load'],
    ['Last resistor lead','Panel negative and ground rail','Completes the series circuit'],
    ['Uno GND','Ground rail and INA219 GND','Shared voltage reference'],
    ['Uno 5 V','INA219 VCC / logic VIN (header)','USB-derived sensor supply'],
    ['Uno A4 / SDA','INA219 SDA','I²C data'],
    ['Uno A5 / SCL','INA219 SCL','I²C clock'],
    ['Computer USB','Uno USB-B','Programming, power and readings'],
  ],
  test:'In steady light, compare 440 Ω, 660 Ω and an open circuit. Check that load power in mW is load voltage × current in mA. Shade the 440 Ω load trial and compare again. Actual readings vary with the panel and light.',
  demo:['Incident light','Open circuit','Loaded panel','Voltage can remain with no current','Voltage × current gives load power'],
};
