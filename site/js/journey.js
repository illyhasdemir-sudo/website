/* Die Fahrt — gepinnte Scroll-Sequenz mit 6 Stopps.
   STOPS ist die einzige Quelle für Panel-Ranges (from/to = Anteil des Pin-Fortschritts).
   Reduced Motion (?reduced=1 oder OS-Einstellung): statische Key-Frames statt Scrub. */
/* Ranges kalibriert auf das reale Kling-Footage (2026-07-04):
   aussen 0–0.12 · Tür/Einstieg 0.13–0.36 · Cockpit 0.38–0.50 ·
   Fussraum 0.53–0.62 · Sitze 0.65–0.79 · Felge 0.85–0.98 */
const STOPS = [
  { id: 'lack',    from: 0.00, to: 0.12, num: '01', title: 'Lackpolitur & Keramik',  text: 'Mehrstufige Politur entfernt Swirls, Hologramme und Kratzer. Danach: Keramikversiegelung — wasserabweisend, UV-stabil, 3–5 Jahre Schutz.', pos: 'left'  },
  /* 0.13–0.36: Tür öffnet, Einstieg — bewusst kein Panel */
  { id: 'cockpit', from: 0.38, to: 0.50, num: '02', title: 'Innenraum-Aufbereitung', text: 'Tiefenreinigung von Armaturen, Himmel und jeder Ritze im Cockpit. Sauber ist erst der Anfang.', pos: 'right' },
  { id: 'teppich', from: 0.53, to: 0.62, num: '03', title: 'Deep Clean',             text: 'Fussraum und Teppiche: Extraktionsreinigung bis in die Faser, Geruchsneutralisierung inklusive.', pos: 'left'  },
  { id: 'leder',   from: 0.65, to: 0.79, num: '04', title: 'Leder & Polster',        text: 'Lederreinigung, Pflege und Imprägnierung. Sitze wie am ersten Tag.', pos: 'right' },
  { id: 'felgen',  from: 0.85, to: 0.98, num: '05', title: 'Felgen & Reifen',        text: 'Tiefenreinigung, Versiegelung, Reifenpflege — für Aluminium, High-Gloss und Pulverbeschichtung.', pos: 'left'  },
];
/* Statische Key-Frames für den Reduced-Fallback — Reihenfolge passend zu STOPS */
const KEYFRAMES = [10, 66, 87, 108, 142];

function stopPanelHTML(s) {
  return `
    <span class="stop-num">${s.num}</span>
    <h3 class="display h-md">${s.title}</h3>
    <p>${s.text}</p>
    <a class="stop-link" href="#pakete">Zum Paket <span aria-hidden="true">→</span></a>`;
}

function frameUrl(dir, n) {
  return `${dir}/f_${String(n).padStart(4, '0')}.webp`;
}

function initJourney() {
  const section = document.getElementById('fahrt');
  if (!section) return;

  const isMobile = matchMedia('(max-width: 768px)').matches;
  const dir = isMobile ? 'assets/frames/mobile' : 'assets/frames/desktop';
  const reduced = document.documentElement.classList.contains('reduced');
  const stage = section.querySelector('.journey-stage');

  /* ---- Statischer Fallback: Key-Frames + Panels als normale Karten ---- */
  if (reduced) {
    section.classList.add('static');
    document.getElementById('journey-canvas').remove();
    section.querySelector('.journey-progress').remove();
    const list = document.createElement('div');
    list.className = 'journey-static';
    STOPS.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'journey-static-item';
      item.innerHTML = `
        <img src="${frameUrl(dir, KEYFRAMES[i])}" alt="" loading="lazy">
        <aside class="stop-panel panel active">${stopPanelHTML(s)}</aside>`;
      list.appendChild(item);
    });
    stage.appendChild(list);
    return;
  }

  /* ---- Animierte Fahrt ---- */
  const seq = new FrameSequence({
    canvas: document.getElementById('journey-canvas'),
    dir,
    count: 150,
  });

  STOPS.forEach((s) => {
    const el = document.createElement('aside');
    el.className = `stop-panel panel pos-${s.pos}`;
    el.dataset.stop = s.id;
    el.innerHTML = stopPanelHTML(s);
    stage.appendChild(el);
  });
  const panels = [...stage.querySelectorAll('.stop-panel')];

  const dots = STOPS.map(() => {
    const d = document.createElement('span');
    d.className = 'journey-dot';
    section.querySelector('.journey-progress').appendChild(d);
    return d;
  });

  /* Gestaffeltes Laden: Priority-Frames erst im Idle nach window-load,
     der Rest erst beim ersten Scroll (wer nie scrollt, lädt nie die volle
     Sequenz). Auf Mobilgeräten nur jeden 2. Frame laden (Speicherschutz;
     draw() nutzt den nächstliegenden geladenen Frame). */
  const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn) : (fn) => setTimeout(fn, 200);
  idle(() => seq.loadPriority());
  addEventListener('scroll', () => {
    seq.loadPriority().then(() => seq.loadRest(isMobile ? 2 : 1));
  }, { passive: true, once: true });

  const intro = section.querySelector('.journey-intro');
  const pinDistance = isMobile ? '+=380%' : '+=520%';
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: pinDistance,
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    onUpdate: (st) => {
      seq.draw(st.progress);
      intro.style.opacity = String(Math.max(0, 1 - st.progress / 0.08));
      STOPS.forEach((s, i) => {
        const active = st.progress >= s.from && st.progress <= s.to;
        panels[i].classList.toggle('active', active);
        dots[i].classList.toggle('active', st.progress >= s.from);
      });
    },
  });
}
window.addEventListener('load', initJourney);
