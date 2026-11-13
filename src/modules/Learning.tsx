import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Award, BookOpen, Check, ClipboardCheck, Download, FlaskConical, GraduationCap} from 'lucide-react';
import {assessmentBank, learningPaths, practiceCertificate, type PracticeQuiz} from '../data/learning-curriculum';
import {entries} from '../data/atlas';
import {aiCurriculum} from '../data/ai-curriculum';
import {hardwareFamilies} from '../data/hardware';
import TeacherWorkspace from './TeacherWorkspace';
import {download, updateData, useAtlas} from './state';
import '../styles/learning-center.css';

const tabs = ['Learning paths', 'Assessments', 'Practical challenges', 'Progress', 'Teacher workspace'] as const;
const image = (kind: string, id: string) => `./images/learning-illustrations/${kind}-${id}.webp`;
const topicName = (id: string) => hardwareFamilies.find(item=>item.id===id)?.title ?? entries.find(item=>item.id===id)?.name ?? aiCurriculum.find(item=>'ai-'+item.id===id)?.title ?? id;
const passingScore = 67;

type Props = {
  initialAssessment?: string | null;
  progressOnly?: boolean;
  onEntry: (id:string)=>void;
  onNavigate?: (page:number)=>void;
};

export default function Learning({initialAssessment, progressOnly=false, onEntry, onNavigate}: Props) {
  const data = useAtlas();
  const [tab,setTab] = useState<(typeof tabs)[number]>(progressOnly ? 'Progress' : 'Learning paths');
  const [pathId,setPathId] = useState<string>();
  const [quizId,setQuizId] = useState<string>();
  const content = useRef<HTMLElement>(null);
  useEffect(()=>{setQuizId(initialAssessment ?? undefined);},[initialAssessment]);
  useEffect(()=>{setTab(progressOnly?'Progress':'Learning paths');setPathId(undefined);},[progressOnly]);
  const quiz = assessmentBank.find(item=>item.id===quizId);
  const path = learningPaths.find(item=>item.quiz===pathId);
  function showTab(value:(typeof tabs)[number]) {
    setTab(value);
    setPathId(undefined);
    setQuizId(undefined);
  }
  function openQuiz(id:string) {
    setQuizId(id);
    window.scrollTo({top:0});
  }
  if(initialAssessment==='watch') return <RobotLesson/>;
  if(quiz) return <Assessment key={quiz.id} quiz={quiz} onBack={()=>{showTab('Assessments');window.scrollTo({top:0});}}/>;
  return <div className="lc-page">
    <header className="lc-hero">
      <div><span><GraduationCap size={21}/> Atlas Learning</span>
        <h1>{progressOnly?'Your learning record':'Learning & Assessment'}</h1>
        <p>{progressOnly?'See the topics you’ve explored and review your assessment results.':'Explore how technology works, apply what you learn, and check your understanding at your own pace.'}</p>
        <button className="lc-primary" onClick={()=>{showTab(progressOnly?'Progress':'Learning paths');content.current?.scrollIntoView({block:'start'});}}>{progressOnly?'View progress':'Explore learning paths'} <ArrowRight size={17}/></button>
      </div>
      <img src={image('path','robotics')} alt="Robotics learning workspace"/>
    </header>
    <nav className="lc-tabs" aria-label="Learning sections">{tabs.map(item=><button key={item} aria-pressed={item===tab} onClick={()=>showTab(item)}>{item}</button>)}</nav>
    <section className="lc-content" ref={content} aria-label={tab}>
      {tab==='Learning paths' && (path ? <div className="lc-panel">
        <button className="lc-back" onClick={()=>setPathId(undefined)}><ArrowLeft size={16}/> All learning paths</button>
        <h2>{path.title}</h2><p>{path.desc}</p>
        <ol className="lc-guides">{path.ids.map(id=><li key={id}><button onClick={()=>onEntry(id)}>
          {data.completed.includes(id)?<Check size={18}/>:<BookOpen size={18}/>}<span>{topicName(id)}</span><ArrowRight size={16}/>
        </button></li>)}</ol>
        <button className="lc-primary" onClick={()=>openQuiz(path.quiz)}>Practice assessment <ArrowRight size={16}/></button>
      </div> : <>
        <h2>Choose a learning path</h2>
        <div className="lc-grid">{learningPaths.map(item=>{
          const explored=item.ids.filter(id=>data.completed.includes(id)).length;
          return <article className="lc-card" key={item.quiz}><img src={image('path',item.quiz)} alt="" loading="lazy"/>
            <div><span className="lc-meta">{item.level} · {item.ids.length} guides</span><h3>{item.title}</h3><p>{item.desc}</p>
              <progress value={explored} max={item.ids.length} aria-label={`${item.title} progress`}/><small>{explored} of {item.ids.length} guides explored</small>
              <button className="lc-primary" onClick={()=>{setPathId(item.quiz);content.current?.scrollIntoView({block:'start'});}}>View path <ArrowRight size={16}/></button>
            </div></article>;
        })}</div>
        <div className="lc-panel lc-feature"><div><h2>See a humanoid robot in action</h2><p>Watch how sensors, a controller, and motors work together to move a robot.</p></div><a className="lc-primary lc-link" href="#/learning/watch">Watch lesson <ArrowRight size={16}/></a></div>
      </>)}
      {tab==='Assessments' && <><h2>Check your understanding</h2><p>Answer one question at a time, then review the explanation for every answer.</p>
        <div className="lc-grid">{assessmentBank.map(item=><article className="lc-card" key={item.id}><img src={image('assessment',item.id)} alt="" loading="lazy"/><div>
          <span className="lc-meta">{item.questions.length} questions</span><h3>{item.title}</h3>
          <p>{data.scores[item.id]===undefined?'Ready to practice':`Best score ${data.scores[item.id]}%`}</p>
          <button className="lc-primary" onClick={()=>openQuiz(item.id)}>Start assessment <ArrowRight size={16}/></button>
        </div></article>)}</div></>}
      {tab==='Practical challenges' && <><h2>Put it into practice</h2><p>Pick a challenge and record what you expected, what you observed, and what you’d change.</p>
        <div className="lc-grid">{learningPaths.map(item=><article className="lc-card" key={item.quiz}><img src={image('challenge',item.quiz)} alt="" loading="lazy"/><div>
          <span className="lc-meta"><FlaskConical size={15}/> {item.level}</span><h3>{item.title}</h3><p>{item.challenge}</p>
          <button className="lc-primary" onClick={()=>onEntry(item.ids[0])}>Open starting guide <ArrowRight size={16}/></button>
        </div></article>)}</div>
        {onNavigate&&<div className="lc-panel lc-feature"><div><h2>Document your build</h2><p>Use Project Builder to record your design and observations.</p></div><button className="lc-primary" onClick={()=>onNavigate(8)}>Open Project Builder <ArrowRight size={16}/></button></div>}
      </>}
      {tab==='Progress' && <div className="lc-panel"><h2>Your progress</h2><p>Progress and best scores are saved in this browser.</p>
        <div className="lc-stats"><div><BookOpen/><strong>{data.completed.length}</strong>Topics explored</div><div><ClipboardCheck/><strong>{Object.keys(data.scores).length}</strong>Assessments attempted</div><div><Award/><strong>{Object.values(data.scores).filter(score=>score>=passingScore).length}</strong>Scores of 67% or higher</div></div>
        <h3>Path achievements</h3><ul className="lc-progress-list">{learningPaths.map(item=>{
          const explored=item.ids.filter(id=>data.completed.includes(id)).length;
          const earned=explored===item.ids.length&&(data.scores[item.quiz]??0)>=passingScore;
          return <li key={item.quiz}><strong>{item.title}</strong><span>{earned?'Achievement earned':`${explored} of ${item.ids.length} guides explored`}</span></li>;
        })}</ul>
        {data.completed.length>0&&<><h3>Recently explored</h3><ul className="lc-guides">{data.completed.slice(-6).reverse().map(id=><li key={id}><button onClick={()=>onEntry(id)}><Check size={16}/><span>{topicName(id)}</span><ArrowRight size={16}/></button></li>)}</ul></>}
        <button className="lc-primary" onClick={()=>download('atlas-progress.json',JSON.stringify({name:data.settings.name,completed:data.completed,scores:data.scores,projects:data.projects.map(item=>({title:item.title,stages:item.completed.length}))},null,2),'application/json')}><Download size={16}/> Export progress</button>
      </div>}
      {tab==='Teacher workspace' && <TeacherWorkspace/>}
    </section>
  </div>;
}

