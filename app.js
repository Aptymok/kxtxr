(function(){
'use strict';
let C=null;

const LAYER_ORDER=['creation','field','frecuency','lab','notes','objects','reconstructions','tminus'];
const SECTION_MAP={creation:'Creation',field:'Field',frecuency:'Frecuency',lab:'Alchemical Lab',notes:'Notes',objects:'Objects',reconstructions:'Reconstructions',tminus:'[ T - 0.00001 ]'};
const META={
 creation:{subtitle:'Origin Codex',status:'GENESIS ACTIVE',source:'Lore Archive',mode:'Foundational',integrity:'0.94'},
 field:{subtitle:'Signal Observatory',status:'REM618 TRACE ACTIVE',source:'REM618',mode:'Observed',integrity:'0.91'},
 frecuency:{subtitle:'Signal Grammar',status:'CHAIN ONLINE',source:'Sequence Core',mode:'Linked',integrity:'0.96'},
 lab:{subtitle:'Reaction Matrix',status:'REACTION OPEN',source:'Return Design',mode:'Reactive',integrity:'0.89'},
 notes:{subtitle:'Memory Ledger',status:'LEDGER AVAILABLE',source:'Persistent Notes',mode:'Longitudinal',integrity:'0.97'},
 objects:{subtitle:'Artifact Vault',status:'VAULT READY',source:'Catalogue Roles',mode:'Material',integrity:'0.92'},
 reconstructions:{subtitle:'Future Branches',status:'EMERGENCE PENDING',source:'Projection Engine',mode:'Prospective',integrity:'0.83'},
 tminus:{subtitle:'Precursor Archive',status:'PRECURSOR ACCESS',source:'Precursor Archive',mode:'Archaeological',integrity:'0.88'}
};
const RUNE_PATHS={
 creation:'M-18,-30 L-18,30 M-18,-18 L18,-28 M-18,0 L14,-10',
 field:'M-18,30 L-18,-30 M-18,-30 L18,-30 M18,-30 L18,18 M18,18 L0,30 M0,30 L-18,30',
 frecuency:'M-18,-30 L-18,30 M-18,-18 L18,-18 M-18,-18 L14,6',
 lab:'M-18,-30 L-18,30 M-18,-18 L18,-28 M-18,0 L14,-10 M-18,0 L12,22',
 notes:'M-18,-30 L-18,30 M-18,-22 L16,-22 M16,-22 L16,0 M16,0 L-18,0 M-18,0 L18,30',
 objects:'M-18,-30 L-18,30 M-18,0 L18,-22 M-18,0 L18,22',
 reconstructions:'M0,-30 L0,30 M0,-10 L-18,-28 M0,-10 L18,-28',
 tminus:'M-18,0 L0,-24 L18,0 L0,24 Z M-18,0 L-18,30 M18,0 L18,30'
};
const AMBIENT_EXTRA=[
 'M-22,-22 L22,22 M22,-22 L-22,22',
 'M0,-30 L0,30',
 'M14,-30 L-10,-6 L10,-6 L-14,30',
 'M-18,-30 L-18,30 M14,-30 L-10,30',
 'M-8,-28 L18,-8 L-8,12 M8,28 L-18,8 L8,-12',
 'M0,-30 L0,30 M0,-10 L-18,-28 M0,-10 L18,-28',
 'M-22,0 L0,-24 L22,0 L0,24 Z',
 'M-18,-30 L-18,30 M-18,-30 L12,-4'
];
const NS='http://www.w3.org/2000/svg';

const runeOrbit=document.getElementById('runeOrbit');
const ghostRunes=document.getElementById('ghostRunes');
const core=document.getElementById('coreSystem');
const coreRune=document.getElementById('coreActiveRune');
const coreState=document.getElementById('coreState');
const screen=document.getElementById('projectionScreen');
const beam=document.getElementById('projectionBeam');
const pName=document.getElementById('pLayerName');
const pSub=document.getElementById('pLayerSubtitle');
const pStatus=document.getElementById('pStatus');
const pMain=document.getElementById('pMain');
const pSecondary=document.getElementById('pSecondary');
const pL=document.getElementById('pFragLeft');
const pR=document.getElementById('pFragRight');
const pSource=document.getElementById('pMetaSource');
const pMode=document.getElementById('pMetaMode');
const pIntegrity=document.getElementById('pMetaIntegrity');

let current=null, transitioning=false, open=false;

function runeSvg(path,prefix='rune'){
 return `<svg viewBox="-44 -44 88 88" aria-hidden="true">
  <path class="${prefix}-main" d="${path}"/>
  <path class="${prefix}-frag ${prefix}-frag-a" d="${path}"/>
  <path class="${prefix}-frag ${prefix}-frag-b" d="${path}"/>
  <path class="${prefix}-scan" d="${path}"/>
  <path class="${prefix}-ghost ${prefix}-ghost-a" d="${path}"/>
  <path class="${prefix}-ghost ${prefix}-ghost-b" d="${path}"/>
 </svg>`;
}
function setupRunes(){
 runeOrbit.innerHTML='';
 LAYER_ORDER.forEach((key)=>{
  const b=document.createElement('button');
  b.className='rune-node';
  b.dataset.layer=key;
  b.setAttribute('aria-label',SECTION_MAP[key]);
  b.innerHTML=runeSvg(RUNE_PATHS[key]);
  b.addEventListener('click',()=>activate(key));
  runeOrbit.appendChild(b);
 });
 placeRunes();
 addEventListener('resize',placeRunes,{passive:true});
}
function placeRunes(){
 const nodes=[...runeOrbit.querySelectorAll('.rune-node')];
 const radius=Math.min(innerWidth*.34,innerHeight*.34,300);
 const start=-Math.PI/2,step=(Math.PI*2)/nodes.length;
 nodes.forEach((b,i)=>{
  const a=start+i*step;
  b.style.left=(Math.cos(a)*radius)+'px';
  b.style.top=(Math.sin(a)*radius)+'px';
 });
}
function setupAmbient(){
 const base=[...Object.values(RUNE_PATHS),...AMBIENT_EXTRA];
 const pts=[[120,175,.42],[490,135,.32],[810,190,.46],[205,400,.34],[790,430,.30],[100,690,.44],[875,720,.36],[235,1030,.33],[770,1050,.42],[150,1310,.30],[860,1320,.35],[335,1510,.28],[655,1520,.33],[470,320,.26],[575,955,.24],[425,1210,.28]];
 pts.forEach((p,i)=>{
  const g=document.createElementNS(NS,'g');
  g.setAttribute('class','ambient-rune'+([1,4,7,10,14].includes(i)?' glitch':''));
  g.setAttribute('transform',`translate(${p[0]} ${p[1]}) scale(${p[2]})`);
  g.style.setProperty('--dur',`${12+(i%5)*1.8}s`);
  g.style.setProperty('--delay',`${-i*.81}s`);
  const d=base[i%base.length];
  ['ambient-main','ambient-frag','ambient-scan','ambient-ghost'].forEach((cl)=>{
   const q=document.createElementNS(NS,'path');
   q.setAttribute('class',cl+(cl==='ambient-frag'?' ambient-frag-a':'')+(cl==='ambient-ghost'?' ambient-ghost-a':''));
   q.setAttribute('d',d);g.appendChild(q);
  });
  ghostRunes.appendChild(g);
 });
}

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const list=(arr)=>`<div class="canon-list">${(arr||[]).map(v=>`<div class="canon-row">${esc(v)}</div>`).join('')}</div>`;
const rows=(obj)=>`<div class="dossier">${Object.entries(obj||{}).map(([k,v])=>`<div class="dossier-row"><div class="k">${esc(k)}</div><div class="v">${Array.isArray(v)?esc(v.join(' · ')):esc(v)}</div></div>`).join('')}</div>`;
const title=t=>`<div class="canon-title">${esc(t)}</div>`;

function sectionDescription(key){return C.grimoire_sections?.[SECTION_MAP[key]]||''}

function renderCreation(){
 const spine=C.lore_spine||[];
 const pre=spine.filter(n=>!String(n.node).includes('2026')&&n.node!=='INTERVAL'&&n.node!=='[ ? ]');
 return `${title(C.identity?.canon_title||'CREATION')}
 <div class="canon-copy">${esc(C.identity?.core_sentence||'')}</div>
 <div class="signal-formula">${esc(C.identity?.axiom||'')}</div>
 ${title('Persistent attractor')}
 <div class="canon-copy">${esc(C.persistent_attractor?.statement||'')}</div>
 ${list(C.persistent_attractor?.observed_persistent_signals)}
 ${title('Lore spine / formation')}
 <div class="micro-timeline">${pre.map(n=>`<div class="tl-node"><b>${esc(n.node)} · ${esc(n.title)}</b><div class="state">${esc(n.state)}</div><div class="body">${esc(n.canon)}</div><div class="inline-values">${esc((n.inherits_into_next||[]).join(' · '))}</div></div>`).join('')}</div>
 ${title('Anti-attractor')}${list(C.persistent_attractor?.anti_attractor)}`;
}
function renderField(){
 const spine=C.lore_spine||[];
 const nodes=spine.filter(n=>String(n.node).includes('REM618')||n.node==='INTERVAL'||String(n.node).includes('/ RETURN'));
 const r1=(C.return_design?.return_layers||[]).find(x=>x.id==='R1');
 const r3=(C.return_design?.return_layers||[]).find(x=>x.id==='R3');
 return `${title('Field / residue')}
 ${nodes.map(n=>`<div class="return-layer"><b>${esc(n.node)} · ${esc(n.title)}</b><small>${esc(n.state)}${n.role?' · '+esc(n.role):''}</small><div class="canon-copy">${esc(n.canon)}</div>${n.leaves_behind?list(n.leaves_behind):''}${n.asks?list(n.asks):''}</div>`).join('')}
 ${title('R1 / REM618 residue')}${list(r1?.collect)}
 ${title('R3 / field echo')}${list(r3?.collect)}`;
}
function renderFrecuency(){
 return `${title('Signal grammar')}<div class="signal-formula">${esc(C.signal_grammar?.canonical_formula||'')}</div>
 <div class="sequence">${(C.signal_grammar?.sequence||[]).map((x,i,a)=>`<span>${esc(x)}</span>${i<a.length-1?'<i>→</i>':''}`).join('')}</div>
 <div class="canon-copy">${esc(C.signal_grammar?.meaning||'')}</div>
 ${title('Catalogue roles')}${rows(C.catalogue_roles)}`;
}
function renderLab(){
 return `${title('RETURN / transmutation chamber')}
 <div class="canon-copy">${esc(C.return_design?.objective||'')}</div>
 <div class="signal-formula">${esc(C.return_design?.rule||'')}</div>
 ${(C.return_design?.return_layers||[]).map(l=>`<div class="return-layer"><b>${esc(l.id)} · ${esc(l.name)}</b>${list(l.collect)}</div>`).join('')}`;
}
function renderNotes(){
 const n=C.notes_architecture||{};
 return `${title(n.title||'THE BOOK REMEMBERS')}
 <div class="canon-copy">${esc(n.principle||'')}</div>
 <div class="canon-copy">${esc(n.continuity_rule||'')}</div>
 ${title('Note types')}${list(n.note_types)}
 ${title('Required fields')}${list(n.required_fields)}`;
}
function renderObjects(){
 return `${title('Catalogue / role of each carrier')}${rows(C.catalogue_roles)}
 ${title('Visual persistence')}${list(C.visual_language?.persistent)}`;
}
function renderReconstructions(){
 const nxt=(C.lore_spine||[]).find(n=>n.node==='[ ? ]')||{};
 const r5=(C.return_design?.return_layers||[]).find(x=>x.id==='R5');
 return `${title(nxt.title||'THE NEXT FORM')}
 <div class="canon-copy">${esc(nxt.canon||'')}</div>
 ${title('Candidate lineage')}${list(nxt.candidate_lineage)}
 ${title('Selection rule')}<div class="canon-copy">${esc(nxt.selection_rule||C.return_design?.rule||'')}</div>
 ${title('R5 / next inheritance')}${list(r5?.collect)}`;
}
function renderTminus(){
 const sfi=C.external_relationships?.SFI||{};
 return `${title('Before visible creation')}
 <div class="canon-copy">${esc(sectionDescription('tminus'))}</div>
 ${title('Identity')}${rows(C.identity)}
 ${title('Visual state logic')}${rows(C.visual_language?.state_logic)}
 ${title('External relationship / SFI')}${rows(sfi)}`;
}
const RENDER={creation:renderCreation,field:renderField,frecuency:renderFrecuency,lab:renderLab,notes:renderNotes,objects:renderObjects,reconstructions:renderReconstructions,tminus:renderTminus};

function fragmentsFor(key){
 const spine=C.lore_spine||[];
 const idx=LAYER_ORDER.indexOf(key);
 const coreSentence=C.identity?.core_sentence;
 const vals=[];
 if(coreSentence) vals.push(coreSentence);
 for(let i=0;i<4;i++){
  const n=spine[(idx*2+i)%Math.max(spine.length,1)];
  if(n) vals.push(`${n.node} — ${n.title}`);
 }
 return vals;
}
function renderFragments(key){
 const a=fragmentsFor(key),mid=Math.ceil(a.length/2);
 pL.innerHTML=a.slice(0,mid).map(x=>`<div class="frag-line">${esc(x)}</div>`).join('');
 pR.innerHTML=a.slice(mid).map(x=>`<div class="frag-line">${esc(x)}</div>`).join('');
}
function setCore(key){
 coreRune.innerHTML=runeSvg(RUNE_PATHS[key]);
 core.classList.remove('is-glitching');void core.offsetWidth;core.classList.add('is-glitching');
 setTimeout(()=>core.classList.remove('is-glitching'),360);
 coreState.textContent=META[key].status;
}
function render(key){
 const m=META[key];
 pName.textContent=SECTION_MAP[key];
 pSub.textContent=m.subtitle;
 pStatus.textContent=m.status;
 pSource.textContent=m.source;
 pMode.textContent=m.mode;
 pIntegrity.textContent='INTEGRITY '+m.integrity;
 pMain.innerHTML=`<div class="section-description">${esc(sectionDescription(key))}</div>${RENDER[key]()}`;
 pSecondary.textContent=C.return_design?.rule||C.signal_grammar?.meaning||'';
 renderFragments(key);
}
function activate(key){
 if(transitioning||!META[key])return;
 transitioning=true;
 [...runeOrbit.querySelectorAll('.rune-node')].forEach(b=>b.classList.toggle('is-active',b.dataset.layer===key));
 setCore(key);
 if(!open){
  open=true;beam.classList.add('is-open');screen.classList.add('is-open');screen.setAttribute('aria-hidden','false');
 }else{
  screen.classList.remove('is-transitioning');void screen.offsetWidth;screen.classList.add('is-transitioning');
 }
 setTimeout(()=>{render(key);current=key;},open&&current===null?230:145);
 setTimeout(()=>{screen.classList.remove('is-transitioning');transitioning=false;},520);
}
async function init(){
 try{
  C = window.CANON || await window.CANON_READY;
 }catch(error){
  coreState.textContent='CANON · OFFLINE';
  return;
 }
 setupRunes();setupAmbient();
 coreState.textContent=(C.identity?.current_stage||'RETURN')+' · ACTIVE';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();},{once:true});else init();
})();
