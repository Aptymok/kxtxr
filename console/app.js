(() => {
'use strict';

const $ = id => document.getElementById(id);
const KEY = 'kxtxr_control_observations_v1';
let control = null;
let regime = null;
let campaign = null;
let serverState = null;
let csvSummary = null;
let lastEnvelope = null;

const getEntries = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};
const saveEntries = value => localStorage.setItem(KEY, JSON.stringify(value));
const numberValue = id => {
  const value = $(id).value;
  return value === '' ? null : Number(value);
};
const ratio = (a, b) => b > 0 ? a / b : null;
const clamp = value => value == null ? null : Math.max(0, Math.min(1, value));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));

function badge(status) {
  const value = String(status || 'UNKNOWN');
  const className = /CONNECTED|AVAILABLE|CONFIGURED|OBSERVING/.test(value)
    ? 'ok'
    : /MANUAL|REQUIRES|MISSING|UNCONFIGURED|UNKNOWN/.test(value) ? 'warn' : '';
  return '<span class="badge ' + className + '">' + esc(value.replaceAll('_', ' ')) + '</span>';
}

function renderConnectors() {
  const state = serverState?.connectors || {};
  const blogId = state.metricool?.blogId || '7111220';
  $('connectors').innerHTML = (control?.connectors || []).map(connector => {
    let status = connector.current_status;
    if (connector.id === 'sfi' && state.sfi?.structuredResultConfigured) status = 'SERVER_CONFIGURED';
    if ((connector.id === 'instagram' || connector.id === 'tiktok') && state.metricool?.serverApiConfigured) {
      status = 'SERVER_API_CONFIGURED_NETWORK_STATUS_UNKNOWN';
    }
    const action = connector.id === 'instagram' || connector.id === 'tiktok'
      ? '<a class="small" target="_blank" rel="noreferrer" href="https://app.metricool.com/brands/connections?blogId=' + encodeURIComponent(blogId) + '">CONNECT / VERIFY IN METRICOOL →</a>'
      : '';
    return '<div class="card connector">' +
      '<div><span class="eyebrow">' + esc(connector.class) + '</span><b>' + esc(connector.label) + '</b></div>' +
      badge(status) +
      '<div class="caps">' + esc((connector.capabilities || []).join(' · ')) + '</div>' +
      action +
      '</div>';
  }).join('');
}

function currentMetrics() {
  return {
    reach: numberValue('reach') || 0,
    views: numberValue('views') || 0,
    completion: numberValue('completion') || 0,
    shares: numberValue('shares') || 0,
    comments: numberValue('comments') || 0,
    saves: numberValue('saves') || 0,
    profile: numberValue('profile') || 0,
    follows: numberValue('follows') || 0,
    latency: numberValue('latency')
  };
}

function vectorFrom(metrics) {
  const attention = metrics.views > 0
    ? clamp(.75 * ratio(metrics.completion, metrics.views) + .25 * (metrics.reach > 0 ? ratio(metrics.saves, metrics.reach) : 0))
    : null;
  const propagation = metrics.reach > 0 ? clamp(ratio(metrics.shares, metrics.reach) * 8) : null;
  const memory = metrics.reach > 0 ? clamp((metrics.profile + metrics.follows) / metrics.reach * 6) : null;
  return {
    actor_composition: null,
    human_agent_ratio: null,
    latency: metrics.latency == null ? null : Math.min(1, metrics.latency / 72),
    semantic_convergence: null,
    novelty: null,
    selection_pressure: null,
    feedback_loop_length: null,
    attention,
    propagation,
    memory,
    authority: 1
  };
}

function renderVector(vector) {
  const definitions = regime?.variables || [];
  let observed = 0;
  $('vector').innerHTML = definitions.map(definition => {
    const value = vector?.[definition.id];
    if (value != null) observed += 1;
    const percent = value == null ? 0 : Math.round(clamp(Number(value)) * 100);
    return '<div class="vrow">' +
      '<span>' + esc(definition.id) + '</span>' +
      '<div class="bar"><i style="width:' + percent + '%"></i></div>' +
      '<b class="' + (value == null ? 'missing' : '') + '">' + (value == null ? 'MISSING' : percent + '%') + '</b>' +
      '</div>';
  }).join('');
  $('coverage').textContent = observed + '/' + definitions.length;
  return observed;
}

