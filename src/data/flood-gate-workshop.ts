/** Ideal acoustic readings and the published sketch's explicit delays.
 * UART buffering / CPU instruction overhead and water dynamics are not modelled.
 * Actuator slew is authored visual timing, not a measured servo specification.
 */
export type GateWorkshopInputs={upMm:number;downMm:number;upGapMm:number;downGapMm:number;upEmptyMm:number;downEmptyMm:number;upEcho:boolean;downEcho:boolean;logicPower:boolean;servoPower:boolean};
export const gateWorkshopDefaults:GateWorkshopInputs={upMm:0,downMm:0,upGapMm:230,downGapMm:230,upEmptyMm:230,downEmptyMm:230,upEcho:true,downEcho:true,logicPower:true,servoPower:true};
export type GateWorkshopReason='Waiting for upstream'|'Releasing water'|'Upstream recovered'|'Downstream interlock'|'Sensor fault';
export type GateEcho={pulseUs:number;gapMm:number|null;depthMm:number|null};
export function validateGateInputs(i:GateWorkshopInputs){if(![i.upMm,i.downMm,i.upGapMm,i.downGapMm,i.upEmptyMm,i.downEmptyMm].every(Number.isFinite)||i.upMm<0||i.upMm>100||i.downMm<0||i.downMm>100||i.upGapMm<200||i.upGapMm>300||i.downGapMm<200||i.downGapMm>300||!Number.isInteger(i.upEmptyMm)||i.upEmptyMm<200||i.upEmptyMm>300||!Number.isInteger(i.downEmptyMm)||i.downEmptyMm<200||i.downEmptyMm>300)throw Error('Use depths 0–100 mm, dry gaps 200–300 mm and integer calibration references 200–300 mm.');}
export function gateEcho(i:GateWorkshopInputs,channel:'up'|'down'):GateEcho{validateGateInputs(i);const physical=channel==='up'?i.upMm:i.downMm,mount=channel==='up'?i.upGapMm:i.downGapMm,baseline=channel==='up'?i.upEmptyMm:i.downEmptyMm,connected=channel==='up'?i.upEcho:i.downEcho,pulseUs=connected?Math.round(2*(mount-physical)*1000/343):0,gap=Math.floor((pulseUs*343+1000)/2000),valid=pulseUs!==0&&gap>=95&&gap<=baseline+20;return {pulseUs,gapMm:valid?gap:null,depthMm:valid?Math.max(0,baseline-gap):null};}
export function gateWorkshopDecision(up:number|null,down:number|null,opened:boolean):{opened:boolean;reason:GateWorkshopReason}{if(up===null||down===null)return {opened:false,reason:'Sensor fault'};if(down>=60||opened&&down>=up)return {opened:false,reason:'Downstream interlock'};if(opened&&up<=50)return {opened:false,reason:'Upstream recovered'};if(opened||up>=80)return {opened:true,reason:'Releasing water'};return {opened:false,reason:'Waiting for upstream'};}
export type GateWorkshopClock={nowUs:number;nextUs:number;phase:'up-start'|'up-end'|'down-start'|'down-end'|'decide';pending:GateEcho|null;up:GateEcho|null;down:GateEcho|null;reading:{up:GateEcho;down:GateEcho;atUs:number}|null;opened:boolean;reason:GateWorkshopReason;servoAngle:number;cycles:number;serial:string;running:boolean};
export function gateWorkshopInitial(angle=65):GateWorkshopClock{if(!Number.isFinite(angle)||angle<65||angle>120)throw Error('Invalid illustrated servo angle.');return {nowUs:0,nextUs:0,phase:'up-start',pending:null,up:null,down:null,reading:null,opened:false,reason:'Waiting for upstream',servoAngle:angle,cycles:0,serial:'Run the station to collect both echoes.',running:false};}
function moveServo(angle:number,opened:boolean,us:number,i:GateWorkshopInputs){if(!i.logicPower||!i.servoPower)return angle;const target=opened?120:65,step=120*us/1e6;return angle+Math.sign(target-angle)*Math.min(Math.abs(target-angle),step);}
/** The second sensor latches its target at its own trigger, 60 ms after the
 * upstream echo completes. Decisions occur only after the second 60 ms wait.
 */
export function gateWorkshopAdvance(previous:GateWorkshopClock,seconds:number,i:GateWorkshopInputs):GateWorkshopClock{
 validateGateInputs(i);if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 seconds.');if(!previous.running)return previous;
 if(!i.logicPower)return {...gateWorkshopInitial(previous.servoAngle),nowUs:previous.nowUs,nextUs:previous.nowUs,running:true,serial:'USB logic power disconnected; no gate command.'};
 let s={...previous},time=s.nowUs;const end=time+Math.round(seconds*1e6);
 while(s.nextUs<=end){const event=s.nextUs;s.servoAngle=moveServo(s.servoAngle,s.opened,event-time,i);time=event;
  if(s.phase==='up-start'){s.pending=gateEcho(i,'up');s.nextUs=event+12+(s.pending.pulseUs||6000);s.phase='up-end';}
  else if(s.phase==='up-end'){s.up=s.pending;s.pending=null;s.nextUs=event+60000;s.phase='down-start';}
  else if(s.phase==='down-start'){s.pending=gateEcho(i,'down');s.nextUs=event+12+(s.pending.pulseUs||6000);s.phase='down-end';}
  else if(s.phase==='down-end'){s.down=s.pending;s.pending=null;s.nextUs=event+60000;s.phase='decide';}
  else{const decision=gateWorkshopDecision(s.up?.depthMm??null,s.down?.depthMm??null,s.opened);s={...s,...decision,reading:{up:s.up!,down:s.down!,atUs:event},cycles:s.cycles+1,serial:`Upstream mm: ${s.up?.depthMm??-1}  Downstream mm: ${s.down?.depthMm??-1}  Gate: ${decision.opened?'OPEN':'CLOSED'}  ${decision.reason}`,phase:'up-start',nextUs:event};}
 }
 s.servoAngle=moveServo(s.servoAngle,s.opened,end-time,i);s.nowUs=end;return s;
}

/** Side-plane linkage in native millimetres: the servo axis stays dry above the
 * basin. The pin-ended rod has one fixed length; the flap follows circle-circle
 * intersection geometry rather than an independent decorative rotation.
 */
export const gateLinkage={flapPivot:[4,88] as const,servoPivot:[4,180] as const,flapRadius:60,hornRadius:18,closedServo:65,openServo:120};
function hornAt(degrees:number):[number,number]{const a=(degrees-90)*Math.PI/180;return [4+18*Math.cos(a),180+18*Math.sin(a)];}
const closedHorn=hornAt(65);
export const gateRodLength=Math.hypot(closedHorn[0]-4,closedHorn[1]-28);
export function gateLinkagePose(degrees:number){if(!Number.isFinite(degrees)||degrees<65||degrees>120)throw Error('Servo command must stay within the checked 65–120° travel.');const horn=hornAt(degrees),dx=horn[0]-4,dy=horn[1]-88,d=Math.hypot(dx,dy),r=60,L=gateRodLength,a=(r*r-L*L+d*d)/(2*d),h=Math.sqrt(Math.max(0,r*r-a*a)),ux=dx/d,uy=dy/d,attachment:[number,number]=[4+a*ux+h*uy,88+a*uy-h*ux],flapDegrees=Math.atan2(attachment[0]-4,88-attachment[1])*180/Math.PI;return {horn,attachment,flapDegrees,rodLength:Math.hypot(horn[0]-attachment[0],horn[1]-attachment[1])};}
