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
 tminus:{index:'RUNE 08',name:'T−0.00001',meaning:'Precursor / before visible creation'},
 artist:{index:'RUNE 09',name:'THE ARTIST',meaning:'Declared artist voice / authorship / active emitter'}
};
const ARTIST_RUNE='M0,-28 L0,28 M0,-12 L-17,-26 M0,-12 L17,-26 M-13,8 L0,-2 L13,8 M-12,25 L0,14 L12,25';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
function buildArtistRune(){
 if(document.getElementById('artistRune'))return;
 const b=document.createElement('button');
 b.id='artistRune';b.className='artist-rune';b.type='button';
 b.setAttribute('aria-label','Open KXTXR artist chamber');
 b.innerHTML=`<svg viewBox="-40 -40 80 80" aria-hidden="true"><circle cx="0" cy="0" r="31"/><path d="${ARTIST_RUNE}"/></svg><span>RUNE 09 · THE ARTIST</span>`;
 b.addEventListener('click',openArtist);
 document.body.appendChild(b);
}
function legendMarkup(){
 return Object.values(RUNES).map(r=>`<div class="rune-legend-item"><b>${esc(r.index)} · ${esc(r.name)}</b><span>${esc(r.meaning)}</span></div>`).join('');
}
function networkMarkup(items){
 return (items||[]).map(item=>`<a class="network-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(item.label)}</b><small>${esc(item.status)}</small></a>`).join('');
}
async function loadArtist(){
 const r=await fetch('/grimoire/artist-presence.json',{cache:'no-store'});
 if(!r.ok)throw new Error(`ARTIST_HTTP_${r.status}`);
 return r.json();
}
async function openArtist(){
 let chamber=document.getElementById('artistChamber');
 if(!chamber){
   chamber=document.createElement('section');chamber.id='artistChamber';chamber.className='artist-chamber';chamber.setAttribute('aria-hidden','true');
   chamber.innerHTML=`<div class="artist-scrim" data-close-artist></div><article class="artist-panel"><button class="artist-close" data-close-artist>CLOSE ×</button><div id="artistBody"><div class="artist-kicker">KXTXR / DECLARED ARTIST VOICE</div><h2 class="artist-title">THE ARTIST</h2><p class="artist-boundary">LOADING DECLARED PRESENCE…</p></div></article>`;
   document.body.appendChild(chamber);
   chamber.querySelectorAll('[data-close-artist]').forEach(x=>x.addEventListener('click',closeArtist));
 }
 chamber.classList.add('open');chamber.setAttribute('aria-hidden','false');
 try{
   const d=await loadArtist();
   document.getElementById('artistBody').innerHTML=`
    <div class="artist-kicker">${esc(d.id)} · ${esc(d.epistemic_class)} · ${esc(d.state)}</div>
    <h2 class="artist-title">${esc(d.artist)}</h2>
    <div class="artist-voice">${esc(d.voice?.statement)}</div>
    <div class="artist-invitation">${esc(d.voice?.invitation)}</div>
    <div class="network-grid">${networkMarkup(d.network_gateways)}</div>
    <div class="artist-boundary">${esc(d.voice?.boundary)}<br><br>${esc(d.rule)}</div>
    <section class="rune-legend"><h3>Persistent rune grammar</h3><div class="rune-legend-grid">${legendMarkup()}</div></section>`;
 }catch(err){
   document.getElementById('artistBody').innerHTML=`<div class="artist-kicker">KXTXR / ARTIST PRESENCE</div><h2 class="artist-title">THE ARTIST</h2><p class="artist-boundary">Artist presence unavailable: ${esc(err.message)}</p><section class="rune-legend"><h3>Persistent rune grammar</h3><div class="rune-legend-grid">${legendMarkup()}</div></section>`;
 }
}
function closeArtist(){const c=document.getElementById('artistChamber');if(c){c.classList.remove('open');c.setAttribute('aria-hidden','true')}}
function install(){annotateExistingRunes();buildArtistRune();const obs=new MutationObserver(()=>annotateExistingRunes());const orbit=document.getElementById('runeOrbit');if(orbit)obs.observe(orbit,{childList:true,subtree:true});window.addEventListener('keydown',e=>{if(e.key==='Escape')closeArtist()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,80));else setTimeout(install,80);
})();
