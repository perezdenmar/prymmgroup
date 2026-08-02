/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions v14 — Division 01 drawer
   ─ Nav scroll state
   ─ Active nav scroll-spy (IntersectionObserver)
   ─ Active nav indicator on sub-pages
   ─ Mobile hamburger nav + FOCUS TRAP
   ─ Body scroll lock when nav open
   ─ Backdrop tap-to-close
   ─ Escape key close
   ─ aria-expanded + aria-label on hamburger
   ─ Snap reveal (IntersectionObserver) — all pages
   ─ Staggered division cards + benefit items
   ─ Stat counters (eased, reduced-motion safe, data-count driven)
   ─ Division touch feedback
   ─ Bauhaus block parallax (hero-visibility guard)
   ─ Contact form: hidden iframe POST (no CORS, no activation)
   ─ Smooth anchor scrolling
   ─ Page fade-in + PAGE-EXIT CROSS-FADE
   ─ SCROLL PROGRESS BAR
   ─ DIVISION 01 EXPAND DRAWER
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     0. SCROLL PROGRESS BAR
  ───────────────────────────────────────────── */
  var progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-label', 'Page scroll progress');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');
  document.body.appendChild(progressBar);

  var progressTicking = false;
  window.addEventListener('scroll', function () {
    if (progressTicking) return;
    requestAnimationFrame(function () {
      var scrollTop  = window.scrollY;
      var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', pct);
      progressTicking = false;
    });
    progressTicking = true;
  }, { passive: true });

  /* ─────────────────────────────────────────────
     1. NAV SCROLL STATE
  ───────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', function () {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ─────────────────────────────────────────────
     2. ACTIVE NAV SCROLL-SPY
  ───────────────────────────────────────────── */
  var navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = navLinks
    .map(function(a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActiveLink(activeSection) {
    navLinks.forEach(function(a) {
      var target = document.querySelector(a.getAttribute('href'));
      a.classList.toggle('is-active', target === activeSection);
    });
  }

  if (sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target);
        });
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { spyObserver.observe(s); });
    setActiveLink(sections[0]);
  }

  /* ─────────────────────────────────────────────
     2b. ACTIVE NAV ON SUB-PAGES
  ───────────────────────────────────────────── */
  var currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll('.nav__links a').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf(currentPage) !== -1) a.classList.add('is-active');
    });
  }

  /* ─────────────────────────────────────────────
     3. MOBILE HAMBURGER NAV + FOCUS TRAP
  ───────────────────────────────────────────── */
  var navToggle = document.getElementById('nav-toggle');
  var navLinksContainer = document.getElementById('nav-links');

  var backdrop = document.createElement('div');
  backdrop.className = 'nav__backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  nav.appendChild(backdrop);

  function getFocusableNavItems() {
    return Array.from(
      navLinksContainer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
    ).filter(function(el) {
      return !el.hasAttribute('disabled') && el.offsetParent !== null;
    });
  }

  function openNav() {
    nav.classList.add('nav--open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    var items = getFocusableNavItems();
    if (items.length) items[0].focus();
  }

  function closeNav(returnFocus) {
    nav.classList.remove('nav--open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (returnFocus) navToggle.focus();
  }

  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.setAttribute('aria-controls', 'nav-links');

    navToggle.addEventListener('click', function () {
      if (nav.classList.contains('nav--open')) { closeNav(false); }
      else { openNav(); }
    });

    backdrop.addEventListener('click', function () { closeNav(false); });

    document.querySelectorAll('.nav__links a').forEach(function(a) {
      a.addEventListener('click', function() { closeNav(false); });
    });

    document.addEventListener('keydown', function(e) {
      if (!nav.classList.contains('nav--open')) return;
      if (e.key === 'Escape') { closeNav(true); return; }
      if (e.key === 'Tab') {
        var items = getFocusableNavItems();
        if (!items.length) return;
        var first = items[0];
        var last  = items[items.length - 1];
        var active = document.activeElement;
        if (e.shiftKey) {
          if (active === first) { e.preventDefault(); navToggle.focus(); }
        } else {
          if (active === last || active === navToggle) { e.preventDefault(); first.focus(); }
        }
      }
    });
  }

  /* ─────────────────────────────────────────────
     4. SNAP REVEAL — all pages
  ───────────────────────────────────────────── */
  var revealTargets = [
    /* — Homepage — */
    '.mission__quote', '.section-header', '.division', '.benefit',
    '.product__text', '.product__benefits', '.contact__text', '.contact__details',
    '.manifesto__text',
    /* — Waste Management — */
    '.wm-intro__text', '.wm-intro__stats', '.wm-compliance__item',
    /* — EV Charging Station — */
    '.ev-accred__text', '.ev-accred__cert-card', '.ev-manifesto__text',
    '.ev-perm-card', '.ev-cta__title',
    /* — Technical Skills Institution — */
    '.tsi-overview__text', '.tsi-overview__stats', '.tsi-manifesto__text',
    /* — Technology & Systems — */
    '.ts-intro__text', '.ts-product-card',
    /* — Automatic Charging e-Bike — */
    '.eb-intro__text', '.eb-intro__stats', '.eb-how-card',
    '.eb-patent__item', '.eb-cta__title',
    /* — About — */
    '.about-intro__text', '.about-values__item', '.about-team__member',
  ];

  revealTargets.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add('reveal');
    });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────────
     5. STAGGERED CARDS & BENEFIT ITEMS
  ───────────────────────────────────────────── */
  document.querySelectorAll('.division').forEach(function (el, i) {
    el.style.transitionDelay = (i * 70) + 'ms';
  });
  document.querySelectorAll('.benefit').forEach(function (el, i) {
    el.style.transitionDelay = (i * 55) + 'ms';
  });
  document.querySelectorAll('.eb-how-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 70) + 'ms';
  });
  document.querySelectorAll('.ts-product-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 70) + 'ms';
  });
  document.querySelectorAll('.ev-perm-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 70) + 'ms';
  });

  /* ─────────────────────────────────────────────
     6. STAT COUNTERS — reads data-count from HTML
        (values are no longer hardcoded here)
  ───────────────────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, target, duration) {
    if (target === 0) { el.textContent = 0; return; }
    if (prefersReduced) { el.textContent = target; return; }
    var dur = duration || 700;
    var startTime = null;
    function tick(now) {
      if (!startTime) startTime = now;
      var elapsed  = now - startTime;
      var progress = Math.min(elapsed / dur, 1);
      el.textContent = Math.floor(easeOutCubic(progress) * target);
      if (progress < 1) { requestAnimationFrame(tick); }
      else { el.textContent = target; }
    }
    requestAnimationFrame(tick);
  }

  var statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        /* Read target values from data-count attributes on each .hero__stat-num */
        var nums = Array.from(entry.target.querySelectorAll('.hero__stat-num[data-count]'));
        nums.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          if (isNaN(target)) return;
          var sup = el.querySelector('sup');
          if (sup) {
            /* Preserve the <sup> suffix after the counter finishes */
            if (!prefersReduced) {
              var supText = sup.textContent;
              setTimeout(function () {
                el.textContent = target;
                var newSup = document.createElement('sup');
                newSup.textContent = supText;
                el.appendChild(newSup);
              }, 700);
            }
          } else {
            animateCounter(el, target, 700);
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
     7. DIVISION TOUCH FEEDBACK
  ───────────────────────────────────────────── */
  document.querySelectorAll('.division').forEach(function(card) {
    card.addEventListener('touchstart', function() {
      card.classList.add('division--active');
    }, { passive: true });
    card.addEventListener('touchend', function() {
      setTimeout(function() { card.classList.remove('division--active'); }, 300);
    }, { passive: true });
  });

  /* ─────────────────────────────────────────────
     8. BAUHAUS BLOCK PARALLAX
  ───────────────────────────────────────────── */
  if (!prefersReduced) {
    var blockRed    = document.querySelector('.hero__block--red');
    var blockYellow = document.querySelector('.hero__block--yellow');
    var blockBlue   = document.querySelector('.hero__block--blue');
    var heroSection = document.querySelector('.hero');
    var heroVisible = true;
    var parTicking  = false;

    if (heroSection) {
      var heroVisObs = new IntersectionObserver(
        function(entries) { heroVisible = entries[0].isIntersecting; },
        { threshold: 0 }
      );
      heroVisObs.observe(heroSection);
    }

    window.addEventListener('scroll', function() {
      if (!heroVisible || parTicking) return;
      requestAnimationFrame(function() {
        var y = window.scrollY;
        if (blockRed)    blockRed.style.transform    = 'translateY(' + (y * -0.08) + 'px)';
        if (blockYellow) blockYellow.style.transform = 'translateY(' + (y * -0.12) + 'px)';
        if (blockBlue)   blockBlue.style.transform   = 'translateY(' + (y * -0.16) + 'px)';
        parTicking = false;
      });
      parTicking = true;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     9. CONTACT FORM — v10 hidden-iframe POST

     Why iframe instead of fetch()?
     FormSubmit does not send CORS headers that
     allow cross-origin XHR/fetch from arbitrary
     origins. A classic form POST to a hidden
     <iframe> target bypasses CORS entirely because
     it is a navigation, not an XHR. FormSubmit
     handles it, sends the email, then loads its
     thank-you page inside the invisible iframe
     (which we simply ignore). No activation step
     required for the standard (non-/ajax/) endpoint.
  ───────────────────────────────────────────── */
  var CONTACT_EMAIL = 'info@prymmgroup.com';

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var statusEl = contactForm.querySelector('.contact__form-status');

    /* Create a hidden iframe to receive the FormSubmit response page */
    var iframeName = 'formsubmit-target-' + Date.now();
    var iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.cssText = 'display:none;position:absolute;width:0;height:0;border:0;';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('tabindex', '-1');
    document.body.appendChild(iframe);

    /* Point the real form at FormSubmit's standard endpoint */
    contactForm.setAttribute('action', 'https://formsubmit.co/' + CONTACT_EMAIL);
    contactForm.setAttribute('method', 'POST');
    contactForm.setAttribute('target', iframeName);

    /* Ensure required hidden fields exist */
    function ensureHidden(name, value) {
      var el = contactForm.querySelector('input[name="' + name + '"]');
      if (!el) {
        el = document.createElement('input');
        el.type = 'hidden';
        el.name = name;
        contactForm.appendChild(el);
      }
      el.value = value;
    }
    ensureHidden('_captcha',  'false');
    ensureHidden('_template', 'table');
    ensureHidden('_subject',  'New Enquiry — The Prymm Group');
    ensureHidden('_next',     'https://prymmgroup.com/');

    /* ── Field validation helpers ── */
    function showFieldError(input, msg) {
      var err = input.parentElement.querySelector('.contact__field-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'contact__field-error';
        err.setAttribute('aria-live', 'polite');
        input.parentElement.appendChild(err);
      }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(input) {
      var err = input.parentElement.querySelector('.contact__field-error');
      if (err) err.textContent = '';
      input.removeAttribute('aria-invalid');
    }

    function validateField(input) {
      var val = input.value.trim();
      if (input.type === 'email') {
        if (!val) { showFieldError(input, 'Email is required.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showFieldError(input, 'Enter a valid email address.'); return false; }
      } else {
        if (!val) {
          var label = input.name.charAt(0).toUpperCase() + input.name.slice(1);
          showFieldError(input, label + ' is required.');
          return false;
        }
      }
      clearFieldError(input);
      return true;
    }

    /* Live validation */
    contactForm.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]), textarea').forEach(function(field) {
      field.addEventListener('blur', function() { validateField(field); });
      field.addEventListener('input', function() {
        if (field.getAttribute('aria-invalid')) clearFieldError(field);
      });
    });

    /* Submit handler */
    contactForm.addEventListener('submit', function(e) {
      var fields = Array.from(contactForm.querySelectorAll(
        'input:not([type="hidden"]):not([name="_honey"]), textarea'
      ));
      var valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        e.preventDefault();
        return;
      }

      var btn = contactForm.querySelector('button[type="submit"]');
      var origLabel = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending&#8230;';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'contact__form-status'; }

      var confirmed = false;

      function onSuccess() {
        if (confirmed) return;
        confirmed = true;
        if (statusEl) {
          statusEl.textContent = '\u2713 Message sent \u2014 we\'ll be in touch shortly.';
          statusEl.className = 'contact__form-status contact__form-status--ok';
        }
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = origLabel;
      }

      iframe.onload = function() { onSuccess(); };
      setTimeout(onSuccess, 8000);
    });
  }

  /* ─────────────────────────────────────────────
     10. SMOOTH ANCHOR SCROLLING
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────
     11. PAGE-EXIT CROSS-FADE
  ───────────────────────────────────────────── */
  if (!prefersReduced) {
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|http|https|\/\/)/.test(href)) return;
      if (link.target === '_blank') return;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var dest = href;
        document.body.classList.add('page-exit');
        setTimeout(function() { window.location.href = dest; }, 220);
      });
    });
  }

  /* ─────────────────────────────────────────────
     12. DIVISION 01 EXPAND DRAWER
     Uses scrollHeight for pixel-perfect animation
     so max-height never clips the content.
     Moves focus to the first product card on open
     so keyboard users land in the drawer directly.

     FIX v14: The drawer's scrollHeight was being
     read before the browser had laid out its
     contents (product card images are lazy-loaded
     and the drawer was never rendered at full
     height before). We now:
       1. Temporarily remove overflow:hidden and
          set visibility:hidden / position:absolute
          so the drawer paints off-screen at its
          natural height.
       2. Read scrollHeight after a forced reflow.
       3. Restore overflow:hidden and animate.
     This guarantees the product cards are fully
     visible and clickable when the drawer opens.
  ───────────────────────────────────────────── */
  (function () {
    var btn    = document.querySelector('.division__toggle');
    var drawer = document.getElementById('drawer-industrial');
    var card   = document.getElementById('div-industrial');
    if (!btn || !drawer) return;

    /* Pre-measure the drawer's natural height off-screen so scrollHeight
       is always accurate regardless of lazy-load or reveal state. */
    function measureDrawer() {
      var prevMax  = drawer.style.maxHeight;
      var prevVis  = drawer.style.visibility;
      var prevPos  = drawer.style.position;
      var prevOver = drawer.style.overflow;

      drawer.style.maxHeight  = 'none';
      drawer.style.visibility = 'hidden';
      drawer.style.position   = 'absolute';
      drawer.style.overflow   = 'visible';

      /* Force reflow */
      var h = drawer.scrollHeight;

      drawer.style.maxHeight  = prevMax  || '';
      drawer.style.visibility = prevVis  || '';
      drawer.style.position   = prevPos  || '';
      drawer.style.overflow   = prevOver || '';

      /* Never return a height shorter than the min-height defined in CSS
         (2 cards × 340px min-height + drawer padding ≈ 800px) */
      return Math.max(h, 800);
    }

    function openDrawer() {
      btn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      card.classList.add('division--active');

      /* Measure before adding the open class so overflow:hidden is still off */
      var targetHeight = measureDrawer();

      drawer.classList.add('division__drawer--open');
      drawer.style.maxHeight = targetHeight + 'px';

      /* Move focus to the first product card after the transition ends */
      drawer.addEventListener('transitionend', function onEnd(e) {
        if (e.propertyName !== 'max-height') return;
        drawer.removeEventListener('transitionend', onEnd);
        var firstCard = drawer.querySelector('.division__product-card');
        if (firstCard) firstCard.focus();
      });
    }

    function closeDrawer() {
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.classList.remove('division__drawer--open');
      card.classList.remove('division--active');
      drawer.style.maxHeight = '0';
    }

    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    /* Escape key closes the drawer and returns focus to the toggle */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        closeDrawer();
        btn.focus();
      }
    });
  })();

})();
