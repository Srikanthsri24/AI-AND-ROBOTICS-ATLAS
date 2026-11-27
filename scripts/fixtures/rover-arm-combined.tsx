import{createRoot}from'react-dom/client';
import Workshop from'../../src/modules/RoverArmCombinedWorkshop';
export function mount(el:HTMLElement){el.style.cssText='position:relative;padding:24px;background:#f5f4fc;color:#24314a;min-height:100vh';const root=createRoot(el);root.render(<Workshop/>);return()=>root.unmount();}
