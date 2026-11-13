import { lazy, Suspense } from 'react';
import { BookOpen, Boxes, CircuitBoard, FileSpreadsheet, Laptop, Radio } from 'lucide-react';
import { projectPartPhotos } from '../data/project-part-photos';

const PartView = lazy(()=>import('./ProjectDemo').then(module=>({default:module.ProjectPartView})));
const BuildView = lazy(()=>import('./ProjectDemo'));
const demoModels: Record<number,{id:string; marker:string; part:number; activeCase:number}> = {
  18:{id:'ambient-light',marker:'Streetlight LED',part:3,activeCase:1},
  61:{id:'rover-project',marker:'Distance sensor',part:1,activeCase:1},
  63:{id:'hand-project',marker:'Finger linkage',part:2,activeCase:1},
  64:{id:'desktop-arm',marker:'Servo arm',part:2,activeCase:1},
  79:{id:'ambient-light',marker:'Model headlight',part:3,activeCase:1},
};
const references: [RegExp,string][] = [
  [/\buno\b|^Arduino$/i,'Arduino Uno R3'], [/ultrasonic|^distance sensor$/i,'HC-SR04 ultrasonic module'],
  [/motor driver/i,'TB6612FNG breakout'], [/photoresistor|^light sensor$/i,'Photoresistor'],
  [/soil probe/i,'5 V-compatible analog capacitive probe'], [/TMP36/i,'TMP36 analog temperature sensor'],
  [/servo/i,'Positional micro servo'], [/breadboard/i,'Breadboard and jumper wires'],
  [/buttons?|^door switch$/i,'Momentary tactile button'], [/led/i,'LED and 330 Ω resistor'],
];
export function referenceFor(material:string) {
  return references.find(([pattern])=>pattern.test(material))?.[1];
}

export function MaterialVisual({material,showModel=false}: {material:string;showModel?:boolean}) {
  const reference=referenceFor(material);
  const photo=reference ? projectPartPhotos(reference)[0] : undefined;
  const Icon=/sample|table|readings|spreadsheet|mock data/i.test(material)?FileSpreadsheet
    :/browser|software|python|viewer|simulat/i.test(material)?Laptop
    :/sensor|radio|bluetooth/i.test(material)?Radio
    :/board|controller|kit/i.test(material)?CircuitBoard
    :/paper|sketch|notebook|sheet/i.test(material)?BookOpen:Boxes;
  return <>
    {photo ? <figure className="gp-directory-reference"><img src={photo.path} alt={photo.label} loading="lazy"/><figcaption>Example part · {photo.label}</figcaption></figure>
      : <div className="gp-directory-material" aria-hidden="true"><Icon size={44}/></div>}
    {showModel&&reference&&<Suspense fallback={<p>Loading part model…</p>}><PartView name={reference}/></Suspense>}
  </>;
}

export function DirectoryDemoVisual({number,scenario,phase,input,result}: {number:number;scenario:number;phase:number|null;input:string;result:string}) {
  const finished=phase===2;
  const model=demoModels[number];
  if(model) return <figure className="gp-assembly-model">
    <figcaption><strong>3D demonstration</strong><span>Representative hardware · Drag to rotate</span></figcaption>
    <Suspense fallback={<p>Loading 3D demonstration…</p>}>
      <BuildView id={model.id} active={finished&&scenario===model.activeCase} hold={phase===null}
        markers={[{index:model.part,name:model.marker}]} selected={finished?model.part:undefined}/>
    </Suspense>
  </figure>;
  if(number===19) return <div className="gp-directory-board">
    <div className="gp-directory-piano" aria-label="Three piano keys">{['Low','Middle','High'].map((note,i)=>
      <span key={note} data-active={phase!==null&&i===(scenario?2:0)}>{note}</span>)}</div>
    <strong>{finished?result:'Select a key and play the demo'}</strong>
  </div>;
  if([14,18,27,52,54,76,79,80,94,96,99,106].includes(number)) {
    const off=/\boff\b|goes dark|stays off/i.test(result);
    return <div className="gp-directory-board">
      <div className="gp-scenario-led" data-lit={finished&&!off} aria-hidden="true"/>
      <strong>{finished?result:'Waiting for the output'}</strong>
    </div>;
  }
  const visible=phase!==null;
  return <div className="gp-directory-board gp-directory-diagram" aria-label="Illustrated input and output">
    <div data-live={visible}><Radio size={28}/><span>Input</span><strong>{visible?input:'Ready'}</strong></div>
    <div className="gp-directory-link" data-live={phase===1} aria-hidden="true"><i/></div>
    <div data-live={finished}><CircuitBoard size={28}/><span>Output</span><strong>{finished?result:'Waiting'}</strong></div>
  </div>;
}
