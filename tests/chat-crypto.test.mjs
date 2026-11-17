import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEndpoints,sealMessage,openMessage,changePacket} from '../src/data/chat-crypto.mjs';

test('paired endpoints can recover Unicode text and the relay receives only encoded fields',async()=>{
 const keys=await createEndpoints();
 const text='Meet at the lab 🚀';
 const packet=await sealMessage(keys.sealKey,text);
 assert.deepEqual(Object.keys(packet),['nonce','ciphertext']);
 assert(!JSON.stringify(packet).includes(text));
 assert.equal(await openMessage(keys.openKey,packet),text);
 assert.notEqual((await sealMessage(keys.sealKey,text)).nonce,packet.nonce);
 assert.equal(keys.sealKey.extractable,false);
});

test('wrong key and one changed ciphertext byte fail authentication',async()=>{
 const keys=await createEndpoints();
 const packet=await sealMessage(keys.sealKey,'Sample');
 await assert.rejects(openMessage(keys.wrongKey,packet));
 await assert.rejects(openMessage(keys.openKey,changePacket(packet)));
 await assert.rejects(sealMessage(keys.sealKey,'  '),RangeError);
});
