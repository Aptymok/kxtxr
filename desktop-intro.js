(function(){
'use strict';
const DESKTOP='(min-width: 1181px)';

function clickWhenReady(selector,attempts=28){
  const el=document.querySelector(selector);
  if(el){el.click();return;}
  if(attempts>0)setTimeout(()=>clickWhenReady(selector,attempts-1),70);
}

function leaveIntro(intro,mode){
  if(intro.dataset.state==='exit')return;
  intro.dataset.state='exit';
  intro.dataset.entry=mode;
  document.documentElement.dataset.kxtxrEntry=mode;
  setTimeout(()=>intro.classList.add('is-leaving'),120);
  setTimeout(()=>{
    intro.hidden=true;
    intro.setAttribute('aria-hidden','true');
    if(mode==='notes')clickWhenReady('.rune-node[data-layer="notes"]');
    if(mode==='artist')window.location.assign('/artist/');
  },940);
}

function init(){
  const intro=document.getElementById('kxIntro');
  if(!intro)return;
  if(!window.matchMedia(DESKTOP).matches){
    intro.hidden=true;
    intro.setAttribute('aria-hidden','true');
    return;
  }

  intro.querySelectorAll('[data-kx-entry]').forEach(button=>{
    button.addEventListener('click',()=>leaveIntro(intro,button.dataset.kxEntry));
  });

  window.addEventListener('keydown',event=>{
    if(intro.hidden)return;
    if(event.key==='1')leaveIntro(intro,'notes');
    if(event.key==='2')leaveIntro(intro,'artist');
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
