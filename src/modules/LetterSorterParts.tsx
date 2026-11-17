import {SolarMeterSolid as Box} from './SolarMeterParts';

const cardboard = '#bd9568';

export function LetterFeedRamp({highlighted=false}:{highlighted?:boolean}){
  const color = highlighted ? '#f4ba69' : cardboard;
  return <group rotation={[.27,0,0]}>
    <Box at={[0,0,0]} size={[.62,.068,.92]} color={color}/>
    {[-.29,.29].map(x=><Box key={x} at={[x,.072,0]} size={[.045,.10,.92]} color={color}/>)}
    <Box at={[0,.04,.04]} size={[.50,.014,.78]} color="#e4d6b5"/>
  </group>;
}

export function LetterTiltDeck({tilt=0,highlighted=false}:{tilt?:number;highlighted?:boolean}){
  return <group rotation={[0,0,tilt]}>
    <Box at={[0,0,0]} size={[1.25,.063,.85]} color={highlighted?'#eab472':cardboard}/>
    <Box at={[0,.037,0]} size={[1.205,.015,.815]} color="#f0e1be"/>
    {[-.37,.37].map(z=><Box key={z} at={[0,.067,z]} size={[1.25,.063,.037]} color={cardboard}/>)}
  </group>;
}

export function LetterCatchBin({color,highlighted=false}:{color:string;highlighted?:boolean}){
  const wall = highlighted ? '#e5ae65' : color;
  return <>
    <Box at={[0,.032,0]} size={[.83,.064,.88]} color="#a88560"/>
    {[-.40,.40].map(x=><Box key={x} at={[x,.155,0]} size={[.043,.28,.88]} color={wall}/>)}
    {[-.42,.42].map(z=><Box key={z} at={[0,.155,z]} size={[.83,.28,.043]} color={wall}/>)}
    <Box at={[0,.149,.445]} size={[.31,.127,.013]} color="#f2e7d2"/>
  </>;
}
