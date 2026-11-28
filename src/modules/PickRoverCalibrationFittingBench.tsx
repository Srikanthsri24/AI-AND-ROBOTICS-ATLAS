import{useCallback,useState,useEffect,useRef}from'react';
import LiftFitting,{type PickLiftFittingState}from'./PickRoverLiftFittingBench';
import type{PickLiftFittingSceneApi}from'./PickRoverLiftFittingScene';
import Calibration from'./PickRoverUnloadedBench';
import Fitting,{type PickJawFittingState}from'./PickRoverJawFittingBench';
import type{PickUnloadedSceneApi}from'./PickRoverUnloadedScene';
import type{PickJawFittingSceneApi}from'./PickRoverJawFittingScene';
import{pickUnloadedInitial,pickUnloadedReady,type PickUnloadedCalibration}from'../data/pick-rover-unloaded-calibration';
import '../styles/pick-rover-calibration-fitting.css';
export type PickCalibrationFittingState={section:'calibration'|'fitting'|'lift-fitting';calibration:PickUnloadedCalibration;fitting:PickJawFittingState|null;liftFitting:PickLiftFittingState|null};
/** The fitting canvas does not mount until the actual calibration result
 * passes its recorded-reference, returned-angle and independent isolation gates. */
export default function PickRoverCalibrationFittingBench({onState,onCalibrationReady,onFittingReady,onLiftFittingReady}:{onState?:(state:PickCalibrationFittingState)=>void;onCalibrationReady?:(api:PickUnloadedSceneApi)=>void;onFittingReady?:(api:PickJawFittingSceneApi)=>void;onLiftFittingReady?:(api:PickLiftFittingSceneApi)=>void}){
 const[state,setState]=useState<PickCalibrationFittingState>(()=>({section:'calibration',calibration:pickUnloadedInitial(),fitting:null,liftFitting:null})),[revision,setRevision]=useState(0);
 const calibration=useCallback((value:PickUnloadedCalibration)=>setState(s=>({...s,calibration:value})),[]),fitting=useCallback((value:PickJawFittingState)=>setState(s=>({...s,fitting:value})),[]);
 const liftFitting=useCallback((value:PickLiftFittingState)=>setState(s=>({...s,liftFitting:value})),[]);
 const container=useRef<HTMLElement>(null);
 useEffect(()=>{onState?.(state);},[state,onState]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>container.current?.scrollIntoView({block:'start'}));return()=>cancelAnimationFrame(frame);},[state.section]);
 const ready=pickUnloadedReady(state.calibration);
 return <section ref={container} className="pick-calibration-fitting"><div className="pick-cf-route"><span className={state.section==='calibration'?'current':''}>1 · Unloaded calibration</span><span aria-hidden="true">→</span><span className={state.section==='fitting'?'current':''}>2 · Gripper coupling fitting</span><span aria-hidden="true">→</span><span className={state.section==='lift-fitting'?'current':''}>3 · Lift adapter fitting</span></div>
 {state.section==='calibration'?<><Calibration key={revision} initialState={state.calibration} onState={calibration} onReady={onCalibrationReady}/><div className="pick-cf-handoff"><div><h3>{ready?'References verified. The fitting lesson is unlocked.':'Complete calibration before fitting the coupling.'}</h3><p>{ready?'Both pulse pairs are recorded, both shafts have returned to A, and USB logic and servo power are OFF. Wheel power remains OFF.':'Inspect both shafts, record A and B for each channel, return both to A, then switch servo and USB logic sources OFF.'}</p></div><button disabled={!ready} onClick={()=>{if(!pickUnloadedReady(state.calibration))return;setState(s=>({...s,section:'fitting',fitting:null,liftFitting:null}));}}>Continue to gripper fitting</button></div></>:state.section==='fitting'?<><Fitting onState={fitting} onReady={onFittingReady}/><div className="pick-cf-handoff"><div><h3>Fit the lift adapter next</h3><p>Finish the gripper fitting sequence before closing the split lift adapter around the aligned shafts. All sources remain OFF.</p></div><button disabled={state.fitting?.progress!==1} onClick={()=>{if(state.fitting?.progress!==1||!pickUnloadedReady(state.calibration))return;setState(s=>({...s,section:'lift-fitting',liftFitting:null}));}}>Continue to lift fitting</button></div><Restart reset={()=>{setState({section:'calibration',calibration:pickUnloadedInitial(),fitting:null,liftFitting:null});setRevision(r=>r+1);}}/></>:<><LiftFitting onState={liftFitting} onReady={onLiftFittingReady}/><Restart reset={()=>{setState({section:'calibration',calibration:pickUnloadedInitial(),fitting:null,liftFitting:null});setRevision(r=>r+1);}}/></>}

 </section>;
}

function Restart({reset}:{reset:()=>void}){return <div className="pick-cf-handoff"><p>Restarting returns to the unloaded virtual setup, removes both couplings and clears all recorded references and fitting progress. Cable dressing and powered testing remain unfinished.</p><button onClick={reset}>Restart unloaded setup</button></div>;}
