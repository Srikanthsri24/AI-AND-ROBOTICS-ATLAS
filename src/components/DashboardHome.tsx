import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowUpRight,Bookmark,BookOpen,Box,BrainCircuit,Check,ChevronRight,CircuitBoard,Code2,Cpu,GraduationCap,Hand,History,Layers,Play,Radio,RotateCcw,Wrench,X,Bot} from 'lucide-react';
import {useAtlas,toggleSaved} from '../modules/state';
import '../styles/home.css';
import {dashboardImages,dashboardImage} from '../data/dashboard-images';

const collections=[
 {page:1,title:'Evolution of Technology',description:'From early tools to intelligent systems',icon:History},
 {page:2,title:'Electronic Components',description:'The building blocks of every circuit',icon:Cpu},
 {page:3,title:'Microcontrollers & Computers',description:'Arduino, ESP32, Raspberry Pi & Jetson',icon:CircuitBoard},
 {page:4,title:'Sensors & IoT',description:'Sense the world. Connect the data.',icon:Radio},
 {page:5,title:'Robots & Mechanisms',description:'Explore how machines move and work',icon:Bot},
 {page:6,title:'Robot Anatomy',description:'Look beneath every movement',icon:Hand},
 {page:7,title:'Circuit & Code Laboratory',description:'Connect, simulate and program',icon:Code2},
 {page:8,title:'Project Builder',description:'Take an idea through a guided build',icon:Wrench},
 {page:9,title:'AI Robotics',description:'Perception, planning and intelligent action',icon:BrainCircuit},
 {page:10,title:'Learning & Assessment',description:'Explore lessons and test your knowledge',icon:GraduationCap}
];
const stages=[
 {title:'Manual Work',description:'Human effort and hand tools',period:'Prehistory',id:0},
 {title:'Mechanization',description:'Machines and steam power',period:'1700s onward',id:2},
 {title:'Industrial Automation',description:'Production lines and robotics',period:'1900s onward',id:11},
 {title:'Computing Revolution',description:'Computers and microprocessors',period:'1940s–1980s',id:9},
 {title:'Connected World',description:'Internet, mobile, cloud and IoT',period:'1990s onward',id:13},
 {title:'Artificial Intelligence',description:'Learning, reasoning and generation',period:'Ongoing development',id:18},
 {title:'AGI',description:'Proposed general-purpose intelligence',period:'Speculative future',id:23},
 {title:'ASI',description:'Proposed beyond-human intelligence',period:'Hypothetical future',id:24}
];
function DashboardArt({name,className='',eager=false,sizes}:{name:string;className?:string;eager?:boolean;sizes?:string}){
 return <img aria-hidden="true" alt="" className={'home-art '+className} src={dashboardImage(name,1024)} srcSet={`${dashboardImage(name,512)} 512w, ${dashboardImage(name,1024)} 1024w, ${dashboardImage(name,1536)} 1536w`} sizes={sizes||"(max-width:430px) calc((100vw - 32px) / 2), (max-width:760px) calc((100vw - 35px) / 2), (max-width:950px) calc((100vw - 290px) / 3), (max-width:1150px) calc((100vw - 300px) / 5), calc((100vw - 390px) / 5)"} width="1536" height="1024" loading={eager?'eager':'lazy'} decoding="async"/>;
}
export default function DashboardHome({setPage,setLesson,onEntry}:{setPage:(page:number)=>void;setLesson:()=>void;onEntry:(id:string,view?:string)=>void}){
 const data=useAtlas();
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const previousFocus=useRef<HTMLElement|null>(null);
 const open=selected!==null;
 useEffect(()=>{
  if(!open)return;
  previousFocus.current=document.activeElement as HTMLElement;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  dialog.current?.showModal();
  return()=>{dialog.current?.close();document.body.style.overflow=previousOverflow;previousFocus.current?.focus({preventScroll:true})};
 },[open]);
 const current=selected===null?null:stages[selected];
 const saved=current?data.saved.includes('evolution-'+current.id):false;
 return <div className="atlas-home">
  <div className="home-introduction">
   <section className="home-hero" aria-labelledby="home-title">
    <img className="home-hero-art" aria-hidden="true" alt="" src={dashboardImage(dashboardImages.hero,2048)} srcSet={`${dashboardImage(dashboardImages.hero,768)} 768w, ${dashboardImage(dashboardImages.hero,1536)} 1536w, ${dashboardImage(dashboardImages.hero,2048)} 2048w`} sizes="(max-width:760px) 100vw, (max-width:950px) calc(100vw - 255px), calc(100vw - 660px)" width="2172" height="724" fetchPriority="high" decoding="async"/>
    <div className="home-hero-content">
     <div className="home-brand"><span aria-hidden="true"/>VisionariesAI</div>
     <h1 id="home-title">AI & Robotics Atlas</h1>
     <p>Explore · Understand · Simulate · Build · Innovate</p>
     <span className="home-hero-caption">Your interactive guide from electronics to intelligent machines.</span>
     <div className="home-hero-actions"><button className="home-primary-action" onClick={()=>setPage(1)}>Explore the atlas <ArrowRight size={17}/></button><button className="home-watch-action" onClick={setLesson}><Play size={15} fill="currentColor"/> Watch a robot at work</button></div>
    </div>
   </section>
   <section className="home-featured" aria-labelledby="home-project-title">
    <div className="home-featured-label"><span><Wrench size={15}/></span>FEATURED PROJECT <button aria-label="Browse all projects" onClick={()=>setPage(8)}><ArrowUpRight size={17}/></button></div>
    <button className="home-project-art" aria-label="Explore the obstacle avoidance robot project" onClick={()=>setPage(8)}><DashboardArt name={dashboardImages.project} sizes="(max-width:760px) calc(100vw - 48px), (max-width:950px) calc((100vw - 255px) * 0.36), 305px" eager/></button>
    <div className="home-featured-bottom"><div><h2 id="home-project-title">Obstacle Avoidance Robot</h2><p>Arduino · Distance sensing · Motor control</p></div><button aria-label="Open project builder" onClick={()=>setPage(8)}><ArrowRight size={19}/></button></div>
   </section>
  </div>

  <section className="home-collections" aria-labelledby="home-collections-title">
   <div className="home-section-heading home-collection-heading"><div className="home-collection-title-group"><span className="home-collection-title-icon" aria-hidden="true"><BookOpen size={25} strokeWidth={1.65}/></span><div><span className="home-collection-eyebrow">DISCOVER · INTERACT · BUILD</span><div className="home-collection-title-line"><h2 id="home-collections-title">Explore the <span>Atlas</span></h2><span className="home-collection-total">10 collections</span></div><p>Choose a collection to explore, understand and build.</p></div></div><button className="home-laboratory-link" aria-label="Open the laboratory" onClick={()=>setPage(7)}><Code2 size={17}/><span>Open the laboratory</span><ArrowUpRight size={15}/></button></div>
   <div className="home-collection-grid">{collections.map(({page,title,description,icon:Icon},index)=><button className="home-collection" key={page} onClick={()=>setPage(page)}>
    <DashboardArt name={dashboardImages.collections[index]} eager={index<5}/>
    <div className="home-collection-copy"><h3>{title}</h3><p>{description}</p></div>
    <span className="home-collection-hover"><Icon size={16}/><ArrowUpRight size={15}/></span>
   </button>)}</div>
  </section>

  <section className="home-timeline" aria-labelledby="home-timeline-title">
   <div className="home-section-heading"><div className="home-timeline-title"><span><History size={20}/></span><div><h2 id="home-timeline-title">The evolution of technology</h2><p>Discover the ideas and inventions that shaped our world.</p></div></div><button onClick={()=>setPage(1)}>Explore all 25 stages <ArrowRight size={15}/></button></div>
   <div className="home-timeline-track">{stages.map((stage,index)=><button className={`home-stage ${index>=6?'home-stage-future':''}`} key={stage.title} onClick={()=>setSelected(index)}>
    <DashboardArt name={dashboardImages.stages[index]}/>
    <div><h3>{stage.title}</h3><p>{stage.description}</p><small>{stage.period}</small></div>
   </button>)}</div>
  </section>

  <section className="home-experiences" aria-label="Atlas tools and experiences">
   {[{title:'2D Diagrams',subtitle:'Inspect the connections',icon:Layers,action:()=>onEntry('uno','2d')},{title:'3D Explorer',subtitle:'Look beneath the surface',icon:Box,action:()=>onEntry('humanoid','3d')},{title:'Watch It Work',subtitle:'See the principles in motion',icon:Play,action:setLesson},{title:'Circuit Laboratory',subtitle:'Connect, validate and simulate',icon:Code2,action:()=>setPage(7)},{title:'Guided Projects',subtitle:'Take your next idea further',icon:Wrench,action:()=>setPage(8)}].map(({title,subtitle,icon:Icon,action})=><button key={title} onClick={action}><span><Icon size={25} strokeWidth={1.65}/></span><div><strong>{title}</strong><small>{subtitle}</small></div><ChevronRight size={15}/></button>)}
  </section>
  <footer className="home-footer"><span>VISIONARIESAI LABS · AI & ROBOTICS ATLAS</span><span>Explore the science. Understand the engineering. Build the future.</span></footer>

  <dialog className="home-stage-dialog" ref={dialog} aria-labelledby="home-stage-dialog-title" onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}>{current&&<div className="home-stage-detail"><button className="home-dialog-close" aria-label="Close technology stage" onClick={()=>setSelected(null)}><X size={19}/></button><DashboardArt name={dashboardImages.stages[selected!]} sizes="(max-width:760px) calc(100vw - 66px), 430px" eager/><span className="home-stage-period">{current.period}</span><h2 id="home-stage-dialog-title">{current.title}</h2><p>{current.description}. {selected!>=6?'This is a proposed future concept, not an established technological achievement. Its definition, feasibility and timing remain uncertain.':'Explore how successive generations of tools expanded what people could create, communicate and automate. These developments overlap across regions and industries.'}</p><div className="home-stage-dialog-actions"><button onClick={()=>toggleSaved('evolution-'+current.id)}>{saved?<Check size={15}/>:<Bookmark size={15}/>} {saved?'Saved':'Save stage'}</button><button onClick={()=>setSelected((selected!+1)%stages.length)}>Next stage <ArrowRight size={15}/></button></div><button className="home-stage-full-link" onClick={()=>{setSelected(null);setPage(1)}}>Open the complete technology journey <ArrowUpRight size={14}/></button></div>}</dialog>
 </div>;
}
