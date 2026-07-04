/* Vorher/Nachher-Vergleich — Trennlinie folgt Maus/Finger.
   Links: unbehandelter Lack. Rechts: poliert. --pos steuert die Klippkante. */
function initCompare() {
  const el = document.getElementById('compare');
  if (!el) return;

  const set = (clientX) => {
    const r = el.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    el.style.setProperty('--pos', p + '%');
    el.setAttribute('aria-valuenow', String(Math.round(p)));
  };

  el.addEventListener('pointermove', (e) => set(e.clientX));
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); set(e.clientX); });

  /* Tastatur: Pfeiltasten bewegen die Kante */
  el.addEventListener('keydown', (e) => {
    const cur = parseFloat(el.style.getPropertyValue('--pos')) || 50;
    if (e.key === 'ArrowLeft') { e.preventDefault(); set0(cur - 4); }
    if (e.key === 'ArrowRight') { e.preventDefault(); set0(cur + 4); }
    function set0(p) {
      p = Math.min(100, Math.max(0, p));
      el.style.setProperty('--pos', p + '%');
      el.setAttribute('aria-valuenow', String(Math.round(p)));
    }
  });
}
window.addEventListener('load', initCompare);
