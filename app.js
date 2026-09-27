(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],safe=v=>typeof v==='string'?v:'';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(path);return r.json()}
function makeWave(){const w=$('#wave');if(!w)return;for(let i=0;i<54;i++){const b=document.createElement('i');b.style.height=(7+Math.abs(Math.sin(i*.71))*29)+'px';b.style.animationDelay=(-i*.035)+'s';w.appendChild(b)}}
function makeScratches(){const root=$('#scratches');if(!root||reduced)return;for(let i=0;i<17;i++){const s=document.createElement('i'),diag=i%3===0;s.className='scratch'+(diag?' diag':'')+(i%8===0?' red':'');s.style.left=(3+Math.random()*94)+'vw';s.style.top=(-20+Math.random()*80)+'vh';s.style.setProperty('--dur',(4.8+Math.random()*10)+'s');s.style.setProperty('--delay',(-Math.random()*14)+'s');s.style.setProperty('--rot',(diag?(-18+Math.random()*32):(-4+Math.random()*8))+'deg');root.appendChild(s)}}
function text(tag,value){const n=document.createElement(tag);n.textContent=value;return n}
function statusLabel(v){return String(v||'').replace('WAIT_RETURN_07','WAIT').replace('CONDITIONAL','COND.')}
function renderCampaign(cfg){
  const pieces=Array.isArray(cfg?.pieces)?cfg.pieces:[],current=cfg?.current_piece||pieces[0]?.piece||'07/12';
  const hit=pieces.find(p=>p.piece===current)||pieces[0];
  if(hit){
    $('#heroPiece')&&($('#heroPiece').textContent=hit.piece+' · '+hit.state);
    $('#currentPiece')&&($('#currentPiece').textContent=hit.piece);
    $('#currentState')&&($('#currentState').textContent=hit.state);
    $('#currentObjective')&&($('#currentObjective').textContent=hit.objective||'');
  }
  const root=$('#queNoSeries');
  if(root&&pieces.length){
    root.replaceChildren(...pieces.map(p=>{
      const b=document.createElement('button');b.type='button';b.dataset.piece=p.piece;b.tabIndex=-1;
      if(p.piece===current)b.classList.add('is-active');
      b.append(text('span',String(p.piece).split('/')[0]),text('b',p.state||''),text('small',statusLabel(p.status)));
      return b;
    }));
  }
  $('#fieldConfig')&&($('#fieldConfig').textContent='GIT-BACKED / '+current);
}
function renderReleases(data){
  if(!Array.isArray(data?.releases))return;
  $$('#releaseList article').forEach(card=>{
    const id=card.querySelector('h3')?.textContent?.trim();
    const item=data.releases.find(x=>x.id===id); if(!item)return;
    card.dataset.hydrated='1';
    const p=card.querySelector('p');
    if(p)p.textContent=[item.function,item.state].filter(Boolean).join(' · ').toUpperCase();
  });
}
function renderContact(data){
  const root=$('#contactRoutes');if(!root||!Array.isArray(data?.routes))return;
  root.replaceChildren(...data.routes.filter(x=>x.verified&&x.url).map(x=>{const a=text('a',String(x.label).toUpperCase()+' ↗');a.href=x.url;a.target='_blank';a.rel='noreferrer';return a}));
  const st=$('#contactState');if(st)st.textContent=data.public_email?'PUBLIC CONTACT / VERIFIED':'PUBLIC BOOKING EMAIL / NOT YET CANONICAL';
}
function renderRider(data){const el=$('#riderStatus');if(el&&data?.status)el.textContent=data.status.replaceAll('_',' ')}
function renderMedia(data){
  const el=$('#mediaBoundary');if(!el)return;
  const limited=(data?.live||[]).some(x=>x.metadata_status!=='VERIFIED');
  el.textContent=limited?'MEDIA PRESENT · DATE / VENUE / PERSON ATTRIBUTION REMAINS LIMITED UNTIL VERIFIED METADATA EXISTS.':'MEDIA METADATA VERIFIED.';
}
function renderAssets(data){
  const hero=data?.current?.hero;
  if(!hero)return;
  const src=hero.canonical_asset||hero.stable_alias;
  const img=$('.hero-portrait');
  if(img&&src){img.src=src;img.dataset.assetRegistry='/data/assets.json'}
  if(src)document.documentElement.style.setProperty('--hero-image','url("'+src+'")');
  document.documentElement.dataset.heroAsset=hero.id||'QUE_NO_07_12_IG_3';
}
async function hydrate(){
  const paths=[
    '/grimoire/ledger.json','/grimoire/experiment.json','/grimoire/logbook.json','/campaigns/que-no/representation-engine.json',
    '/data/releases.json','/data/media-manifest.json','/data/contact.json','/data/rider.json','/data/visual-system.json','/data/site-manifest.json','/data/assets.json'
  ];
  const jobs=await Promise.allSettled(paths.map(json));
  const get=i=>jobs[i].status==='fulfilled'?jobs[i].value:null;
  const ledger=get(0),experiment=get(1),logbook=get(2),campaign=get(3),releases=get(4),media=get(5),contact=get(6),rider=get(7),visual=get(8),site=get(9),assets=get(10);
  const p=safe(ledger?.phase||experiment?.current_phase?.name||ledger?.current_state).toUpperCase();
  if($('#phase')&&p)$('#phase').textContent=p.replaceAll('_',' ');
  if(campaign)renderCampaign(campaign);else $('#fieldConfig')&&($('#fieldConfig').textContent='SOURCE UNAVAILABLE');
  renderReleases(releases);renderContact(contact);renderRider(rider);renderMedia(media);renderAssets(assets);
  const field=$('#fieldData');
  if(field){
    field.replaceChildren();
    const entries=Array.isArray(logbook)?logbook:(logbook?.entries||logbook?.logbook||[]);
    if(entries.length)entries.slice(-6).reverse().forEach(e=>{const a=document.createElement('article');a.append(text('b',safe(e.title||e.event||e.type||e.id||'RETURN')),text('p',safe(e.date||e.timestamp||e.at||'')));field.append(a)});
    else field.append(text('p','NO PUBLIC RETURN PROMOTED WITHOUT CANONICAL DATA.'));
  }
  if($('#canon'))$('#canon').textContent=ledger&&site&&assets?'CANON / PERSISTENT / ASSET-BACKED':'CANON / SOURCE PARTIAL';
  document.documentElement.dataset.systemBacked=site&&visual&&assets?'1':'0';
}