function Assessment({quiz,onBack}:{quiz:PracticeQuiz;onBack:()=>void}) {
  const data=useAtlas();
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus({preventScroll:true});},[index,submitted]);
  const [question,options]=quiz.questions[index];
  const total=quiz.questions.length;
  const answered=Object.keys(answers).length;
  const correctCount=quiz.questions.filter((entry,i)=>answers[i]===entry[2]).length;
  const score=Math.round(correctCount/total*100);
  const date=new Date().toLocaleDateString();
  function submit() {
    if(answered!==total) return;
    updateData(d=>({...d,scores:{...d.scores,[quiz.id]:Math.max(d.scores[quiz.id]??0,score)}}));
    setSubmitted(true);
    window.scrollTo({top:0});
  }
  return <article className="lc-page lc-assessment">
    <button className="lc-back" onClick={onBack}><ArrowLeft size={16}/> All assessments</button>
    <header className="lc-assessment-heading"><img src={image('assessment',quiz.id)} alt=""/><div><span className="lc-meta">Practice assessment</span><h1>{quiz.title}</h1></div></header>
    {submitted ? <section className="lc-panel">
      <h2 ref={heading} tabIndex={-1}>You got {correctCount} of {total} correct</h2><p>Your score is {score}%. Your best score is saved in this browser.</p>
      <div className="lc-actions">
        <button className="lc-primary" onClick={()=>{setAnswers({});setIndex(0);setSubmitted(false);window.scrollTo({top:0});}}>Try again</button>
        <button onClick={()=>download(quiz.id+'-learning-record.txt',`Atlas practice record\nLearner: ${data.settings.name}\nAssessment: ${quiz.title}\nScore: ${score}%\nDate: ${date}`)}><Download size={16}/> Learning record</button>
        {score>=passingScore&&<button onClick={()=>download(quiz.id+'-practice-achievement.svg',practiceCertificate(data.settings.name,quiz.title,score,date),'image/svg+xml')}><Award size={16}/> Practice achievement</button>}
      </div>
      <h3>Review your answers</h3>
      <ol className="lc-review">{quiz.questions.map(([prompt,choices,correct,why],i)=><li key={prompt}>
        <strong>{prompt}</strong><p>Your answer: {choices[answers[i]]}</p><p>Correct answer: {choices[correct]}</p><p>{why}</p>
      </li>)}</ol>
    </section> : <section className="lc-panel">
      <div className="lc-quiz-progress"><span>Question {index+1} of {total}</span><span>{answered} answered</span></div>
      <progress value={answered} max={total} aria-label="Questions answered"/>
      <h2 ref={heading} tabIndex={-1}>{question}</h2>
      <fieldset className="lc-options"><legend className="ha-sr">Choose one answer</legend>
        {options.map((option,i)=><label key={option}><input type="radio" name="assessment-answer" checked={answers[index]===i} onChange={()=>setAnswers(previous=>({...previous,[index]:i}))}/>{option}</label>)}
      </fieldset>
      <div className="lc-actions"><button disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={16}/> Previous</button>
        {index+1<total?<button className="lc-primary" disabled={answers[index]===undefined} onClick={()=>setIndex(index+1)}>Next question <ArrowRight size={16}/></button>:<button className="lc-primary" disabled={answered!==total} onClick={submit}>See results <ArrowRight size={16}/></button>}
      </div>
    </section>}
  </article>;
}

