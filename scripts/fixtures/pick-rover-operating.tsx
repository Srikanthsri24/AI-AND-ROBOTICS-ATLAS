import{createRoot}from'react-dom/client';
import Bench,{type PickOperatingState}from'../../src/modules/PickRoverOperatingBench';
import type{PickOperatingSceneApi}from'../../src/modules/PickRoverOperatingScene';
const state=(s:PickOperatingState)=>Object.assign(window,{__pickOperatingState:s});
const ready=(api:PickOperatingSceneApi)=>Object.assign(window,{__pickOperatingApi:api});
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;overflow:auto;background:#ececf5;padding:clamp(10px,2vw,24px);color:#202b4a';el.setAttribute('data-operating-preview','true');const root=createRoot(el);root.render(<Bench onStateChange={state} onSceneReady={ready}/>);return()=>root.unmount();}
