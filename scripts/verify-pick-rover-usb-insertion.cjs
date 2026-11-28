const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('../node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const{pickUsbInsertion}=require('../src/data/pick-rover-usb-insertion.ts'),{pickUsbConnected,pickUsbUnoFace,pickUsbBankFace}=require('../src/data/pick-rover-usb.ts');
let worst=0,lastUno=12,lastBank=12;
for(let n=0;n<=1000;n++){
 const progress=n/1000,p=pickUsbInsertion(progress);
 assert.ok(p.curve.getPoint(0).distanceTo(p.start)<1e-8&&p.curve.getPoint(1).distanceTo(p.end)<1e-8,'cable detached from boot');
 assert.ok(Math.abs(p.uno.x-(pickUsbUnoFace[0]-p.unoWithdrawal))<1e-8&&Math.abs(p.bank.x-(pickUsbBankFace[0]-p.bankWithdrawal))<1e-8);
 assert.ok(p.unoWithdrawal<=lastUno+1e-8&&p.bankWithdrawal<=lastBank+1e-8,'connector backs out');
 if(progress<=.5)assert.equal(p.bankWithdrawal,12,'source connected before Uno seats');
 if(progress>=.5)assert.equal(p.unoWithdrawal,0,'Uno not seated before source insertion');
 assert.equal(pickUsbConnected(false,p.unoWithdrawal,p.bankWithdrawal),false,'off source energizes logic');
 if(progress<.5)assert.equal(pickUsbConnected(true,p.unoWithdrawal,p.bankWithdrawal),false,'incomplete cable powers logic');
 assert.ok(p.curve.points.every(v=>v.toArray().every(Number.isFinite)));
 worst=Math.max(worst,Math.abs(p.curve.getLength()-p.length));lastUno=p.unoWithdrawal;lastBank=p.bankWithdrawal;
}
assert.ok(worst<.001);assert.equal(pickUsbConnected(true,0,0),true);
for(const p of[-1,2,NaN,Infinity])assert.throws(()=>pickUsbInsertion(p));
console.log('1001 POSES / BOTH BOOT EXITS / UNO BEFORE SOURCE / OFF POWER GATE / LENGTH RESIDUAL PASS',worst);
