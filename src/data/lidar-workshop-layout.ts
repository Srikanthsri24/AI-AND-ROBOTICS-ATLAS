/** Independent illustrative geometry in millimetres. Source drawings are research references, not redistributed assets. */
export const lidarMm=1/20;
export type LidarMmPoint=[number,number,number];
export const lidarHardwareReference={
 crazyflie:'https://www.bitcraze.io/products/crazyflie-2-1-plus/',
 placement:'https://www.bitcraze.io/documentation/hardware/crazyflie_2_1/cf2.1_component_placement.pdf',
 multiranger:'https://www.bitcraze.io/products/multi-ranger-deck/',
 multiMechanics:'https://raw.githubusercontent.com/bitcraze/hardware/master/src/products/multi-ranger-deck/datasheet/multi-ranger-deck-mechanics.png',
 flow:'https://www.bitcraze.io/products/flow-deck-v2/',
 flowMechanics:'https://raw.githubusercontent.com/bitcraze/hardware/master/src/products/flow-deck-2/datasheet/flow-deck-v2-mechanics.png',
 pins:'https://www.bitcraze.io/documentation/system/platform/cf2-expansiondecks/',
 sensor:'https://www.st.com/en/imaging-and-photonics-solutions/vl53l1x.html',
 radio:'https://www.bitcraze.io/products/crazyradio-2-0/',
 published:{headerPitch:2,headerContactsPerSide:10,multiPcbSide:32.5,multiProductEnvelope:35,flowWidth:27.940,flowLength:21.079,sensorPackage:[4.9,2.5,1.56] as LidarMmPoint,radioEnvelope:{length:63,width:18,height:8}},
 // These visual assembly choices require mesh / clearance verification before the workshop is published.
 authored:{mainThickness:.8,pinWidth:.5,boardBoreDiameter:.8,socketApertureWidth:.76,rowX:11,motorAxis:32.5,motorPcbTip:27,benchRootY:28,multiY:8,flowY:-5,battery:[19.4,6,29.5] as LidarMmPoint,batteryBottom:1.3,mediumSpacerBottom:11.4,mediumLongEnd:15,mediumSpacer:2,mediumShortEnd:2,socketHeight:3},
};
export const lidarHeaderNames={left:['VCC','RX1','TX1','SDA','SCL','IO1','IO2','IO3','IO4','GND'],right:['TX2','RX2','SCK','MISO','MOSI','N_IO1','WKUP','OW','VCOM','VUSB']} as const;
export const lidarHeaderGrid=([-1,1] as const).flatMap((side)=>Array.from({length:10},(_,index)=>({side,index,pin:index+1,name:lidarHeaderNames[side===-1?'left':'right'][index],x:side*11,z:-9+index*2})));
export const lidarRangeSensorFaces={front:[0,9.8,-17.81],back:[0,9.8,17.81],left:[-17.81,9.8,0],right:[17.81,9.8,0],up:[0,9.96,0]} satisfies Record<string,LidarMmPoint>;
export const lidarBenchSupports=([-1,1] as const).flatMap(x=>([-1,1] as const).map(z=>({x:x*20,z:z*20,top:27.6,width:6})));
export function lidarHeaderAt(level:'main'|'multi'|'flow',side:-1|1,pin:number):LidarMmPoint{if(!Number.isInteger(pin)||pin<1||pin>10)throw Error('Each expansion row has ten contacts.');return [side*11,level==='main'?0:level==='multi'?8:-5,-9+(pin-1)*2];}
export const lidarCardMarks=[350,450,550,750] as const;
