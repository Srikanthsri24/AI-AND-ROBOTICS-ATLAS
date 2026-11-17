export type Packet={nonce:string;ciphertext:string};
export type Endpoints={sealKey:CryptoKey;openKey:CryptoKey;wrongKey:CryptoKey};
export function createEndpoints():Promise<Endpoints>;
export function sealMessage(key:CryptoKey,text:string):Promise<Packet>;
export function openMessage(key:CryptoKey,packet:Packet):Promise<string>;
export function changePacket(packet:Packet):Packet;
