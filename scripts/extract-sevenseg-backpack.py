"""Extract Adafruit 0.56 inch seven-segment backpack Eagle XY geometry. Derived data: CC BY-SA.
Original notices are preserved in public/third-party/adafruit-sevenseg-backpack.
Component heights and PCB thickness are not supplied by this 2D CAD extraction.
"""
from pathlib import Path
import hashlib,json,math,urllib.request,urllib.parse,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
base='https://raw.githubusercontent.com/adafruit/Adafruit-LED-Backpacks/master/'
board_name='Adafruit 7seg backpack.brd'
raw=urllib.request.urlopen(base+urllib.parse.quote(board_name)).read()
b=ET.fromstring(raw).find('.//board')
packages={}
for library in b.findall('./libraries/library'):
 for package in library.findall('./packages/package'):
  packages[library.get('name')+'/'+package.get('name')]={kind:[dict(p.attrib) for p in package.findall(kind)] for kind in ['pad','smd','wire','rectangle','circle']}
data={'source':base+urllib.parse.quote(board_name),'sha256':hashlib.sha256(raw).hexdigest(),'units':'mm','outline':[dict(w.attrib) for w in b.findall('./plain/wire') if w.get('layer')=='20'],'holes':[dict(h.attrib) for h in b.findall('./plain/hole')],'elements':[dict(e.attrib) for e in b.findall('./elements/element')],'packages':packages,'traces':[],'pads':[]}
nets={(c.get('element'),c.get('pad')):s.get('name') for s in b.findall('./signals/signal') for c in s.findall('contactref')}
data['nets']={s.get('name'):[dict(c.attrib) for c in s.findall('contactref')] for s in b.findall('./signals/signal')}
for signal in b.findall('./signals/signal'):
 data['traces'] += [dict(w.attrib,net=signal.get('name')) for w in signal.findall('wire') if w.get('layer') in ['1','16']]
for e in data['elements']:
 package=packages[e['library']+'/'+e['package']];rot=e.get('rot','R0');angle=math.radians(float(rot.split('R')[-1]));mirror=-1 if 'M' in rot else 1
 for p in package['pad']:
  x=float(p['x'])*mirror;y=float(p['y']);data['pads'].append({'element':e['name'],'name':p['name'],'x':round(float(e['x'])+x*math.cos(angle)-y*math.sin(angle),6),'y':round(float(e['y'])+x*math.sin(angle)+y*math.cos(angle),6),'drill':float(p['drill']),'diameter':float(p.get('diameter',1.778)),'net':nets.get((e['name'],p['name']))})
(root/'src/data/ht16k33-sevenseg-layout.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
notices=root/'public/third-party/adafruit-sevenseg-backpack'
notices.mkdir(parents=True,exist_ok=True)
for name in ['README.md','license.txt']:(notices/name).write_bytes(urllib.request.urlopen(base+name).read())
(notices/'DERIVATION.txt').write_text('CAD source: '+base+urllib.parse.quote(board_name)+'\nSHA256: '+data['sha256']+'\nDerived XY board / pad / copper data: src/data/ht16k33-sevenseg-layout.json\nExtraction script: scripts/extract-sevenseg-backpack.py\nOriginal design by Adafruit Industries; original attribution and CC BY-SA terms are in README.md and license.txt.\n3D heights and surface materials are authored visual approximations, not manufacturer CAD.\n')
print('Seven-segment backpack extracted',len(data['elements']),'elements,',len(data['pads']),'through-hole pads,',len(data['traces']),'copper traces')
