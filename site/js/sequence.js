/* FrameSequence — lädt eine WebP-Bildsequenz und zeichnet sie cover-gecroppt auf ein Canvas.
   Ladestrategie: loadPriority() = Frame 1 + jeder 10. (sofort scrubbbar),
   loadRest() füllt die Lücken idle-priorisiert. draw(p) fällt auf den
   nächstliegenden bereits geladenen Frame zurück. */
class FrameSequence {
  constructor({ canvas, dir, count, ext = 'webp' }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.count = count;
    this.urls = Array.from({ length: count }, (_, i) => `${dir}/f_${String(i + 1).padStart(4, '0')}.${ext}`);
    this.images = new Array(count).fill(null);
    this.loaded = new Array(count).fill(false);
    this.lastProgress = 0;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this._onResize = () => this.resize();
    addEventListener('resize', this._onResize, { passive: true });
    this.resize();
  }

  _load(i) {
    if (!this._promises) this._promises = new Array(this.count).fill(null);
    if (this._promises[i]) return this._promises[i];
    this._promises[i] = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.loaded[i] = true; resolve(); };
      img.onerror = () => resolve();
      img.src = this.urls[i];
      this.images[i] = img;
    });
    return this._promises[i];
  }

  async loadPriority() {
    const picks = [0];
    for (let i = 9; i < this.count; i += 10) picks.push(i);
    if (!picks.includes(this.count - 1)) picks.push(this.count - 1);
    await Promise.all(picks.map((i) => this._load(i)));
    this.draw(this.lastProgress);
  }

  /* stride > 1 lädt nur jeden n-ten Frame (Speicherschutz auf Mobilgeräten;
     draw() fällt automatisch auf den nächstliegenden geladenen Frame zurück). */
  loadRest(stride = 1) {
    let i = 0;
    const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn) : (fn) => setTimeout(fn, 60);
    const step = () => {
      let batch = 0;
      while (i < this.count && batch < 6) {
        if (i % stride === 0 && !this.images[i]) { this._load(i).then(() => this.draw(this.lastProgress)); batch++; }
        i++;
      }
      if (i < this.count) idle(step);
    };
    idle(step);
  }

  _nearestLoaded(target) {
    if (this.loaded[target]) return target;
    for (let d = 1; d < this.count; d++) {
      if (this.loaded[target - d]) return target - d;
      if (this.loaded[target + d]) return target + d;
    }
    return -1;
  }

  draw(progress) {
    this.lastProgress = Math.min(1, Math.max(0, progress));
    const idx = this._nearestLoaded(Math.round(this.lastProgress * (this.count - 1)));
    if (idx < 0) return;
    const img = this.images[idx];
    const cw = this.canvas.width, ch = this.canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.draw(this.lastProgress);
  }
}
window.FrameSequence = FrameSequence;
