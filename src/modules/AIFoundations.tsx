import { useState } from 'react';
import { ArrowLeft, ArrowRight, BrainCircuit, Check, FlaskConical } from 'lucide-react';
import { aiCurriculum, trainLine } from '../data/ai-curriculum';
import AIWorkshop from './AIWorkshop';
import '../styles/ai-foundations.css';

const route = '#/ai-robotics';
const artwork = (id: string) => `./images/ai-topic-illustrations/${id}.webp`;
const lessons = [
  { id:'fundamentals', title:'AI Fundamentals', short:'How a robot turns clues into a decision.',
    explanation:'Artificial intelligence is a broad name for systems that do tasks such as recognizing an object or choosing an action. A rule follows instructions a person writes. A learned model finds patterns in examples. Both need to be tested before a robot uses their output.',
    example:'A recycling robot can follow a fixed rule about color or learn from labeled pictures of bottles and cans. Once it recognizes an item, a separate controller moves the sorting gate.',
    terms:[['Input','The clues a system receives.'],['Prediction','The model’s best answer from those clues.'],['Action','What the robot does with that answer.']],
    question:'Which step actually moves the sorting gate?', answers:['Taking a picture','Predicting “can”','Sending a command to the motor'], correct:2,
    feedback:'The prediction tells the robot what it thinks it sees. A separate command makes the gate move.' },
  { id:'machine-learning', title:'Machine Learning', short:'How examples teach a model to make predictions.',
    explanation:'Machine learning uses examples to adjust a model. During training the model makes predictions, measures its mistakes, and adjusts. Testing uses examples that training did not see.',
    example:'A delivery robot records how long several trips take. A simple model can learn an estimate of seconds per metre, then predict the time for a new trip.',
    terms:[['Training data','Examples used to learn the pattern.'],['Error','The gap between a prediction and a known answer.'],['Test data','New examples used to check the model.']],
    question:'What should you use to see if the model works on new trips?',answers:['Only the same training trips','Trips the model did not train on','Only its best prediction'],correct:1,
    feedback:'New trips help you check whether the model learned a pattern that works beyond the training examples.' },
  { id:'neural-networks', title:'Neural Networks', short:'How small groups of calculations combine clues.',
    explanation:'An artificial neuron combines inputs using weights. A larger weight makes an input count more. An activation function changes the combined score before passing it on. A network connects many of these units.',
    example:'A robot trying to spot a bottle might use clues about its shape and label. Changing the weights changes how much each clue matters to its prediction.',
    terms:[['Weight','A number that controls a clue’s influence.'],['Bias','An adjustment to the combined score.'],['Activation','A function that changes the score before passing it on.']],
    question:'How can you make the shape clue matter more?',answers:['Increase its weight','Erase the shape input','Use the same score for every object'],correct:0,
    feedback:'A larger weight gives the shape clue more influence when the neuron combines the inputs.' },
  { id:'deep-learning', title:'Deep Learning', short:'How several layers build up a useful picture.',
    explanation:'Deep learning uses neural networks with multiple layers that learn from data. In an image model, earlier layers may respond to edges and textures. Later layers can combine simpler clues into patterns useful for recognizing objects.',
    example:'A camera model can combine boundaries into a round shape and then combine that shape with a handle to help recognize a cup. A shadow or an unfamiliar view can still cause errors.',
    terms:[['Layer','A group of units that transforms its inputs.'],['Feature','A clue the model uses, such as an edge or texture.'],['Generalization','How well the model works on new examples.']],
    question:'Why test the cup model from a new angle?',answers:['To make it use fewer pixels','To see whether its prediction works on an unfamiliar view','To make sure it always says cup'],correct:1,
    feedback:'A new angle checks whether the model recognizes the object beyond the views it learned from.' },
];

