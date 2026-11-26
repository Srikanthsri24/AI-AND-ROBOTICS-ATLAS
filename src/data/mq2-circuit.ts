/** Educational circuit calculations, independent of the MQ-2 gas chemistry.
 * The module voltage is an explicit input: this model does not invent a ppm curve,
 * heater conditioning time, or response to a particular gas. Units: V and ohms. */
export type Mq2CircuitInput=Readonly<{
  usb:boolean;
  commonGround:boolean;
  mode:'dial'|'sensor';
  dialPosition:number;
  sensorSupply:boolean;
  moduleOutputV:number;
  upperOhms:number;
  lowerOhms:number;
  dialConnected:boolean;
  dividerConnected:boolean;
}>;
export type Mq2CircuitReading=Readonly<{
  valid:boolean;
  voltage:number|null;
  adc:number|null;
  reason:string;
}>;
export function mq2Circuit(input:Mq2CircuitInput):Mq2CircuitReading{
  const invalid=(reason:string):Mq2CircuitReading=>({valid:false,voltage:null,adc:null,reason});
  if(!input.usb)return invalid('Connect Uno USB power.');
  if(!input.commonGround)return invalid('Join the signal and Uno grounds.');
  if(input.dialConnected&&input.dividerConnected)return invalid('Disconnect one source before joining A0; the dial and divider must not drive it together.');
  let voltage:number;
  if(input.mode==='dial'){
    if(!input.dialConnected||input.dividerConnected)return invalid('Connect only the dial wiper to A0.');
    if(!Number.isFinite(input.dialPosition)||input.dialPosition<0||input.dialPosition>1)return invalid('Dial position must be between its two end stops.');
    voltage=5*input.dialPosition;
  }else{
    if(!input.dividerConnected||input.dialConnected)return invalid('Connect only the divider midpoint to A0.');
    if(!input.sensorSupply)return invalid('Switch on the separate regulated module supply.');
    if(!Number.isFinite(input.moduleOutputV)||input.moduleOutputV<0)return invalid('The module output voltage is unknown.');
    if(!Number.isFinite(input.upperOhms)||input.upperOhms<=0||!Number.isFinite(input.lowerOhms)||input.lowerOhms<=0)return invalid('Both divider resistors must be connected with positive resistance.');
    voltage=input.moduleOutputV*input.lowerOhms/(input.upperOhms+input.lowerOhms);
  }
  if(voltage>5)return invalid('A0 exceeds the Uno reference voltage; disconnect power and correct the divider.');
  // AVR ideal 10-bit quantizer: 1024 equal bins, top bin clipped to 1023.
  return {valid:true,voltage,adc:Math.min(1023,Math.floor(voltage/5*1024)),reason:input.mode==='dial'?'Dial voltage at A0.':'Divided module voltage at A0; relative signal only.'};
}