let audioCtx=null,analyser=null,mediaSource=null,freq=null,audioLevel=0;
const audio=$('#audio'),play=$('#play'),title=$('#nowTitle'),state=$('#nowState');
async function armAudioReactive(){
  if(!audio||analyser)return;
  try{
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    analyser=audioCtx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.78;
    freq=new Uint8Array(analyser.frequencyBinCount);
    mediaSource=audioCtx.createMediaElementSource(audio);mediaSource.connect(analyser);analyser.connect(audioCtx.destination);
  }catch(e){analyser=null}
}
function measureAudio(){
  if(!analyser||!freq)return audioLevel*=.92;
  analyser.getByteFrequencyData(freq);let sum=0;for(let i=2;i<Math.min(freq.length,72);i++)sum+=freq[i];
  const raw=sum/(70*255);audioLevel+=(Math.min(1,raw*2.1)-audioLevel)*.22;
  document.documentElement.style.setProperty('--audio',audioLevel.toFixed(3));return audioLevel;
}
function sync(){
  if(!audio||!play)return;const on=!audio.paused&&!audio.ended;
  play.querySelector('span').textContent=on?'Ⅱ':'▶';const wave=$('#wave');if(wave)wave.style.opacity=on?'1':'.45';
  if(state)state.textContent=on?'REPRODUCIENDO / SIGNAL FIELD ACTIVE':'MASTER EN REPOSITORIO';
  document.body.dataset.audioActive=on?'1':'0';
}
async function toggle(){
  if(!audio)return;
  if(audio.paused){await armAudioReactive();if(audioCtx?.state==='suspended')await audioCtx.resume();try{await audio.play()}catch(e){if(state)state.textContent='PLAYBACK BLOQUEADO POR EL NAVEGADOR'}}
  else audio.pause();sync();
}
if(play&&audio){play.addEventListener('click',toggle);audio.addEventListener('play',sync);audio.addEventListener('pause',sync);audio.addEventListener('ended',sync)}
$$('.track-play').forEach(b=>b.addEventListener('click',async()=>{const card=b.closest('.track'),src=card?.dataset.src;if(!src||!audio)return;if(audio.getAttribute('src')!==src){audio.src=src;if(title)title.textContent=card.dataset.title||'KXTXR'}await toggle()}));