function FoundationsLab({id}: {id:string}) {
  const [example,setExample]=useState(0);
  const [slope,setSlope]=useState(1);
  const [weight,setWeight]=useState(50);
  const [layer,setLayer]=useState(0);
  const [bias,setBias]=useState(0);
  const [testTrip,setTestTrip]=useState(0);
  const [ruleClue,setRuleClue]=useState('Color');
  const [pattern,setPattern]=useState(0);
  if(id==='fundamentals'){
    const examples=[['Red bottle','Bottle','Bottle'],['Blue bottle','Can','Bottle'],['Red can','Bottle','Can']];
    const [item,colorGuess,model]=examples[example];
    const rule=ruleClue==='Color'?colorGuess:model;
    return <><p>Try a color rule and a shape-based example model on the same item.</p>
      <div className="af-options">{examples.map(([name],i)=><button key={name} aria-pressed={example===i} onClick={()=>setExample(i)}>{name}</button>)}</div>
      <div className="af-options" role="group" aria-label="Choose a rule clue">{['Color','Shape'].map(clue=><button key={clue} aria-pressed={ruleClue===clue} onClick={()=>setRuleClue(clue)}>Use {clue.toLowerCase()} rule</button>)}</div>
      <div className="af-readings" aria-live="polite"><div>Input<strong>{item}</strong></div><div>{ruleClue} rule<strong>{rule}</strong></div><div>Example model<strong>{model}</strong></div></div>
      <p>Test the red can with both rules. A person chose the clue for each rule. A trained model would need examples to learn which clues to use.</p></>;
  }
  if(id==='machine-learning'){
    const examples = [{x:2,y:6},{x:4,y:12}];
    const nextSlope = trainLine(examples,slope,0,.025).weight;
    const [distance,actual] = [[5,15],[8,24],[5,22]][testTrip];
    const prediction=slope*distance;
    const meanError = examples.reduce((sum,trip)=>sum+Math.abs(trip.y-trip.x*slope),0)/examples.length;
    return <><p>Training trips took 6 seconds for 2 metres and 12 seconds for 4 metres. Improve the model’s estimate for a new 5-metre trip.</p>
      <div className="af-options"><button onClick={()=>setSlope(nextSlope)}>Train one round</button><button onClick={()=>setSlope(1)}>Reset</button></div>
      <div className="af-readings" aria-live="polite"><div>Learned pace<strong>{slope.toFixed(2)} s/m</strong></div><div>Predicted time<strong>{prediction.toFixed(2)} seconds</strong></div><div>Mean training error<strong>{meanError.toFixed(2)} seconds</strong></div></div>
      <h3>Test on a new trip</h3>
      <div className="af-options">{['5 m on flat ground','8 m on flat ground','5 m uphill'].map((name,i)=><button key={name} aria-pressed={testTrip===i} onClick={()=>setTestTrip(i)}>{name}</button>)}</div>
      <div className="af-readings" aria-live="polite"><div>Measured time<strong>{actual} seconds</strong></div><div>Test error<strong>{Math.abs(actual-prediction).toFixed(2)} seconds</strong></div></div>
      <p>Train until the error on flat ground gets smaller, then test uphill. The model only receives distance, so it cannot account for the hill.</p></>;
  }
  if(id==='neural-networks'){
    const score=80*(weight/100)+20*(1-weight/100)+bias;
    return <><p>The shape clue scores 80 out of 100. The color clue scores 20. Change how much weight each clue gets.</p>
      <label className="af-slider">Weight for shape <strong>{weight}%</strong><input type="range" min={0} max={100} value={weight} onChange={e=>setWeight(Number(e.target.value))}/></label>
      <div className="af-readings" aria-live="polite"><div>Color weight<strong>{100-weight}%</strong></div><div>Combined score<strong>{score.toFixed(1)}</strong></div><div>Threshold at 60<strong>{score>=60-1e-9?'Bottle':'Unsure'}</strong></div></div>
      <label className="af-slider">Bias adjustment <strong>{bias}</strong><input type="range" min={-25} max={25} value={bias} onChange={e=>setBias(Number(e.target.value))}/></label>
      <p className="af-formula">80 × {weight}% + 20 × {100-weight}% {bias<0?'−':'+'} {Math.abs(bias)} = {score.toFixed(1)}</p>
      <p>Set the shape weight to 50%, then increase the bias until the answer changes. The weights mix the clues. This example uses a simple threshold to turn the score into an answer.</p></>;
  }
  const layers=['Input pixels','Local differences','Combine clues','Prediction'];
  const patterns=[
    [0,1,0, 0,1,0, 0,1,0],
    [0,0,0, 1,1,1, 0,0,0],
    [1,0,0, 0,1,0, 0,0,1],
  ];
  const pixels=patterns[pattern];
  const rows=[0,1,2].map(row=>Math.abs(pixels[row*3]-pixels[row*3+1])+Math.abs(pixels[row*3+1]-pixels[row*3+2]));
  const columns=[0,1,2].map(col=>Math.abs(pixels[col]-pixels[col+3])+Math.abs(pixels[col+3]-pixels[col+6]));
  const across=rows.reduce((a,b)=>a+b,0);
  const down=columns.reduce((a,b)=>a+b,0);
  const prediction=across===down?'Unsure':across>down?'Vertical line':'Horizontal line';
  return <><p>See what happens inside a tiny vision pipeline. Choose an image and follow the numbers through the layers.</p>
    <div className="af-options" role="group" aria-label="Input pattern">{['Vertical line','Horizontal line','Diagonal line'].map((name,i)=><button key={name} aria-pressed={pattern===i} onClick={()=>setPattern(i)}>{name}</button>)}</div>
    <div className="af-options" role="group" aria-label="Model layer">{layers.map((name,i)=><button key={name} aria-pressed={layer===i} onClick={()=>setLayer(i)}>{name}</button>)}</div>
    <div className="af-layer" aria-live="polite">
      <div className="af-pixels" aria-label="Three by three pixels">{pixels.map((pixel,i)=><span key={i} data-light={pixel===1}>{pixel}</span>)}</div>
      <div><strong>{layers[layer]}</strong>
        <p>{[
          'Each pixel is a number. Dark is 0 and light is 1.',
          `Compare neighbours. Across the rows, the differences add up to ${rows.join(', ')}. Down the columns they add up to ${columns.join(', ')}.`,
          `Add the differences. The across total is ${across}. The down total is ${down}. A vertical line changes brightness more when you move across it.`,
          `${prediction}. Equal totals leave the system unsure. Try the diagonal line to see this happen.`,
        ][layer]}</p></div>
    </div>
    <p>This example uses fixed calculations so you can follow every step. In a deep learning model, training adjusts the calculations that extract useful clues.</p></>;
}

