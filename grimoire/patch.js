(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-view="logbook"]');
    if (!target) return;
    setTimeout(() => {
      if (typeof window.renderLocalNotes === 'function') window.renderLocalNotes();
      else if (typeof renderLocalNotes === 'function') renderLocalNotes();
    }, 0);
  });
})();
