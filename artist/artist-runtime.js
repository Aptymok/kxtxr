(function(){
'use strict';
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const stage=q('#kxStage'),field=q('#kxLayerfield'),fx=q('#kxFxfield'),sections=qa('#kxTrack section'),bar=q('#kxProgress i');
const audio=q('#kx111'),sound=q('#kxSound');
const bg={room:q('[data-bg="room"]'),studio:q('[data-bg="studio"]'),stage:q('[data-bg="stage"]'),kaiju:q('[data-bg="kaiju"]')};

const MOTION={
 top:{x:0,y:-62,s:.82,r:-5},bottom:{x:0,y:64,s:.86,r:5},left:{x:-70,y:0,s:.92,r:-8},right:{x:70,y:0,s:.92,r:8},depth:{x:0,y:0,s:.2,r:12},tl:{x:-62,y:-46,s:.62,r:-16},tr:{x:62,y:-46,s:.62,r:16},bl:{x:-62,y:48,s:.68,r:11},br:{x:64,y:50,s:.68,r:-13},spin:{x:36,y:-22,s:.3,r:150},float:{x:28,y:-42,s:.7,r:9},snap:{x:-22,y:30,s:1.7,r:-16}
};
const svg={
 guitar:'<svg viewBox="0 0 180 180"><path d="M37 143c-16-12-13-40 5-55l20-16 13 13-15 18c22-4 37 4 42 22 4 16-6 31-22 36-17 5-31-2-43-18Z"/><path class="hot" d="m78 83 58-58 13 13-58 58Z"/><circle cx="71" cy="126" r="9"/><line x1="113" y1="46" x2="153" y2="18"/></svg>',
 mic:'<svg viewBox="0 0 180 180"><rect x="72" y="17" width="36" height="72" rx="18"/><line x1="90" y1="89" x2="90" y2="147"/><line x1="61" y1="151" x2="119" y2="151"/><path class="hot" d="M60 62c0 22 12 38 30 38s30-16 30-38"/></svg>',
 headphones:'<svg viewBox="0 0 180 180"><path d="M42 96V72c0-34 20-55 48-55s48 21 48 55v24"/><rect x="30" y="83" width="30" height="55" rx="12"/><rect x="120" y="83" width="30" height="55" rx="12"/><path class="hot" d="M57 91c17-11 49-11 66 0"/></svg>',
 cassette:'<svg viewBox="0 0 180 180"><rect x="23" y="46" width="134" height="88" rx="8"/><circle cx="65" cy="89" r="18"/><circle cx="116" cy="89" r="18"/><path class="hot" d="M49 121h82l-12-21H61Z"/></svg>',
 speaker:'<svg viewBox="0 0 180 180"><rect x="43" y="16" width="94" height="148" rx="8"/><circle cx="90" cy="60" r="19"/><circle class="hot" cx="90" cy="119" r="31"/></svg>',
 phone:'<svg viewBox="0 0 180 180"><rect x="55" y="14" width="70" height="152" rx="14"/><rect class="hot" x="65" y="30" width="50" height="104" rx="4"/><line x1="80" y1="149" x2="100" y2="149"/></svg>'
};
function node(cls,id){const e=document.createElement('div');e.className=cls;e.id=id;field.appendChild(e);return e}
function prop(name){const e=node('kx-prop','p-'+name);e.innerHTML=svg[name]||svg.cassette;return e}
function actor(pose,bgUrl){const e=node('kx-actor','a-'+pose);e.dataset.pose=pose;if(bgUrl)e.style.backgroundImage=`url('${bgUrl}')`;return e}
function card(id,title,subtitle,meter=83){const e=document.createElement('section');e.className='kx-interface-card';e.id=id;e.style.setProperty('--meter',meter+'%');e.innerHTML=`<header><span>KXTXR / SIGNAL</span><span>${String(meter).padStart(3,'0')}%</span></header><h3>${title}</h3><div class="wave"></div><div class="meter"></div>${subtitle?`<select aria-label="${subtitle}"><option>${subtitle}</option><option>111</option><option>GLOBAL</option></select>`:''}`;fx.appendChild(e);return e}
function label(){const e=document.createElement('div');e.className='kx-scene-code';e.innerHTML='<b>01</b><i></i><span>WAKE UP</span>';stage.appendChild(e);return e}
const L=label();
const E={
 tired:actor('tired','/assets/kxtxr/kxtxr-bg-desktop.webp'),signal:actor('signal','/assets/cinematic/scene-01-awake.webp'),guitarMan:actor('guitar','/assets/cinematic/scene-04-open.webp'),producer:actor('producer','/assets/cinematic/scene-05-dashboard.webp'),energyActor:actor('energy','/assets/cinematic/scene-03-lift.webp'),
 guitar:prop('guitar'),mic:prop('mic'),headphones:prop('headphones'),cassette:prop('cassette'),speaker:prop('speaker'),phone:prop('phone'),
 upload:card('ui-upload','REM618_FINAL.mp3','DESTINATION',83),route:card('ui-route','SIGNAL ROUTE','KXTXR / 111',100)
};
const burst=document.createElement('div');burst.className='kx-energy-burst';fx.appendChild(burst);
const mark=document.createElement('div');mark.className='kx-fx kx-111';mark.textContent='111';fx.appendChild(mark);
const boom=document.createElement('div');boom.className='kx-fx kx-onoma';boom.textContent='BOOM!';fx.appendChild(boom);
const crowd=document.createElement('div');crowd.className='kx-crowd-css';field.appendChild(crowd);
const kaiju=document.createElement('div');kaiju.className='kx-kaiju-css';field.appendChild(kaiju);
const glance=document.createElement('div');glance.className='kx-glance';field.appendChild(glance);
const socials=document.createElement('nav');socials.className='kx-social-burst';socials.innerHTML=['SPOTIFY','APPLE MUSIC','AMAZON MUSIC','YOUTUBE','TIKTOK','INSTAGRAM','WEBSITE','CORREO ELECTRÓNICO'].map(x=>`<a href="#" data-network="${x}">${x}</a>`).join('');stage.appendChild(socials);
const all=[...Object.values(E),burst,mark,boom,crowd,kaiju,glance];
function set(e,o={}){e.dataset.x=o.x??0;e.dataset.y=o.y??0;e.dataset.s=o.s??1;e.dataset.r=o.r??0;e.dataset.o=o.o??0;e.dataset.z=o.z??20}
function render(e){const x=+e.dataset.x||0,y=+e.dataset.y||0,s=+e.dataset.s||1,r=+e.dataset.r||0,o=+e.dataset.o||0,z=+e.dataset.z||20;e.style.zIndex=z;e.style.opacity=o;e.style.transform=`translate(calc(-50% + ${x}vw),calc(-50% + ${y}vh)) scale(${s}) rotate(${r}deg)`}
function reveal(e,m,to,p){const a=MOTION[m]||MOTION.depth,t=ease(clamp(p));set(e,{x:lerp(a.x,to.x||0,t),y:lerp(a.y,to.y||0,t),s:lerp(a.s,to.s??1,t),r:lerp(a.r,to.r||0,t),o:t*(to.o??1),z:to.z??20})}
function hide(){all.forEach(e=>set(e,{o:0,s:.8}));socials.style.opacity=0;socials.classList.remove('active');qa('.kx-bg').forEach(e=>e.style.opacity=0);q('#kxSpeedlines').style.opacity=0}
function setBg(k,p){Object.entries(bg).forEach(([name,e])=>{e.style.opacity=name===k?1:0;e.style.transform=`scale(${1.05+p*.035}) translate3d(${p*.18}%,${-p*.1}%,0)`})}
const codes=[['01','WAKE UP'],['02','FIRST SIGNAL'],['03','LAYERS ASSEMBLE'],['04','PRODUCER MODE'],['05','111 ENERGY'],['06','UPLOAD / RELEASE'],['07','LIVE STAGE'],['08','GODZILLA GLANCE'],['09','NETWORK']];
function code(i){L.querySelector('b').textContent=codes[i][0];L.querySelector('span').textContent=codes[i][1]}
function wake(p){setBg('room',p);reveal(E.tired,'bl',{x:-11,y:5,s:.92,r:-2,z:24},p/.42);reveal(E.phone,'bottom',{x:28,y:19,s:.85,r:10,z:31},(p-.12)/.28);reveal(E.cassette,'tr',{x:-29,y:24,s:.72,r:-7,z:28},(p-.28)/.25)}
function signal(p){setBg('room',.7+p);reveal(E.signal,'left',{x:-9,y:4,s:.9,r:0,z:24},p/.34);reveal(E.headphones,'top',{x:29,y:18,s:.72,r:8,z:35},(p-.16)/.24);reveal(E.speaker,'right',{x:33,y:2,s:.75,r:-4,z:22},(p-.32)/.25);reveal(E.cassette,'spin',{x:6,y:26,s:.82,r:7,z:36},(p-.49)/.22)}
function layers(p){setBg('studio',p);reveal(E.guitar,'bottom',{x:-31,y:3,s:.88,r:-9,z:27},p/.25);reveal(E.mic,'top',{x:-10,y:-13,s:.68,r:5,z:34},(p-.1)/.24);reveal(E.headphones,'tr',{x:28,y:-10,s:.7,r:-6,z:32},(p-.2)/.24);reveal(E.speaker,'right',{x:34,y:12,s:.7,r:4,z:29},(p-.32)/.22);reveal(E.cassette,'spin',{x:8,y:25,s:.8,r:-5,z:38},(p-.46)/.2)}
function producer(p){setBg('studio',.5+p);reveal(E.producer,'depth',{x:0,y:4,s:.94,r:0,z:23},p/.42);reveal(E.guitar,'left',{x:-33,y:20,s:.65,r:-12,z:28},(p-.22)/.24);reveal(E.mic,'top',{x:30,y:-12,s:.62,r:6,z:31},(p-.38)/.23);reveal(E.speaker,'br',{x:34,y:20,s:.62,r:-4,z:22},(p-.52)/.2)}
function energy(p){setBg('studio',1+p);reveal(E.energyActor,'rise',{x:-3,y:4,s:.96,r:0,z:26},p/.38);reveal(burst,'depth',{x:0,y:0,s:1.15,r:p*18,z:20},(p-.08)/.3);reveal(mark,'right',{x:24,y:-13,s:1,r:-7,z:42},(p-.34)/.24);q('#kxSpeedlines').style.opacity=clamp((p-.16)/.5)*.78}
function release(p){setBg('studio',1.3+p);reveal(E.upload,'left',{x:-19,y:4,s:.92,r:-2,z:35},p/.34);reveal(E.route,'right',{x:19,y:10,s:.86,r:3,z:36},(p-.16)/.32);reveal(E.cassette,'top',{x:0,y:-28,s:.82,r:12,z:40},(p-.38)/.22);reveal(E.phone,'bottom',{x:31,y:24,s:.7,r:-10,z:39},(p-.54)/.2)}
function live(p){setBg('stage',p);set(crowd,{x:0,y:0,s:1,o:clamp(p/.25),z:15});reveal(E.guitarMan,'bottom',{x:0,y:8,s:.92,r:-2,z:29},(p-.08)/.32);reveal(E.mic,'top',{x:-5,y:-8,s:.65,r:4,z:36},(p-.28)/.22);reveal(E.guitar,'left',{x:28,y:18,s:.58,r:12,z:34},(p-.45)/.2)}
function final(p){setBg('kaiju',p);set(crowd,{x:0,y:0,s:1.04,o:1,z:14});reveal(kaiju,'right',{x:21,y:-4,s:1.05,r:0,z:23},p/.46);reveal(E.guitarMan,'left',{x:-25,y:11,s:.67,r:1,z:34},(p-.06)/.35);reveal(glance,'depth',{x:22,y:-16,s:1,r:0,z:45},(p-.38)/.2);reveal(boom,'depth',{x:17,y:19,s:1.05,r:-8,z:49},(p-.57)/.25)}
function network(p){setBg('kaiju',1.4);const t=ease(clamp((p-.05)/.55));socials.style.opacity=t;socials.classList.toggle('active',t>.92);set(kaiju,{x:20,y:-4,s:1.08,o:1-t*.7,z:20})}
const scenes=[wake,signal,layers,producer,energy,release,live,final,network];
function update(){const vh=innerHeight,y=scrollY;let idx=0,local=0;for(let i=0;i<sections.length;i++){const r=sections[i].getBoundingClientRect();if(r.top<=vh*.5)idx=i;if(r.top<=0&&r.bottom>=vh){idx=i;local=clamp((-r.top)/(Math.max(1,r.height-vh)));break}}hide();code(idx);scenes[idx]?.(local);all.forEach(render);bar.style.height=(clamp(y/Math.max(1,document.documentElement.scrollHeight-vh))*100)+'%'}
let raf=0;function request(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;update()})}addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
async function hydrate(){try{const r=await fetch('/grimoire/artist-presence.json',{cache:'no-store'});if(!r.ok)return;const d=await r.json(),g=d.network_gateways||[];qa('[data-network]').forEach(a=>{const key=a.dataset.network.toUpperCase();const hit=g.find(x=>String(x.label||'').toUpperCase().includes(key));if(hit?.url)a.href=hit.url;else if(key==='WEBSITE')a.href='/';else if(key==='CORREO ELECTRÓNICO'&&d.email)a.href='mailto:'+d.email;else a.setAttribute('aria-disabled','true')})}catch(_){}}
async function find111(){for(const s of ['/assets/111.wav','/assets/111.mp3','/assets/KXTXR - 111 master final.wav','/assets/KXTXR-111-master.wav']){try{const r=await fetch(s,{method:'HEAD',cache:'no-store'});if(r.ok){audio.src=s;return true}}catch(_){}}sound.classList.add('is-muted');sound.title='111 audio asset pending';return false}
sound.addEventListener('click',async()=>{if(!audio.src&&!(await find111()))return;if(audio.paused){try{await audio.play();sound.classList.remove('is-muted')}catch(_){sound.classList.add('is-muted')}}else{audio.pause();sound.classList.add('is-muted')}});
async function init(){hydrate();await find111();update()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();