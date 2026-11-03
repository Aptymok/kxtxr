const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const world=$('#world'),hub=$('#hub'),content=$('#hubContent'),rail=$('#hubRail'),flash=$('#flash');
const sources={
  music:{title:'EL ARTISTA.',over:'01 / MÚSICA & VIDEO',meta:'KXTXR / SIGNAL ROOM',desc:'La música funciona por sí misma. No necesitas conocer el universo narrativo ni participar en la comunidad para escuchar a KXTXR.'},
  universe:{title:'LA SEÑAL.',over:'02 / UNIVERSO & TERMINAL',meta:'KXTXR / OBSERVATION OS',desc:'Historia, ficción y tecnología se pueden explorar sin confundir reconstrucción narrativa con evidencia de acontecimientos reales.'},
  archive:{title:'EL ARCHIVO.',over:'03 / MEMORIA ARTÍSTICA',meta:'KXTXR / VAULT',desc:'Objetos, lanzamientos y huellas del proceso creativo. Las piezas históricas se conservan; no se reemplazan por una campaña nueva.'},
  memory:{title:'LA AUSENCIA.',over:'04 / MEMORIA & ORIENTACIÓN',meta:'KXTXR / HUMAN ENTRY',desc:'Una puerta distinta a la ficción: información y orientación, sin acertijos, sin registro forzado y sin tratamiento de casos sensibles en este prototipo.'}
};
let active=null,lastTrigger=null,task=null,requestedTab=null;
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function elementLink(label,url,cls='text-link'){const a=node('a',cls,label);a.href=url;a.target=url.startsWith('http')?'_blank':'_self';if(a.target==='_blank')a.rel='noopener noreferrer';return a}
function panelTile(code,title,description){const e=node('article','tile');e.append(node('span','micro',code),node('h3','',title),node('p','',description));return e}
function addHeading(parent,kicker,title,description){parent.append(node('span','micro',kicker),node('h2','',title));if(description)parent.append(node('p','',description))}
function addActions(parent,items){const row=node('div','row-actions');for(const [label,url] of items)row.append(elementLink(label,url));parent.append(row);return row}
function railButtons(items,selected,onSelect){rail.replaceChildren();items.forEach(([id,label])=>{const b=node('button','',label);b.type='button';b.setAttribute('aria-pressed',String(id===selected));b.addEventListener('click',()=>onSelect(id));rail.append(b)})}
function showTab(panels,key){for(const [id,el] of Object.entries(panels))el.hidden=id!==key;$$('button',rail).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===key)))}
function selectTabs(items,initial,render){let current=initial;const choose=id=>{current=id;$$('audio',content).forEach(a=>a.pause());railButtons(items,current,choose);render(id)};choose(current)}
function music(){const panels={};const items=[['listen','01 · ESCUCHAR'],['video','02 · VIDEO'],['artist','03 · ARTISTA']];selectTabs(items,requestedTab==='video'?'video':requestedTab==='artist'?'artist':'listen',tab=>{content.replaceChildren();if(tab==='listen'){
  addHeading(content,'REPRODUCCIÓN BAJO CONTROL DEL VISITANTE','REM618 / 111 / QUE NO','Estas obras forman parte de la genealogía KXTXR. No se anuncian como publicadas canciones sin distribución confirmada.');
  const player=node('div','player-box');player.append(node('span','micro','REM618 · ORIGINAL MASTER / ENLACE DE AUDIO'));const wave=node('div','wave');for(let i=0;i<42;i++){const b=node('i');b.style.setProperty('--h',`${14+Math.abs(Math.sin(i*.61))*72}%`);b.style.setProperty('--d',`${-i*.047}s`);wave.append(b)}player.append(wave);
  const audio=node('audio');audio.controls=true;audio.preload='none';audio.src='/assets/KXTXR%20-%20REM%20618%20master%20final.wav';audio.setAttribute('aria-label','Reproducir REM618');audio.addEventListener('error',()=>{status.textContent='El archivo remoto no pudo cargarse. Utiliza los enlaces oficiales para escuchar.'});player.append(audio);const status=node('p','micro','Audio remoto: se inicia únicamente por acción del usuario.');player.append(status);content.append(player);
  addActions(content,[['Spotify · KXTXR ↗','https://open.spotify.com/artist/5Iwk9h7kNRB8GPNGeiRKGh'],['Apple Music ↗','https://music.apple.com/mx/artist/kxtxr/6772383279'],['Catálogo web ↗','/legacy/#musica']]);
  const grid=node('div','content-grid');grid.append(panelTile('01 · ORIGEN','REM618','La primera señal como anomalía artística.'),panelTile('02 · TRANSFORMACIÓN','111','El sonido adquiere un emisor y una historia.'),panelTile('03 · PRESENCIA','QUE NO','La memoria se convierte en acción, interpretación y cuerpo.'),panelTile('31 DIC 2026 · OBJETIVO','PRÓXIMO LANZAMIENTO','El título y la distribución requieren confirmación artística.'));content.append(grid);
}else if(tab==='video'){
  addHeading(content,'NARRATIVA / NO VIDEO SIMULADO','EL FILM DE KXTXR.','Las experiencias audiovisuales publicadas se abren desde su fuente real. Aquí no se inventan emisiones en vivo.');
  const grid=node('div','content-grid');grid.append(panelTile('FILM','111 · SIGNAL FILM','Experiencia cinematográfica con scroll y audio, ya disponible en la web de KXTXR.'),panelTile('ARCHIVO','REM618 HISTORICAL','Conservación de un estado histórico de la identidad del proyecto.'),panelTile('VIDEO','LIVE / PRESENCE','Material de campo; los créditos, fechas y sedes sólo se atribuyen con respaldo.'),panelTile('SALIDA','LA MÚSICA','Las piezas audiovisuales regresan al catálogo, no desplazan al artista.'));content.append(grid);
  addActions(content,[['Abrir film 111 ↗','/artist/'],['Material live ↗','/legacy/#live']]);
}else{addHeading(content,'AUTORÍA','EDWING / KXTXR','La presencia, la voz y el trabajo creativo del músico son el centro de esta ruta. SFI no es coautor de la obra por observar sus resultados.');const grid=node('div','content-grid');grid.append(panelTile('MÚSICA','PERFIL DE ARTISTA','Escuchar sus obras, seguir lanzamientos y explorar su historia.'),panelTile('CONTRATACIÓN','PRESENCIA FÍSICA','Prensa, dossier y actuaciones sin fingir conciertos no documentados.'));content.append(grid);addActions(content,[['Experiencia del artista ↗','/artist/'],['Prensa y contacto ↗','/legacy/#contacto']]);}
})}
function universe(){const items=[['timeline','01 · TIMELINE'],['terminal','02 · TERMINAL'],['field','03 · OBSERVATORIO']];selectTabs(items,requestedTab==='terminal'?'terminal':'timeline',tab=>{content.replaceChildren();if(tab==='timeline'){
  addHeading(content,'CANON / PROYECCIÓN','1987 → 2050','La línea de tiempo es un espacio narrativo. Las fechas de ficción no equivalen a registros históricos verificables.');const years=[['1987','Anclaje inicial de la señal'],['1991','Desviación del canon narrativo'],['1998','Subestación y desplazamiento'],['2003','Resonancia secundaria'],['2024','Umbral de transición'],['2026','Punto actual de observación'],['2031','Horizonte proyectado'],['2038','Horizonte proyectado'],['2050','Horizonte proyectado']];const row=node('div','timeline'),detail=node('div','notice','Selecciona un año para inspeccionar el nodo.');for(const [year,label] of years){const b=node('button','year',year);b.type='button';b.addEventListener('click',()=>{$$('button',row).forEach(x=>x.classList.remove('active'));b.classList.add('active');detail.textContent=`${year} · ${label} · ${Number(year)>2026?'PROYECCIÓN DE FICCIÓN':'NODO DEL RELATO KXTXR'}`});row.append(b)}content.append(row,detail);addActions(content,[['Archivo original ↗','/legacy/#archivo']]);
}else if(tab==='terminal'){
  addHeading(content,'CONSOLa NARRATIVA · OPERACIONES LOCALES','OBSERVATION OS','Los comandos exploran esta experiencia y no proporcionan acceso a sistemas, casos ni datos personales.');const out=node('div','terminal-output','KXTXR OBSERVATION OS / LOCAL DEMO\nSTATUS: LOCAL SCENE ACTIVE\nType help to inspect available commands.');out.setAttribute('role','log');out.setAttribute('aria-live','polite');const row=node('form','term-entry');const inp=node('input','prompt');inp.placeholder='help | signal | releases | timeline | clear';inp.setAttribute('aria-label','Comando de terminal');const submit=node('button','control','EJECUTAR ↵');submit.type='submit';row.append(inp,submit);row.addEventListener('submit',e=>{e.preventDefault();const command=inp.value.trim().toLowerCase();inp.value='';if(!command)return;const replies={help:'AVAILABLE: help, signal, releases, timeline, status, memory, clear',signal:'6.18 · REM618 is the symbolic carrier in KXTXR fiction.',releases:'REM618 → 111 → QUE NO → NEW SIGNAL (pending approval)',timeline:'1987 → 1991 → 1998 → 2003 → 2024 → 2026 → [2031, 2038, 2050 projected]',status:'LOCAL UI READY. No authenticated backend or live instrumentation.',memory:'Real community cases are NOT accessible from the fictional terminal.'};if(command==='clear'){out.textContent='KXTXR OBSERVATION OS / LOCAL DEMO\n';return}out.textContent+=`\n> ${command}\n${replies[command]||'UNKNOWN COMMAND. Type help.'}`;out.scrollTop=out.scrollHeight});content.append(out,row);
}else{addHeading(content,'ARCHITECTURA / EVIDENCIA','FICCIÓN Y REALIDAD.','La terminal y el juego pueden descubrir fragmentos ficticios. La evidencia real requiere procedencia, privacidad, corrección y responsables humanos.');const grid=node('div','content-grid');grid.append(panelTile('SIGNAL','REM618','Frecuencia como símbolo narrativo, no medición de señal real.'),panelTile('RECONSTRUCCIÓN','DOCUMENTOS','El archivo artístico preserva versiones y genealogía.'),panelTile('LIMITES','SIN ACCESO PRIVILEGIADO','La ficción nunca revela datos personales ni desbloquea expedientes reales.'),panelTile('SFI','OBSERVACIÓN','Separar interacción, respuesta, evidencia y resultados verificables.'));content.append(grid)}
})}
const archiveData=[{code:'REM618',title:'REM618 · Histórico',kind:'Música / archivo',url:'/historical/rem618/'},{code:'111',title:'111 · Signal Film',kind:'Narrativa audiovisual',url:'/artist/'},{code:'QUE-NO',title:'QUE NO · Representation Field',kind:'Proceso artístico',url:'/legacy/#queno'},{code:'GRIMOIRE',title:'Registro artístico / estado público',kind:'Datos y procedencia',url:'/legacy/#archivo'},{code:'PRESS',title:'Material de prensa y contacto',kind:'Carrera artística',url:'/legacy/#contacto'}];
function archive(){const items=[['index','01 · REGISTROS'],['vault','02 · BÓVEDA']];selectTabs(items,requestedTab==='vault'?'vault':'index',tab=>{content.replaceChildren();if(tab==='index'){
  addHeading(content,'REGISTROS ARTÍSTICOS','LA HUELLA.','Buscar obras y archivos públicos existentes; nada de expedientes inventados.');const input=node('input','search');input.type='search';input.placeholder='Filtrar REM618, 111, QUE NO, PRESS…';input.setAttribute('aria-label','Buscar registros de archivo');const result=node('div');const render=()=>{const q=input.value.toLowerCase().trim();result.replaceChildren();const matches=archiveData.filter(x=>[x.code,x.title,x.kind].join(' ').toLowerCase().includes(q));if(!matches.length)result.append(node('p','','Sin coincidencias.'));for(const item of matches){const r=node('div','record');const left=node('div');left.append(node('span','micro',item.code),node('div','',item.title),node('small','',item.kind));r.append(left,elementLink('ABRIR ↗',item.url));result.append(r)}};input.addEventListener('input',render);content.append(input,result);render();
}else{addHeading(content,'LA BÓVEDA / OBJETOS FÍSICOS','ARTEFACTOS.','La extensión física de la obra puede incluir ediciones, materiales y objetos. El catálogo existente no constituye una tienda de pago funcional.');const grid=node('div','content-grid');grid.append(panelTile('CORPUS VISUAL','65 / 65','El film del artista documenta un corpus audiovisual asociado a su narrativa.'),panelTile('STICKER SHOP','MANIFIESTO LOCAL','El módulo existente compone una selección sin procesar cobros.'),panelTile('PROCEDENCIA','IDENTIDAD ARTÍSTICA','Un objeto adquiere sentido por su vínculo con un lanzamiento y su autor.'),panelTile('TRANSPARENCIA','SIN COMPRAS FICTICIAS','No se muestran precios, existencias ni recibos sin un comercio real.'));content.append(grid);addActions(content,[['Explorar bóveda existente ↗','/artist/#stickerShop']]);}
})}
function memory(){
  const boardUrl='https://sfi-living-blackboard.hh8xnc46c6.chatgpt.site/';
  const items=[['board','01 · TABLÓN'],['participation','02 · PARTICIPACIÓN'],['safety','03 · RESGUARDO']];
  selectTabs(items,'board',tab=>{
    content.replaceChildren();const paper=node('div','memory-box');content.append(paper);
    if(tab==='board'){
      addHeading(paper,'TABLÓN SOCIAL ORIGINAL · SFI LIVING BLACKBOARD','UN ESPACIO PARA CONECTAR ACCIONES.','Este es el Living Blackboard existente de SFI. La entrada KXTXR lo conecta como superficie independiente, sin copiar tarjetas privadas ni inventar resultados públicos.');
      paper.append(node('p','','El tablón se consulta en su propio sitio. La participación requiere una identidad autenticada y permisos gestionados por el servicio del tablón; KXTXR no recopila ni guarda contraseñas.'));
      addActions(paper,[['Abrir Living Blackboard ↗',boardUrl]]);
      const grid=node('div','content-grid');
      grid.append(
        panelTile('CONSULTA','Leer lo publicado','El acceso al contenido depende de los permisos y de la visibilidad real del servicio.'),
        panelTile('SEGUIMIENTO','Consultar avances','Las acciones, responsables, revisiones y resultados deben identificarse con fuentes y fecha cuando el servicio los ofrezca.'),
        panelTile('PARTICIPACIÓN','Comentarios identificados','Comentar no es una función local de KXTXR: debe realizarse dentro de una sesión autenticada en el tablón.'),
        panelTile('CUIDADO','Personas y derechos','No confundir iniciativas sociales con expedientes sensibles ni publicar información privada de terceros.')
      );paper.append(grid);
    }else if(tab==='participation'){
      addHeading(paper,'IDENTIDAD Y PERMISOS','PARTICIPAR REQUIERE SESIÓN.','Para comentar, seguir una iniciativa o aportar evidencias, entra al Living Blackboard con una cuenta autorizada por su propio servicio.');
      paper.append(node('div','notice','KXTXR no autentica cuentas SFI desde esta pantalla. No escribas contraseñas, testimonios sensibles ni datos de terceros en formularios de demostración. El inicio de sesión y los permisos de comentario/seguimiento deben verificarse en el servicio de destino.'));
      const grid=node('div','content-grid');grid.append(
        panelTile('01','Identifícate','Abre el sitio original y usa su mecanismo de acceso, si está disponible.'),
        panelTile('02','Selecciona una iniciativa','Revisa la procedencia, el estado y las personas responsables antes de intervenir.'),
        panelTile('03','Comenta o sigue','La operación sólo cuenta si el servicio confirma que fue guardada bajo tu identidad.'),
        panelTile('04','Comprueba el resultado','Una acción enviada no acredita resolución. Busca seguimiento y resultados verificados.')
      );paper.append(grid);
      addActions(paper,[['Ir al tablón / Acceso ↗',boardUrl]]);
    }else{
      addHeading(paper,'PROTECCIÓN DE DATOS Y AUTORIDAD','SEPARAR PARTICIPACIÓN DE EVIDENCIA.','El acceso social no constituye una autorización para divulgar nombres, ubicaciones, denuncias, expedientes o información sensible.');
      const grid=node('div','content-grid');grid.append(
        panelTile('PÚBLICO','Difusión revisada','Sólo materiales con autorización, contexto y posibilidad de corrección.'),
        panelTile('PRIVADO','Expedientes protegidos','Los casos reales requieren consentimiento, pertenencia y controles de acceso independientes.'),
        panelTile('IA','Apoyo delimitado','Una sugerencia de IA no equivale a evidencia, resolución ni decisión institucional.'),
        panelTile('SEGUIMIENTO','Hechos y retornos','Diferenciar comentario, compromiso, ejecución y resultado demostrado.')
      );paper.append(grid);
      addActions(paper,[['Consultar Living Blackboard ↗',boardUrl],['Recursos públicos de búsqueda ↗','https://comisionacionaldebusqueda.gob.mx/']]);
    }
  });
}
const renderers={music,universe,archive,memory};
function openHub(key,trigger){if(!renderers[key])return;lastTrigger=trigger;active=key;const data=sources[key];$('#hubTitle').textContent=data.title;$('#hubMeta').textContent=data.meta;$('#hubOverline').textContent=data.over;$('#hubDesc').textContent=data.desc;renderers[key]();hub.inert=false;hub.classList.add('open');hub.setAttribute('aria-hidden','false');$('#announcer').textContent=`Se abrió ${data.title}`;window.history.replaceState(null,'',`#${key}`);window.setTimeout(()=>$('#closeHub').focus(),70)}
function enterHub(key,trigger){if(active)return;if(key==='music'&&!reduced){flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go');task=window.setTimeout(()=>{flash.classList.remove('go');openHub(key,trigger)},310)}else{openHub(key,trigger)}}
function closeHub(){if(task){clearTimeout(task);task=null}if(!active)return;hub.classList.remove('open');hub.setAttribute('aria-hidden','true');hub.inert=true;$$('audio',content).forEach(a=>a.pause());active=null;history.replaceState(null,'',location.pathname);lastTrigger?.focus();$('#announcer').textContent='Se cerró el módulo. Regresaste al portal.'}
$$('[data-hub]').forEach(el=>{
  el.addEventListener('click',e=>{
    if(e.target!==el&&e.target.closest('a,button,input,form,video,audio'))return;
    requestedTab=el.dataset.tab||null;
    enterHub(el.dataset.hub,el);
  });
  if(el.getAttribute('role')==='button')el.addEventListener('keydown',e=>{
    if(e.target!==el)return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();requestedTab=el.dataset.tab||null;enterHub(el.dataset.hub,el)}
  });
});$('#closeHub').addEventListener('click',closeHub);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHub();if(e.key==='Tab'&&active){const focus=$$('button,a,input,textarea,audio',hub).filter(x=>!x.closest('[hidden]')&&!x.disabled&&x.getClientRects().length);if(!focus.length)return;const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function clock(){const date=new Date();const time=date.toISOString().slice(11,19);const sceneClock=$('#clock'),dialogClock=$('#hubClock');if(sceneClock)sceneClock.textContent=`UTC ${time}`;if(dialogClock)dialogClock.textContent=`● LOCAL / ${time}`};clock();setInterval(clock,1000);
if(!reduced){world.addEventListener('pointermove',e=>{if(active)return;const x=e.clientX/window.innerWidth-.5,y=e.clientY/window.innerHeight-.5;world.style.setProperty('--px',`${-x*9}px`);world.style.setProperty('--py',`${-y*6}px`);world.style.setProperty('--gx',`${x*30}px`)},{passive:true})}
if(['music','universe','archive','memory'].includes(location.hash.slice(1)))openHub(location.hash.slice(1),null);
/* Scene-local interactions. They must not open an unrelated overlay when used. */
const sceneAudio=$('#sceneAudio'),scenePlay=$('#scenePlay'),audioStatus=$('#sceneAudioStatus');
if(sceneAudio&&scenePlay){
  scenePlay.addEventListener('click',async e=>{e.stopPropagation();
    if(sceneAudio.paused){try{await sceneAudio.play();audioStatus.textContent='REPRODUCIENDO';scenePlay.textContent='Ⅱ'}catch{audioStatus.textContent='AUDIO NO DISPONIBLE'}}
    else{sceneAudio.pause();audioStatus.textContent='EN PAUSA';scenePlay.textContent='▶'}
  });
  sceneAudio.addEventListener('ended',()=>{scenePlay.textContent='▶';audioStatus.textContent='FINALIZADO'});
  sceneAudio.addEventListener('error',()=>{audioStatus.textContent='ARCHIVO NO DISPONIBLE';scenePlay.textContent='▶'});
}
const liveVideo=$('#sceneLive'),liveToggle=$('#sceneVideoToggle');
if(liveVideo&&liveToggle){
  liveToggle.addEventListener('click',async e=>{e.stopPropagation();
    if(liveVideo.paused){try{await liveVideo.play();liveToggle.textContent='Ⅱ PAUSAR'}catch{liveToggle.textContent='VIDEO NO DISPONIBLE'}}
    else{liveVideo.pause();liveToggle.textContent='▶ REPRODUCIR'}
  });
  liveVideo.addEventListener('ended',()=>liveToggle.textContent='▶ REPRODUCIR');
  liveVideo.addEventListener('error',()=>liveToggle.textContent='VIDEO NO DISPONIBLE');
}
const terminalForm=$('#sceneTermForm'),terminalInput=$('#sceneTermInput'),terminalLog=$('#sceneTermLog');
if(terminalForm){
  terminalForm.addEventListener('click',e=>e.stopPropagation());
  terminalForm.addEventListener('keydown',e=>e.stopPropagation());
  terminalForm.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();
    const q=terminalInput.value.trim().toLowerCase();terminalInput.value='';
    if(!q)return;
    const answers={
      help:'AVAILABLE: help / signal / archive / music / memory / status / clear',
      signal:'REM618 → 111 → QUE NO. THE SIGNAL IS ARTISTIC FICTION.',
      archive:'SOURCE: /legacy/#archivo · /historical/rem618/',
      music:'SOURCE: /artist/ · /legacy/#musica',
      memory:'SFI LIVING BLACKBOARD IS A SEPARATE SERVICE. PARTICIPATION REQUIRES ITS OWN ACCESS.',
      status:'SCENE RUNNING LOCALLY IN BROWSER. NO LIVE TELEMETRY OR PRIVATE CASE ACCESS.'
    };
    if(q==='clear'){terminalLog.textContent='KXTXR / TERMINAL READY';return}
    const line=document.createElement('div');line.textContent='> '+q+'\n'+(answers[q]||'UNKNOWN COMMAND. TYPE HELP.');
    line.style.whiteSpace='pre-line';terminalLog.append(line);terminalLog.scrollTop=terminalLog.scrollHeight;
  });
}
const previewYears={
  '1987':'Punto de anclaje ficcional; no es un evento históricamente validado.',
  '1998':'Nodo de la cronología narrativa de KXTXR.',
  '2018':'Referencia de relato; la fecha no demuestra una publicación real.',
  '2026':'Año presente de referencia de las obras y la experiencia.',
  '2050*':'Horizonte proyectado de ficción, no acontecimiento observado.'
};
$$('#timelineTrack span').forEach(el=>{
  el.setAttribute('role','button');el.tabIndex=0;
  const select=()=>{const year=el.textContent;$('#timelinePreviewYear').textContent=year+' · NODO NARRATIVO';$('#timelinePreviewText').textContent=previewYears[year];};
  el.addEventListener('click',e=>{e.stopPropagation();select()});
  el.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}});
});
