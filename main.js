/* ═══════════════════════════════════════════════
   PRYMM GROUP — BAUHAUS LANDING PAGE
   Interactions v6
   ─ Nav scroll state
   ─ Active nav scroll-spy (IntersectionObserver)
   ─ Active nav indicator on sub-pages
   ─ Mobile hamburger nav (works on all pages)
   ─ Snap reveal (IntersectionObserver)
   ─ Staggered division cards
   ─ Stat counters (reduced-motion safe)
   ─ Division touch feedback
   ─ Bauhaus block parallax
   ─ Contact form: FormSubmit AJAX + mailto fallback
   ─ Smooth anchor scrolling
   ─ Page fade-in
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. NAV SCROLL STATE
     Border shifts red → yellow after 80px
  ───────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (!nav) return; /* guard: nav must exist on the page */

  window.addEventListener('scroll', function () {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ─────────────────────────────────────────────
     2. ACTIVE NAV SCROLL-SPY
     Watches #hero, #divisions, #product, #contact
     Only runs on index.html (links are hash-based)
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
     Reads data-page on <body> and marks the link
     whose href contains the page slug.
     Sub-page nav links point to index.html#section
     so we match on the filename segment only.
  ───────────────────────────────────────────── */
  var currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll('.nav__links a').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf(currentPage) !== -1) a.classList.add('is-active');
    });
  }

  /* ─────────────────────────────────────────────
     3. MOBILE HAMBURGER NAV
     Works on index.html AND all sub-pages.
     Looks up #nav-toggle and .nav__links by ID,
     toggling nav--open on the #nav element.
  ───────────────────────────────────────────── */
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    /* Close menu when any nav link is clicked (navigation or hash) */
    document.querySelectorAll('.nav__links a').forEach(function(a) {
      a.addEventListener('click', function() {
        nav.classList.remove('nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
    /* Close menu on Escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        nav.classList.remove('nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  /* ─────────────────────────────────────────────
     4. SNAP REVEAL
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
    { threshold: 0.10, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────────
     5. STAGGERED DIVISION CARDS
  ───────────────────────────────────────────── */
  document.querySelectorAll('.division').forEach(function (el, i) {
    el.style.transitionDelay = (i * 60) + 'ms';
  });

  /* ─────────────────────────────────────────────
     6. STAT COUNTERS — reduced-motion + zero-value safe
  ───────────────────────────────────────────── */
  function animateCounter(el, target) {
    if (target === 0) { el.textContent = 0; return; }
    if (prefersReduced) { el.textContent = target; return; }
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
            if (!prefersReduced) {
              setTimeout(function () {
                el.textContent = targets[i];
                var newSup = document.createElement('sup');
                newSup.textContent = sup.textContent;
                el.appendChild(newSup);
              }, 620);
            }
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
     Subtle depth shift on scroll, RAF-throttled
  ───────────────────────────────────────────── */
  if (!prefersReduced) {
    var blockRed    = document.querySelector('.hero__block--red');
    var blockYellow = document.querySelector('.hero__block--yellow');
    var blockBlue   = document.querySelector('.hero__block--blue');
    var ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var y = window.scrollY;
          if (blockRed)    blockRed.style.transform    = 'translateY(' + (y * -0.08) + 'px)';
          if (blockYellow) blockYellow.style.transform = 'translateY(' + (y * -0.12) + 'px)';
          if (blockBlue)   blockBlue.style.transform   = 'translateY(' + (y * -0.16) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
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
      var timeoutId = setTimeout(function() { if (controller) controller.abort(); }, 8000);

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
          status.textContent = 'Message sent — we’ll be in touch shortly.';
          status.className = 'contact__form-status contact__form-status--ok';
          contactForm.reset();
          btn.disabled = false;
          btn.textContent = 'Send Message →';
        })
        .catch(function() {
          clearTimeout(timeoutId);
          btn.disabled = false;
          btn.textContent = 'Send Message →';
          status.textContent = 'Opening your email client to send directly…';
          status.className = 'contact__form-status contact__form-status--ok';
          setTimeout(function() { openMailtoFallback(nameVal, emailVal, messageVal); }, 400);
        });
    });
  }

  /* ─────────────────────────────────────────────
     10. SMOOTH ANCHOR SCROLLING
     64px nav offset — hash links on index.html only
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = 64;
      var top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
