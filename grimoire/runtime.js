const FILES = {
  ledger: '/grimoire/ledger.json',
  experiment: '/grimoire/experiment.json',
  logbook: '/grimoire/logbook.json',
  retro: '/grimoire/retrolongitudinal.json',
  questions: '/grimoire/questions.json',
  snapshots: '/grimoire/snapshots.json',
  notes: '/grimoire/notes.json',
  story: '/grimoire/story.json'
};

const state = {
  data: {},
  view: 'return',
  labRun: 0
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function errorPanel(message) {
  return `<div class="error-state">CANONICAL DATA UNAVAILABLE.<br>${esc(message)}</div>`;
}

function classBadge(value) {
  const klass = String(value || 'DECLARED').toUpperCase();
  return `<span class="class ${esc(klass)}">${esc(klass)}</span>`;
}

function list(items) {
  if (!items?.length) return '<p class="missing">MISSING / NONE RECORDED</p>';
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function sigilSvg() {
  return `
    <svg viewBox="0 0 240 300" role="img" aria-label="KXTXR signature">
      <circle cx="120" cy="150" r="112"/>
      <circle cx="120" cy="150" r="91" stroke-dasharray="5 12"/>
      <path d="M52 32 L52 174 L108 112 L144 112 L91 170 L130 211 L98 244 L52 196 L52 268"/>
      <path d="M185 54 L185 268 L131 210 L157 181 L185 209"/>
      <path d="M106 137 L152 184 M152 137 L106 184"/>
    </svg>`;
}

async function loadCanonicalData() {
  const results = await Promise.all(
    Object.entries(FILES).map(async ([key, url]) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(String(response.status));
        return [key, await response.json()];
      } catch (error) {
        return [key, { _error: `${url}:${error.message}` }];
      }
    })
  );

  state.data = Object.fromEntries(results);
  renderOverview();
  renderView(state.view);
}

function renderOverview() {
  const experiment = state.data.experiment;
  const ledger = state.data.ledger;
  const root = $('#leftPage');
  if (!root) return;

  if (experiment?._error || ledger?._error) {
    root.innerHTML = errorPanel(experiment?._error || ledger?._error);
    return;
  }

  const currentFolio = ledger.daily_folio?.[0] || {};
  root.innerHTML = `
    <div class="fade-in">
      <div class="folio-kicker">KXTXR / LIVING GRIMOIRE · ${esc(experiment.state)}</div>
      <div class="sigil-main">${sigilSvg()}</div>
      <h1 class="folio-title">The experiment<br>observes itself.</h1>
      <p class="folio-copy">${esc(experiment.primary_question)}</p>
      <div class="state-grid">
        <div class="state-cell"><label>CURRENT PHASE</label><span class="open">${esc(experiment.current_phase?.name)}</span></div>
        <div class="state-cell"><label>AXIOM</label><span>${esc(ledger.axiom)}</span></div>
        <div class="state-cell"><label>FOLIO</label><span>${esc(currentFolio.id || 'MISSING')}</span></div>
        <div class="state-cell"><label>NEXT STATE</label><span class="missing">UNRESOLVED</span></div>
      </div>
      <div class="rule">
        AI ASSISTED / HUMAN GOVERNED / SFI OBSERVED<br>
        VISUALIZATION ≠ MEASUREMENT · MISSING REMAINS MISSING
      </div>
    </div>`;
}

function artifactByLabel(label) {
  return state.data.ledger?.lineage?.find((item) => item.label === label);
}

function renderArtifact(view) {
  const label = view === 'rem' ? 'REM618' : '111';
  const artifact = artifactByLabel(label);
  if (!artifact) return errorPanel(`${label} / MISSING`);

  const rem = label === 'REM618';
  return `
    <div class="fade-in">
      <div class="folio-kicker">${rem ? 'I / PRIMA MATERIA' : 'II / COAGULA'}</div>
      <h2 class="section-title">${label}</h2>
      <p class="section-sub">${esc(artifact.function)}</p>
      <div class="state-grid">
        <div class="state-cell"><label>STATE</label><span class="open">${esc(artifact.state)}</span></div>
        <div class="state-cell"><label>EPISTEMIC CLASS</label><span>${esc(artifact.epistemic_class)}</span></div>
        <div class="state-cell"><label>OPENED</label><span>${esc(artifact.opened_at || 'MISSING')}</span></div>
        <div class="state-cell"><label>EXTERNAL MANIFESTATIONS</label><span>${artifact.external_manifestations?.length || 0}</span></div>
      </div>
      ${rem
        ? '<a class="external-link" href="/historical/rem618/">ENTER PRESERVED HISTORICAL EVENT →</a>'
        : `<div class="rule">PAYLOAD SHA-256<br>${esc(artifact.payload_sha256 || 'MISSING')}</div>`}
      <div class="rule">ARTIFACT ≠ PUBLICATION ≠ EVIDENCE</div>
    </div>`;
}

