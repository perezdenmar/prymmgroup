/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions v9 — Contact Form Fix
   ─ Nav scroll state
   ─ Active nav scroll-spy (IntersectionObserver)
   ─ Active nav indicator on sub-pages
   ─ Mobile hamburger nav + FOCUS TRAP
   ─ Body scroll lock when nav open
   ─ Backdrop tap-to-close
   ─ Escape key close
   ─ aria-expanded + aria-label on hamburger
   ─ Snap reveal (IntersectionObserver)
   ─ Staggered division cards + benefit items
   ─ Stat counters (eased, reduced-motion safe)
   ─ Division touch feedback
   ─ Bauhaus block parallax (hero-visibility guard)
   ─ Contact form: FormSubmit AJAX + mailto fallback (FIXED)
   ─ Smooth anchor scrolling
   ─ Page fade-in + PAGE-EXIT CROSS-FADE
   ─ SCROLL PROGRESS BAR
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
     4. SNAP REVEAL
  ───────────────────────────────────────────── */
  var revealTargets = [
    '.mission__quote', '.section-header', '.division', '.benefit',
    '.product__text', '.product__benefits', '.contact__text', '.contact__details',
    '.manifesto__text',
    '.wm-intro__text', '.wm-intro__stats', '.wm-compliance__item',
    '.ev-accred__text', '.ev-accred__cert-card', '.ev-manifesto__text',
    '.tsi-overview__text', '.tsi-overview__stats', '.tsi-manifesto__text',
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

  /* ─────────────────────────────────────────────
     6. STAT COUNTERS
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
        var nums    = entry.target.querySelectorAll('.hero__stat-num');
        var targets = [3, 95, 0];
        nums.forEach(function (el, i) {
          var sup = el.querySelector('sup');
          if (sup) {
            if (!prefersReduced) {
              var supText = sup.textContent;
              setTimeout(function () {
                el.textContent = targets[i];
                var newSup = document.createElement('sup');
                newSup.textContent = supText;
                el.appendChild(newSup);
              }, 700);
            }
          } else {
            animateCounter(el, targets[i], 700);
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
     9. CONTACT FORM — FIXED v9
     Strategy:
       1. POST as FormData to FormSubmit's standard
          (non-AJAX) endpoint so it works even before
          AJAX activation.
       2. Use fetch with FormData — FormSubmit accepts
          this and returns JSON when _captcha=false and
          Accept: application/json is set.
       3. Check response.ok AND the json.success field.
       4. On any failure, open the mailto fallback so
          the message is never lost.
  ───────────────────────────────────────────── */
  var CONTACT_EMAIL = 'info@prymmgroup.com';

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var statusEl = contactForm.querySelector('.contact__form-status');

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

    /* ── Live validation ── */
    contactForm.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]), textarea').forEach(function(field) {
      field.addEventListener('blur', function() { validateField(field); });
      field.addEventListener('input', function() {
        if (field.getAttribute('aria-invalid')) clearFieldError(field);
      });
    });

    /* ── Mailto fallback ── */
    function openMailtoFallback(name, email, message) {
      var subject = encodeURIComponent('Website Enquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\n' + 'Email: ' + email + '\n\nMessage:\n' + message);
      window.open('mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body);
    }

    /* ── Submit ── */
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      /* Validate all visible fields */
      var fields = Array.from(contactForm.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]), textarea'));
      var valid = fields.map(validateField).every(Boolean);
      if (!valid) return;

      var nameVal    = (contactForm.querySelector('[name="name"]') || {}).value || '';
      var emailVal   = (contactForm.querySelector('[name="email"]') || {}).value || '';
      var messageVal = (contactForm.querySelector('[name="message"]') || {}).value || '';
      nameVal    = nameVal.trim();
      emailVal   = emailVal.trim();
      messageVal = messageVal.trim();

      var btn = contactForm.querySelector('button[type="submit"]');
      var origLabel = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending&#8230;';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'contact__form-status'; }

      /* Build FormData — works with FormSubmit before AJAX activation */
      var fd = new FormData();
      fd.append('name', nameVal);
      fd.append('email', emailVal);
      fd.append('message', messageVal);
      fd.append('_subject', 'New Enquiry — The Prymm Group');
      fd.append('_captcha', 'false');   /* disables the reCAPTCHA redirect */
      fd.append('_template', 'table'); /* clean email table layout */
      fd.append('_honey', '');          /* honeypot empty */

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeoutId  = setTimeout(function() { if (controller) controller.abort(); }, 10000);

      var fetchOptions = {
        method: 'POST',
        headers: { 'Accept': 'application/json' }, /* ask for JSON response */
        body: fd
      };
      if (controller) fetchOptions.signal = controller.signal;

      fetch('https://formsubmit.co/' + CONTACT_EMAIL, fetchOptions)
        .then(function(r) {
          clearTimeout(timeoutId);
          /* FormSubmit returns 200 with {success:"true"} on success.
             Any non-2xx is a real error. */
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          /* FormSubmit success payload: {success: "true", message: "..."} */
          if (data && (data.success === true || data.success === 'true')) {
            if (statusEl) {
              statusEl.textContent = '\u2713 Message sent — we\'ll be in touch shortly.';
              statusEl.className = 'contact__form-status contact__form-status--ok';
            }
            contactForm.reset();
            btn.disabled = false;
            btn.innerHTML = origLabel;
          } else {
            /* FormSubmit may return {success:"false"} if not yet activated —
               treat this as the activation-pending case. */
            throw new Error('not-activated');
          }
        })
        .catch(function(err) {
          clearTimeout(timeoutId);
          btn.disabled = false;
          btn.innerHTML = origLabel;

          var isAborted = err && (err.name === 'AbortError' || err.message === 'not-activated');

          if (statusEl) {
            statusEl.textContent = isAborted
              ? 'Opening your email client as a backup\'…'
              : 'Could not send — opening your email client\'…';
            statusEl.className = 'contact__form-status contact__form-status--ok';
          }
          /* Always fall back to mailto so no message is ever lost */
          setTimeout(function() { openMailtoFallback(nameVal, emailVal, messageVal); }, 450);
        });
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

})();
