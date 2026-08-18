(function(){
'use strict';
const PACK='/artist/assets/kxtxr-artist-pack.bin';
const td=new TextDecoder();
function shell(){return `
<main class="kx-pack-artist" id="kxPackArtist" aria-label="KXTXR artist immersive experience">
  <div class="kx-pack-stage" id="kxPackStage">
    <div class="kx-pack-bgfield" id="kxPackBgfield"></div>
    <div class="kx-pack-wash"></div><div class="kx-pack-halftone"></div><div class="kx-pack-speed"></div>
    <div class="kx-pack-world"><div id="kxPackRugs"></div><div id="kxPackActors"></div><div id="kxPackProps"></div><div id="kxPackFx"></div></div>
    <nav class="kx-pack-socials" id="kxPackSocials" aria-label="KXTXR networks">
      <a href="#" data-network="SPOTIFY">SPOTIFY</a><a href="#" data-network="APPLE MUSIC">APPLE MUSIC</a>
      <a href="#" data-network="AMAZON MUSIC">AMAZON MUSIC</a><a href="#" data-network="YOUTUBE">YOUTUBE</a>
      <a href="#" data-network="TIKTOK">TIKTOK</a><a href="#" data-network="INSTAGRAM">INSTAGRAM</a>
      <a href="/" data-network="WEBSITE">WEBSITE</a><a href="#" data-network="CORREO ELECTRÓNICO">CORREO ELECTRÓNICO</a>
    </nav>
    <button class="kx-pack-gate" id="kxPackGate" type="button" aria-label="Start 111"><span></span></button>
    <button class="kx-pack-sound is-muted" id="kxPackSound" type="button" aria-label="Play or pause 111"><i></i><i></i><i></i><i></i></button>
    <a class="kx-pack-return" href="/" aria-label="Return to KXTXR">×</a><div class="kx-pack-progress"><i id="kxPackProgress"></i></div>
  </div>
  <div class="kx-pack-track" id="kxPackTrack" aria-hidden="true">
    ${['wake','signal','bass','guitar','drums','vocal','producer','rem618','marketing','video','edit','laundry','coffee','pasta','crash','loop','energy111','live','kaiju','network'].map(x=>`<section data-scene="${x}"></section>`).join('')}
  </div>
  <audio id="kxPack111" preload="auto" playsinline></audio>
</main>`}
async function parse(){
  const r=await fetch(PACK,{cache:'force-cache'});if(!r.ok)return null;
  const b=await r.arrayBuffer(),u=new Uint8Array(b);if(td.decode(u.slice(0,8))!=='KXPACK01')throw new Error('Invalid KXTXR artist pack');
  const hlen=new DataView(b).getUint32(8,false),h0=12,h1=h0+hlen,h=JSON.parse(td.decode(u.slice(h0,h1))),out={};
  for(const e of h.entries){const bytes=u.slice(h1+e.offset,h1+e.offset+e.size);out[e.name]=URL.createObjectURL(new Blob([bytes],{type:e.mime}))}
  return out;
}
async function boot(){
  try{const pack=await parse();if(!pack)return;window.KXTXR_ARTIST_PACK=pack;document.documentElement.dataset.artistPack='ready';document.body.innerHTML=shell();
    const s=document.createElement('script');s.src='/artist/artist-media-pack-runtime.js';s.defer=true;document.body.appendChild(s);
  }catch(e){console.warn('[KXTXR] media pack unavailable',e)}
}
boot();
})();
