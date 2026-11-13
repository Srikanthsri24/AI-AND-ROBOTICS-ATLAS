import {useEffect,useRef,useState,Suspense,lazy} from 'react';
import {House,History,Cpu,CircuitBoard,Radio,Bot,Hand,Code2,Wrench,BrainCircuit,GraduationCap,FolderKanban,Bookmark,ChartNoAxesCombined,Settings,Menu,Search,Bell,BookOpen,ChevronRight,X,UserRound,ArrowUpRight,Check} from 'lucide-react';
import DashboardHome from './DashboardHome';
const Workspace=lazy(()=>import('../modules/Workspace'));
import {entries} from '../data/atlas';
import {projectBlueprints} from '../data/project-blueprints';
import {hardwareFamilies,legacyFamilyAliases} from '../data/hardware';
import {aiCurriculum} from '../data/ai-curriculum';
import {assessmentBank} from '../data/learning-curriculum';
import {useAtlas,useStorageIssue} from '../modules/state';
import '../styles/dashboard.css';
import '../styles/modules.css';
const Lesson=lazy(()=>import('./App'));
const modules=[
 ['Dashboard','Your engineering learning workspace',House,'dashboard'],
 ['Evolution of Technology','Manual → Automation → AI → Future',History,'evolution'],
 ['Electronic Components','Buttons, LEDs, Resistors, ICs & more',Cpu,'components'],
 ['Microcontrollers & Computers','Arduino, ESP32, Raspberry Pi, Jetson',CircuitBoard,'controllers'],
 ['Sensors & IoT','Temperature, Motion, GPS, Wireless',Radio,'sensors'],
 ['Robots & Mechanisms','Humanoid, Arm, Rover, Drone & more',Bot,'robots'],
 ['Robot Anatomy','Eyes, Hands, Joints, Legs, Grippers',Hand,'anatomy'],
 ['Circuit & Code Laboratory','Build · Simulate · Code',Code2,'circuit-lab'],
 ['Project Builder','Idea → Design → Build → Test → Deploy',Wrench,'project-builder'],
 ['AI Robotics','Vision · Voice · Navigation · Edge AI',BrainCircuit,'ai-robotics'],
 ['Learning & Assessment','Lessons · Quizzes · Challenges',GraduationCap,'learning'],
 ['My Projects','',FolderKanban,'my-projects'],
 ['My Saved Items','',Bookmark,'saved'],
 ['My Learning Progress','',ChartNoAxesCombined,'progress'],
 ['Settings','',Settings,'settings']
] as const;
function parseRoute(){
 const [slug,id,view]=location.hash.replace(/^#\/?/,'').split('?')[0].split('/');
 const page=modules.findIndex(x=>x[3]===slug);
 let entry:string|null=null;try{entry=id?decodeURIComponent(id):null}catch{/* Recover malformed links to the collection. */}
 return {page:page<0?0:page,entry,view:view||null,lesson:slug==='humanoid-lesson'};
}
function useMobile(){
 const [mobile,setMobile]=useState(()=>matchMedia('(max-width:760px)').matches);
 useEffect(()=>{const media=matchMedia('(max-width:760px)'),change=()=>setMobile(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 return mobile;
}
type SearchHit={id:string;title:string;description:string;page:number;entry?:string;lesson?:boolean};
export default function Dashboard(){
 const storageIssue=useStorageIssue();const data=useAtlas(),mobile=useMobile();
 const [route,setRoute]=useState(parseRoute);
 const [collapsed,setCollapsed]=useState(()=>localStorage.getItem('atlas-sidebar-collapsed')==='true');
 const [mobileOpen,setMobileOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [searchIndex,setSearchIndex]=useState(-1);
 const [menu,setMenu]=useState<'notifications'|'profile'|null>(null);
 const [unread,setUnread]=useState(()=>localStorage.getItem('atlas-welcome-read')!=='true');
 const main=useRef<HTMLElement>(null),header=useRef<HTMLElement>(null),sidebar=useRef<HTMLElement>(null),menuButton=useRef<HTMLButtonElement>(null),searchInput=useRef<HTMLInputElement>(null);
 const firstRoute=useRef(true);
 useEffect(()=>{const change=()=>{setRoute(parseRoute());setMobileOpen(false);setQuery('');setMenu(null);window.scrollTo({top:0})};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useEffect(()=>{localStorage.setItem('atlas-sidebar-collapsed',String(collapsed))},[collapsed]);
 useEffect(()=>{setMobileOpen(false);setMenu(null)},[mobile]);
 useEffect(()=>{if(firstRoute.current){firstRoute.current=false;return}main.current?.focus({preventScroll:true})},[route.page,route.entry]);
 useEffect(()=>{setSearchIndex(-1)},[query]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){setMobileOpen(false);setMenu(null);setQuery('');if(document.activeElement===searchInput.current)return;if(mobileOpen)menuButton.current?.focus();else if(menu)header.current?.querySelector<HTMLButtonElement>(menu==='profile'?'[aria-label="Profile menu"]':'[aria-label="Notifications"]')?.focus()}
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.current?.focus();setMenu(null)}
   if(e.key==='Tab'&&mobileOpen&&sidebar.current){
    const buttons=Array.from(sidebar.current.querySelectorAll<HTMLButtonElement>('button'));
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
   }
  };
  const outside=(e:PointerEvent)=>{if(header.current&&!header.current.contains(e.target as Node)){setMenu(null);setQuery('')}};
  window.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside)};
 },[mobileOpen,menu]);
 useEffect(()=>{if(!mobileOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';sidebar.current?.querySelector('button')?.focus();return()=>{document.body.style.overflow=previous}},[mobileOpen]);
 const navigate=(page:number,id?:string,view?:string)=>{
  const hash='#/'+modules[page][3]+(id?'/'+encodeURIComponent(id):'')+(view?'/'+view:'');
  setMobileOpen(false);setMenu(null);setQuery('');
  if(location.hash!==hash)location.hash=hash;else main.current?.focus({preventScroll:true});
 };
 const openEntry=(id:string|null,view?:string)=>{if(!id){navigate(route.page);return}const canonical=legacyFamilyAliases[id]||id,family=hardwareFamilies.find(f=>f.id===canonical),entry=entries.find(e=>e.id===id);if(family)navigate(family.module,family.id,view);else if(entry)navigate(entry.module,id,view);else if(aiCurriculum.some(t=>t.id===id.replace(/^ai-/,'')))navigate(9,id.replace(/^ai-/,''));else if(projectBlueprints.some(p=>p.id===id))navigate(8,id);else if(assessmentBank.some(q=>q.id===id))navigate(10,id)};
 const openLesson=()=>{setMenu(null);setQuery('');location.hash='#/humanoid-lesson'};
 const catalogue:SearchHit[]=[
  ...hardwareFamilies.map(f=>({id:f.id,title:f.title,description:f.groupTitle+' · '+f.variants,page:f.module,entry:f.id})),
  ...entries.map(e=>{const f=hardwareFamilies.find(f=>f.id===legacyFamilyAliases[e.id]);return {id:e.id,title:e.name,description:e.category+' · '+e.level,page:f?.module||e.module,entry:f?.id||e.id}}),
  ...aiCurriculum.map(t=>({id:'ai-'+t.id,title:t.title,description:'AI Robotics · '+t.category,page:9,entry:t.id})),
  ...assessmentBank.map(q=>({id:'quiz-'+q.id,title:q.title+' assessment',description:'Practice · '+q.questions.length+' questions',page:10,entry:q.id})),
  ...projectBlueprints.map(p=>({id:p.id,title:p.name,description:'Guided project · '+p.level,page:8,entry:p.id})),
  ...data.projects.map(p=>({id:p.id,title:p.title,description:'Your saved project',page:11})),
  ...modules.flatMap(([title,description,,slug],page)=>['my-projects','saved','progress'].includes(slug)?[]:[{id:slug,title,description:description||'Your learning workspace',page}]),
  {id:'humanoid-lesson',title:'How does a humanoid robot work?',description:'Watch & Learn · 8 chapters',page:6,lesson:true}
 ];
 const terms=query.toLowerCase().trim().split(/[\s\-–—/]+/).filter(t=>!['show','all','find','how','does','a','an','the','me','using','with'].includes(t));
 const hits=query.trim()?catalogue.filter(e=>terms.every(t=>(e.title+' '+e.description).toLowerCase().includes(t))).slice(0,8):[];
 const chooseHit=(hit:SearchHit)=>hit.lesson?openLesson():navigate(hit.page,hit.entry);
 const toggleMenu=(next:'notifications'|'profile')=>{setMenu(menu===next?null:next);setQuery('');if(next==='notifications'){setUnread(false);localStorage.setItem('atlas-welcome-read','true')}};
 if(route.lesson)return <div className="atlas-lesson-shell"><button className="atlas-back" onClick={()=>navigate(0)}>← Atlas dashboard</button><Suspense fallback={<div className="module-empty">Loading humanoid laboratory…</div>}><Lesson/></Suspense></div>;
 return <div className={`atlas ${collapsed?'atlas-collapsed':''} ${mobileOpen?'atlas-mobile-open':''}`}>
  <a className="atlas-skip" href="#atlas-content" onClick={e=>{e.preventDefault();main.current?.focus()}}>Skip to content</a>
  <header className="atlas-header" ref={header}>
   <a className="atlas-brand" href="#/dashboard" aria-label="VisionariesAI Atlas home"><span className="atlas-logo" aria-hidden="true"/><span>VisionariesAI <small>Labs Pvt. Ltd.</small><em>AI  |  Robotics  |  IoT  |  Innovation</em></span></a>
   <button ref={menuButton} className="atlas-menu-toggle" aria-label={mobile?'Open navigation menu':collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={mobile?mobileOpen:!collapsed} aria-controls="atlas-navigation" onClick={()=>{setMenu(null);if(mobile)setMobileOpen(!mobileOpen);else setCollapsed(!collapsed)}}><Menu size={24}/></button>
   <div className="atlas-title"><BookOpen size={37} strokeWidth={1.6}/><div>AI & Robotics Atlas<small>Interactive · Learn · Build · Innovate</small></div></div>
   <div className="atlas-search-wrap">
    <label className="atlas-search"><Search size={20}/><input ref={searchInput} role="combobox" aria-autocomplete="list" value={query} onFocus={()=>setMenu(null)} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setSearchIndex(i=>Math.min(hits.length-1,i+1))}if(e.key==='ArrowUp'){e.preventDefault();setSearchIndex(i=>Math.max(0,i-1))}if(e.key==='Enter'&&hits.length){e.preventDefault();chooseHit(hits[Math.max(0,searchIndex)])}}} placeholder="Search components, robots, projects, lessons…" aria-label="Search atlas" aria-expanded={Boolean(query.trim())} aria-controls="atlas-search-results" aria-activedescendant={searchIndex>=0?'atlas-result-'+searchIndex:undefined}/>{query?<button aria-label="Clear search" onClick={()=>{setQuery('');searchInput.current?.focus()}}><X size={15}/></button>:<kbd>⌘ K</kbd>}</label>
    {query.trim()&&<div className="atlas-search-results" id="atlas-search-results" role="listbox" aria-label="Atlas search results"><span>EXPLORE YOUR ATLAS</span>{hits.map((hit,i)=><button role="option" aria-selected={searchIndex===i} id={'atlas-result-'+i} className={searchIndex===i?'search-active':''} key={hit.id+'-'+i} onMouseEnter={()=>setSearchIndex(i)} onClick={()=>chooseHit(hit)}><div><strong>{hit.title}</strong><small>{hit.description}</small></div><ArrowUpRight size={16}/></button>)}{!hits.length&&<div className="atlas-search-empty"><Search size={23}/><p>No matching results.</p><small>Try “ESP32”, “LED”, “robot” or “project”.</small></div>}<small className="atlas-search-help">↑ ↓ to browse · Enter to open · Escape to close</small></div>}
   </div>
   <div className="atlas-header-divider"/>
   <div className="atlas-header-control"><button className={`atlas-bell ${menu==='notifications'?'header-control-active':''}`} aria-label="Notifications" aria-expanded={menu==='notifications'} aria-controls="atlas-notifications" onClick={()=>toggleMenu('notifications')}><Bell size={23}/>{unread&&<i/>}</button>{menu==='notifications'&&<div className="atlas-header-popover" id="atlas-notifications"><div className="atlas-popover-heading"><strong>Notifications</strong><span>All caught up</span></div><div className="atlas-welcome-notice"><span><GraduationCap size={20}/></span><div><strong>Your robotics laboratory is ready</strong><p>Explore eight chapters, inspect robot parts, and watch the humanoid lesson.</p><button onClick={openLesson}>Start learning <ArrowUpRight size={14}/></button></div></div><div className="atlas-popover-footer"><Check size={13}/> Your progress is saved on this device.</div></div>}</div>
   <div className="atlas-header-control"><button className={`atlas-avatar ${menu==='profile'?'header-control-active':''}`} aria-label="Profile menu" aria-expanded={menu==='profile'} aria-controls="atlas-profile" onClick={()=>toggleMenu('profile')}><UserRound size={22}/></button>{menu==='profile'&&<div className="atlas-header-popover atlas-profile-popover" id="atlas-profile"><div className="atlas-profile-summary"><span><UserRound size={23}/></span><div><strong>{data.settings.name||'Atlas Learner'}</strong><small>Personal learning workspace</small></div></div>{[[14,'Settings',Settings]].map(([page,title,Icon])=><button key={String(page)} onClick={()=>navigate(page as number)}>{typeof Icon!=='string'&&typeof Icon!=='number'&&<Icon size={17}/>}<span>{String(title)}</span><ChevronRight size={14}/></button>)}<div className="atlas-popover-footer">English · Saved in this browser</div></div>}</div>
  </header>
  {mobileOpen&&<button className="atlas-sidebar-scrim" aria-label="Close navigation menu" tabIndex={-1} onClick={()=>{setMobileOpen(false);menuButton.current?.focus()}}/>}
  <aside className="atlas-sidebar" id="atlas-navigation" aria-label="Atlas navigation" ref={sidebar} inert={mobile&&!mobileOpen||!mobile&&collapsed}>
   <nav aria-label="Learning modules">{modules.slice(0,11).map(([title,sub,Icon,slug],i)=>slug==='ai-robotics'?null:<button key={title} aria-current={route.page===i?'page':undefined} className={route.page===i?'active':''} onClick={()=>navigate(i)} title={title}><Icon size={27} strokeWidth={1.6}/><div>{title}{i>0&&<small>{sub}</small>}</div><ChevronRight className="atlas-nav-chevron" size={14}/></button>)}</nav>
   <div className="atlas-sidebar-bottom">
    <div className="atlas-secondary" role="navigation" aria-label="Settings">
     <button className={route.page===14?'active':''} aria-current={route.page===14?'page':undefined} onClick={()=>navigate(14)}><Settings size={23} strokeWidth={1.7}/>Settings</button>
    </div>
    <div className="atlas-sidebar-foot">VISIONARIESAI LABS<small>Explore your next possibility.</small></div>
   </div>
  </aside>
  <main className="atlas-main" id="atlas-content" ref={main} tabIndex={-1}>{storageIssue&&<div className="atlas-storage-status" role="alert"><span>{storageIssue}</span><button onClick={()=>navigate(14)}>Open backup settings</button></div>}{route.page===0?<DashboardHome setPage={navigate} setLesson={openLesson} onEntry={(id,view)=>openEntry(id,view)}/>:<Suspense fallback={<div className="module-empty" role="status">Preparing your Atlas workspace…</div>}><Workspace key={route.page} page={route.page} entry={route.entry} initialView={route.view} onEntry={openEntry} onNavigate={navigate} onLesson={openLesson}/></Suspense>}</main>
 </div>;
}
