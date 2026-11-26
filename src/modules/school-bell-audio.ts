/** Browser audio illustrates the sketch's commanded frequency, not measured
 * acoustic loudness or a physical piezo frequency response. Call resume() on
 * the supplied context from the user's sound button before enabling output. */
export function createSchoolBellTone(context:AudioContext){
 const oscillator=context.createOscillator(),gain=context.createGain();let disposed=false;
 oscillator.type='square';oscillator.frequency.value=880;gain.gain.value=0;
 oscillator.connect(gain);gain.connect(context.destination);oscillator.start();
 return {output:gain,setPitch(pitch:number){if(!Number.isFinite(pitch)||pitch<0||pitch>20000)throw new RangeError('Invalid bell tone frequency');if(disposed)return;const now=context.currentTime;if(pitch>0)oscillator.frequency.setValueAtTime(pitch,now);gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(pitch>0?.015:0,now,.003);},dispose(){if(disposed)return;disposed=true;gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setValueAtTime(0,context.currentTime);oscillator.stop();oscillator.disconnect();gain.disconnect();}};
}
