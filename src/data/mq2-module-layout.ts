/** Waveshare 9529 MQ-2: manufacturer 40 × 21 mm envelope and 2 mm holes.
 * Component centres below are authored estimates from the manufacturer's top /
 * underside photographs, not fabrication CAD. Coordinates are board millimetres.
 * https://www.waveshare.com/mq-2-gas-sensor.htm */
export const mq2ModuleLayout={
  width:40,depth:21,thickness:1.6,
  holes:[[2.5,2.5],[2.5,18.5],[37.5,2.5],[37.5,18.5]],
  sensor:{x:10.5,z:10.5,radius:9.5,height:15},
  header:{x:38,z:[6.69,9.23,11.77,14.31],pins:['DOUT','AOUT','GND','VCC']},
  indicators:[{x:32,z:4.1,label:'DAT'},{x:32,z:16.6,label:'PWR'}],
  underside:[
    {id:'mq2-comparator',x:20,z:10.5,width:5,depth:4,height:1.6,color:'#25282d'},
    {id:'mq2-boost-ic',x:26.4,z:9.2,width:3,depth:3,height:1.2,color:'#25282d'},
    {id:'mq2-inductor',x:30.1,z:17.8,width:3.5,depth:3.5,height:2.4,color:'#333740'},
    {id:'mq2-trim',x:19.6,z:18,width:3,depth:3,height:1.4,color:'#d8d3c8'},
    {id:'mq2-boost-diode',x:25.6,z:17.5,width:2.4,depth:4,height:1.5,color:'#25282d'},
    {id:'mq2-capacitors',x:31,z:12.6,width:2,depth:4,height:1.7,color:'#d2a94d'},
    {id:'mq2-capacitors',x:34.1,z:12.6,width:2,depth:4,height:1.7,color:'#d2a94d'},
  ],
} as const;
