"""Extract factual board / pad dimensions from Espressif's published V4 DXF.
Usage: python3 scripts/extract-esp32-devkitc-dimensions.py /path/to/source.dxf
The original drawing is not redistributed; its source hash is retained.
"""
import hashlib,json,sys
from pathlib import Path
raw=Path(sys.argv[1]).read_bytes();lines=raw.decode(errors='replace').splitlines();pairs=[(lines[i].strip(),lines[i+1].strip()) for i in range(0,len(lines)-1,2)]
entities=[];section='';current=[]
def finish(e):
 if section=='ENTITIES' and e:entities.append(e)
for code,value in pairs:
 if code=='0':
  finish(current);current=[(code,value)]
  if value=='ENDSEC':section=''
 elif code=='2' and current and current[0][1]=='SECTION':section=value;current.append((code,value))
 else:current.append((code,value))
finish(current)
def norm(x,y):return [round(float(x)-500.000016,6),round(float(y)-399.999962,6)]
pads={}
for e in entities:
 d=dict(e)
 if d.get('0')=='INSERT' and d.get('8')=='0':pads.setdefault(d['2'],set()).add(tuple(norm(d['10'],d['20'])))
header=sorted(pads['ROUND_370']);left=sorted([p for p in header if p[0]<14],key=lambda p:-p[1]);right=sorted([p for p in header if p[0]>14],key=lambda p:-p[1]);assert len(left)==len(right)==19
names=[['3V3','EN','VP','VN','IO34','IO35','IO32','IO33','IO25','IO26','IO27','IO14','IO12','GND','IO13','D2','D3','CMD','5V'],['GND','IO23','IO22','TX','RX','IO21','GND','IO19','IO18','IO5','IO17','IO16','IO4','IO0','IO2','IO15','D1','D0','CLK']]
headers=[{'row':row,'pad':i+1,'name':name,'at':p} for row,ps,ns in zip(['J2','J3'],[left,right],names) for i,(name,p) in enumerate(zip(ns,ps))]
module_side=[p for p in sorted(pads['RECTANGLE_23']) if (abs(p[0]-5.49529)<1e-5 or abs(p[0]-22.495256)<1e-5) and p[1]>=30.29]
assert len(module_side)==28
out={'source':'https://dl.espressif.com/dl/schematics/esp32_devkitc_v4_dimensions.dxf','sourceSha256':hashlib.sha256(raw).hexdigest(),'pinSource':'https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html','attribution':'Factual dimensions and pad centres extracted from Espressif Systems ESP32-DevKitC V4 drawing; original drawing copyright belongs to Espressif. No original drawing is redistributed.','units':'mm','pcb':{'width':27.94,'length':48.26,'cornerRadius':1,'thickness':1.6,'mountingHoles':[]},'module':{'name':'ESP32-WROOM-32E','min':[5,28.8],'max':[23,54.30012],'shieldTop':48.2986,'pads':module_side+sorted(pads['RECTANGLE_24'])},'headers':headers,'footprints':{k:[list(p) for p in sorted(ps)] for k,ps in pads.items() if k in ['RECTANGLE_26','RECTANGLE_27','SQUARE_28','RECTANGLE_29','OBLONG_16','ROUND_387','RECTANGLE_368','SQUARE_369','SQUARE_371','RECTANGLE_18','RECTANGLE_19','RECTANGLE_20','RECTANGLE_21','RECTANGLE_375']}}
target=Path(__file__).resolve().parents[1]/'src/data/esp32-devkitc-v4-layout.json';target.write_text(json.dumps(out,separators=(',',':'))+'\n');print('Saved',len(headers),'header contacts and',len(out['module']['pads']),'module pads to',target)
