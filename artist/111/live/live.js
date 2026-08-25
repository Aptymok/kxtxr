(() => {
  'use strict';

  const SCHEDULE = Object.freeze({
    signal: '111',
    timezone: 'America/Mexico_City',
    activationAt: '2026-08-24T20:11:00-06:00',
    releaseAt: '2026-08-25T01:11:00-06:00',
    cycleMs: 60 * 60 * 1000,
    unitsPerCycle: 111
  });

  const activationMs = Date.parse(SCHEDULE.activationAt);
  const releaseMs = Date.parse(SCHEDULE.releaseAt);
  const totalDurationMs = releaseMs - activationMs;
  const totalCycles = Math.round(totalDurationMs / SCHEDULE.cycleMs);
  const unitMs = SCHEDULE.cycleMs / SCHEDULE.unitsPerCycle;

  const root = document.getElementById('kxLive');
  const cycleEl = document.getElementById('kxCycle');
  const valueEl = document.getElementById('kxSignalValue');
  const phaseEl = document.getElementById('kxPhase');
  const targetEl = document.getElementById('kxTarget');
  const signalStateEl = document.getElementById('kxSignalState');
  const stateEl = document.getElementById('kxState');
  const traceEl = document.getElementById('kxTrace');
  const remainingEl = document.getElementById('kxRemaining');
  const clockEl = document.getElementById('kxClock');
  const stateCodeEl = document.getElementById('kxStateCode');
  const stateLabelEl = document.getElementById('kxStateLabel');
  const viewModeEl = document.getElementById('kxViewMode');

  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view === 'obs' || view === 'clean') document.body.dataset.view = view;
  if (viewModeEl && view) viewModeEl.textContent = `${view.toUpperCase()} FEED`;

  const canonicalClock = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHEDULE.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const targetLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHEDULE.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(releaseMs)).toUpperCase().replace(',', ' ·');

  if (targetEl) targetEl.textContent = targetLabel;

  let lastCycle = null;
  let lastValue = null;
  let pulseTimer = null;

  const pad = (number, width = 3) => String(Math.max(0, number)).padStart(width, '0');

  function formatDuration(ms) {
    const safe = Math.max(0, ms);
    const totalSeconds = Math.ceil(safe / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  }

  function pulse(kind) {
    root.classList.remove('is-step', 'is-cycle');
    void root.offsetWidth;
    root.classList.add(kind === 'cycle' ? 'is-cycle' : 'is-step');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => root.classList.remove('is-step', 'is-cycle'), kind === 'cycle' ? 1050 : 420);
  }

  function derive(now) {
    if (now < activationMs) {
      return {
        state: 'standby',
        code: 'PRE',
        label: 'STANDBY',
        cycle: totalCycles,
        value: SCHEDULE.unitsPerCycle,
        signalState: 'STANDBY',
        stateText: 'PRE-RELEASE',
        phase: 'RETURN SEQUENCE / STANDBY',
        remaining: activationMs - now
      };
    }

    if (now >= releaseMs) {
      return {
        state: 'released',
        code: '000',
        label: 'RELEASED',
        cycle: 0,
        value: SCHEDULE.unitsPerCycle,
        signalState: 'RETURNED',
        stateText: 'RELEASED',
        phase: 'RETURN COMPLETE',
        remaining: 0
      };
    }

    const elapsed = now - activationMs;
    const completedCycles = Math.floor(elapsed / SCHEDULE.cycleMs);
    const cycle = Math.max(1, totalCycles - completedCycles);
    const withinCycle = elapsed % SCHEDULE.cycleMs;
    const completedUnits = Math.min(SCHEDULE.unitsPerCycle - 1, Math.floor(withinCycle / unitMs));
    const value = SCHEDULE.unitsPerCycle - completedUnits;
    const final = cycle === 1;

    return {
      state: final ? 'final' : 'active',
      code: pad(cycle),
      label: final ? 'FINAL CYCLE' : 'ACTIVE',
      cycle,
      value,
      signalState: 'ACTIVE',
      stateText: final ? 'FINAL CYCLE' : 'PRE-RELEASE',
      phase: final ? 'FINAL RETURN SEQUENCE' : 'RETURN SEQUENCE',
      remaining: releaseMs - now
    };
  }

  function render() {
    const now = Date.now();
    const frame = derive(now);

    root.dataset.state = frame.state;
    cycleEl.textContent = pad(frame.cycle);
    valueEl.textContent = pad(frame.value);
    phaseEl.textContent = frame.phase;
    signalStateEl.textContent = frame.signalState;
    stateEl.textContent = frame.stateText;
    traceEl.textContent = `${pad(frame.cycle)} / ${pad(frame.value)}`;
    remainingEl.textContent = formatDuration(frame.remaining);
    clockEl.textContent = canonicalClock.format(new Date(now));
    stateCodeEl.textContent = frame.code;
    stateLabelEl.textContent = frame.label;

    if (lastCycle !== null && frame.cycle !== lastCycle) pulse('cycle');
    else if (lastValue !== null && frame.value !== lastValue) pulse('step');

    lastCycle = frame.cycle;
    lastValue = frame.value;
  }

  render();
  setInterval(render, 250);
})();
