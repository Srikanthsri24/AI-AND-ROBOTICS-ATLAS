"""Reproduce factual pad / trace coordinates from Adafruit's CC BY-SA 3.0 microB board.
Source archive is retained in asset-sources/adafruit-micro-b with its license.
"""
from pathlib import Path
import hashlib,json,xml.etree.ElementTree as E
root=Path(__file__).resolve().parents[1];source=root/'asset-sources/adafruit-micro-b/microB.brd';raw=source.read_bytes();board=E.fromstring(raw).find('./drawing/board')
packages={p.get('name'):p for p in board.findall('./libraries/library/packages/package')};nets={(p.get('element'),p.get('pad')):s.get('name') for s in board.findall('./signals/signal') for p in s.findall('contactref')}
elements=[]
for e in board.findall('./elements/element'):
 p=packages[e.get('package')];elements.append({**e.attrib,'pads':[{**x.attrib,'kind':x.tag,'net':nets.get((e.get('name'),x.get('name')))} for x in p if x.tag in ['pad','smd']],'holes':[x.attrib for x in p if x.tag=='hole']})
out={'source':'https://github.com/adafruit/Adafruit-SMT-Breakout-PCBs/blob/master/microB.brd','sourceSha256':hashlib.sha256(raw).hexdigest(),'productSource':'https://www.adafruit.com/product/1833','license':'CC BY-SA 3.0','licenseURI':'https://creativecommons.org/licenses/by-sa/3.0/','attribution':'Adafruit Industries USB Micro-B breakout Eagle layout, adapted as a 3D educational model; original hardware design CC BY-SA 3.0.','units':'mm','width':20.32,'length':10.16,'thickness':1.6,'outline':[w.attrib for w in board.findall('./plain/wire') if w.get('layer')=='20'],'elements':elements,'tracks':[w.attrib for s in board.findall('./signals/signal') for w in s.findall('wire') if w.get('layer')=='1']}
p=root/'src/data/usb-micro-breakout-layout.json';p.write_text(json.dumps(out,separators=(',',':'))+'\n');print('Saved',len(elements),'elements and',len(out['tracks']),'top tracks')
