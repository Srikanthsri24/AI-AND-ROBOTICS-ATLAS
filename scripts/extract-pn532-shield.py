"""Extract Adafruit PN532 shield v1.3 Eagle XY geometry. Derived data: CC BY-SA.
Original notices are preserved in public/third-party/adafruit-pn532-shield.
Component heights and PCB thickness are not supplied by this 2D CAD extraction.
"""
from pathlib import Path
import hashlib,json,math,urllib.request,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
base='https://raw.githubusercontent.com/adafruit/Adafruit-PN532-RFID-NFC-Shield/master/'
board_name='Adafruit_PN532_Shield_v1.3.brd'
raw=urllib.request.urlopen(base+board_name).read()
b=ET.fromstring(raw).find('.//board')
packages={}
for library in b.findall('./libraries/library'):
 for package in library.findall('./packages/package'):
  packages[library.get('name')+'/'+package.get('name')]={kind:[dict(p.attrib) for p in package.findall(kind)] for kind in ['pad','smd','wire','rectangle','circle']}
data={'source':base+board_name,'sha256':hashlib.sha256(raw).hexdigest(),'units':'mm','outline':[dict(w.attrib) for w in b.findall('./plain/wire') if w.get('layer')=='20'],'holes':[dict(h.attrib) for h in b.findall('./plain/hole')],'elements':[dict(e.attrib) for e in b.findall('./elements/element')],'packages':packages,'antenna':[],'pads':[]}
nets={(c.get('element'),c.get('pad')):s.get('name') for s in b.findall('./signals/signal') for c in s.findall('contactref')}
for signal in b.findall('./signals/signal'):
 if signal.get('name') in ['N$4','N$5','TX1_ANTENNA','TX2_ANTENNA']:
  data['antenna'] += [dict(w.attrib,net=signal.get('name')) for w in signal.findall('wire')]
for e in data['elements']:
 package=packages[e['library']+'/'+e['package']];rot=e.get('rot','R0');angle=math.radians(float(rot.split('R')[-1]));mirror=-1 if 'M' in rot else 1
 for p in package['pad']:
  x=float(p['x'])*mirror;y=float(p['y']);data['pads'].append({'element':e['name'],'name':p['name'],'x':round(float(e['x'])+x*math.cos(angle)-y*math.sin(angle),6),'y':round(float(e['y'])+x*math.sin(angle)+y*math.cos(angle),6),'drill':float(p['drill']),'diameter':float(p.get('diameter',1.778)),'net':nets.get((e['name'],p['name']))})
(root/'src/data/pn532-shield-layout.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
notices=root/'public/third-party/adafruit-pn532-shield'
notices.mkdir(parents=True,exist_ok=True)
for name in ['README.md','license.txt']:(notices/name).write_bytes(urllib.request.urlopen(base+name).read())
(notices/'DERIVATION.txt').write_text('CAD source: '+base+board_name+'\nSHA256: '+data['sha256']+'\nDerived XY board / pad / antenna data: src/data/pn532-shield-layout.json\nExtraction script: scripts/extract-pn532-shield.py\nOriginal design by Adafruit Industries; original attribution and CC BY-SA terms are in README.md and license.txt.\n3D heights and surface materials are authored visual approximations, not manufacturer CAD.\n')
print('PN532 extracted',len(data['elements']),'elements,',len(data['pads']),'through-hole pads,',len(data['antenna']),'antenna wires')
