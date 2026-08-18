(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
const cues=window.KXTXR111_CUES||null;
const duration=cues?.meta?.duration||173.078;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const audio=$('#audio'), gate=$('#gate'), enter=$('#enter'), leader=$('#leader'), ident=$('#ident'), count=$('#count'), stage=$('#stage'), progress=$('#progress'), chapter=$('#chapter'), kicker=$('#kicker'), headline=$('#headline'), copy=$('#copy'), micro=$('#micro'), timecode=$('#timecode'), status=$('#status'), sound=$('#sound'), endRings=$('#endRings'), broadcast=$('#broadcast'), footageA=$('#footageA'), footageB=$('#footageB'), footageC=$('#footageC');
const videos=[footageA,footageB,footageC];
const bgs=Object.fromEntries($$('.bg').map(e=>[e.dataset.bg,e]));
const cuts=Object.fromEntries($$('.cutout').map(e=>[e.dataset.cutout,e]));
const scenes=[
 {a:0,b:21.739,bg:'room',cut:'edwing',k:'00 · SOURCE PROCESS',h:'EDWING',p:'Before KXTXR became a name, there was a room, unfinished work, repeated listening and the refusal to let a signal disappear.',align:'left',micro:[2.4,6.8,'LIKE THEY SAY, IT ALL STARTED WITH A <em>WAAAAAAAAGH!</em>'],micro2:[11.5,17.5,'WHAT TRULY MOVES A PERSON? WHERE DOES PASSION COME FROM?']},
 {a:21.739,b:39.147,bg:'studio',cut:'edit',k:'01 · OBSERVE / REPEAT',h:'THE WORK',p:'The archive does not hide the labor. Recording, editing, rendering, failing, returning. The maker remains inside the carrier.',align:'right',micro:[24,30,'A LITTLE PIECE OF THE MAKER REMAINS IN EVERY CARRIER.']},
 {a:39.147,b:56.555,bg:'studio',cut:'signal',k:'02 · MULTI-ROLE SYSTEM',h:'ONE SIGNAL',p:'Voice, guitar, production, camera, edit, release. Separate roles become one continuous trace when the same signal survives all of them.',align:'left',micro:[44,50,'THE ARCHIVE REEKS OF YESTERDAY. <em>THAT IS INTENTIONAL.</em>']},
 {a:56.555,b:73.963,bg:'city',cut:'signal',k:'03 · TRANSFORMATION',h:'KXTXR',p:'Edwing does not vanish. The operational identity changes scale. KXTXR is the layer that can carry the work outside the room.',align:'right',micro:[60,68,'I COMPOSE SIGNALS TO OBSERVE WHAT SURVIVES CONTACT WITH TIME.']},
 {a:73.963,b:91.371,bg:'city',cut:'oneeleven',k:'04 · 111',h:'TRANSFORM',p:'111 is not an illustration of change. It is the timed mechanism driving this page. The music is the clock; the scroll is its visible consequence.',align:'center',micro:[78,87,'THIS IS ONLY THE BEGINNING.']},
 {a:91.371,b:108.779,bg:'city',video:1,k:'05 · ARCHIVE / REAL FOOTAGE',h:'CONTACT',p:'Real frames and illustrated memory occupy the same image. Neither replaces the other. Their disagreement is part of the trace.',align:'left',micro:[95,104,'REAL FRAME / DRAWN FRAME / <em>SAME SIGNAL</em>']},
 {a:108.779,b:143.595,bg:'stage',cut:'perform',rug:true,crowd:true,k:'06 · FIRST SHOW',h:'LIVE',p:'The room opens into a field. The carpet persists beneath the performer. The audience is no longer hypothetical. Return has become contact.',align:'right',micro:[116,124,'TIME HAS COME.'],micro2:[129,139,'THE SIGNAL NOW HAS WITNESSES.']},
 {a:143.595,b:161.003,bg:'stage',show:true,godzilla:true,rug:true,smoke:true,k:'07 · KAIJU CONTACT',h:'OBSERVED',p:'At the first show, KXTXR and Godzilla do not fight. They observe each other as two systems large enough to distort the same field.',align:'center',micro:[147,157,'GODZILLA + KXTXR // FIRST SHOW // <em>MUTUAL OBSERVATION</em>']},
 {a:161.003,b:duration,bg:'stage',cut:'remcassette',k:'08 · RETURN',h:'CARRIER',p:'The performance ends. The carrier remains. REM618 is still there after the image collapses.',align:'center',micro:[164,170,'THE SIGNAL RETURNS CARRYING EVIDENCE OF ITS OWN PASSAGE.']}
];
let armed=false, manualUntil=0, ctx=null, finalTone=false, lastScene=-1, lastImpact=-1, scrollRAF=0, syncingFromAudio=false;
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.floor((t%1)*1000);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`}
function ensureCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}
function synthIdent(){try{const c=ensureCtx(),now=c.currentTime,master=c.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.22,now+.08);master.gain.exponentialRampToValueAtTime(.0001,now+2.15);master.connect(c.destination);for(let i=0;i<4;i++){const o=c.createOscillator(),g=c.createGain();o.type=i%2?'sawtooth':'triangle';o.frequency.setValueAtTime(54+i*17,now);o.frequency.exponentialRampToValueAtTime(30+i*9,now+1.8);g.gain.value=.15/(i+1);o.connect(g).connect(master);o.start(now+i*.03);o.stop(now+2.2)}const n=c.createBufferSource(),buf=c.createBuffer(1,c.sampleRate*2.15,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);n.buffer=buf;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=205;n.connect(f).connect(master);n.start(now);n.stop(now+2.15)}catch(_){}}
function beep(){try{const c=ensureCtx(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.07,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.075);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch(_){}}
async function start(){if(armed)return;armed=true;scrollTo(0,0);audio.currentTime=0;gate.classList.add('is-gone');ensureCtx();try{await audio.play();status.textContent='111 // PLAYING'}catch(_){status.textContent='111 // TAP SOUND TO PLAY'}leader.classList.add('is-on');for(let n=5;n>=1;n--){count.textContent=n;beep();await wait(500)}leader.classList.remove('is-on');ident.classList.add('is-on');synthIdent();await wait(2200);ident.classList.remove('is-on')}
enter.addEventListener('click',start);
function firstGesture(e){if(armed)return;if(e.type==='keydown'&&![' ','Enter','ArrowDown','PageDown'].includes(e.key))return;e.preventDefault?.();start()}
addEventListener('pointerdown',firstGesture,{once:false,passive:false});
addEventListener('touchstart',firstGesture,{once:false,passive:false});
addEventListener('wheel',firstGesture,{once:false,passive:false});
addEventListener('keydown',firstGesture,{once:false});
['wheel','touchmove','pointerdown'].forEach(ev=>addEventListener(ev,()=>{if(armed)manualUntil=performance.now()+3600},{passive:true}));
sound.addEventListener('click',async e=>{e.stopPropagation();if(audio.paused){try{await audio.play();sound.textContent='SOUND ON';status.textContent='111 // PLAYING'}catch(_){status.textContent='111 // PLAY BLOCKED'}}else{audio.pause();sound.textContent='SOUND OFF';status.textContent='111 // PAUSED'}});
function sceneAt(t){let i=scenes.findIndex(s=>t>=s.a&&t<s.b);if(i<0)i=t>=duration?scenes.length-1:0;return[scenes[i],i]}
function local(s,t){return clamp((t-s.a)/(s.b-s.a))}
function setOpacity(el,o){if(el)el.style.opacity=clamp(o).toFixed(3)}
function cutTransform(el,x=0,y=0,scale=1,rot=0){if(el)el.style.transform=`translate(calc(-50% + ${x}vw),calc(-50% + ${y}vh)) scale(${scale}) rotate(${rot}deg)`}
function microText(s,t){let item=null;if(s.micro&&t>=s.micro[0]&&t<=s.micro[1])item=s.micro;if(s.micro2&&t>=s.micro2[0]&&t<=s.micro2[1])item=s.micro2;if(!item){setOpacity(micro,0);return}const q=clamp((t-item[0])/(item[1]-item[0])),edge=Math.min(clamp(q/.15),clamp((1-q)/.18));micro.innerHTML=item[2];setOpacity(micro,smooth(edge));micro.style.transform=`translateX(-50%) translateY(${(1-edge)*10}px) rotate(${(q-.5)*.4}deg)`}
function hitImpact(t){if(reduceMotion||!cues?.impacts?.length)return;let hit=-1,best=.055;for(let i=0;i<cues.impacts.length;i++){const d=Math.abs(cues.impacts[i]-t);if(d<best){best=d;hit=i}}if(hit>=0&&hit!==lastImpact){lastImpact=hit;stage.classList.remove('is-impact');void stage.offsetWidth;stage.classList.add('is-impact')}}
function render(t){const[s,idx]=sceneAt(t),q=local(s,t),edge=Math.min(clamp(q/.12),clamp((1-q)/.12));document.documentElement.style.setProperty('--u',(t/duration).toFixed(5));
  Object.entries(bgs).forEach(([n,e])=>{const on=n===s.bg?1:0;setOpacity(e,on*(.3+.7*smooth(edge)));e.style.transform=`scale(${1.065-q*.025}) translate(${(q-.5)*-1.4}vw,${(q-.5)*-.6}vh)`});
  Object.values(cuts).forEach(e=>setOpacity(e,0));videos.forEach(v=>setOpacity(v,0));
  if(s.cut&&cuts[s.cut]){const el=cuts[s.cut];setOpacity(el,.15+.85*smooth(edge));cutTransform(el,(q-.5)*6,(q-.5)*-2,1.02+q*.06,(q-.5)*1.2)}
  if(s.rug){setOpacity(cuts.rug,.88);cutTransform(cuts.rug,0,34,1.08,0)}
  if(s.crowd){setOpacity(cuts.crowd,clamp((q-.12)/.28));cutTransform(cuts.crowd,0,30+(1-q)*9,1.2,0)}
  if(s.show){setOpacity(cuts.show,smooth(edge));cutTransform(cuts.show,-20,4,.98,0)}
  if(s.godzilla){setOpacity(cuts.godzilla,smooth(edge));cutTransform(cuts.godzilla,24,-2,1.08,0)}
  if(s.smoke){setOpacity(cuts.smoke,.32+.3*Math.sin(q*Math.PI));cutTransform(cuts.smoke,8,9,1.12+q*.18,0)}
  if(s.video){setOpacity(footageA,.43+.12*Math.sin(t*2.1));setOpacity(footageB,.28+.1*Math.cos(t*1.7));setOpacity(footageC,.12+.08*Math.sin(t*.9));footageA.style.transform=`scale(${1.05+q*.08}) translateX(${(q-.5)*-3}vw)`;footageB.style.transform=`scale(${1.12-q*.04}) translateX(${(q-.5)*3}vw)`;footageC.style.transform=`scale(1.18) rotate(${(q-.5)*.8}deg)`;videos.forEach(v=>{if(v?.paused)v.play().catch(()=>{})})}else videos.forEach(v=>v?.pause());
  if(lastScene!==idx){lastScene=idx;kicker.textContent=s.k;headline.textContent=s.h;copy.textContent=s.p;chapter.className='chapter '+(s.align||'left')}
  setOpacity(chapter,.18+.82*smooth(edge));microText(s,t);progress.style.width=(t/duration*100)+'%';timecode.textContent=fmt(t);
  const bpm=cues?.meta?.bpm||110.294118,anchor=cues?.meta?.beatAnchor||4.331,phase=((t-anchor)/(60/bpm))%1,beat=Math.pow(1-((phase+1)%1),7);document.documentElement.style.setProperty('--beat',beat.toFixed(3));
  hitImpact(t);
  if(t>165.8&&t<172.15){endRings.classList.add('is-on');endRings.style.transform=`scale(${1+(t-165.8)*.004})`}else endRings.classList.remove('is-on')
}
function endTone(){if(finalTone)return;finalTone=true;broadcast.classList.add('is-on');broadcast.setAttribute('aria-hidden','false');status.textContent='SIGNAL // ENDED';try{const c=ensureCtx(),o=c.createOscillator(),g=c.createGain();o.frequency.value=1000;g.gain.setValueAtTime(.05,c.currentTime);o.connect(g).connect(c.destination);o.start();setTimeout(()=>{g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.2);o.stop(c.currentTime+.22)},2400)}catch(_){}}
function scrollUnit(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);return clamp(scrollY/max)}
function targetScroll(t){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);return clamp(t/duration)*max}
addEventListener('scroll',()=>{if(!armed||syncingFromAudio||performance.now()>manualUntil)return;if(scrollRAF)return;scrollRAF=requestAnimationFrame(()=>{scrollRAF=0;const t=scrollUnit()*duration;if(Number.isFinite(t)&&Math.abs(audio.currentTime-t)>.18){try{audio.currentTime=t}catch(_){}}render(t)})},{passive:true});
function loop(){const now=performance.now();if(armed&&!audio.ended){let t;if(!audio.paused){t=Math.min(duration,audio.currentTime);if(now>manualUntil){syncingFromAudio=true;scrollTo(0,targetScroll(t));syncingFromAudio=false}}else t=scrollUnit()*duration;render(t)}if(armed&&(audio.ended||audio.currentTime>=duration-.04))endTone();requestAnimationFrame(loop)}
audio.addEventListener('ended',endTone);
audio.addEventListener('play',()=>{sound.textContent='SOUND ON'});
audio.addEventListener('pause',()=>{if(!audio.ended)sound.textContent='SOUND OFF'});
render(0);requestAnimationFrame(loop);
})();
