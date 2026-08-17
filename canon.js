/* KXTXR — canonical state loader. JSON remains the single source of truth. */
window.CANON_READY = fetch('/grimoire/kxtxr-grimoire-longitudinal-canon-v3.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error(`CANON_HTTP_${response.status}`);
    return response.json();
  })
  .then((canon) => {
    window.CANON = canon;
    return canon;
  })
  .catch((error) => {
    console.error('KXTXR: canonical JSON could not be loaded', error);
    throw error;
  });
