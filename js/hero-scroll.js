/* =========================================================
   hero-scroll.js — scroll-driven cinematic hero
   The clip's timeline is bound to the page scroll: scrolling
   down advances it, scrolling up rewinds it. It is never
   played by the browser itself and never loops.
   ========================================================= */
(() => {
  'use strict';

  const section = document.querySelector('.cine');
  const stage = section && section.querySelector('.cine__sticky');
  const video = document.getElementById('heroVideo');
  if (!section || !stage || !video) return;

  const content = document.getElementById('heroContent');
  const bar = document.getElementById('heroProgressBar');
  const counter = document.getElementById('heroIndex');
  const dots = Array.from(document.querySelectorAll('.cine__dot'));
  const railPrev = document.querySelector('.rail [data-hero="prev"]');
  const railNext = document.querySelector('.rail [data-hero="next"]');

  const STAGES = 4;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let duration = 0;
  let targetP = 0;
  let easedP = 0;
  let appliedP = -1;
  let activeStage = -1;
  let frameId = 0;
  let running = false;
  let inView = true;

  /* ---------- geometry ---------- */
  const headerHeight = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;

  const travel = () => Math.max(1, section.offsetHeight - stage.offsetHeight);

  const progress = () =>
    clamp((headerHeight() - section.getBoundingClientRect().top) / travel(), 0, 1);

  /* ---------- video seeking (one seek in flight at a time) ---------- */
  let pendingTime = null;

  const flushSeek = () => {
    if (pendingTime === null || !duration || video.readyState < 1) return;
    const time = pendingTime;
    pendingTime = null;
    if (Math.abs(video.currentTime - time) < 0.008) return;
    try {
      video.currentTime = time;
    } catch (err) {
      /* a seek may be refused while the decoder is busy — retried next frame */
    }
  };

  const seek = (p) => {
    if (!duration) return;
    pendingTime = clamp(p * duration, 0, Math.max(0, duration - 0.05));
    if (!video.seeking) flushSeek();
  };

  video.addEventListener('seeked', flushSeek);

  const readDuration = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    seek(easedP);
  };

  if (video.readyState >= 1) readDuration();
  video.addEventListener('loadedmetadata', readDuration);
  video.addEventListener('loadeddata', () => { seek(easedP); kick(); });

  /* the clip must never run on its own */
  video.addEventListener('play', () => video.pause());

  /* ---------- paint ---------- */
  const paint = (p) => {
    if (content) {
      const fade = clamp((p - 0.1) / 0.36, 0, 1);
      content.style.opacity = String(1 - fade);
      content.style.transform =
        `translate3d(0, ${(-p * 46).toFixed(2)}px, 0) scale(${(1 - p * 0.045).toFixed(4)})`;
      content.style.pointerEvents = fade > 0.55 ? 'none' : '';
    }

    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;

    /* subtle camera push + parallax so the plate gains depth */
    video.style.transform =
      `translate3d(0, ${(-p * 1.6).toFixed(2)}%, 0) scale(${(1.015 + p * 0.055).toFixed(4)})`;
  };

  const setStage = (index) => {
    if (index === activeStage) return;
    activeStage = index;
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });
  };

  /* ---------- frame loop ---------- */
  const update = () => {
    if (!inView || document.hidden || reducedMotion.matches) {
      running = false;
      return;
    }

    targetP = progress();
    easedP += (targetP - easedP) * 0.15;
    if (Math.abs(targetP - easedP) < 0.0012) easedP = targetP;

    if (Math.abs(easedP - appliedP) > 0.0004) {
      appliedP = easedP;
      paint(easedP);
      seek(easedP);
      setStage(Math.min(STAGES - 1, Math.floor(easedP * STAGES + 0.0001)));
    }

    if (Math.abs(targetP - easedP) > 0.0004) {
      frameId = requestAnimationFrame(update);
    } else {
      running = false;
    }
  };

  function kick() {
    if (reducedMotion.matches) return;
    if (running) return;
    running = true;
    frameId = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => { appliedP = -1; kick(); });

  /* ---------- stage navigation (rail pager + dots) ---------- */
  const currentStage = () => Math.min(STAGES - 1, Math.floor(progress() * STAGES));

  const scrollToStage = (index) => {
    const base = section.getBoundingClientRect().top + window.scrollY - headerHeight();
    const offset = (clamp(index, 0, STAGES - 1) / STAGES) * travel();
    window.scrollTo({
      top: Math.max(0, base + offset),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
    kick();
  };

  if (railPrev) railPrev.addEventListener('click', () => scrollToStage(currentStage() - 1));
  if (railNext) railNext.addEventListener('click', () => scrollToStage(currentStage() + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => scrollToStage(Number(dot.dataset.stage))));

  /* ---------- reduced motion ---------- */
  const applyMode = () => {
    const isStatic = reducedMotion.matches;
    section.classList.toggle('is-static', isStatic);

    if (isStatic) {
      cancelAnimationFrame(frameId);
      running = false;
      video.style.transform = '';
      if (content) {
        content.style.opacity = '';
        content.style.transform = '';
        content.style.pointerEvents = '';
      }
      if (bar) bar.style.transform = 'scaleX(1)';
      try { video.currentTime = 0; } catch (err) { /* metadata not ready */ }
      setStage(0);
    } else {
      appliedP = -1;
      kick();
    }
  };

  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', applyMode);
  applyMode();

  /* ---------- only animate while the hero is on screen ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) kick();
      else {
        cancelAnimationFrame(frameId);
        running = false;
      }
    }, { rootMargin: '20% 0px' }).observe(section);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick();
  });
})();
