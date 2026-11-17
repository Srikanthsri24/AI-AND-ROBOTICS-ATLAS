import assert from 'node:assert/strict';
import {createEndpoints,sealMessage,openMessage,changePacket} from './chat-crypto.mjs';

const {sealKey,openKey,wrongKey}=await createEndpoints();
const text='Meet at the robotics lab.';
const packet=await sealMessage(sealKey,text);
assert.deepEqual(Object.keys(packet),['nonce','ciphertext']);
assert.equal(await openMessage(openKey,packet),text);
assert.notEqual((await sealMessage(sealKey,text)).nonce,packet.nonce);
await assert.rejects(openMessage(wrongKey,packet));
await assert.rejects(openMessage(openKey,changePacket(packet)));
console.log('Recipient recovered the sample. A wrong key and a changed packet were both rejected.');
