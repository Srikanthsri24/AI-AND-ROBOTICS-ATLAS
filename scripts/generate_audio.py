#!/usr/bin/env python3
"""Generate original scripts with local eSpeak NG. No Apple voice assets are used."""
import json, subprocess, wave, pathlib, concurrent.futures, array, shutil
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'src/data/lesson.json').read_text())
engine=shutil.which('espeak-ng') or '/usr/local/bin/espeak-ng'
def make(job):
 lang,voice,i,j,text=job
 path=root/f'public/audio/{lang}/{i+1}-{j+1}.wav';speed=165
 for attempt in range(8):
  subprocess.run([engine,'-v',voice,'-s',str(speed),'-w',str(path),text],check=True,capture_output=True)
  with wave.open(str(path),'rb') as w: rate=w.getframerate();channels=w.getnchannels();samples=array.array('h',w.readframes(w.getnframes()))
  duration=len(samples)/rate/channels
  if duration<=14.7: break
  speed=int(speed*duration/14.2)+3
 if duration>15: raise RuntimeError(f'Audio exceeds slot: {path}')
 samples.extend([0]*(15*rate*channels-len(samples)))
 with wave.open(str(path),'wb') as w: w.setnchannels(channels);w.setsampwidth(2);w.setframerate(rate);w.writeframes(samples.tobytes())
 return {'path':str(path.relative_to(root)),'engine':'eSpeak NG 1.52.0','voice':voice,'spokenDuration':duration,'slotDuration':15,'rate':speed}
jobs=[(lang,voice,i,j,seg['text'][lang]) for i,s in enumerate(data['scenes']) for j,seg in enumerate(s['segments']) for lang,voice in [('english','en-in'),('telugu','te'),('hindi','hi')]]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: results=list(pool.map(make,jobs))
(root/'public/audio/manifest.json').write_text(json.dumps(results,indent=2))
print(f'Generated {len(results)} aligned 15-second WAVs using eSpeak NG.')
