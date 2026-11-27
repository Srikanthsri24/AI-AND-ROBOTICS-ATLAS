"""Extract reference PCB coordinates. Input: official Adafruit .brd path.
Derived data remains CC BY-SA 3.0; see docs/third-party/adafruit-mosfet/.
"""
import json, math, pathlib, sys, xml.etree.ElementTree as ET
board=ET.parse(sys.argv[1]).getroot().find('.//board')
elements={e.get('name'):dict(e.attrib) for e in board.findall('elements/element')}
packages={p.get('name'):p for p in board.findall('libraries/library/packages/package')}
nets={(c.get('element'),c.get('pad')):s.get('name') for s in board.findall('signals/signal') for c in s.findall('contactref')}
pads=[]
for name in ['JP1','JP3','X4','X1','Q1','D3','U$1','U$8']:
    e=elements[name]; angle=math.radians(float(e.get('rot','R0').replace('R','')))
    for p in packages[e['package']]:
        if p.tag not in ['pad','smd']: continue
        x,y=float(p.get('x')),float(p.get('y'))
        pads.append({'element':name,'name':p.get('name'),'x':round(float(e['x'])+x*math.cos(angle)-y*math.sin(angle),6),'y':round(float(e['y'])+x*math.sin(angle)+y*math.cos(angle),6),'drill':float(p.get('drill','0')),'net':nets.get((name,p.get('name')),'MOUNT' if name in ['U$1','U$8'] else 'NC')})
data={'source':'https://github.com/adafruit/Adafruit-MOSFET-Driver-STEMMA-PCB','license':'CC-BY-SA-3.0','width':25.4,'height':17.78,'outline':[dict(w.attrib) for w in board.findall('plain/wire') if w.get('layer')=='20'],'elements':[elements[n] for n in ['Q1','D3','D1','D2','R1','R2','R3','C1','X1','X4']],'pads':pads,'tracks':[dict(w.attrib) for w in board.findall('signals/signal/wire') if w.get('layer')=='1']}
pathlib.Path('src/data/tap-mosfet-layout.json').write_text(json.dumps(data,indent=2)+'\n')
