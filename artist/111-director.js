(function(){
'use strict';
const cues=window.KXTXR111_CUES;if(!cues)return;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const stage=q('#kxStage'),audio=q('#kx111'),track=q('#kxTrack'),sections=qa('#kxTrack section'),sound=q('#kxSound');
if(!stage||!track)return;
const rug=document.createElement('div');rug.className='kx-rug';rug.setAttribute('aria-hidden','true');stage.insertBefore(rug,q('#kxLayerfield'));
const ring=document.createElement('div');ring.className='kx-melody-ring';ring.setAttribute('aria-hidden','true');stage.appendChild(ring);
const cinema=new URLSearchParams(location.search).get('cinema')==='1';if(cinema)document.documentElement.dataset.cinema='1';
let lastImpact=-1,lastScene='';
const pcHue={'C':0,'C#':.08,'D':.16,'D#':.24,'E':.32,'F':.4,'F#':.48,'G':.56,'G#':.64,'A':.72,'A#':.82,'B':.92};
function sceneAt(t){let s=cues.scenes[0];for(const x of cues.scenes){if(t>=x.start)s=x;if(t>=x.start&&t<x.end)return x}return cues.scenes[cues.scenes.length-1]}
function melodyAt(t){let m=cues.melody[0];for(const x of cues.melody){if(x.t<=t)m=x;else break}return m}
function nearestImpact(t){let best=-1,d=.095;for(let i=0;i<cues.impacts.length;i++){const x=Math.abs(cues.impacts[i]-t);if(x<d){d=x;best=i}}return best}
function applyClock(t){t=clamp(t,0,cues.meta.duration);const s=sceneAt(t),local=clamp((t-s.start)/(s.end-s.start));stage.dataset.scene=s.id;stage.style.setProperty('--kx-scene',local);const m=melodyAt(t),mel=clamp((pcHue[m.pc[0]]||0)*.55+(m.w[0]||0)*.45);stage.style.setProperty('--kx-melody',mel.toFixed(4));const beatPhase=((t-cues.meta.beatAnchor)/(cues.meta.barPeriod/4));const phase=((beatPhase%1)+1)%1;stage.style.setProperty('--kx-beat',Math.pow(1-phase,6).toFixed(4));const impact=nearestImpact(t);if(impact>=0&&impact!==lastImpact){lastImpact=impact;stage.classList.remove('is-impact');void stage.offsetWidth;stage.classList.add('is-impact')}if(lastScene!==s.id){lastScene=s.id;stage.dataset.scene=s.id}return {s,local}}
function scrollClock(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);return clamp(scrollY/max)*cues.meta.duration}
function driveCinema(t){const {s,local}=applyClock(t);const i=cues.scenes.indexOf(s),sec=sections[i];if(!sec)return;const maxLocal=Math.max(1,sec.offsetHeight-innerHeight);const y=sec.offsetTop+local*maxLocal;scrollTo(0,y)}
function tick(){const hasAudio=audio&&audio.src&&!audio.paused&&!audio.ended;const t=hasAudio?audio.currentTime:scrollClock();if(cinema&&hasAudio)driveCinema(t);else applyClock(t);requestAnimationFrame(tick)}
async function arm(){if(!audio)return false;const candidates=['/assets/KXTXR_111_TRUEPEAK_CORRECTED_48K24_SFI_ARCHIVAL.wav','/assets/111.wav','/assets/111.mp3','/assets/KXTXR-111-master.wav'];if(audio.src)return true;for(const src of candidates){try{const r=await fetch(src,{method:'HEAD',cache:'no-store'});if(r.ok){audio.src=src;audio.loop=false;return true}}catch(_){}}return false}
async function startFromEntry(){let armed=await arm();if(!armed)return;const asked=sessionStorage.getItem('kxtxrArtistAudio')==='1'||cinema;if(!asked)return;sessionStorage.removeItem('kxtxrArtistAudio');try{audio.currentTime=0;await audio.play();sound?.classList.remove('is-muted')}catch(_){sound?.classList.add('is-muted')}}
if(audio){audio.addEventListener('ended',()=>{if(cinema){applyClock(cues.meta.duration-.001);scrollTo(0,document.documentElement.scrollHeight-innerHeight)}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startFromEntry,{once:true});else startFromEntry();
requestAnimationFrame(tick);
})();
