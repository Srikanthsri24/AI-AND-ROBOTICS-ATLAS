import layout from'./uno-r3-board-layout.json';
import{unoR3HeaderPoint}from'./bluetooth-car-layout';
export const raArmUnoAt=[-160,3,90]as const;
export const raArmPcaAt=[-110,3,0]as const;
export const raArmLogicLinks=[{id:'vcc',uno:'5V',pca:3,label:'Logic power · 5V to VCC',color:'#c9483e',why:'Powers the PWM controller logic. Servo motor current uses the separate V+ supply.'},{id:'ground',uno:'GND-P1',pca:5,label:'Shared reference · GND to GND',color:'#383b43',why:'Gives the Uno and PWM controller a common voltage reference.'},{id:'sda',uno:'A4',pca:2,label:'I²C data · A4 to SDA',color:'#4685c9',why:'Carries the six-channel command data from the Uno to the driver.'},{id:'scl',uno:'A5',pca:1,label:'I²C clock · A5 to SCL',color:'#579b72',why:'Clocks the I²C command transfer. A disconnected clock prevents new commands reaching the driver.'}]as const;
export function raArmUnoSocket(name:string){const p=unoR3HeaderPoint(name);return p.map((v,i)=>v*50+raArmUnoAt[i])as[number,number,number];}
export function raArmPcaLogic(index:number){return[raArmPcaAt[0]-28.5,raArmPcaAt[1]+6,raArmPcaAt[2]-6.35+index*2.54]as[number,number,number];}
export const raArmUnoParts=[
 ['pcb','Uno R3 PCB','The board runs this guide’s dual-mode sketch. A2 is sampled at startup: open selects the arm, grounded selects the rover.'],
 ['mcu','ATmega328P controller','Reads serial commands at 115200 baud. In arm mode h requests neutral; 1–6 jog the selected channel.'],
 ['usb','USB-B logic supply and upload','The USB connection uploads the sketch and powers the Uno. It does not power the servo V+ rail.'],
 ['bridge','USB serial interface','Carries computer upload and Serial Monitor data to the main controller.'],
 ['power','Power conditioning','Regulators and capacitors condition the Uno logic supply. The barrel connector stays unused in this guide.'],
 ['reset','Reset pushbutton','Restarts the sketch and samples the A2 selector again. Disconnect actuator power before changing the build.'],
 ['tracks','PCB copper tracks','Conductive routes join the controller, sockets and support components.'],
 ['programming','ICSP programming headers','Programming connectors remain unused for this USB-uploaded guide.'],
 ['leds','Power and activity indicators','ON follows the Uno logic supply; RX and TX indicate USB serial traffic.'],
].map(([id,label,description])=>({id:'ra-uno-'+id,label,description}));
export const raArmSocketParts=layout.headers.map(h=>({id:'ra-uno-socket-'+h.name,label:'Uno socket · '+h.name,description:raArmLogicLinks.find(l=>l.uno===h.name)?.why??(h.name==='A2'?'Leave this open at startup for arm mode. Ground it only for the alternative rover build.':'Unused by the stationary arm recipe. Do not add a wire unless a guide step calls for it.')}));
