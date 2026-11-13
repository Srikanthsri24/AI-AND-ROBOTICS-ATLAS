import {useSyncExternalStore} from 'react';
export type ProjectRecord={id:string;template:string;title:string;objective:string;notes:Record<number,string>;brief?:Record<string,string>;completed:number[];created:string};
export type AssignmentRecord={id:string;title:string;due:string;status:string;activity?:string;instructions?:string;review?:string};
export type AppData={saved:string[];scores:Record<string,number>;completed:string[];projects:ProjectRecord[];settings:{name:string;language:string;level:string;labels:boolean};assignments:AssignmentRecord[];content:Record<string,{summary:string;status:string}>;circuit?:unknown};
const empty:AppData={saved:[],scores:{},completed:[],projects:[],settings:{name:'Atlas Learner',language:'English',level:'Beginner',labels:true},assignments:[],content:{}};
function read():AppData{try{const x=JSON.parse(localStorage.getItem('atlas-workspace-v2')||'null');return x?{...empty,...x,settings:{...empty.settings,...x.settings,language:'English',level:x.settings?.level==='Class 3 – 10'?'Beginner':x.settings?.level||'Beginner'}}:empty}catch{return empty}}
let data=read();let storageIssue:string|null=null;const subscribers=new Set<()=>void>();
export function updateData(fn:(d:AppData)=>AppData){data=fn(data);try{localStorage.setItem('atlas-workspace-v2',JSON.stringify(data));storageIssue=null}catch{storageIssue='Browser storage is unavailable or full. Changes remain in this tab; export a backup before closing it.'}subscribers.forEach(fn=>fn());}
export function useAtlas(){return useSyncExternalStore(fn=>{subscribers.add(fn);return()=>subscribers.delete(fn)},()=>data)}
export function toggleSaved(id:string){updateData(d=>({...d,saved:d.saved.includes(id)?d.saved.filter(x=>x!==id):[...d.saved,id]}))}
export function download(name:string,content:string,type='text/plain'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function completeLesson(id:string){updateData(d=>({...d,completed:[...new Set([...d.completed,id])]}))}
export function validateBackup(value:unknown):AppData|null{if(!value||typeof value!=='object')return null;const x=value as any,d=x.data;if(x.version!==2||!d||typeof d!=='object')return null;
if(!Array.isArray(d.saved)||d.saved.some((s:unknown)=>typeof s!=='string')||!Array.isArray(d.completed)||d.completed.some((s:unknown)=>typeof s!=='string'))return null;
if(!d.settings||typeof d.settings.name!=='string'||typeof d.settings.level!=='string'||typeof d.settings.language!=='string')return null;
if(!d.scores||typeof d.scores!=='object'||Object.values(d.scores).some((n:any)=>typeof n!=='number'||n<0||n>100||!Number.isFinite(n)))return null;
if(!Array.isArray(d.projects)||d.projects.some((p:any)=>!p||typeof p.id!=='string'||typeof p.title!=='string'||typeof p.objective!=='string'||typeof p.template!=='string'||typeof p.created!=='string'||(p.brief!==undefined&&(!p.brief||typeof p.brief!=='object'||Object.values(p.brief).some(v=>typeof v!=='string')))||!p.notes||typeof p.notes!=='object'||Object.values(p.notes).some(n=>typeof n!=='string')||!Array.isArray(p.completed)||p.completed.some((n:any)=>!Number.isInteger(n)||n<0||n>8)))return null;
if(!Array.isArray(d.assignments)||d.assignments.some((a:any)=>!a||['id','title','due','status'].some(k=>typeof a[k]!=='string')||['activity','instructions','review'].some(k=>a[k]!==undefined&&typeof a[k]!=='string')))return null;
if(!d.content||typeof d.content!=='object'||Object.values(d.content).some((c:any)=>!c||typeof c.summary!=='string'||typeof c.status!=='string'))return null;
if(d.circuit){const c=d.circuit;if(!Array.isArray(c.nodes)||!Array.isArray(c.wires)||typeof c.voltage!=='number'||!Number.isFinite(c.voltage)||typeof c.resistance!=='number'||!Number.isFinite(c.resistance)||typeof c.code!=='string'||c.nodes.some((n:any)=>!n||typeof n.id!=='string'||typeof n.kind!=='string'||typeof n.x!=='number'||typeof n.y!=='number')||c.wires.some((w:any)=>!w||typeof w.from!=='string'||typeof w.to!=='string'))return null}
return d as AppData}

export function toggleExplored(id:string){updateData(d=>({...d,completed:d.completed.includes(id)?d.completed.filter(x=>x!==id):[...d.completed,id]}))}

export function useStorageIssue(){return useSyncExternalStore(fn=>{subscribers.add(fn);return()=>subscribers.delete(fn)},()=>storageIssue)}