function renderReturn() {
  const artifact = artifactByLabel('RETURN');
  if (!artifact) return errorPanel('RETURN / MISSING');

  const records = (artifact.external_manifestations || []).map((manifestation) => `
    <article class="record">
      <div class="record-head">
        <span class="record-id">${esc(manifestation.trace_id)} / ${esc(manifestation.platform).toUpperCase()}</span>
        ${classBadge(manifestation.state === 'PREPARED' ? 'DECLARED' : 'OBSERVED')}
      </div>
      <h3>${esc(manifestation.state)}</h3>
      <p>SCHEDULED · ${esc(manifestation.scheduled_at || 'MISSING')}</p>
      <p>URL · ${manifestation.external_url
        ? `<a href="${esc(manifestation.external_url)}" target="_blank" rel="noreferrer">${esc(manifestation.external_url)}</a>`
        : 'MISSING'}</p>
      <p class="decision">CERTIFICATE · <a href="${esc(manifestation.certificate_url)}" target="_blank" rel="noreferrer">${esc(manifestation.certificate_url)}</a></p>
    </article>`).join('');

  return `
    <div class="fade-in">
      <div class="folio-kicker">III / SOLVE ↔ COAGULA</div>
      <h2 class="section-title">RETURN</h2>
      <p class="section-sub">${esc(artifact.function)}</p>
      <div class="record-list">${records}</div>
      <div class="rule">
        PREPARED → PUBLISHED → POST-PLATFORM QA → VERIFIED<br>
        PUBLICATION ≠ EVIDENCE · SFI CERTIFICATE ≠ TRUTH
      </div>
    </div>`;
}

function renderStory() {
  const data = state.data.story;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">NARRATIVE SPINE / CANONICAL</div>
      <h2 class="section-title">${esc(data.title)}</h2>
      <div class="timeline">
        ${(data.chapters || []).map((chapter) => `
          <article class="chapter">
            <small>${esc(chapter.id)} · ${esc(chapter.label)} · ${esc(chapter.state)}</small>
            <h3>${esc(chapter.title)}</h3>
            <p>${esc(chapter.text)}</p>
          </article>`).join('')}
      </div>
    </div>`;
}

function localNotebookMarkup() {
  return `
    <section class="notebook">
      <div class="folio-kicker">LOCAL FIELD NOTEBOOK / NOT CANONICAL</div>
      <textarea id="localNote" placeholder="Write a private observation. It stays in this browser unless exported and later admitted into the canonical logbook."></textarea>
      <div class="notebook-actions">
        <button class="micro-btn" id="saveLocal">SAVE LOCAL</button>
        <button class="micro-btn" id="exportLocal">EXPORT JSON</button>
        <button class="micro-btn" id="clearLocal">CLEAR</button>
      </div>
      <div class="local-log" id="localLog"></div>
    </section>`;
}

function renderLogbook() {
  const data = state.data.logbook;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">GIT-BACKED / PERSISTENT</div>
      <h2 class="section-title">Logbook</h2>
      <p class="section-sub">${esc(data.rule)}</p>
      <div class="record-list">
        ${(data.entries || []).map((entry) => `
          <article class="record">
            <div class="record-head">
              <span class="record-id">${esc(entry.id)} · ${esc(entry.at || 'TIME UNRESOLVED')}</span>
              ${classBadge(entry.class)}
            </div>
            <h3>${esc(entry.title)}</h3>
            <p>${esc(entry.body)}</p>
            <p class="decision">DECISION · ${esc(entry.decision)}</p>
          </article>`).join('')}
      </div>
      ${localNotebookMarkup()}
    </div>`;
}

