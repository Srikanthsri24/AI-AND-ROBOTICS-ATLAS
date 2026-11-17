const agreement={name:'ECDH',namedCurve:'P-256'};
const cipher={name:'AES-GCM',length:256};
const encoder=new TextEncoder();
const context=encoder.encode('sender → recipient');

export async function createEndpoints(){
 const [sender,recipient]=await Promise.all([0,1].map(()=>crypto.subtle.generateKey(agreement,false,['deriveKey'])));
 const derive=(privateKey,publicKey,usage)=>crypto.subtle.deriveKey(
  {name:'ECDH',public:publicKey},privateKey,cipher,false,[usage],
 );
 const [sealKey,openKey,wrongKey]=await Promise.all([
  derive(sender.privateKey,recipient.publicKey,'encrypt'),
  derive(recipient.privateKey,sender.publicKey,'decrypt'),
  crypto.subtle.generateKey(cipher,false,['decrypt']),
 ]);
 return {sealKey,openKey,wrongKey};
}

const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));

export async function sealMessage(key,text){
 if(!text.trim()||text.length>240)throw new RangeError('Enter a message of 1–240 characters.');
 const nonce=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:context},key,encoder.encode(text));
 return {nonce:encode(nonce),ciphertext:encode(encrypted)};
}

export async function openMessage(key,packet){
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(packet.nonce),additionalData:context},key,decode(packet.ciphertext));
 return new TextDecoder().decode(plain);
}
export function changePacket(packet){
 const bytes=decode(packet.ciphertext);
 bytes[0]^=1;
 return {...packet,ciphertext:encode(bytes)};
}
