import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, ClipboardList, Database, Download, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import seed from '../data/school-workspaces.json';
import { advanceInquiry, createSession, permissions, scopeRecords, setAttendance, type Role } from '../data/school-workspace-engine.mjs';
import engineSource from '../data/school-workspace-engine.mjs?raw';
import { schoolProject } from '../data/school-workspace-project';
import { download } from './state';
import '../styles/school-workspaces.css';

const names = ['Overview','Components','Assembly','Program & test','Finished demo'];
const routes = ['overview','components','assembly','test','demo'];
const root = '#/project-builder';
const route = (stage:number) => `${root}/${schoolProject.id}/${routes[stage]}`;
const roleNames: Record<Role,string> = {admin:'Administrator',teacher:'Teacher',student:'Student'};
const resources = [
  {key:'records', title:'Two fictional school datasets', description:'Six learner records and five admissions inquiries. Each row includes the ID of its school.', filename:'school-workspaces.json', source:JSON.stringify(seed,null,2)+'\n', type:'application/json'},
  {key:'engine', title:'Workspace rules', description:'JavaScript for selecting records, checking roles, recording attendance and advancing inquiries.', filename:'school-workspace-engine.mjs', source:engineSource, type:'text/javascript'},
  {key:'tests', title:'Permission checks', description:'A Node.js script that tests school boundaries, assigned classes and who can update each record.', filename:'check-school-workspaces.mjs'},
];

function ResourceDownload({resource}:{resource:(typeof resources)[number]}) {
  return resource.source
    ? <button type="button" className="gp-button gp-secondary" onClick={()=>download(resource.filename,resource.source,resource.type)}><Download size={16}/>Download {resource.filename}</button>
    : <a className="gp-button gp-secondary" href={`./project-files/${resource.filename}`} download><Download size={16}/>Download {resource.filename}</a>;
}

function PermissionsTable() {
  return <div className="gp-table"><table>
    <caption>Role and record permissions</caption>
    <thead><tr><th scope="col">Role</th><th scope="col">Learners</th><th scope="col">Attendance</th><th scope="col">Admissions</th></tr></thead>
    <tbody>{Object.entries(permissions).map(([role,rule])=><tr key={role}>
      <td>{roleNames[role as Role]}</td><td>{rule.roster}</td>
      <td>{rule.attendance?'Update visible records':'Read only'}</td><td>{rule.admissions?'View and advance inquiries':'Hidden'}</td>
    </tr>)}</tbody>
  </table></div>;
}

