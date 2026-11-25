import {radarWorkshopParts} from './radar-workshop-parts';
import {radarAdvance,radarDefaults,radarInitial} from './radar-workshop';
import {radarPowerSeating,type RadarPowerWithdrawal} from './radar-power-jumpers';
export type RadarSonarWithdrawal={sonar:number;uno:number};
export type RadarBenchMotion={actual:number;hornOffset:number;usbUno:number;usbHost:number;usb:boolean;servoPower:boolean;sonar:readonly RadarSonarWithdrawal[];power:readonly RadarPowerWithdrawal[]};
export const radarAssemblyChapters=[
 {title:'Prepare the bench',end:0,instruction:'Keep the separate servo output off. Put the base on temporary supports so its underside screws are accessible. Leave the horn and sensor off the shaft.'},
 {title:'Mount the servo',end:1,instruction:'Fit the posts and underside screws while the base is supported. Lift it slightly, slide the supports away and lower the base. Place the prewired servo module and secure its ears.'},
 {title:'Connect servo circuit',end:2,instruction:'With power off, seat each labelled plug: D9 to orange, separate +5 V to red and motor negative to brown. Join the separate reference socket to Uno GND through one real five-hole strip.'},
 {title:'Centre the bare shaft',end:3,instruction:'Connect USB and briefly enable servo power. The original sketch requests 90° during setup. Stop within its startup delay, switch the servo output off and disconnect the Uno end before fitting anything.'},
 {title:'Fit the horn',end:4,instruction:'Both supplies are disconnected from the servo circuit. Lower the horn onto the centred shaft and insert its retaining screw. Keep the straight-ahead mark at 90°.'},
 {title:'Secure the bracket',end:5,instruction:'Lower the lightweight open-backed bracket onto the horn. Slide its two nuts underneath the arms, then lower the screws through the aligned bracket and horn holes.'},
 {title:'Mount the sonar',end:6,instruction:'Hold the PCB flat against the two side straps. Seat the rear nuts, then insert the four front screws. The central rear electronics and lower header remain unobstructed.'},
 {title:'Connect the sonar',end:7,instruction:'Seat each sensor plug and its matching Uno plug with power off: 5 V, D2/TRIG, D3/ECHO and GND. Preserve a slack loop for the full 30–150° sweep.'},
 {title:'Position the target',end:8,instruction:'Place the flat card 40 cm from the reference sensor face. Its cross is at acoustic-axis height. Face the card towards the head and leave the sweep area clear.'},
 {title:'Reconnect & test',end:9,instruction:'With the separate servo output still off, reconnect the Uno USB end. Inspect the completed wiring. Run the virtual sketch to enable the servo and observe real angle/range samples.'},
] as const;
export const radarAssemblyParts=[...radarWorkshopParts,{id:'radar-assembly-supports',name:'Temporary underside assembly supports',what:'Four blocks support the base while its underside fasteners are inserted above the work surface.',connection:'Lift the base clear, slide the blocks out and remove them before lowering the base. They are not part of the working scanner.'}];
const ids=new Set(radarAssemblyParts.map(p=>p.id));
const children=new Set(['radar-bracket-nut-set','radar-bracket-screw-set','radar-sonar-nut-set','radar-sonar-screw-set']);
export const radarUnit=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(p:number,a:number,b:number)=>{const f=radarUnit((p-a)/(b-a));return f*f*(3-2*f);};
function validate(p:number){if(!Number.isFinite(p)||p<0||p>9)throw Error('Radar assembly progress must be 0–9');}
export function radarSonarSeating(progress:number):RadarSonarWithdrawal[]{
 if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Sonar seating progress must be 0–1');
 return Array.from({length:4},(_,i)=>({sonar:4*(1-ease(progress*8,i*2,i*2+1)),uno:5*(1-ease(progress*8,i*2+1,i*2+2))}));
}
export function radarAssemblyMotion(p:number):RadarBenchMotion{
 validate(p);let usbHost=12,usbUno=12;
 if(p>=2){usbHost=12*(1-ease(p,2,2.25));usbUno=p<2.8?12*(1-ease(p,2.25,2.5)):p<8?12*ease(p,2.8,2.9):12*(1-ease(p,8,8.7));}
 const servoPower=p>=2.5&&p<2.8;
 const actual=p<2.5?30:p>=2.8?90:radarAdvance({...radarInitial(),actual:30},Math.round(ease(p,2.5,2.8)*1200000),{...radarDefaults,usb:true,servoPower:true}).actual;
 return{actual,hornOffset:0,usbHost,usbUno,usb:true,servoPower,sonar:radarSonarSeating(radarUnit(p-6)),power:radarPowerSeating(radarUnit(p-1))};
}
export function radarAssemblyPose(id:string,p:number):{visible:boolean;offset:[number,number,number]}{
 validate(p);if(!ids.has(id)&&!children.has(id))throw Error('Unknown radar assembly owner '+id);
 const pose=(visible=true,x=0,y=0,z=0)=>({visible,offset:[x,y,z] as [number,number,number]});
 const baseLift=p<.35?30:p<.45?30+2*ease(p,.35,.45):32*(1-ease(p,.55,.7));
 if(id==='radar-assembly-supports')return pose(p<=.55,0,0,120*ease(p,.45,.55));
 if(id==='radar-base'||id==='radar-feet')return pose(true,0,baseLift);
 if(id==='radar-posts')return pose(p>0,0,baseLift+16*(1-ease(p,0,.2)));
 if(id==='radar-post-bolts')return pose(p>=.2,0,baseLift-14*(1-ease(p,.2,.35)));
 if(id==='radar-servo-bolts')return pose(p>=.88,0,12*(1-ease(p,.88,1)));
 if(id==='radar-servo-case'||id==='radar-shaft'||id==='radar-servo-connector'||id==='radar-servo-rest'||/^radar-servo-(signal|positive|ground)-(tail|contact)$/.test(id))return pose(p>=.7,0,60*(1-ease(p,.7,.88)));
 if(id==='radar-horn')return pose(p>=3,0,24*(1-ease(p,3,3.7)));
 if(id==='radar-hub-screw')return pose(p>=3.7,0,14*(1-ease(p,3.7,4)));
 if(id==='radar-bracket')return pose(p>=4,0,28*(1-ease(p,4,4.6)));
 if(id==='radar-bracket-bolts')return pose(p>=4.6);
 if(id==='radar-bracket-nut-set')return pose(p>=4.6,0,0,18*(1-ease(p,4.6,4.8)));
 if(id==='radar-bracket-screw-set')return pose(p>=4.8,0,16*(1-ease(p,4.8,5)));
 if(id==='radar-sonar-bolts')return pose(p>=5.5);
 if(id==='radar-sonar-nut-set')return pose(p>=5.5,0,0,-16*(1-ease(p,5.5,5.7)));
 if(id==='radar-sonar-screw-set')return pose(p>=5.7,0,0,18*(1-ease(p,5.7,6)));
 if(id.startsWith('radar-sonar-'))return pose(p>=5,0,0,45*(1-ease(p,5,5.5)));
 if(id.startsWith('radar-lead-'))return pose(p>=6);
 if(id.startsWith('radar-jumper-'))return pose(p>=1);
 if(id.startsWith('radar-usb-'))return pose(p>=2);
 if(id.startsWith('radar-target-'))return pose(p>=7,0,30*(1-ease(p,7,8)));
 return pose();
}
export function radarAssemblyActive(p:number){
 validate(p);if(p===0)return'radar-assembly-supports';if(p<.2)return'radar-posts';if(p<.35)return'radar-post-bolts';if(p<.55)return'radar-assembly-supports';if(p<.7)return'radar-base';if(p<.88)return'radar-servo-case';if(p<1)return'radar-servo-bolts';
 if(p<2){const step=Math.min(9,Math.floor((p-1)*10));return'radar-jumper-'+['servo-command','servo-positive','servo-return','logic-reference','uno-reference'][Math.floor(step/2)]+(step%2?'-b':'-a');}
 if(p<2.25)return'radar-usb-a-grip';if(p<2.5||p>=2.8&&p<3)return'radar-usb-b-grip';if(p<3)return'radar-shaft';if(p<3.7)return'radar-horn';if(p<4)return'radar-hub-screw';if(p<4.6)return'radar-bracket';if(p<5)return'radar-bracket-bolts';if(p<5.5)return'radar-sonar-pcb';if(p<6)return'radar-sonar-bolts';
 if(p<7){const step=Math.min(7,Math.floor((p-6)*8));return['radar-lead-vcc','radar-lead-trigger','radar-lead-echo','radar-lead-ground'][Math.floor(step/2)]+(step%2?'-uno':'-sonar');}
 return p<8?'radar-target-card':p<9?'radar-usb-b-grip':'radar-sonar-transmitter';
}
