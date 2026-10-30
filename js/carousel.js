/* =========================================================
   carousel.js — horizontal project gallery
   ========================================================= */
(() => {
  'use strict';

  const track = document.querySelector('[data-track]');
  if (!track) return;

  const prev = document.querySelector('[data-carousel="prev"]');
  const next = document.querySelector('[data-carousel="next"]');

  const step = () => {
    const card = track.querySelector('.card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  };

  const syncButtons = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= maxScroll;
  };

  if (prev) {
    prev.addEventListener('click', () => {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }

  track.addEventListener('scroll', syncButtons, { passive: true });
  window.addEventListener('resize', syncButtons);
  syncButtons();
})();