function calcKry(metrics) {
  if (!(metrics.reach > 0 && metrics.views > 0)) return null;
  return 1000 * (
    .30 * (metrics.shares / metrics.reach) +
    .25 * (metrics.comments / metrics.reach) +
    .20 * (metrics.completion / metrics.views) +
    .15 * (metrics.profile / metrics.reach) +
    .10 * (metrics.saves / metrics.reach)
  );
}

function renderMetrics(metrics) {
  const kry = calcKry(metrics);
  const vector = vectorFrom(metrics);
  $('kry').textContent = kry == null ? '—' : kry.toFixed(2);
  $('attention').textContent = vector.attention == null ? '—' : Math.round(vector.attention * 100) + '%';
  $('propagation').textContent = vector.propagation == null ? '—' : Math.round(vector.propagation * 100) + '%';
  renderVector(vector);
  return { kry, vector };
}

function assessRegime(envelope, priorEntries) {
  const comparable = priorEntries.filter(entry =>
    entry.platform === envelope.platform &&
    entry.campaign === envelope.campaign &&
    entry.regimeVector
  );
  const observedVariables = Object.entries(envelope.regimeVector || {})
    .filter(([, value]) => value != null).map(([key]) => key);

  if (!comparable.length) return 'BASELINE_MISSING';
  if (observedVariables.length < Number(regime?.candidate_gate?.minimum_observed_variables || 4)) return 'OBSERVING';

  // No universal numeric threshold is used here. Directional comparison is only a screening trace.
  // A candidate still requires persistence in later windows, rivals, negative controls and SFI calibration.
  return 'OBSERVING';
}

function renderTimeline() {
  const entries = getEntries();
  $('localCount').textContent = entries.length + ' LOCAL';
  $('timeline').innerHTML = entries.length
    ? entries.slice().reverse().slice(0, 12).map(entry =>
        '<article class="entry">' +
        '<div class="meta">' + esc(entry.piece) + ' · ' + esc(entry.platform) + ' · ' + esc(new Date(entry.observedAt).toLocaleString()) + '</div>' +
        '<p>' + esc(entry.signal || 'No qualitative signal') + '</p>' +
        '<div class="small">KRY ' + (entry.kry == null ? 'N/D' : Number(entry.kry).toFixed(2)) + ' · ' + esc(entry.regimeCandidate) + '</div>' +
        '</article>'
      ).join('')
    : '<div class="small">NO OBSERVATIONS RECORDED</div>';
}

function buildEnvelope(metrics, kry, vector) {
  const signal = $('signal').value.trim();
  const hypothesis = $('hypothesis').value.trim();
  const platform = $('platform').value;
  const observed = [];
  if (signal) observed.push({ statement: signal, basis: platform });
  observed.push({
    statement: 'Observed platform metrics for ' + platform +
      ': reach=' + metrics.reach +
      ', views=' + metrics.views +
      ', shares=' + metrics.shares +
      ', comments=' + metrics.comments +
      ', saves=' + metrics.saves +
      ', profile/search=' + metrics.profile +
      ', follows=' + metrics.follows + '.',
    basis: 'operator/platform export'
  });

  const derived = [];
  if (kry != null) derived.push({
    statement: 'KRY internal comparison indicator = ' + kry.toFixed(4) + '.',
    basis: 'KXTXR internal heuristic; not platform algorithm'
  });
  for (const [key, value] of Object.entries(vector)) {
    if (value != null) derived.push({
      statement: 'Regime variable proxy ' + key + '=' + Number(value).toFixed(4) + '.',
      basis: 'KXTXR uncalibrated proxy'
    });
  }

  const missing = Object.entries(vector)
    .filter(([, value]) => value == null)
    .map(([key]) => ({ statement: 'Regime variable ' + key + ' not observed in this snapshot.', basis: 'missing' }));

  const envelope = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    campaign: campaign?.campaign || 'QUE NO',
    piece: campaign?.current_piece || '07/12',
    platform,
    representation: $('representation').value.trim(),
    objective: $('objective').value.trim(),
    observedAt: new Date().toISOString(),
    signal,
    summary: 'KXTXR ' + platform + ' observation for ' + (campaign?.current_piece || '07/12') + '.',
    measurementSummary: csvSummary
      ? 'CSV summary available: ' + csvSummary.rowCount + ' rows, ' + csvSummary.headers.length + ' columns.'
      : 'Manual platform observation.',
    rowCount: csvSummary?.rowCount,
    fields: csvSummary?.headers || [],
    metrics,
    regimeVector: vector,
    regimeCandidate: 'OBSERVING',
    kry,
    observed,
    declared: [{ statement: 'Human operator retains publication and representation authority.', basis: 'KXTXR governance' }],
    derived,
    missing,
    hypotheses: hypothesis ? [{
      statement: hypothesis,
      role: 'primary',
      confidence: .5,
      discriminatingTest: 'Compare against the next bounded observation window.'
    }] : [],
    rivals: hypothesis ? [{
      statement: 'Observed movement is platform/distribution variance rather than a change in field operating rules.',
      role: 'rival',
      confidence: .5,
      discriminatingTest: 'Check persistence across another comparable window and a negative control.'
    }] : [],
    limitations: [
      'Regime Transition Program is experimental and uncalibrated.',
      'Platform metrics do not reveal recommendation algorithms or causality.'
    ],
    unresolved: ['Need comparable longitudinal windows before any transition candidate can be strengthened.'],
    acquisitionMethod: csvSummary ? 'platform_csv_export_summary' : 'operator_observation'
  };
  envelope.regimeCandidate = assessRegime(envelope, getEntries());
  return envelope;
}

