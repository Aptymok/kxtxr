(function(){
'use strict';
const RUNES={
 creation:{index:'RUNE 01',name:'CREATION',meaning:'Origin / formation / first inscription'},
 field:{index:'RUNE 02',name:'FIELD',meaning:'Residue / world contact / external trace'},
 frecuency:{index:'RUNE 03',name:'FRECUENCY',meaning:'Signal grammar / recurrence / sequence'},
 lab:{index:'RUNE 04',name:'LAB',meaning:'Transformation / reaction / return design'},
 notes:{index:'RUNE 05',name:'NOTES',meaning:'Persistent memory / longitudinal ledger'},
 objects:{index:'RUNE 06',name:'OBJECTS',meaning:'Carrier / artifact / material body'},
 reconstructions:{index:'RUNE 07',name:'RECONSTRUCTIONS',meaning:'Projected branch / candidate inheritance'},
 tminus:{index:'RUNE 08',name:'T−0.00001',meaning:'Precursor / before visible creation'}
};
function annotateExistingRunes(){
 document.querySelectorAll('.rune-node').forEach(node=>{
   const key=node.dataset.layer;
   const meta=RUNES[key];
   if(!meta)return;
   node.dataset.runeIndex=meta.index;
   node.dataset.runeName=meta.name;
   node.title=`${meta.name} — ${meta.meaning}`;
 });
}
function install(){
 annotateExistingRunes();
 const obs=new MutationObserver(()=>annotateExistingRunes());
 const orbit=document.getElementById('runeOrbit');
 if(orbit)obs.observe(orbit,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,80));else setTimeout(install,80);
})();
