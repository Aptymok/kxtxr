(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],safe=v=>typeof v==='string'?v:'';
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(path);return r.json()}
function makeWave(){const w=$('#wave');if(!w)return;for(let i=0;i<54;i++){const b=document.createElement('i');b.style.height=(7+Math.abs(Math.sin(i*.71))*29)+'px';b.style.animationDelay=(-i*.035)+'s';w.appendChild(b)}}
function makeScratches(){const root=$('#scratches');if(!root)return;for(let i=0;i<17;i++){const s=document.createElement('i'),diag=i%3===0;s.className='scratch'+(diag?' diag':'')+(i%8===0?' red':'');s.style.left=(3+Math.random()*94)+'vw';s.style.top=(-20+Math.random()*80)+'vh';s.style.setProperty('--dur',(4.8+Math.random()*10)+'s');s.style.setProperty('--delay',(-Math.random()*14)+'s');s.style.setProperty('--rot',(diag?(-18+Math.random()*32):(-4+Math.random()*8))+'deg');root.appendChild(s)}}
function text(tag,value){const n=document.createElement(tag);n.textContent=value;return n}
function statusLabel(v){return String(v||'').replace('WAIT_RETURN_07','WAIT').replace('CONDITIONAL','COND.').replace('READY','READY')}
function renderCampaign(cfg){
  const pieces=Array.isArray(cfg?.pieces)?cfg.pieces:[],current=cfg?.current_piece||pieces[0]?.piece||'07/12';
  const hit=pieces.find(p=>p.piece===current)||pieces[0];
  if(hit){
    $('#heroPiece')&&( $('#heroPiece').textContent=hit.piece+' · '+hit.state );
    $('#currentPiece')&&( $('#currentPiece').textContent=hit.piece );
    $('#currentState')&&( $('#currentState').textContent=hit.state );
    $('#currentObjective')&&( $('#currentObjective').textContent=hit.objective||'' );
  }
  const root=$('#queNoSeries');
  if(root&&pieces.length){
    root.replaceChildren(...pieces.map(p=>{
      const b=document.createElement('button');b.type='button';b.dataset.piece=p.piece;
      if(p.piece===current)b.classList.add('is-active');
      const num=text('span',String(p.piece).split('/')[0]);
      const st=text('b',p.state||'');
      const sm=text('small',statusLabel(p.status));
      b.append(num,st,sm);return b;
    }));
  }
  $('#fieldConfig')&&( $('#fieldConfig').textContent='GIT-BACKED / '+current );
}
async function hydrate(){
  const phase=$('#phase'),field=$('#fieldData'),canon=$('#canon');
  const jobs=await Promise.allSettled([
    json('/grimoire/ledger.json'),json('/grimoire/experiment.json'),json('/grimoire/logbook.json'),json('/campaigns/que-no/representation-engine.json')
  ]);
  const ledger=jobs[0].status==='fulfilled'?jobs[0].value:null;
  const experiment=jobs[1].status==='fulfilled'?jobs[1].value:null;
  const logbook=jobs[2].status==='fulfilled'?jobs[2].value:null;
  const campaign=jobs[3].status==='fulfilled'?jobs[3].value:null;
  const p=safe(ledger?.phase||experiment?.current_phase?.name||ledger?.current_state).toUpperCase();
  if(phase&&p)phase.textContent=p.replace('_',' ');
  if(campaign)renderCampaign(campaign);else $('#fieldConfig')&&( $('#fieldConfig').textContent='SOURCE UNAVAILABLE' );
  if(field){
    field.replaceChildren();
    const entries=Array.isArray(logbook)?logbook:(logbook?.entries||logbook?.logbook||[]);
    if(entries.length)entries.slice(-6).reverse().forEach(e=>{const a=document.createElement('article');a.append(text('b',safe(e.title||e.event||e.type||e.id||'RETURN')),text('p',safe(e.date||e.timestamp||e.at||'')));field.append(a)});
    else field.append(text('p','NO PUBLIC RETURN PROMOTED WITHOUT CANONICAL DATA.'));
  }
  if(canon)canon.textContent=ledger?'CANON / PERSISTENT / GIT-BACKED':'CANON / SOURCE UNAVAILABLE';
}
const audio=$('#audio'),play=$('#play'),title=$('#nowTitle'),state=$('#nowState');
function sync(){if(!audio||!play)return;const on=!audio.paused&&!audio.ended;play.querySelector('span').textContent=on?'Ⅱ':'▶';const wave=$('#wave');if(wave)wave.style.opacity=on?'1':'.45';if(state)state.textContent=on?'REPRODUCIENDO':'MASTER EN REPOSITORIO'}
async function toggle(){if(!audio)return;if(audio.paused){try{await audio.play()}catch(e){if(state)state.textContent='PLAYBACK BLOQUEADO POR EL NAVEGADOR'}}else audio.pause();sync()}
if(play&&audio){play.addEventListener('click',toggle);audio.addEventListener('play',sync);audio.addEventListener('pause',sync);audio.addEventListener('ended',sync)}
$$('.track-play').forEach(b=>b.addEventListener('click',async()=>{const card=b.closest('.track'),src=card?.dataset.src;if(!src||!audio)return;if(audio.getAttribute('src')!==src){audio.src=src;if(title)title.textContent=card.dataset.title||'KXTXR'}await toggle()}));

const nav=$$('.nav nav a');
const sceneObserver=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const key=e.target.dataset.nav;nav.forEach(a=>a.classList.toggle('active',a.textContent.trim()===key));document.body.dataset.scene=key}),{threshold:.43});
$$('.scene').forEach(s=>sceneObserver.observe(s));
const revealObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.18});
$$('.reveal').forEach(n=>revealObserver.observe(n));

let tx=0,ty=0,cx=0,cy=0;
addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)},{passive:true});
function drift(){
  cx+=(tx-cx)*.045;cy+=(ty-cy)*.045;
  const r=document.documentElement.style;
  r.setProperty('--mx-back',(cx*-10).toFixed(2)+'px');r.setProperty('--my-back',(cy*-7).toFixed(2)+'px');
  r.setProperty('--mx-actor',(cx*18).toFixed(2)+'px');r.setProperty('--my-actor',(cy*10).toFixed(2)+'px');
  r.setProperty('--mx-echo',(cx*34).toFixed(2)+'px');r.setProperty('--my-echo',(cy*18).toFixed(2)+'px');
  requestAnimationFrame(drift);
}
makeWave();makeScratches();hydrate();sync();
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)drift();
})();