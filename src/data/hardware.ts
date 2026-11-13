import boards from './hardware/boards.json' with {type:'json'};
import boardPhotoData from './hardware/board-photos.json' with {type:'json'};
import components from './hardware/components.json' with {type:'json'};
import componentPhotoData from './hardware/component-photos.json' with {type:'json'};
import sensors from './hardware/sensors.json' with {type:'json'};
import sensorPhotoData from './hardware/sensor-photos.json' with {type:'json'};
import robots from './hardware/robots.json' with {type:'json'};
import robotPhotoData from './hardware/robot-photos.json' with {type:'json'};
import robotIllustrationData from './hardware/robot-illustrations.json' with {type:'json'};
import anatomy from './hardware/anatomy.json' with {type:'json'};
import anatomyIllustrationData from './hardware/anatomy-illustrations.json' with {type:'json'};
import {boardGuides} from './hardware/board-guides.ts';
import {componentGuides} from './hardware/component-guides.ts';
import {sensorGuides} from './hardware/sensor-guides.ts';
import {robotGuides} from './hardware/robot-guides.ts';
import {anatomyGuides} from './hardware/anatomy-guides.ts';
export type HardwareFamily={id:string;module:number;number:number;group:string;groupLetter:string;groupTitle:string;title:string;variants:string;summary:string;why:string;steps:string[];useCases:string[];choose:string;mistake:string;flow:string[]};
const join=(items:typeof boards,copy:string):HardwareFamily[]=>{const lines=copy.trim().split('\n');if(items.length!==lines.length)throw new Error(`Guide coverage mismatch: ${items.length} families / ${lines.length} guides`);return items.map((item,i)=>{const[summary,why,steps,useCases,choose,mistake,flow]=lines[i].split('|');if(!flow)throw new Error(`Incomplete guide: ${item.id}`);return {...item,summary,why,steps:steps.split('~'),useCases:useCases.split(';'),choose,mistake,flow:flow.split('>')}})};
export const hardwareFamilies=[...join(components,componentGuides),...join(boards,boardGuides),...join(sensors,sensorGuides),...join(robots,robotGuides),...join(anatomy,anatomyGuides)];
export const hardwareModules:Record<number,{title:string;headline:string;intro:string;art:string;quote:string}>={
2:{title:'Electronic Components',headline:'Small parts. Extraordinary possibilities.',intro:'Understand what each component does, how it connects, and why it belongs in your circuit.',art:'components-passive',quote:'A good circuit starts with understanding every part of the path.'},
3:{title:'Microcontrollers & Computers',headline:'Find the right brain for your next idea.',intro:'From your first programmable board to edge AI: discover the differences that matter before you build.',art:'boards-maker',quote:'Choose the controller around the task—not the other way around.'},
4:{title:'Sensors & IoT',headline:'Sense the world. Understand the signal.',intro:'Explore physical measurements, connected devices and the complete journey from an observation to a useful action.',art:'sensors-navigation',quote:'A useful measurement begins with knowing what the sensor actually measures.'},
5:{title:'Robots & Mechanisms',headline:'Discover the engineering behind movement.',intro:'Explore robot forms, mechanical principles and the systems that turn a command into purposeful motion.',art:'robots-arms',quote:'Every movement is a conversation between structure, energy and control.'},
6:{title:'Robot Anatomy',headline:'Look beneath every movement.',intro:'Explore the robot from head to toe: structure, joints, sensing, intelligence and the connections between them.',art:'anatomy-hands',quote:'Understanding the whole robot starts with understanding how its parts work together.'}
};
export const familyImage=(group:string,width=640)=>`./images/hardware/${group}-${width}.jpg`;
type HardwarePhoto = { label: string; credit: string; source: string; license?: string };
type PhotoCatalogue = Readonly<Partial<Record<string, HardwarePhoto>>>;

const photoCatalogues: Readonly<Partial<Record<number, { directory: string; photos: PhotoCatalogue }>>> = {
  2: { directory: 'components', photos: componentPhotoData },
  3: { directory: 'boards', photos: boardPhotoData },
  4: { directory: 'sensors', photos: sensorPhotoData },
  5: { directory: 'robots', photos: robotPhotoData },
};

type IllustrationCatalogue = {
  directory: string;
  labels: Readonly<Partial<Record<string, string>>>;
};

const illustrationCatalogues: Readonly<Partial<Record<number, IllustrationCatalogue>>> = {
  5: { directory: 'robot-illustrations', labels: robotIllustrationData },
  6: { directory: 'anatomy-illustrations', labels: anatomyIllustrationData },
};

export function familyVisual(family: HardwareFamily, width = 640) {
  const illustrations = illustrationCatalogues[family.module];
  const illustration = illustrations?.labels[family.id];
  if (illustrations && illustration) {
    return {
      src: `./images/${illustrations.directory}/${family.id}.webp`,
      alt: illustration,
      photo: undefined,
      generated: true,
    };
  }

  const catalogue = photoCatalogues[family.module];
  const photo = catalogue?.photos[family.id];
  if (catalogue && photo) {
    return {
      src: `./images/${catalogue.directory}/${family.id}.webp`,
      alt: photo.label,
      photo,
      generated: false,
    };
  }

  const group = family.id === 'boards-01' ? 'arduino-family' : family.group;
  return {
    src: familyImage(group, width),
    alt: `${family.groupTitle} — representative family illustration`,
    photo: undefined,
    generated: false,
  };
}

export const hardwareGroups=(module:number)=>{const items=hardwareFamilies.filter(x=>x.module===module);return [...new Set(items.map(x=>x.group))].map(id=>({id,title:items.find(x=>x.group===id)!.groupTitle,letter:items.find(x=>x.group===id)!.groupLetter,count:items.filter(x=>x.group===id).length}))};

export function matchesFamily(f:HardwareFamily,query:string){const terms=query.toLowerCase().split(/[\s\-–—/]+/).filter(Boolean);const haystack=(f.title+' '+f.variants+' '+f.groupTitle+' '+f.summary+' '+f.useCases.join(' ')).toLowerCase();return terms.every(term=>haystack.includes(term))}
export const legacyFamilyAliases:Record<string,string>={led:'components-20','rgb-led':'components-20',resistor:'components-01',potentiometer:'components-05',capacitor:'components-02',inductor:'components-03',diode:'components-10',zener:'components-10',transistor:'components-11',mosfet:'components-11',relay:'components-07',button:'components-06',toggle:'components-06',buzzer:'components-22',fuse:'components-31',breadboard:'components-25',jumper:'components-24',timer:'components-15',regulator:'components-19',battery:'components-28',uno:'boards-01',esp32:'boards-02',pi4:'boards-16',jetson:'boards-21',pico:'boards-03',distance:'sensors-08',temperature:'sensors-02',light:'sensors-21',motion:'sensors-13',imu:'sensors-16',servo:'anatomy-31',motor:'components-33',humanoid:'robots-01',hand:'anatomy-12',arm:'robots-08',rover:'robots-13'};