export default function AIFoundations({initialTopic,onEntry}:{initialTopic?:string|null;onEntry:(id:string)=>void}) {
  const index=lessons.findIndex(lesson=>lesson.id===initialTopic);
  if(index>=0) return <Lesson key={initialTopic} index={index}/>;
  if(initialTopic==='laboratory'||aiCurriculum.some(topic=>topic.id===initialTopic)) return <div className="af-page"><a className="af-back" href={route}><ArrowLeft size={16}/> AI learning path</a><AIWorkshop initialTopic={initialTopic} onEntry={onEntry}/></div>;
  return <div className="af-page">
    <header className="af-hero"><div><span><BrainCircuit size={20}/> AI Robotics</span><h1>How robots learn and decide</h1><p>Start with an everyday example, then follow the ideas from simple decisions to deep learning.</p><a className="af-primary" href={`${route}/fundamentals`}>Start learning <ArrowRight size={17}/></a></div><img src={artwork('fundamentals')} alt="Robot and AI learning illustration"/></header>
    <h2>Four lessons to get started</h2>
    <div className="af-cards">{lessons.map((lesson,i)=><a key={lesson.id} href={`${route}/${lesson.id}`}><img src={artwork(lesson.id)} alt=""/><div><span>Lesson {i+1}</span><h3>{lesson.title}</h3><p>{lesson.short}</p><strong>Open lesson <ArrowRight size={16}/></strong></div></a>)}</div>
    <div className="af-more"><div><h2>Explore more AI topics</h2><p>Try computer vision, robot navigation, voice commands, and more in the lab.</p></div><a href={`${route}/laboratory`} className="af-primary">Open AI Robotics Lab <ArrowRight size={16}/></a></div>
  </div>;
}

function Lesson({index}:{index:number}) {
  const lesson=lessons[index];
  const [answer,setAnswer]=useState<number>();
  return <article className="af-page">
    <a className="af-back" href={route}><ArrowLeft size={16}/> AI learning path</a>
    <nav className="af-nav" aria-label="AI foundations lessons">{lessons.map((item,i)=><a key={item.id} aria-current={i===index?'page':undefined} href={`${route}/${item.id}`}>{item.title}</a>)}</nav>
    <header className="af-hero af-lesson-hero"><div><span>Lesson {index+1} of {lessons.length}</span><h1>{lesson.title}</h1><p>{lesson.short}</p><button className="af-primary" onClick={()=>document.getElementById('af-activity')?.scrollIntoView()}>Try the activity <ArrowRight size={17}/></button></div><img src={artwork(lesson.id)} alt=""/></header>
    <div className="af-columns"><section className="af-panel"><h2>How it works</h2><p>{lesson.explanation}</p><h3>In a robot</h3><p>{lesson.example}</p></section>
      <section className="af-panel"><h2>Key words</h2><dl>{lesson.terms.map(([term,meaning])=><div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl></section></div>
    <section id="af-activity" className="af-panel af-lab"><h2><FlaskConical size={22}/> Interactive lab</h2><FoundationsLab id={lesson.id}/></section>
    <section className="af-panel"><h2>Check your understanding</h2><p>{lesson.question}</p>
      <div className="af-options">{lesson.answers.map((option,i)=><button key={option} aria-pressed={answer===i} data-result={answer===i?(i===lesson.correct?'correct':'retry'):undefined} onClick={()=>setAnswer(i)}>{option}</button>)}</div>
      {answer!==undefined&&<p className="af-feedback" role="status">{answer===lesson.correct?<><Check size={18}/> {lesson.feedback}</>:'Try again. Look at the example above for a clue.'}</p>}
    </section>
    <div className="af-more"><a className="af-back" href={index===0?route:`${route}/${lessons[index-1].id}`}><ArrowLeft size={16}/> {index===0?'All lessons':'Previous lesson'}</a>
      <a className="af-primary" href={index===lessons.length-1?`${route}/laboratory`:`${route}/${lessons[index+1].id}`}>{index===lessons.length-1?'Explore the lab':lessons[index+1].title} <ArrowRight size={16}/></a></div>
  </article>;
}
