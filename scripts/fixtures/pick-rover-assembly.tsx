import{createRoot}from'react-dom/client';
import Bench,{type PickAssemblyState}from'../../src/modules/PickRoverAssemblyBench';
import type{PickAssemblyApi}from'../../src/modules/PickRoverAssemblyScene';
const state=(value:PickAssemblyState)=>Object.assign(window,{__pickAssemblyState:value}),ready=(value:PickAssemblyApi)=>Object.assign(window,{__pickAssemblyApi:value});
export function mount(el:HTMLElement){el.dataset.assemblyPreview='';el.style.cssText='position:fixed;inset:0;overflow:auto;background:#edebf5;padding:24px';const root=createRoot(el);root.render(<Bench onState={state} onReady={ready}/>);return()=>root.unmount();}
