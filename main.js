/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions — Mechanical precision only.
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Nav scroll state ──────────────────────── */
  const nav = document.getElementById('nav');
  const scrollThreshold = 80;

  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Scroll-reveal ─────────────────────────── */
  const revealTargets = [
    '.mission__quote',
    '.section-header',
    '.division',
    '.benefit',
    '.product__text',
    '.product__benefits',
    '.contact__text',
    '.contact__details',
    '.manifesto__text',
  ];

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── Staggered division cards ──────────────── */
  document.querySelectorAll('.division').forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
  });

  /* ── Stat counter animation ─────────────────── */
  function animateCounter(el, target, suffix) {
    let start = 0;
    const duration = 600;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = target + (suffix || '');
        clearInterval(timer);
        return;
      }
      el.textContent = Math.floor(start) + (suffix || '');
    }, step);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const strip = entry.target;
          const nums = strip.querySelectorAll('.hero__stat-num');
          const targets = [3, 95, 0];
          const suffixes = ['', '%', ''];
          nums.forEach((el, i) => {
            const sup = el.querySelector('sup');
            if (sup) {
              const supText = sup.textContent;
              el.textContent = '0';
              el.appendChild(sup);
              // restore sup after animation
              setTimeout(() => {
                el.textContent = targets[i];
                const newSup = document.createElement('sup');
                newSup.textContent = supText;
                el.appendChild(newSup);
              }, 600);
            } else {
              animateCounter(el, targets[i], suffixes[i]);
            }
          });
          statsObserver.unobserve(strip);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statStrip = document.querySelector('.hero__stat-strip');
  if (statStrip) statsObserver.observe(statStrip);

  /* ── Smooth anchor for all nav links ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