const robotChapters = [
  {title:'Sense', part:'Sensors', caption:'The robot’s camera sees a block in its path. The sensor sends that information to the controller.'},
  {title:'Decide', part:'Controller', caption:'The controller checks the reading and chooses to stop before stepping into the block.'},
  {title:'Move', part:'Motors', caption:'Motors move the joints when the controller asks them to. Here the controller holds the robot in place.'},
  {title:'Check again', part:'Feedback', caption:'The robot takes another reading before it moves. When the path clears, it can step forward again.'},
];

function RobotLesson() {
  const [chapter,setChapter] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [finished,setFinished] = useState(false);
  const [answer,setAnswer] = useState<boolean>();
  useEffect(()=>{
    if(!playing) return;
    const timer = window.setTimeout(()=>{
      if(chapter<robotChapters.length-1) setChapter(chapter+1);
      else {setPlaying(false);setFinished(true);}
    },5500);
    return ()=>window.clearTimeout(timer);
  },[playing,chapter]);
  const current=robotChapters[chapter];
  return <article className="lc-page lc-watch">
    <a className="lc-back lc-link" href="#/learning"><ArrowLeft size={16}/> Learning &amp; Assessment</a>
    <div className="lc-panel">
      <h1>How a humanoid robot responds</h1>
      <div className="lc-watch-layout">
        <div className="lc-watch-stage">
          <img src={image('path','anatomy')} alt="Illustration of humanoid robot anatomy"/>
          <div className="lc-watch-caption" aria-live="polite">
            <span>{chapter+1} of {robotChapters.length} · {current.part}</span>
            <strong>{current.title}</strong><p>{current.caption}</p>
          </div>
        </div>
        <div>
          <button className="lc-primary" onClick={()=>{
            if(finished){setChapter(0);setFinished(false);}
            setPlaying(!playing);
          }}>{playing?'Pause lesson':finished?'Replay lesson':'Play lesson'}</button>
          <ol className="lc-guides">{robotChapters.map((item,i)=><li key={item.title}><button aria-current={chapter===i?'step':undefined} onClick={()=>{setChapter(i);setPlaying(false);setFinished(false);}}><span>{i+1}. {item.title}</span></button></li>)}</ol>
        </div>
      </div>
    </div>
    <section className="lc-panel lc-feature">
      <div><h2>Check your understanding</h2><p>What should the robot do after stopping?</p>
        <div className="lc-actions"><button aria-pressed={answer===true} onClick={()=>setAnswer(true)}>Check the path again</button><button aria-pressed={answer===false} onClick={()=>setAnswer(false)}>Step forward immediately</button></div>
        {answer!==undefined&&<p role="status">{answer?'Correct. A new reading tells it whether the path is clear.':'Try again. The block may still be in the robot’s path.'}</p>}
      </div>
    </section>
  </article>;
}