function initSignalField(){
  const canvas=$('#signalField'),label=$('#gpuState');if(!canvas||reduced){if(label)label.textContent='SIGNAL FIELD / STATIC';return}
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'high-performance'});
  if(!gl){if(label)label.textContent='SIGNAL FIELD / CSS FALLBACK';return}
  const vs='attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const fs=`
precision mediump float;
varying vec2 v;uniform vec2 r;uniform vec2 m;uniform float t;uniform float au;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.)),f.x),f.y);}
float line(float x,float w){return 1.-smoothstep(0.,w,abs(x));}
void main(){
 vec2 uv=v;vec2 p=uv-.5;p.x*=r.x/max(r.y,1.);
 float q=n(p*3.8+vec2(t*.025,-t*.018));q+=.5*n(p*8.2-vec2(t*.04,0.));
 float scan=line(sin((uv.y+q*.025)*92.+t*(1.15+au*2.4)),.09+au*.07);
 vec2 g=abs(fract(uv*vec2(22.,14.))-.5);float grid=(1.-smoothstep(.47,.495,max(g.x,g.y)))*.11;
 float d=length(p-vec2(.22+m.x*.08,.02+m.y*.05));float halo=smoothstep(.55,.02,d);
 float rupture=line(p.y-sin(p.x*7.+t*.35)*(.018+au*.045)-q*.018,.012+au*.009);
 float glitch=step(.975,h(vec2(floor(uv.y*90.),floor(t*5.))))*line(fract(uv.x*3.+q)-.5,.12);
 vec3 bone=vec3(.925,.90,.85),red=vec3(.72,.07,.085);
 vec3 col=bone*(grid+scan*.07)+red*(halo*.11+rupture*(.14+au*.32)+glitch*.16);
 float a=clamp(grid+scan*.08+halo*.08+rupture*.18+glitch*.16,0.,.48);
 gl_FragColor=vec4(col,a);
}`;
  function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
  let prog;try{prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog))}catch(e){if(label)label.textContent='SIGNAL FIELD / SHADER FALLBACK';return}
  gl.useProgram(prog);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const ur=gl.getUniformLocation(prog,'r'),um=gl.getUniformLocation(prog,'m'),ut=gl.getUniformLocation(prog,'t'),ua=gl.getUniformLocation(prog,'au');
  let mx=0,my=0,visible=true;
  addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=.5-e.clientY/innerHeight},{passive:true});
  document.addEventListener('visibilitychange',()=>visible=!document.hidden);
  function resize(){const d=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.floor(canvas.clientWidth*d)),h=Math.max(1,Math.floor(canvas.clientHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}}
  const start=performance.now();
  function frame(now){resize();measureAudio();if(visible){gl.uniform2f(ur,canvas.width,canvas.height);gl.uniform2f(um,mx,my);gl.uniform1f(ut,(now-start)/1000);gl.uniform1f(ua,audioLevel);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6)}requestAnimationFrame(frame)}
  if(label)label.textContent='SIGNAL FIELD / WEBGL';requestAnimationFrame(frame);
}

const nav=$$('.nav nav a');
const sceneObserver=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const key=e.target.dataset.nav;nav.forEach(a=>a.classList.toggle('active',a.textContent.trim()===key));document.body.dataset.scene=key}),{threshold:.43});
$$('.scene').forEach(s=>sceneObserver.observe(s));
const revealObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.18});
$$('.reveal').forEach(n=>revealObserver.observe(n));

let tx=0,ty=0,cx=0,cy=0;
addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});
function drift(){
  cx+=(tx-cx)*.045;cy+=(ty-cy)*.045;const r=document.documentElement.style;
  r.setProperty('--mx-back',(cx*-10).toFixed(2)+'px');r.setProperty('--my-back',(cy*-7).toFixed(2)+'px');
  r.setProperty('--mx-actor',(cx*14).toFixed(2)+'px');r.setProperty('--my-actor',(cy*8).toFixed(2)+'px');
  r.setProperty('--mx-echo',(cx*30).toFixed(2)+'px');r.setProperty('--my-echo',(cy*16).toFixed(2)+'px');
  requestAnimationFrame(drift);
}
makeWave();makeScratches();hydrate();sync();initSignalField();if(!reduced)drift();
})();