function renderSnapshots() {
  const data = state.data.snapshots;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">STATE PRESERVATION</div>
      <h2 class="section-title">Snapshots</h2>
      <p class="section-sub">A snapshot freezes what was known and unknown at a particular operational cut.</p>
      <div class="record-list">
        ${(data.snapshots || []).map((snapshot) => `
          <article class="record">
            <div class="record-head">
              <span class="record-id">${esc(snapshot.id)} · ${esc(snapshot.captured_at)}</span>
              ${classBadge(snapshot.epistemic_class)}
            </div>
            <h3>${esc(snapshot.state)}</h3>
            <p>${esc(snapshot.summary)}</p>
            <div class="columns">
              <div class="column"><b>KNOWN</b>${list(snapshot.known)}</div>
              <div class="column"><b>UNKNOWN</b>${list(snapshot.unknown)}</div>
              <div class="column"><b>ARTIFACT</b><p>${snapshot.artifact ? `<a href="${esc(snapshot.artifact)}">${esc(snapshot.artifact)}</a>` : 'MISSING'}</p></div>
            </div>
          </article>`).join('')}
      </div>
      <button class="micro-btn" id="captureLocal">CAPTURE LOCAL VIEW SNAPSHOT</button>
    </div>`;
}

function renderRetro() {
  const data = state.data.retro;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">RETROLONGITUDINAL / 2026.06 → NOW</div>
      <h2 class="section-title">Read backward.</h2>
      <p class="section-sub">${esc(data.question)}</p>
      ${(data.periods || []).map((period) => `
        <article class="record">
          <div class="record-head"><span class="record-id">${esc(period.id)} · ${esc(period.label)}</span><span class="class">PERIOD</span></div>
          <div class="columns">
            <div class="column"><b>OBSERVED</b>${list(period.observed)}</div>
            <div class="column"><b>INFERRED</b>${list(period.inferred)}</div>
            <div class="column"><b>MISSING</b>${list(period.missing)}</div>
          </div>
        </article>`).join('')}
      <article class="record">
        <div class="record-head"><span class="record-id">CURRENT READING</span>${classBadge(data.current_reading?.class)}</div>
        <h3>${esc(data.current_reading?.statement)}</h3>
        <div class="rule">ALTERNATIVE EXPLANATIONS${list(data.current_reading?.alternatives)}</div>
      </article>
    </div>`;
}

function renderQuestions() {
  const data = state.data.questions;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">UNRESOLVED / DO NOT CLOSE PREMATURELY</div>
      <h2 class="section-title">Open questions</h2>
      ${(data.questions || []).map((question) => `
        <article class="open-question">
          <span class="q-id">${esc(question.id)} · ${esc(question.state)}</span>
          <h3>${esc(question.question)}</h3>
          <p>WOULD CHANGE · ${esc(question.would_change)}</p>
        </article>`).join('')}
    </div>`;
}

function renderNotes() {
  const data = state.data.notes;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">OPERATIONAL NOTES / PUBLIC</div>
      <h2 class="section-title">Do / do not.</h2>
      <div class="record-list">
        ${(data.notes || []).map((note) => `
          <article class="record">
            <div class="record-head"><span class="record-id">${esc(note.id)} · ${esc(note.at)}</span>${classBadge(note.class)}</div>
            <h3>${esc(note.title)}</h3>
            <p>${esc(note.body)}</p>
          </article>`).join('')}
      </div>
    </div>`;
}

