import { SolarMeterSolid as Box } from './SolarMeterParts';

export function VoiceConsolePart({selected=false,active=false}:{selected?:boolean;active?:boolean}){
  return <>
    <Box at={[0,.045,0]} size={[1.21,.083,.79]} color={selected?'#ae8547':'#69737a'} metal={.52}/>
    <Box at={[0,.092,-.085]} size={[.94,.024,.39]} color="#242d33"/>
    {Array.from({length:4},(_,row)=>Array.from({length:11},(_,column)=><Box key={row+':'+column}
      at={[(column-5)*.079,.11,(row-2.6)*.086]} size={[.062,.014,.061]} color="#546067"/>))}
    <Box at={[0,.093,.235]} size={[.292,.014,.179]} color="#8b9599" metal={.24}/>
    <group position={[0,.093,-.369]} rotation={[-.20,0,0]}>
      <Box at={[0,.311,0]} size={[1.20,.66,.075]} color="#303a41" metal={.48}/>
      <Box at={[0,.314,.045]} size={[1.075,.534,.022]} color={active?'#247470':'#244b59'}/>
      <Box at={[0,.604,.047]} size={[.038,.017,.014]} color={active?'#77e5a6':'#7b8282'}/>
      {Array.from({length:13},(_,i)=><Box key={i} at={[(i-6)*.069,.31,.06]}
        size={[.029,.043+(active?(.11+.13*Math.sin(i*1.4)**2):.015*Math.sin(i)),.012]} color="#8acabc"/>)}
    </group>
  </>;
}
