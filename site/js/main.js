/* Shark Surface — Boot: Lenis, Nav, Hero-Reveal */
gsap.registerPlugin(ScrollTrigger);

const reduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  new URLSearchParams(location.search).has('reduced');
document.documentElement.classList.toggle('reduced', reduced);

/* Smooth Scroll */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* Anker-Navigation über Lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView();
  });
});

/* Nav-Blur ab 40px */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* Hero-Intro */
if (!reduced) {
  gsap.from('.hero-title .word', {
    yPercent: 110,
    duration: 1.1,
    ease: 'power4.out',
    stagger: 0.12,
    delay: 0.15,
  });
  gsap.to('[data-hero]', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 0.55,
    startAt: { y: 24 },
  });
} else {
  gsap.set('[data-hero]', { opacity: 1 });
}

/* Generische Section-Reveals (Elemente mit .reveal ohne data-hero) */
if (!reduced) {
  document.querySelectorAll('.reveal:not([data-hero])').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      startAt: { y: 32 },
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
} else {
  gsap.set('.reveal', { opacity: 1 });
}
