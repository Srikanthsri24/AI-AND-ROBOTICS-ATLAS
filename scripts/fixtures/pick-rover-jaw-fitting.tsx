import{createRoot}from'react-dom/client';
import Bench,{type PickJawFittingState}from'../../src/modules/PickRoverJawFittingBench';
import type{PickJawFittingSceneApi}from'../../src/modules/PickRoverJawFittingScene';
import '../../src/styles/app.css';
const state=(value:PickJawFittingState)=>Object.assign(window,{__pickJawFittingState:value});
const ready=(value:PickJawFittingSceneApi)=>Object.assign(window,{__pickJawFittingApi:value});
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;overflow:auto;background:#f5f3fb;color:#202b4a';const root=createRoot(el);root.render(<Bench onState={state} onReady={ready}/>);return()=>root.unmount();}
