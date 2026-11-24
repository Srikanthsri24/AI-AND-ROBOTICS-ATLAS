import type { Build } from './guided-projects';

export const bluetoothCar: Build = {
  id: 'directory-1',
  title: 'DIY Bluetooth-Controlled RC Car',
  outcome: 'Build a two-wheel car that drives, reverses, and pivots on commands sent from your phone over Bluetooth Low Energy.',
  parts: [
    ['Arduino Uno R3','1','Reads one-letter commands over UART and sets the direction and speed of each wheel.'],
    ['Bluefruit LE UART Friend','1','Receives Bluetooth commands from the phone and sends them to the Uno through TXO.'],
    ['TB6612FNG breakout','1','Uses the Uno’s logic signals to switch power from the AA pack to each motor.'],
    ['6 V geared DC motors and wheels','2','Each motor drives one wheel. Opposite wheel directions pivot the car in place.'],
    ['Chassis and caster','1 set','Holds the boards and motors. The caster supports the free end as the car turns.'],
    ['Switched 4×AA holder','1','Four alkaline AAs supply the driver’s motor input. Its switch cuts motor power.'],
    ['Breadboard and jumper wires','1 set','Join the low-current signals and common ground. Keep motor power leads short and secure.'],
    ['5 V USB power bank','1','Powers the Uno through its USB port during a floor test. Use a USB data cable for uploading from a computer.'],
  ],
  assembly: [
    ['Build and label the chassis','Mount the two motors on opposite sides and fit the wheels. Attach the caster at the rear and mark the front, left and right.','Spin both wheels by hand and check that the chassis sits level.',[3,4]],
    ['Mount the electronics','Secure the Uno, Bluefruit, and driver on insulated mounts. Keep the Bluefruit antenna at the edge, away from batteries and metal. Use modules with headers already fitted, or have an adult solder them before installation.','Boards and exposed pins clear the chassis, and wires cannot reach the wheels.',[0,1,2,4,6]],
    ['Wire Bluetooth to the Uno','With USB and AA power disconnected, set the Bluefruit switch to UART/Data. Connect TXO to D2, VIN to Uno 5 V, and both CTS and GND to the common ground. Leave RXI, RTS and MOD disconnected.','TXO goes to the Uno’s receive pin D2, and CTS has continuity to GND.',[1,0,6]],
    ['Wire the motor driver','Connect the control pins from the table. Connect the left motor to channel A and the right motor to channel B. Connect battery negative to driver GND and battery positive to VM.','Verify VM and VCC are separate. Check that each motor’s stall current at the battery voltage fits the driver’s rating.',[2,3,5,0,6]],
    ['Secure both power supplies','Fasten the switched AA holder and USB power bank so they cannot shift. Leave the AA switch off. Use computer USB to program the Uno first. Switch to the USB power bank only for untethered testing.','All grounds are shared through the driver and Uno. The AA positive wire goes only to VM.',[5,7,2,0]],
  ],
  wiring: [
    ['Uno 5 V','Bluefruit VIN and driver VCC','Logic power'],
    ['Bluefruit TXO','Uno D2','Bluetooth command bytes at 9600 baud'],
    ['Bluefruit CTS and GND','Uno GND','Enable UART output and share the ground reference'],
    ['Uno D5 / D6','PWMA / PWMB','Left and right wheel speed'],
    ['Uno D4 / D7','AIN1 / AIN2','Left wheel direction'],
    ['Uno D8 / D11','BIN1 / BIN2','Right wheel direction'],
    ['Uno D12','STBY','Enable or disable both driver channels'],
    ['Driver A outputs','Left motor leads','Left motor power and direction'],
    ['Driver B outputs','Right motor leads','Right motor power and direction'],
    ['Switched AA positive','Driver VM / Vmotor','Motor power'],
    ['AA negative and driver GND','Uno GND','Common ground'],
    ['Computer USB or USB power bank','Uno USB port','Logic supply during upload or untethered use'],
  ],
  test: 'With the wheels lifted, test F, B, L, R and S in that order. If a wheel turns the wrong way, power off both supplies and swap that motor’s two output leads. Send F and disconnect Bluetooth before the pulse ends to check that the driver disables its outputs 850 ms after the last command. The wheels can coast briefly after the outputs switch off. After all checks pass, switch to the USB power bank and repeat on a clear floor at low speed.',
  demo: ['Drive command','Stopped','Forward','Both wheels are idle','Both wheels drive forward'],
};

export const bluetoothCarCommands = [
  { key:'F', label:'Forward', left:1, right:1, description:'Both wheels drive forward.' },
  { key:'B', label:'Reverse', left:-1, right:-1, description:'Both wheels drive in reverse.' },
  { key:'L', label:'Pivot left', left:-1, right:1, description:'Left wheel reverses. Right wheel drives forward.' },
  { key:'R', label:'Pivot right', left:1, right:-1, description:'Left wheel drives forward. Right wheel reverses.' },
  { key:'S', label:'Stop', left:0, right:0, description:'The motor driver is disabled.' },
] as const;
export type BluetoothCarCommand = (typeof bluetoothCarCommands)[number]['key'];
export const bluetoothCarPulseMs = 850;
