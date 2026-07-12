/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions v3
   ─ Nav scroll state
   ─ Active nav scroll-spy (IntersectionObserver)
   ─ Snap reveal (IntersectionObserver)
   ─ Staggered division cards
   ─ Stat counters
   ─ Smooth anchor scrolling
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. NAV SCROLL STATE
     Border shifts red → yellow after 80px
  ───────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ─────────────────────────────────────────────
     2. ACTIVE NAV SCROLL-SPY
     Watches #hero, #divisions, #product, #contact
     Adds .is-active to matching nav link when
     section occupies the top 40% of the viewport.
     The CTA (“Contact”) is excluded from underline
     treatment via CSS (.nav__cta::after {display:none})
     but still receives .is-active for colour parity.
  ───────────────────────────────────────────── */
  const navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function setActiveLink(activeSection) {
    navLinks.forEach(a => {
      const target = document.querySelector(a.getAttribute('href'));
      a.classList.toggle('is-active', target === activeSection);
    });
  }

  const spyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveLink(entry.target);
        }
      });
    },
    {
      // Trigger when section crosses the top 40% line
      rootMargin: '0px 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach(function (s) { spyObserver.observe(s); });

  // Set initial active state on load
  if (sections.length) setActiveLink(sections[0]);

  /* ─────────────────────────────────────────────
     3. SNAP REVEAL
     Elements snap into place using
     cubic-bezier(0.16, 1, 0.3, 1) defined in CSS.
     Observer fires once per element — no re-hiding.
  ───────────────────────────────────────────── */
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

  revealTargets.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add('reveal');
    });
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────────
     4. STAGGERED DIVISION CARDS
     60ms delay increment per card
  ───────────────────────────────────────────── */
  document.querySelectorAll('.division').forEach(function (el, i) {
    el.style.transitionDelay = (i * 60) + 'ms';
  });

  /* ─────────────────────────────────────────────
     5. STAT COUNTERS
     Counts up mechanically over 600ms on first view
  ───────────────────────────────────────────── */
  function animateCounter(el, target) {
    var start = 0;
    var step = 16;
    var increment = target / (600 / step);
    var timer = setInterval(function () {
      start += increment;
      if (start >= target) {
        el.textContent = target;
        clearInterval(timer);
        return;
      }
      el.textContent = Math.floor(start);
    }, step);
  }

  var statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var nums = entry.target.querySelectorAll('.hero__stat-num');
        var targets = [3, 95, 0];
        nums.forEach(function (el, i) {
          var sup = el.querySelector('sup');
          if (sup) {
            // Preserve <sup> element after animation
            setTimeout(function () {
              el.textContent = targets[i];
              var newSup = document.createElement('sup');
              newSup.textContent = sup.textContent;
              el.appendChild(newSup);
            }, 620);
          } else {
            animateCounter(el, targets[i]);
          }
        });
        statsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  var statStrip = document.querySelector('.hero__stat-strip');
  if (statStrip) statsObserver.observe(statStrip);

  /* ─────────────────────────────────────────────
     6. SMOOTH ANCHOR SCROLLING
     Overrides browser default for nav-height offset.
     html { scroll-behavior: smooth } handles all
     other anchor clicks. This handles only nav links
     that need the 64px offset correction.
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 64;
      var top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
