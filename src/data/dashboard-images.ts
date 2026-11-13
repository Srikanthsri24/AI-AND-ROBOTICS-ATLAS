/** Individually authored, high-resolution artwork; no screenshot sprite coordinates. */
export const dashboardImages={
 hero:'hero',
 project:'project-rover',
 collections:['evolution','components','controllers','sensors','robots','anatomy','circuit-lab','project-builder','ai-robotics','learning'],
 stages:['manual-work','mechanization','automation','computing','connected','artificial-intelligence','agi','asi']
};
export function dashboardImage(name:string,width=1024){return `./images/dashboard/${name}-${width}.jpg`}
