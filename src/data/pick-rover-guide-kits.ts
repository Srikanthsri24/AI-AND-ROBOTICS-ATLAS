export const pickGuideKitReferences=[
 {id:'chassis',name:'Pick-rover wide acrylic chassis and caster',label:'Matched workshop render · notched deck, four motor-cable bores and retained rear caster'},
 {id:'frame',name:'Pick-rover four-bar lift and parallel-jaw frame',label:'Matched workshop render · assembled mechanical frame; servos and drive adapters are listed separately'},
 {id:'servo-supply',name:'Pick-rover dedicated regulated 6 V servo source',label:'Matched workshop render · separate 6 V actuator source with its output OFF'},
 {id:'mini',name:'Pick-rover 170-point logic board and signal jumpers',label:'Matched workshop render · the actual 170-point board and isolated five-contact ties; signal jumpers are fitted in the wiring steps'},
 {id:'usb-bank',name:'Pick-rover switched 5 V USB source and A-to-B cable',label:'Matched workshop render · portable USB logic source; the computer for uploading is a separate item'},
 {id:'servo',name:'Pick-rover MG996R-style positional servos',label:'Matched workshop render · bare servo body and spline; its three-wire lead is shown in the wiring lessons'},
 {id:'mounting',name:'Pick-rover matching bolt, spacer and retaining hardware',label:'Matched workshop render · the ten M4 clamp stacks, arranged for inspection; smaller fasteners are fitted in their individual steps'},
 {id:'couplers',name:'Pick-rover split lift adapter and jaw drive hub',label:'Matched workshop render · split spline-to-D adapter with cross-bolts/nuts beside the shoulder-bored jaw hub and axial screw'},
 {id:'foam',name:'Pick-rover foam test block and course marks',label:'Matched workshop render · the actual foam payload; mark pickup and delivery positions on the course'},
 {id:'protectors',name:'Pick-rover split rubber cable-bore protectors',label:'Matched workshop render · four split bore protectors arranged for inspection, not their installed positions'},
 {id:'pads',name:'Pick-rover source mounting strips',label:'Matched workshop render · two mounting strips for each source, arranged for inspection'},
 {id:'power-lead',name:'Pick-rover prepared motor and supply leads',label:'Matched workshop render · one prepared motor lead with its soldered end and hollow driver plug; the kit uses eight separately routed power leads'},
]as const;
export type PickGuideKitId=typeof pickGuideKitReferences[number]['id'];
export const pickGuideExtraReferences=[{id:'usb-cable',label:'Matched workshop render · USB-A-to-B cable, both metal shields and contact tongues'},{id:'signal-lead',label:'Matched workshop render · D5-to-PWMA signal jumper with male and female ends'}]as const;
export type PickGuidePartMode=PickGuideKitId|typeof pickGuideExtraReferences[number]['id']|'uno'|'driver'|'motors'|'pca'|'battery';
export const pickGuideName=(id:PickGuideKitId)=>pickGuideKitReferences.find(p=>p.id===id)!.name;
export const pickGuideKitPhotos=Object.fromEntries(pickGuideKitReferences.map(p=>{const extra=p.id==='mini'?pickGuideExtraReferences[1]:p.id==='usb-bank'?pickGuideExtraReferences[0]:undefined;return[p.name,[{path:`./images/project-parts/pick-${p.id}-reference.png`,label:p.label,reference:true},...(extra?[{path:`./images/project-parts/pick-${extra.id}-reference.png`,label:extra.label,reference:true}]:[])]];}));
export const pickGuidePartModes:readonly(PickGuidePartMode|null)[]=['uno','driver','motors','chassis','frame','pca',null,'battery','servo-supply','mini','usb-bank','servo','mounting','couplers','foam','protectors','pads',null,'power-lead'];
