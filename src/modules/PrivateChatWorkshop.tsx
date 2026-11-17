import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, Send } from 'lucide-react';
import { changePacket, createEndpoints, openMessage, sealMessage, type Endpoints, type Packet } from '../data/chat-crypto.mjs';
import source from '../data/chat-crypto.mjs?raw';
import { privateChatProject } from '../data/private-chat-project';
import { download } from './state';
import '../styles/private-chat.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${privateChatProject.id}/${paths[index]}`;
const steps=[
 ['Set up the two endpoints','Generate separate P-256 ECDH key pairs. Each endpoint gets the other endpoint’s public key and derives an AES key with its own private key.'],
 ['Encrypt at the sender','Encode the sample text as UTF-8. Generate a fresh 12-byte nonce and use AES-GCM to encrypt the text and add an authentication tag.'],
 ['Pass a packet through the relay','The simulated relay receives just the nonce and authenticated ciphertext, encoded in Base64. It can forward either the original packet or a changed copy.'],
 ['Open at the recipient','Decrypt using the derived recipient key. Verify that the original text appears. An unrelated key or changed ciphertext must fail authentication.'],
];
const assets=[
 ['Sender and recipient','2 simulated endpoints','Each endpoint generates its own private/public key pair.'],
 ['Relay packet','2 fields','The nonce and ciphertext with its authentication tag.'],
 ['Fictional conversation','1 editable message','Use sample text to follow the encryption and decryption steps.'],
 ['Web Crypto module','1 JavaScript file','Uses ECDH and AES-GCM in a secure browser context or Node.js.'],
 ['Test runner','1 JavaScript file','Checks the matching key and rejects a wrong key or changed packet.'],
];

function ChatArt(){
 return <section className="ec-card ec-preview" aria-label="Encrypted chat preview">
  <div><Send size={24}/><strong>Sender</strong><p>Meet at the robotics lab.</p></div>
  <div><LockKeyhole size={24}/><strong>Relay</strong><p>Nonce and ciphertext</p></div>
  <div><KeyRound size={24}/><strong>Recipient</strong><p>Meet at the robotics lab.</p></div>
 </section>;
}

function ChatDemo(){
 const [text,setText]=useState('Meet at the robotics lab.');
 const [packet,setPacket]=useState<Packet|null>(null);
 const [changed,setChanged]=useState(false);
 const [plain,setPlain]=useState('');
 const [status,setStatus]=useState('Create a packet to start.');
 const [busy,setBusy]=useState(false);
 const keys=useRef<Endpoints|null>(null);
 const displayed=packet&&changed?changePacket(packet):packet;
 async function send(){
  if(busy)return;
  setBusy(true);setPlain('');
  try{
   if(!globalThis.crypto?.subtle)throw new Error('Web Crypto unavailable');
   keys.current??=await createEndpoints();
   const encrypted=await sealMessage(keys.current.sealKey,text);
   setPacket(encrypted);setChanged(false);setStatus('Packet sent to relay · Recipient can try opening it.');
  }catch{setStatus('Could not encrypt. Check the message and open the demo on localhost or HTTPS.');}
  finally{setBusy(false);}
 }
 async function open(wrong:boolean){
  if(!displayed||!keys.current||busy)return;
  setBusy(true);setPlain('');
  try{
   setPlain(await openMessage(wrong?keys.current.wrongKey:keys.current.openKey,displayed));
   setStatus('Authentication passed · Message opened.');
  }catch{setStatus('Authentication failed · Message could not be opened.');}
  finally{setBusy(false);}
 }
 return <>
  <div className="ec-flow">
   <section className="ec-card" aria-label="Sender endpoint"><h3><Send size={18}/> Sender</h3>
    <label htmlFor="ec-message">Fictional message</label><textarea id="ec-message" value={text} maxLength={240} rows={4} onChange={event=>setText(event.target.value)}/>
    <button className="gp-button" type="button" disabled={busy||!text.trim()} onClick={()=>void send()}>Encrypt and send</button>
   </section>
   <section className="ec-card" aria-label="Ciphertext relay"><h3><LockKeyhole size={18}/> Relay</h3>
    {displayed?<><dl className="ec-packet"><dt>Nonce</dt><dd>{displayed.nonce}</dd><dt>Authenticated ciphertext</dt><dd>{displayed.ciphertext}</dd></dl>
     <button className="gp-button gp-secondary" type="button" disabled={busy} onClick={()=>{setChanged(!changed);setPlain('');setStatus(changed?'Original packet restored.':'One ciphertext byte changed.');}}>{changed?'Restore original packet':'Change one byte'}</button></>:<p>Waiting for a packet.</p>}
   </section>
   <section className="ec-card" aria-label="Recipient endpoint"><h3><KeyRound size={18}/> Recipient</h3>
    <div className="ec-opened" aria-label="Recovered text">{plain||'No message opened.'}</div>
    <div className="gp-steps"><button type="button" disabled={busy||!packet} onClick={()=>void open(false)}>Open with recipient key</button><button type="button" disabled={busy||!packet} onClick={()=>void open(true)}>Try unrelated key</button></div>
   </section>
  </div>
  <p role="status" className="ec-status">{status}</p>
 </>;
}
export default function PrivateChatWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page ec-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="ec-header"><LockKeyhole size={34} aria-hidden="true"/><div><h1>{privateChatProject.title}</h1><p>{privateChatProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel ec-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="ec-grid"><section className="ec-card"><h3>What you’ll build</h3><p>A local chat exercise that runs the two endpoints and the relay side by side in one page. The relay panel shows exactly what it receives.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Recover the original sample with the recipient key and verify that an unrelated key or changed packet is rejected.</p>
   </section><ChatArt/></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="ec-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="ec-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="ec-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div>
    <ol className="ec-map" aria-label="Data connection map">{['Sender plaintext','AES-GCM seal','Relay nonce and ciphertext','Recipient authentication and plaintext'].map(item=><li key={item}>{item}</li>)}</ol></>}
   {stage===3&&<div className="ec-grid"><section className="ec-card"><h3>Run the local trial</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> A secure browser context or Node.js 22 or later with Web Crypto.</p>
    <ol className="gp-program-steps"><li>Save both files into the same folder.</li><li>Run <code>node chat_crypto_trial.mjs</code>.</li><li>Expect the recipient to recover the sample, and both altered input trials to fail.</li><li>In the browser, send the same message twice. Check that the relay nonce and ciphertext change.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('chat-crypto.mjs',source)}>Download crypto module</button><a className="gp-button gp-secondary" href="./project-files/chat_crypto_trial.mjs" download>Download trial runner</a></div>
   </section><section className="ec-card"><h3>Understand the boundary</h3><p>This demo provides both public keys directly inside a single browser page and simulates the relay. A real chat app also needs verifiable peer identities, authenticated key exchange and a secure deployment.</p>
    <p>Base64 is an encoding for the packet bytes. Encryption and authentication come from AES-GCM.</p></section></div>}
   {stage===4&&<ChatDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
