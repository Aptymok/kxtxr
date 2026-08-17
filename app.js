/* KXTXR — app.js
   Runtime: rune field, JSON hydration, projection states. */
const RUNE_PATHS={creation:"M-18,-30 L-18,30 M-18,-18 L18,-28 M-18,0 L14,-10",field:"M-18,30 L-18,-30 M-18,-30 L18,-30 M18,-30 L18,18 M18,18 L0,30 M0,30 L-18,30",frecuency:"M-18,-30 L-18,30 M-18,-18 L18,-18 M-18,-18 L14,6",lab:"M-18,-30 L-18,30 M-18,-18 L18,-28 M-18,0 L14,-10 M-18,0 L12,22",notes:"M-18,-30 L-18,30 M-18,-22 L16,-22 M16,-22 L16,0 M16,0 L-18,0 M-18,0 L18,30",objects:"M-18,-30 L-18,30 M-18,0 L18,-22 M-18,0 L18,22",reconstructions:"M0,-30 L0,30 M0,-10 L-18,-28 M0,-10 L18,-28",tminus:"M-18,0 L0,-24 L18,0 L0,24 Z M-18,0 L-18,30 M18,0 L18,30"};
const AMBIENT_PATHS=[RUNE_PATHS.creation,RUNE_PATHS.field,RUNE_PATHS.frecuency,RUNE_PATHS.lab,RUNE_PATHS.notes,RUNE_PATHS.objects,RUNE_PATHS.reconstructions,RUNE_PATHS.tminus,"M-22,-22 L22,22 M22,-22 L-22,22","M0,-30 L0,30","M14,-30 L-10,-6 L10,-6 L-14,30","M-18,-30 L-18,30 M14,-30 L-10,30"];
const NS='http://www.w3.org/2000/svg';
const screen=document.getElementById('projectionScreen'),beam=document.getElementById('projectionBeam'),core=document.getElementById('coreSystem'),coreRune=document.getElementById('coreActiveRune');
const pName=document.getElementById('pLayerName'),pSub=document.getElementById('pLayerSubtitle'),pStatus=document.getElementById('pStatus'),pMain=document.getElementById('pMain'),pSecondary=document.getElementById('pSecondary'),pL=document.getElementById('pFragLeft'),pR=document.getElementById('pFragRight'),pSource=document.getElementById('pMetaSource'),pMode=document.getElementById('pMetaMode'),pIntegrity=document.getElementById('pMetaIntegrity');
let activeLayer=null,projectionOpen=false;
function runeSvg(path,ambient=false){const c=ambient?'ambient':'rune';return `<svg viewBox="-44 -44 88 88" aria-hidden="true"><path class="${c}-main" d="${path}"/><path class="${c}-frag ${c}-frag-a" d="${path}"/><path class="${c}-frag ${c}-frag-b" d="${path}"/><path class="${c}-scan" d="${path}"/><path class="${c}-ghost ${c}-ghost-a" d="${path}"/><path class="${c}-ghost ${c}-ghost-b" d="${path}"/></svg>`}
function setupRunes(){
  const nodes=[...document.querySelectorAll('.rune-node')];
  const pos=[[0,-1],[.72,-.72],[1,0],[.72,.72],[0,1],[-.72,.72],[-1,0],[-.72,-.72]];
  nodes.forEach((b,i)=>{
    const key=b.dataset.layer;
    b.innerHTML=runeSvg(RUNE_PATHS[key]);
    b.addEventListener('click',()=>setLayer(key));
  });
  const place=()=>{
    const radius=Math.min(innerWidth*.34,innerHeight*.34,300);
    nodes.forEach((b,i)=>{b.style.left=(pos[i][0]*radius)+'px';b.style.top=(pos[i][1]*radius)+'px';});
  };
  place();
  addEventListener('resize',place,{passive:true});
}
function setupAmbient(){const svg=document.getElementById('ghostRunes');const pts=[[120,180,.42],[490,145,.32],[805,190,.48],[210,420,.36],[770,450,.30],[105,710,.46],[860,725,.38],[245,1040,.34],[760,1055,.44],[155,1320,.31],[850,1325,.36],[340,1510,.28],[650,1525,.34],[470,330,.27],[575,960,.25],[425,1210,.29]];pts.forEach((p,i)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','ambient-rune'+([1,4,7,10,14].includes(i)?' glitch':''));g.setAttribute('transform',`translate(${p[0]} ${p[1]}) scale(${p[2]})`);g.style.setProperty('--dur',`${12+(i%5)*1.7}s`);g.style.setProperty('--delay',`${-i*.77}s`);const d=AMBIENT_PATHS[i%AMBIENT_PATHS.length];['ambient-main','ambient-frag','ambient-scan','ambient-ghost'].forEach((cl,j)=>{const path=document.createElementNS(NS,'path');path.setAttribute('class',cl+(cl==='ambient-frag'?' ambient-frag-a':'')+(cl==='ambient-ghost'?' ambient-ghost-a':''));path.setAttribute('d',d);g.appendChild(path)});svg.appendChild(g)})}
function setCoreRune(key){coreRune.innerHTML=runeSvg(RUNE_PATHS[key]);core.classList.remove('is-glitching');void core.offsetWidth;core.classList.add('is-glitching');setTimeout(()=>core.classList.remove('is-glitching'),360)}
function fragmentColumns(items=[]){const arr=items.filter(Boolean);const mid=Math.ceil(arr.length/2);pL.innerHTML=arr.slice(0,mid).map(x=>`<div class="frag-line">${x}</div>`).join('');pR.innerHTML=arr.slice(mid).map(x=>`<div class="frag-line">${x}</div>`).join('')}
function bars(){return Array.from({length:28},(_,i)=>`<span style="height:${8+Math.abs(Math.sin(i*.73))*25}px"></span>`).join('')}
function renderVisual(layer){
  pMain.innerHTML='';
  pSecondary.innerHTML='';
  switch(layer.visualType){
    case 'origin-codex':
      pMain.innerHTML=`<div><div class="origin-column">${layer.origin||''}</div><div class="micro-timeline">${(layer.timeline||[]).map(x=>`<div class="tl-node"><b>${x.when}</b>${x.label}</div>`).join('')}</div></div>`;
      break;
    case 'timeline-signal':
      pMain.innerHTML=`<div style="width:100%"><div class="signal-wave"><svg viewBox="0 0 500 80"><path d="M0 40 ${Array.from({length:50},(_,i)=>`L${i*10} ${40+Math.sin(i*.7)*18+Math.sin(i*.21)*9}`).join(' ')}"/></svg></div><div class="event-timeline">${(layer.events||[]).map(x=>`<div class="ev"><b>${x.when}</b>${x.label}</div>`).join('')}</div></div>`;
      break;
    case 'sequence-map':
      pMain.innerHTML=`<div style="width:100%"><div class="sequence-nodes">${(layer.sequence||[]).map((x,i,a)=>`<div class="seq-node">${x}</div>${i<a.length-1?'<div class="seq-line"></div>':''}`).join('')}</div><div class="frequency-spectrum">${bars()}</div></div>`;
      pSecondary.textContent=layer.formula||'';
      break;
    case 'network-matrix': {
      const n=layer.nodes||[];
      const pts=[[80,70],[250,50],[420,80],[120,170],[310,165],[460,185]];
      const links=layer.links||[];
      pMain.innerHTML=`<div class="lab-network"><svg viewBox="0 0 540 230">${links.map(([a,b])=>`<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}"/>`).join('')}${n.map((x,i)=>`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="9"/><text x="${pts[i][0]+12}" y="${pts[i][1]+3}">${x}</text>`).join('')}</svg></div>`;
      break;
    }
    case 'ledger-stack':
      pMain.innerHTML=`<div class="ledger-entries">${(layer.noteTypes||[]).slice(0,7).map((x,i)=>`<div class="entry">${String(i+1).padStart(2,'0')} · ${x}</div>`).join('')}</div>`;
      break;
    case 'artifact-grid':
      pMain.innerHTML=`<div class="artifact-grid">${Object.entries(layer.catalogue||{}).slice(0,10).map(([k,v])=>`<div class="obj"><b>${k}</b>${v}</div>`).join('')}</div>`;
      break;
    case 'branch-tree': {
      const br=layer.branches||[];
      pMain.innerHTML=`<div class="future-branches"><svg viewBox="0 0 540 230"><circle cx="270" cy="35" r="8" class="branch-emerging"/>${br.map((b,i)=>{const x=55+i*(430/Math.max(1,br.length-1)),y=175;return `<line x1="270" y1="43" x2="${x}" y2="${y-8}"/><circle cx="${x}" cy="${y}" r="7" class="branch-${b.state}"/><text x="${x-25}" y="${y+24}">${b.label}</text>`}).join('')}</svg></div>`;
      pSecondary.textContent=layer.rule||'';
      break;
    }
    case 'deep-archive':
      pMain.innerHTML=`<div class="archive-dossier">${(layer.dossier||[]).map(x=>`<div class="d-row"><span>${x.k}</span><span>${x.v}</span></div>`).join('')}</div>`;
      break;
  }
}
function setLayer(key){const layer=layers[key];if(!layer)return;document.querySelectorAll('.rune-node').forEach(b=>b.classList.toggle('is-active',b.dataset.layer===key));setCoreRune(key);if(!projectionOpen){projectionOpen=true;beam.classList.add('is-open');screen.classList.add('is-open');screen.setAttribute('aria-hidden','false')}else{screen.classList.remove('is-transitioning');void screen.offsetWidth;screen.classList.add('is-transitioning')}setTimeout(()=>{pName.textContent=layer.title;pSub.textContent=layer.subtitle;pStatus.textContent=layer.status;fragmentColumns(layer.fragments||[]);renderVisual(layer);pSource.textContent=layer.meta?.source||'';pMode.textContent=layer.meta?.mode||'';pIntegrity.textContent=layer.meta?.integrity||'';activeLayer=key},projectionOpen&&activeLayer===null?220:140);setTimeout(()=>screen.classList.remove('is-transitioning'),500)}
function recovery(){let v=0;const a=document.getElementById('recoveryAscii'),p=document.getElementById('recoveryPct');setInterval(()=>{v=v>=100?0:Math.min(100,v+(Math.random()<.18?2:1));const n=20,f=Math.round(v/100*n);a.textContent='['+'█'.repeat(f)+'░'.repeat(n-f)+']';p.textContent=String(v).padStart(2,'0')+'%'},180)}
(async function boot(){setupRunes();setupAmbient();recovery();await loadKxtxrLayers();requestAnimationFrame(()=>setTimeout(()=>setLayer('creation'),650))})();
