import type {Build} from './guided-projects';

export const modelWindVanePointer:Build={
  id:'model-wind-vane-pointer',
  title:'Model wind vane pointer',
  outcome:'Build a freely turning vane and read its heading from a magnetic angle sensor. Calibrate against the north and east marks on the model base.',
  parts:[
    ['Arduino Uno R3','1','Reads the angle over I²C and converts it to a heading relative to the base.'],
    ['Adafruit AS5600 angle sensor','1','Reads the rotating magnetic field without touching the vane shaft.'],
    ['Diametrically polarized magnet','1','Rotates with the shaft. Its poles lie across the diameter.'],
    ['Card vane, pivot and compass base','1 set','A broad tail catches the moving air and turns the arrow toward the source.'],
    ['Breadboard and jumper wires','1 set','Connects the stationary sensor to the Uno.'],
    ['USB-A to USB-B data cable','1','Powers the circuit and connects Serial Monitor.'],
  ],
  assembly:[
    ['Build and balance the vane','Cut a small arrowhead and a larger tail fin. Mount them on a lightweight beam. Use a straight shaft in a low-friction support and mark N, E, S and W clockwise on the base.','The vane turns freely through a full circle without fouling the base.',[3]],
    ['Align the magnet and sensor','Secure the diametric magnet to the lower end of the shaft. Center it over the AS5600 chip with a small air gap, starting within the documented 0.5–3 mm range. Keep the board and its wires stationary.','The magnet rotates above the chip without touching it and is detected throughout the turn.',[1,2,3]],
    ['Connect the I²C breakout','With USB unplugged, connect VIN to 5 V, GND to GND, SDA to A4, and SCL to A5 on the Uno. Use an assembled breakout or have an adult attach its header.','The sensor responds at address 0x36 with the magnet in place.',[0,1,4]],
    ['Calibrate and test the pointer','Upload and open Serial Monitor at 115200 baud. Point the arrow at N and send n. Turn it clockwise to E and send e. Blow gently from each marked side and compare the settled reading with the arrow.','N reads near 0°, E near 90°, and a full turn wraps back to north.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno 5 V','Breakout VIN','Power for the Adafruit breakout'],
    ['Uno GND','Breakout GND','Shared signal ground'],
    ['Uno A4 / SDA','Breakout SDA','I²C data'],
    ['Uno A5 / SCL','Breakout SCL','I²C clock'],
    ['Vane shaft magnet','AS5600 chip across a small air gap','Contactless angle measurement'],
  ],
  test:'Capture N and E. Turn through S, W and back to N. Confirm that the heading increases clockwise and wraps near 360°. The arrow points toward the source of the moving air.',
  demo:['Free pivot','Calibrate north','Calibrate east','Aim airflow','Read the heading'],
};