function renderLedger() {
  const data = state.data.ledger;
  if (data?._error) return errorPanel(data._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">MACHINE-READABLE CANON</div>
      <h2 class="section-title">Ledger</h2>
      <p class="section-sub">Current state: ${esc(data.current_state)}. The public ledger is versioned with the work.</p>
      <div class="timeline">
        ${(data.lineage || []).map((artifact) => `
          <article class="chapter">
            <small>${esc(artifact.id)} · ${esc(artifact.epistemic_class)}</small>
            <h3>${esc(artifact.label)} / ${esc(artifact.state)}</h3>
            <p>${esc(artifact.function)}</p>
          </article>`).join('')}
      </div>
      <a class="external-link" href="/grimoire/ledger.json" target="_blank">OPEN RAW LEDGER →</a>
    </div>`;
}

function renderHistory() {
  return `
    <div class="fade-in">
      <div class="folio-kicker">HISTORICAL EVENT / PRESERVED</div>
      <h2 class="section-title">ARCHIVE_NODE</h2>
      <p class="section-sub">The June REM618 web chamber remains intact. It is not restyled into the current Grimoire; it is entered as archaeological evidence of the earlier system state.</p>
      <div class="state-grid">
        <div class="state-cell"><label>PERIOD</label><span>JUNE 2026</span></div>
        <div class="state-cell"><label>STATUS</label><span class="open">PRESERVED</span></div>
        <div class="state-cell"><label>ROUTE</label><span>/historical/rem618/</span></div>
        <div class="state-cell"><label>RELATION</label><span>REM618 / OPENING</span></div>
      </div>
      <a class="external-link" href="/historical/rem618/">ENTER HISTORICAL EVENT →</a>
    </div>`;
}

function renderLab() {
  const experiment = state.data.experiment;
  if (experiment?._error) return errorPanel(experiment._error);

  return `
    <div class="fade-in">
      <div class="folio-kicker">OBSERVABLE LABORATORY</div>
      <h2 class="section-title">Field</h2>
      <p class="section-sub">The Lab makes the system legible while preserving the boundary between representation and measurement.</p>
      <div class="lab-frame">
        <canvas id="labCanvas"></canvas>
        <span class="lab-label">NON-MEASURING VISUALIZATION / REPRESENTATION ONLY</span>
      </div>
      <div class="state-grid">
        <div class="state-cell"><label>AI ROLE</label><span>${esc(experiment.roles?.ai)}</span></div>
        <div class="state-cell"><label>HUMAN ROLE</label><span>${esc(experiment.roles?.human)}</span></div>
        <div class="state-cell"><label>SFI ROLE</label><span>${esc(experiment.roles?.sfi)}</span></div>
        <div class="state-cell"><label>AUTOMATIC TRUTH</label><span class="missing">NONE</span></div>
      </div>
      <div class="rule">INSTRUMENTS · ${(experiment.instruments || []).map(esc).join(' · ')}</div>
    </div>`;
}

const renderers = {
  rem: renderArtifact,
  '111': renderArtifact,
  return: renderReturn,
  story: renderStory,
  lab: renderLab,
  logbook: renderLogbook,
  snapshots: renderSnapshots,
  retro: renderRetro,
  questions: renderQuestions,
  notes: renderNotes,
  history: renderHistory,
  ledger: renderLedger
};

function renderView(view) {
  state.view = view;
  $$('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));

  const root = $('#rightPage');
  if (!root) return;

  const renderer = renderers[view] || renderReturn;
  root.innerHTML = renderer(view);
  root.scrollTop = 0;

  if (view === 'lab') requestAnimationFrame(startLab);
  if (view === 'logbook') requestAnimationFrame(renderLocalNotes);
}

function startLab() {
  const token = ++state.labRun;
  const canvas = $('#labCanvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const box = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const width = box.width;
  const height = box.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.scale(dpr, dpr);

  const nodes = Array.from({ length: 31 }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.19,
    vy: (Math.random() - 0.5) * 0.19,
    r: index % 8 === 0 ? 2.1 : 1
  }));

  function frame() {
    if (token !== state.labRun || !document.body.contains(canvas)) return;
    context.clearRect(0, 0, width, height);

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 108) {
          context.strokeStyle = `rgba(103,237,246,${(1 - distance / 108) * 0.17})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      context.fillStyle = node.r > 2 ? 'rgba(210,255,255,.85)' : 'rgba(103,237,246,.52)';
      context.beginPath();
      context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      context.fill();
    });

    requestAnimationFrame(frame);
  }

  frame();
}

function getLocalNotes() {
  try {
    return JSON.parse(localStorage.getItem('kxtxr_local_notes') || '[]');
  } catch {
    return [];
  }
}

