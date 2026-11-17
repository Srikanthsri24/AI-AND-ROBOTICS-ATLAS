import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

export function DialFace({highlighted=false,labelled=true}:{highlighted?:boolean;labelled?:boolean}){
  return <>
    <Box at={[0,.11,-.09]} size={[1.85,1.58,.12]} color={highlighted?'#e4ba80':'#a9825d'}/>
    <Box at={[0,.11,-.021]} size={[1.72,1.45,.024]} color="#e8dec1"/>
    {Array.from({length:11},(_,index)=>{
      const value=index*10;
      const angle=(60-value*1.2)*Math.PI/180;
      const major=value%50===0;
      return <group key={value} rotation={[0,0,angle]}>
        <Box at={[0,.59,.003]} size={[major ? .026 : .012,major ? .088 : .044,.012]} color="#39454a"/>
        {major&&labelled&&<WorldLabel position={[0,.72,.022]} className="gp-marker-anchor"><span className="gp-vane-cardinal">{value}%</span></WorldLabel>}
      </group>;
    })}
  </>;
}

export function DialPointer({value=50,highlighted=false}:{value?:number;highlighted?:boolean}){
  return <group rotation={[0,0,(60-value*1.2)*Math.PI/180]}>
    <Box at={[0,.25,.035]} size={[.038,.50,.023]} color={highlighted?'#ed984a':'#b64f3d'}/>
    <mesh position={[0,.515,.035]}><coneGeometry args={[.043,.093,3]}/><meshStandardMaterial color={highlighted?'#ed984a':'#b64f3d'}/></mesh>
    <mesh position={[0,0,.038]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.074,.074,.066,28]}/><meshStandardMaterial color="#4a5254" metalness={.24}/></mesh>
  </group>;
}
