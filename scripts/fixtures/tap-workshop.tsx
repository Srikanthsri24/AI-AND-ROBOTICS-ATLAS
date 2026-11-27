import{createRoot}from'react-dom/client';
import type{TapWorkflow}from'../../src/data/tap-workflow';
import Workshop from'../../src/modules/AutomaticTapWorkshop';
export function mount(el:HTMLElement,initialState?:TapWorkflow){el.style.cssText='padding:20px;background:#f7f8fe;color:#1c2948;font:14px Inter,Arial,sans-serif;min-height:100vh';const root=createRoot(el);root.render(<Workshop initialState={initialState} onStateChange={state=>Object.assign(window,{__tapWorkshopState:state})} onSceneReady={state=>Object.assign(window,{__tapWorkshopScene:state})}/>);return()=>root.unmount();}
