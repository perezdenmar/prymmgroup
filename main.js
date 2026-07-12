/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions v7 — Phase 4 UX Polish
   ─ Nav scroll state
   ─ Active nav scroll-spy (IntersectionObserver)
   ─ Active nav indicator on sub-pages
   ─ Mobile hamburger nav + FOCUS TRAP
   ─ Snap reveal (IntersectionObserver)
   ─ Staggered division cards + benefit items
   ─ Stat counters (eased, reduced-motion safe)
   ─ Division touch feedback
   ─ Bauhaus block parallax (hero-visibility guard)
   ─ Contact form: FormSubmit AJAX + mailto fallback
   ─ Smooth anchor scrolling
   ─ Page fade-in + PAGE-EXIT CROSS-FADE
   ─ SCROLL PROGRESS BAR
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     0. SCROLL PROGRESS BAR
     Thin yellow line that tracks page scroll %
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
     Border shifts red → yellow after 80px
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
     Focus cycles within the open menu via Tab/Shift+Tab.
     Escape closes and returns focus to the toggle button.
  ───────────────────────────────────────────── */
  var navToggle = document.getElementById('nav-toggle');
  var navLinksContainer = document.getElementById('nav-links');

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
    /* Move focus to first nav item */
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
    navToggle.addEventListener('click', function () {
      if (nav.classList.contains('nav--open')) { closeNav(false); }
      else { openNav(); }
    });

    /* Close menu when any nav link is clicked */
    document.querySelectorAll('.nav__links a').forEach(function(a) {
      a.addEventListener('click', function() { closeNav(false); });
    });

    /* Keyboard: Escape + Tab focus trap */
    document.addEventListener('keydown', function(e) {
      if (!nav.classList.contains('nav--open')) return;

      if (e.key === 'Escape') {
        closeNav(true);
        return;
      }

      if (e.key === 'Tab') {
        var items = getFocusableNavItems();
        if (!items.length) return;
        var first = items[0];
        var last  = items[items.length - 1];
        var active = document.activeElement;

        if (e.shiftKey) {
          /* Shift+Tab: if focus is on first item, wrap to navToggle */
          if (active === first) {
            e.preventDefault();
            navToggle.focus();
          }
        } else {
          /* Tab: if focus is on navToggle or last item, wrap to first */
          if (active === last || active === navToggle) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  /* ─────────────────────────────────────────────
     4. SNAP REVEAL
     threshold raised to 0.15 so elements reveal
     only when meaningfully in view, not at edge.
  ───────────────────────────────────────────── */
  var revealTargets = [
    '.mission__quote',
    '.section-header',
    '.division',
    '.benefit',
    '.product__text',
    '.product__benefits',
    '.contact__text',
    '.contact__details',
    '.manifesto__text',
    /* sub-page selectors */
    '.wm-intro__text',
    '.wm-intro__stats',
    '.wm-compliance__item',
    '.ev-accred__text',
    '.ev-accred__cert-card',
    '.ev-manifesto__text',
    '.tsi-overview__text',
    '.tsi-overview__stats',
    '.tsi-manifesto__text',
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
     6. STAT COUNTERS — eased cubic, reduced-motion safe
     Uses ease-out cubic: progress = 1 - (1 - t)^3
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
     RAF-throttled. Only runs while hero is visible
     (IntersectionObserver guard — saves scroll work
     when user is past the fold).
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
        function(entries) {
          heroVisible = entries[0].isIntersecting;
        },
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
     9. CONTACT FORM
     Primary: FormSubmit AJAX (8 s timeout)
     Fallback: mailto: pre-filled with form data
  ───────────────────────────────────────────── */
  var CONTACT_EMAIL = 'info@prymmgroup.com';

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var status = contactForm.querySelector('.contact__form-status');

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
      if (input.type === 'email') {
        if (!input.value.trim()) { showFieldError(input, 'Email is required.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { showFieldError(input, 'Enter a valid email address.'); return false; }
      } else {
        if (!input.value.trim()) { showFieldError(input, input.name.charAt(0).toUpperCase() + input.name.slice(1) + ' is required.'); return false; }
      }
      clearFieldError(input);
      return true;
    }

    function openMailtoFallback(name, email, message) {
      var subject = encodeURIComponent('Website Enquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\n' + 'Email: ' + email + '\n\n' + message);
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    }

    contactForm.querySelectorAll('input, textarea').forEach(function(field) {
      field.addEventListener('blur', function() { validateField(field); });
      field.addEventListener('input', function() { if (field.getAttribute('aria-invalid')) clearFieldError(field); });
    });

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var fields = Array.from(contactForm.querySelectorAll('input, textarea'));
      var valid = fields.map(validateField).every(Boolean);
      if (!valid) return;

      var nameVal    = contactForm.querySelector('[name="name"]').value.trim();
      var emailVal   = contactForm.querySelector('[name="email"]').value.trim();
      var messageVal = contactForm.querySelector('[name="message"]').value.trim();

      var btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeoutId  = setTimeout(function() { if (controller) controller.abort(); }, 8000);

      var fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: nameVal, email: emailVal, message: messageVal })
      };
      if (controller) fetchOptions.signal = controller.signal;

      fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, fetchOptions)
        .then(function(r) {
          clearTimeout(timeoutId);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function() {
          status.textContent = 'Message sent \u2014 we’ll be in touch shortly.';
          status.className = 'contact__form-status contact__form-status--ok';
          contactForm.reset();
          btn.disabled = false;
          btn.textContent = 'Send Message \u2192';
        })
        .catch(function() {
          clearTimeout(timeoutId);
          btn.disabled = false;
          btn.textContent = 'Send Message \u2192';
          status.textContent = 'Opening your email client to send directly…';
          status.className = 'contact__form-status contact__form-status--ok';
          setTimeout(function() { openMailtoFallback(nameVal, emailVal, messageVal); }, 400);
        });
    });
  }

  /* ─────────────────────────────────────────────
     10. SMOOTH ANCHOR SCROLLING
     64px nav offset — hash links on index.html
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = 64;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────
     11. PAGE-EXIT CROSS-FADE
     Internal links that navigate to a new page
     trigger a 200ms opacity-out before following.
     Hash links and external links are excluded.
  ───────────────────────────────────────────── */
  if (!prefersReduced) {
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      /* Skip: hash anchors, external, mailto, tel, already-handled */
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|http|https|\/\/)/.test(href)) return;
      /* Skip target="_blank" */
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