function recordObservation() {
  const metrics = currentMetrics();
  const { kry, vector } = renderMetrics(metrics);
  const envelope = buildEnvelope(metrics, kry, vector);
  const entries = getEntries();
  entries.push(envelope);
  saveEntries(entries);
  lastEnvelope = envelope;
  renderTimeline();
  $('regimeState').textContent = envelope.regimeCandidate.replaceAll('_', ' ');
  return envelope;
}

async function persistToSfi() {
  const token = prompt('KXTXR control token (kept only for this request):');
  if (!token) return;
  const envelope = lastEnvelope || recordObservation();
  const button = $('persistBtn');
  button.disabled = true;
  button.textContent = 'PERSISTING…';
  try {
    const response = await fetch('/api/kxtxr-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-kxtxr-control-token': token },
      body: JSON.stringify(envelope)
    });
    const result = await response.json().catch(() => ({}));
    button.textContent = response.ok ? 'SFI RECEIPT RECORDED' : 'SFI: ' + (result.error || response.status);
  } catch {
    button.textContent = 'SFI UNAVAILABLE';
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = 'PERSIST STRUCTURED RESULT TO SFI';
    }, 3000);
  }
}

function parseCsvSummary(file, text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length);
  const headers = (lines[0] || '').split(',').map(value => value.trim().replace(/^"|"$/g, ''));
  return { name: file.name, rowCount: Math.max(0, lines.length - 1), headers };
}

async function init() {
  try {
    [control, regime, campaign, serverState] = await Promise.all([
      fetch('/data/control-plane.json').then(response => response.json()),
      fetch('/data/regime-transition.json').then(response => response.json()),
      fetch('/campaigns/que-no/representation-engine.json').then(response => response.json()),
      fetch('/api/kxtxr-control-state').then(response => response.json())
    ]);
  } catch {
    $('systemState').textContent = 'SOURCE PARTIAL';
  }

  $('campaignName').textContent = campaign?.campaign || 'QUE NO';
  const piece = (campaign?.pieces || []).find(item => item.piece === campaign?.current_piece);
  $('pieceState').textContent = (campaign?.current_piece || '07/12') + ' · ' + (piece?.state || 'MEMORY');
  $('campaignState').textContent = piece?.status || 'READY';
  $('heroTitle').textContent = (campaign?.campaign || 'QUE NO') + ' · ' + (campaign?.current_piece || '07/12');
  $('cycleText').textContent = (control?.cycle || []).join(' → ');
  $('platform').innerHTML = (control?.connectors || [])
    .filter(item => item.id !== 'sfi')
    .map(item => '<option value="' + esc(item.label) + '">' + esc(item.label) + '</option>')
    .join('');

  renderConnectors();
  renderMetrics(currentMetrics());
  renderTimeline();
  $('systemState').textContent = 'CONTROL MODEL LOADED';
}

$('recordBtn').addEventListener('click', recordObservation);
$('persistBtn').addEventListener('click', persistToSfi);
['reach','views','completion','shares','comments','saves','profile','follows','latency']
  .forEach(id => $(id).addEventListener('input', () => renderMetrics(currentMetrics())));

$('csvFile').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  csvSummary = parseCsvSummary(file, text);
  $('csvState').textContent =
    csvSummary.name + ' · ' + csvSummary.rowCount + ' rows · ' +
    csvSummary.headers.length + ' columns · RAW FILE LOCAL ONLY';
});

setInterval(() => {
  $('clock').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);

init();
})();