export default function SchoolWorkspaceWorkshop({stage}:{stage:number}) {
  const [data,setData]=useState(seed);
  const [schoolId,setSchoolId]=useState(seed.schools[0].id);
  const [role,setRole]=useState<Role>('admin');
  const [panel,setPanel]=useState<'attendance'|'admissions'>('attendance');
  const [ready,setReady]=useState<string[]>([]);
  const [notice,setNotice]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  const session=createSession(data,schoolId,role);
  const records=scopeRecords(data,session);
  const rule=permissions[role];
  const school=data.schools.find(record=>record.id===schoolId)!;
  const arrivals=records.learners.filter(learner=>learner.attendance==='Present').length;
  const admissionsVisible=panel==='admissions'&&rule.admissions;

  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      window.scrollTo({top:0,behavior:'instant'});
      heading.current?.focus({preventScroll:true});
    });
    return ()=>cancelAnimationFrame(frame);
  },[stage]);

  return <div className="gp-page gp-build sw-page">
    <a href={root} className="gp-back"><ArrowLeft size={16}/>All projects</a>
    <header className="gp-title"><h1>{schoolProject.title}</h1><p>{schoolProject.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{names.map((name,i)=><a key={name} href={route(i)}
      aria-current={stage===i?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="school-stage">
      <h2 id="school-stage" ref={heading} tabIndex={-1}>{names[stage]}</h2>
      {stage===0&&<div className="gp-split">
        <div className="sw-art">
          <div className="sw-art-heading"><Building2 size={21}/> School workspaces</div>
          <div className="sw-art-schools">{seed.schools.map((item,i)=><article key={item.id}>
            <span className={`sw-school-mark sw-school-mark-${i}`}>{item.initials}</span>
            <strong>{item.name}</strong>
            <div><ClipboardList size={16}/> Attendance</div><div><Users size={16}/> Admissions</div>
          </article>)}</div>
        </div>
        <div className="gp-guide">
          <h3>One application, separate school workspaces</h3>
          <p>A tenant is one school’s workspace. The ERP view manages learner attendance. The CRM view follows admissions inquiries from first contact through enrollment.</p>
          <ol>
            <li>Choose one of the two fictional schools and an administrator, teacher or student role.</li>
            <li>Change a learner’s attendance or advance an inquiry as an authorized role.</li>
            <li>Switch schools and roles, then compare which records and actions are available.</li>
          </ol>
          <div className="gp-check"><Check size={19}/><div><strong>Success criteria</strong><p>Maple Grove edits stay in Maple Grove. A teacher sees their assigned class and a student sees only their own row.</p></div></div>
        </div>
      </div>}
      {stage===1&&<div className="gp-guide">
        <p>{ready.length} of {resources.length} assets ready.</p>
        <div className="sw-assets">{resources.map(resource=><article key={resource.key} className={ready.includes(resource.key)?'sw-ready':undefined}>
          <Database size={20}/><h3>{resource.title}</h3><p>{resource.description}</p>
          <div className="sw-actions"><ResourceDownload resource={resource}/>
            <button type="button" className="gp-button gp-secondary" aria-label={`Mark ${resource.title} ready`} aria-pressed={ready.includes(resource.key)}
              onClick={()=>setReady(current=>current.includes(resource.key)?current.filter(key=>key!==resource.key):[...current,resource.key])}>{ready.includes(resource.key)?'Ready':'Mark ready'}</button>
          </div>
        </article>)}</div>
      </div>}
      {stage===2&&<div className="gp-split">
        <div className="gp-guide">
          <h3>Connect the data to the views</h3>
          <ol>
            <li><strong>Open the demo in a browser.</strong> You can also download the three assets to inspect the records and run the same checks in Node.js.</li>
            <li><strong>Read the IDs.</strong> Open the JSON fixture. Each learner and inquiry includes a <code>schoolId</code>. The demo selects one school before applying a role.</li>
            <li><strong>Assign the role.</strong> The school’s first learner sets the example student and their class sets the teacher’s assigned class.</li>
            <li><strong>Route an update.</strong> Attendance actions go through the role and record checks. Admissions actions advance a single inquiry through the pipeline.</li>
          </ol>
          <div className="sw-flow" aria-label="Data flow">
            <span>School + role</span><ArrowRight size={18}/><span>Scoped records</span><ArrowRight size={18}/><span>Attendance or admissions</span>
          </div>
        </div>
        <PermissionsTable/>
      </div>}
      {stage===3&&<div className="gp-guide">
        <div className="gp-program-meta"><div><span>Language</span><strong>JavaScript and JSON</strong></div><div><span>Tools</span><strong>Browser, text editor and optional Node.js</strong></div></div>
        <div className="gp-program-grid">
          <section className="gp-program-card">
            <h3>Test the school and role boundaries</h3>
            <ol className="gp-program-steps">
              <li>As Maple Grove administrator, mark Arun Park present and move Robotics club visit to Contacted.</li>
              <li>Switch to Riverbank Academy. Confirm the roster and inquiries belong to Riverbank. Switch back and confirm both Maple Grove edits remain.</li>
              <li>Choose Teacher. Confirm only Robotics 8 appears and admissions are hidden.</li>
              <li>Choose Student. Confirm Maya Stone can read her record and attendance editing is disabled.</li>
            </ol>
          </section>
          <section className="gp-program-card">
            <h3>Run the same rules in Node.js</h3>
            <p>Save the three downloads to the same folder and run:</p>
            <pre tabIndex={0}><code>node check-school-workspaces.mjs</code></pre>
            <p>The check verifies permitted changes, rejects cross-school and out-of-class changes, and expects the untouched school’s records to match the starting data.</p>
            <p>The browser simulation uses fictional records and role switching. A live school application would enforce permissions on its server before returning or changing records.</p>
            <div className="sw-actions">{resources.map(resource=><ResourceDownload key={resource.key} resource={resource}/>)}</div>
          </section>
        </div>
      </div>}
      {stage===4&&<div className="sw-workspace gp-guide">
        <header className="sw-dashboard-heading">
          <span className={`sw-school-mark sw-school-mark-${schoolId==='maple'?0:1}`}>{school.initials}</span>
          <div><h3>{school.name}</h3><p>{school.term} · {school.room}</p></div>
          <div className="sw-selects">
            <label>School<select value={schoolId} onChange={event=>{setSchoolId(event.target.value);setNotice('');}}>
              {data.schools.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select></label>
            <label>Role<select value={role} onChange={event=>{setRole(event.target.value as Role);setPanel('attendance');setNotice('');}}>
              {Object.entries(roleNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}
            </select></label>
          </div>
        </header>
        <div className="sw-metrics">
          <div><span>{rule.roster}</span><strong>{records.learners.length}</strong></div>
          <div><span>Present</span><strong>{arrivals}</strong></div>
          <div><span>Open inquiries</span><strong>{rule.admissions?records.inquiries.filter(item=>item.status!=='Enrolled').length:'Restricted'}</strong></div>
        </div>
        <div className="sw-dashboard-body">
          <div className="sw-actions" aria-label="Workspace sections" role="group">
            <button type="button" className={`gp-button ${admissionsVisible?'gp-secondary':''}`} aria-pressed={!admissionsVisible} onClick={()=>{setPanel('attendance');setNotice('');}}><ClipboardList size={17}/>Attendance</button>
            <button type="button" className={`gp-button ${admissionsVisible?'':'gp-secondary'}`} aria-pressed={admissionsVisible} disabled={!rule.admissions}
              onClick={()=>{setPanel('admissions');setNotice('');}}><Users size={17}/>Admissions</button>
            <button type="button" className="gp-button gp-secondary sw-reset" onClick={()=>{setData(seed);setNotice('Restored the sample records for both schools.');}}>Reset sample records</button>
          </div>
          <p className="sw-access"><ShieldCheck size={17}/>{roleNames[role]} · {role==='teacher'?session.group:rule.roster}</p>
          {notice&&<p className="sw-notice" role="status">{notice}</p>}
          <div className="gp-table sw-table">
            {admissionsVisible?<table>
              <caption>Admissions inquiries</caption>
              <thead><tr><th scope="col">Inquiry</th><th scope="col">Program</th><th scope="col">Stage</th><th scope="col">Action</th></tr></thead>
              <tbody>{records.inquiries.map(item=><tr key={item.id}>
                <th scope="row">{item.name}</th><td>{item.program}</td><td><span className="sw-tag">{item.status}</span></td>
                <td><button type="button" className="gp-button gp-secondary" aria-label={`Advance ${item.name}`} disabled={item.status==='Enrolled'}
                  onClick={()=>{setData(current=>advanceInquiry(current,session,item.id));setNotice(`Updated ${item.name}.`);}}>{item.status==='Enrolled'?'Complete':'Advance stage'}</button></td>
              </tr>)}</tbody>
            </table>:<table>
              <caption>Learner attendance</caption>
              <thead><tr><th scope="col">Learner</th><th scope="col">Class</th><th scope="col">Attendance</th>{rule.attendance&&<th scope="col">Action</th>}</tr></thead>
              <tbody>{records.learners.map(learner=><tr key={learner.id}>
                <th scope="row">{learner.name}</th><td>{learner.group}</td><td><span className={`sw-tag sw-${learner.attendance.toLowerCase()}`}>{learner.attendance}</span></td>
                {rule.attendance&&<td><button type="button" className="gp-button gp-secondary"
                  aria-label={`Mark ${learner.name} ${learner.attendance==='Present'?'absent':'present'}`}
                  onClick={()=>{
                    const attendance=learner.attendance==='Present'?'Absent':'Present';
                    setData(current=>setAttendance(current,session,learner.id,attendance));
                    setNotice(`${learner.name} marked ${attendance.toLowerCase()}.`);
                  }}>{learner.attendance==='Present'?'Mark absent':'Mark present'}</button></td>}
              </tr>)}</tbody>
            </table>}
          </div>
          <div className="sw-hint"><GraduationCap size={18}/><p>Switch schools after one update. Then try the teacher and student roles to see how the view changes.</p></div>
        </div>
      </div>}
    </section>
    <nav className="gp-footer" aria-label="Stage navigation">
      {stage>0?<a className="gp-button gp-secondary" href={route(stage-1)}><ArrowLeft size={16}/>{names[stage-1]}</a>:<span/>}
      {stage<4&&<a className="gp-button" href={route(stage+1)}>{names[stage+1]}<ArrowRight size={16}/></a>}
    </nav>
  </div>;
}
