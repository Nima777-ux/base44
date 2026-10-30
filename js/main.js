/* =========================================================
   main.js — scroll reveal, menu, nav state, hero pager,
   contact form, image lightbox
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 1. fade-in on scroll ---------- */
  const revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    revealables.forEach((el) => revealObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 2. mobile menu ---------- */
  const burger = document.querySelector('.topbar__burger');
  const nav = document.getElementById('siteNav');

  const closeNav = () => {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ---------- 3. active nav link on scroll ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  if ('IntersectionObserver' in window && navLinks.length) {
    const targets = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    targets.forEach((target) => spy.observe(target));
  }

  /* ---------- 4. contact form ---------- */
  const form = document.getElementById('contactForm');

  if (form) {
    const note = form.querySelector('.form__note');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        if (note) note.textContent = 'Please complete the highlighted fields.';
        form.reportValidity();
        return;
      }

      if (note) note.textContent = 'Thank you — we will be in touch shortly.';
      form.reset();
    });
  }

  /* ---------- 5. image lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');

  if (lightbox && lightboxImage) {
    document.querySelectorAll('[data-zoom]').forEach((button) => {
      button.addEventListener('click', () => {
        lightboxImage.src = button.dataset.zoom;
        lightboxImage.alt = button.dataset.zoomAlt || '';
        lightbox.showModal();
      });
    });

    lightbox.querySelector('.lightbox__close')
      .addEventListener('click', () => lightbox.close());

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
