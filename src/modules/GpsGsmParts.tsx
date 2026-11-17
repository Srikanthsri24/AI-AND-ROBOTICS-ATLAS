import { SolarMeterSolid as Box } from './SolarMeterParts';
export function MegaBoard({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[1.52,.083,.73]} color={selected?'#cfac63':'#24789b'}/>
    <Box at={[-.64,.105,-.17]} size={[.31,.18,.24]} color="#b9c4ca" metal={.73}/>
    <Box at={[-.64,.095,.22]} size={[.31,.16,.22]} color="#242d33"/>
    <Box at={[.15,.078,-.02]} size={[.29,.074,.28]} color="#222c36"/>
    {[-.294,.294].map(z=><group key={z}>
      <Box at={[.08,.101,z]} size={[1.18,.109,.087]} color="#202b33"/>
      {Array.from({length:15},(_,i)=><Box key={i} at={[i*.073-.438,.167,z]} size={[.031,.011,.036]} color="#b9a16d" metal={.64}/>)}
    </group>)}
    <Box at={[.68,.106,0]} size={[.11,.13,.42]} color="#202831"/>
  </>;
}
