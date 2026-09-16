(()=>{'use strict';
const $=s=>document.querySelector(s);
const safe=v=>typeof v==='string'?v:'';
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(path);return r.json()}
async function hydrate(){
  const state=$('#buildState'),phase=$('#phase'),lineage=$('#lineageData'),field=$('#fieldData');
  try{
    const [ledger,experiment,logbook]=await Promise.all([json('/grimoire/ledger.json'),json('/grimoire/experiment.json'),json('/grimoire/logbook.json')]);
    const p=safe(ledger.phase||experiment.phase||ledger.current_phase).toUpperCase(); if(p)phase.textContent=p+' / ACTIVE';
    const nodes=ledger.lineage||ledger.nodes||ledger.releases;
    if(Array.isArray(nodes)&&nodes.length){lineage.textContent=nodes.map(x=>safe(x.name||x.id||x.title||x)).filter(Boolean).join('  →  ')}
    const entries=Array.isArray(logbook)?logbook:(logbook.entries||logbook.logbook||[]);
    if(entries.length){field.innerHTML='';entries.slice(-5).reverse().forEach(e=>{const a=document.createElement('article');const title=safe(e.title||e.event||e.type||e.id||'RETURN');const date=safe(e.date||e.timestamp||e.at||'');a.innerHTML=`<b>${title}</b><p>${date}</p>`;field.appendChild(a)})}
    else field.innerHTML='<p>Persistent ledger loaded. No public RETURN entries are promoted here without canonical data.</p>';
    state.textContent='CANON: PERSISTENT / GIT-BACKED';
  }catch(e){state.textContent='CANON: SOURCE UNAVAILABLE';field.innerHTML='<p>Persistent source unavailable. The interface will not invent replacement data.</p>'}
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){document.body.dataset.state=e.target.dataset.state||''}}),{threshold:.55});
document.querySelectorAll('.view').forEach(v=>io.observe(v));
hydrate();
})();