function renderLocalNotes() {
  const root = $('#localLog');
  if (!root) return;
  const notes = getLocalNotes();
  root.innerHTML = notes.length
    ? notes.slice().reverse().map((note) => `<div class="local-entry">${esc(note.at)}<br>${esc(note.text)}</div>`).join('')
    : '<div class="local-entry">NO LOCAL NOTES.</div>';
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

document.addEventListener('click', (event) => {
  const viewTarget = event.target.closest('[data-view]');
  if (viewTarget) {
    renderView(viewTarget.dataset.view);
    return;
  }

  if (event.target.id === 'saveLocal') {
    const textarea = $('#localNote');
    const text = textarea?.value.trim();
    if (!text) return;
    const notes = getLocalNotes();
    notes.push({ at: new Date().toISOString(), class: 'LOCAL_NOT_CANONICAL', text });
    localStorage.setItem('kxtxr_local_notes', JSON.stringify(notes));
    textarea.value = '';
    renderLocalNotes();
  }

  if (event.target.id === 'exportLocal') {
    downloadJson(`kxtxr-local-notes-${new Date().toISOString().slice(0, 10)}.json`, {
      schema: 'KXTXR_LOCAL_NOTEBOOK_V1',
      canonical: false,
      notes: getLocalNotes()
    });
  }

  if (event.target.id === 'clearLocal') {
    localStorage.removeItem('kxtxr_local_notes');
    renderLocalNotes();
  }

  if (event.target.id === 'captureLocal') {
    downloadJson(`kxtxr-local-snapshot-${Date.now()}.json`, {
      schema: 'KXTXR_LOCAL_VIEW_SNAPSHOT_V1',
      canonical: false,
      captured_at: new Date().toISOString(),
      view: state.view,
      ledger_state: state.data.ledger?.current_state || 'MISSING'
    });
  }
});

const opening = $('#opening');
const openingStage = $('#coverStage');
const openingTitle = $('#openingTitle');
const openingSub = $('#openingSub');
const openingProgress = $('#openingProgress i');
const openingVideo = $('#openingVideo');
let openingTimers = [];

function later(milliseconds, callback) {
  openingTimers.push(setTimeout(callback, milliseconds));
}

function clearOpeningTimers() {
  openingTimers.forEach(clearTimeout);
  openingTimers = [];
}

function endOpening() {
  clearOpeningTimers();
  openingVideo?.pause();
  opening?.classList.add('opening-hide');
  $('#app')?.classList.add('app-ready');
  sessionStorage.setItem('kxtxr_grimoire_opened', '1');
}

function playOpening() {
  clearOpeningTimers();
  opening.classList.remove('opening-hide');
  $('#app').classList.remove('app-ready');
  openingStage.className = 'cover-stage';
  openingProgress.style.width = '0';
  openingTitle.textContent = 'DORMANCIA';
  openingSub.textContent = 'THE GRIMOIRE HOLDS THE INTERVAL';

  if (openingVideo) {
    openingVideo.currentTime = 0;
    openingVideo.playbackRate = 0.78;
    openingVideo.play().catch(() => {});
  }

  later(900, () => {
    openingStage.classList.add('core-on');
    openingTitle.textContent = 'CORE IGNITION';
    openingSub.textContent = 'CURRENT SIGNATURE DETECTED';
    openingProgress.style.width = '34%';
  });

  later(3300, () => {
    openingStage.classList.add('opening-book');
    openingTitle.textContent = 'RUNIC MATRIX';
    openingSub.textContent = 'THE ARCHIVE OPENS INTO AN OPERATING FIELD';
    openingProgress.style.width = '68%';
  });

  later(5700, () => {
    openingTitle.textContent = 'RETURN / LINK STABLE';
    openingSub.textContent = 'OBSERVE · SYNCHRONIZE · OPERATE';
    openingProgress.style.width = '100%';
  });

  later(7200, endOpening);
}

$('#skipOpening')?.addEventListener('click', endOpening);
$('#replayOpening')?.addEventListener('click', playOpening);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !opening.classList.contains('opening-hide')) endOpening();
});

if (matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('kxtxr_grimoire_opened')) {
  endOpening();
} else {
  playOpening();
}

document.addEventListener('pointermove', (event) => {
  document.documentElement.style.setProperty('--mx', `${event.clientX / innerWidth * 100}%`);
  document.documentElement.style.setProperty('--my', `${event.clientY / innerHeight * 100}%`);
});

setInterval(() => {
  const clock = $('#liveClock');
  if (clock) clock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 500);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

loadCanonicalData();
