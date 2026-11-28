// Only these rigid, manufactured servo-case interfaces intentionally share
// material. This is not permission for moving links, gears or brackets to clip.
const interfaces=new Set(['body / mounts','body / relief','gearcase / mounts','case-screws / mounts']);
function factoryInterface(owners){const parts=owners.map(id=>id.match(/^(ra-arm-(?:base|shoulder|elbow|pitch|roll|grip)-servo)-(body|mounts|relief|gearcase|case-screws)$/));return parts.every(Boolean)&&parts[0][1]===parts[1][1]&&interfaces.has(parts.map(p=>p[2]).sort().join(' / '));}
function unexpectedArmContacts(groups,mechanicalOwners){const scope=new Set(mechanicalOwners);return groups.filter(g=>g.owners.some(id=>scope.has(id))&&!factoryInterface(g.owners));}
module.exports={unexpectedArmContacts};
