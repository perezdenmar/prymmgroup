/* =====================================================
   APPOINTMENTS PAGE — appointments.js  v2
   Handles: date/time logic, inline validation,
   char counter, iframe POST submit, success summary
===================================================== */
(function () {
  'use strict';

  // ── AVAILABILITY CONFIG ──────────────────────────
  // Days: 1=Mon, 2=Tue, 5=Fri (PST/UTC+8)
  var AVAILABLE_DAYS = {
    1: { label: 'Monday',  slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM'] },
    2: { label: 'Tuesday', slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM'] },
    5: { label: 'Friday',  slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM'] }
  };

  // ── DOM REFS ─────────────────────────────────────
  var dateInput   = document.getElementById('apt-date');
  var timeSelect  = document.getElementById('apt-time');
  var altDateInput= document.getElementById('apt-alt-date');
  var textarea    = document.getElementById('apt-topic');
  var charCount   = document.getElementById('char-count');
  var form        = document.getElementById('apt-form');
  var successEl   = document.getElementById('apt-success');
  var submitBtn   = document.getElementById('apt-submit');

  if (!dateInput || !timeSelect || !form) return;

  // ── DATE SETUP ───────────────────────────────────
  var pad    = function(n) { return String(n).padStart(2, '0'); };
  var toISO  = function(d) { return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); };

  // Min = tomorrow in the user's local timezone
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = toISO(tomorrow);
  if (altDateInput) altDateInput.min = toISO(tomorrow);

  // ── DATE UTILS ───────────────────────────────────
  function getDayOfWeek(dateStr) {
    // Parse as local date to avoid UTC shift
    var parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  }

  function isDateInPast(dateStr) {
    var parts  = dateStr.split('-').map(Number);
    var chosen = new Date(parts[0], parts[1] - 1, parts[2]);
    var today  = new Date();
    today.setHours(0, 0, 0, 0);
    return chosen <= today;
  }

  function formatDateLabel(dateStr) {
    var parts = dateStr.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── TIME SLOT POPULATION ─────────────────────────
  function populateTimeSlots(dayIndex) {
    timeSelect.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value    = '';
    placeholder.disabled = true;
    placeholder.selected = true;

    if (dayIndex === undefined || !AVAILABLE_DAYS[dayIndex]) {
      placeholder.textContent = 'Select a date first\u2026';
      timeSelect.appendChild(placeholder);
      timeSelect.disabled = true;
      return;
    }

    placeholder.textContent = 'Select a time\u2026';
    timeSelect.appendChild(placeholder);
    AVAILABLE_DAYS[dayIndex].slots.forEach(function(slot) {
      var opt = document.createElement('option');
      opt.value = slot + ' PST';
      opt.textContent = slot + ' PST';
      timeSelect.appendChild(opt);
    });
    timeSelect.disabled = false;
  }

  populateTimeSlots(undefined);

  dateInput.addEventListener('change', function () {
    var val = this.value;
    if (!val) { populateTimeSlots(undefined); return; }

    if (isDateInPast(val)) {
      showFieldError(dateInput, 'err-date', 'Please choose a future date.');
      populateTimeSlots(undefined);
      return;
    }

    var day = getDayOfWeek(val);
    if (!AVAILABLE_DAYS[day]) {
      showFieldError(dateInput, 'err-date', 'We\u2019re only available on Monday, Tuesday, and Friday.');
      populateTimeSlots(undefined);
    } else {
      clearFieldError(dateInput, 'err-date');
      populateTimeSlots(day);
    }
    if (altDateInput) altDateInput.min = val || toISO(tomorrow);
  });

  // ── CHAR COUNTER ─────────────────────────────────
  if (textarea && charCount) {
    textarea.addEventListener('input', function () {
      var len = this.value.length;
      charCount.textContent = len;
      charCount.style.color = len >= 480 ? 'var(--red)' : '';
    });
  }

  // ── VALIDATION HELPERS ───────────────────────────
  function showFieldError(inputEl, errId, msg) {
    var errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = msg;
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-describedby', errId);
  }
  function clearFieldError(inputEl, errId) {
    var errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');
  }

  // Live-clear errors on input
  var liveFields = form.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]), select, textarea');
  liveFields.forEach(function(field) {
    field.addEventListener('input', function() {
      if (field.classList.contains('is-invalid')) {
        // Only clear if the field now has a value
        if (field.value && field.value.trim()) {
          var errId = 'err-' + (field.id || '').replace('apt-', '');
          clearFieldError(field, errId);
        }
      }
    });
    field.addEventListener('change', function() {
      if (field.classList.contains('is-invalid') && field.value) {
        var errId = 'err-' + (field.id || '').replace('apt-', '');
        clearFieldError(field, errId);
      }
    });
  });

  function validateForm() {
    var valid = true;

    var name = document.getElementById('apt-name');
    if (!name.value.trim()) { showFieldError(name, 'err-name', 'Full name is required.'); valid = false; }
    else clearFieldError(name, 'err-name');

    var email = document.getElementById('apt-email');
    var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRx.test(email.value.trim())) { showFieldError(email, 'err-email', 'A valid email address is required.'); valid = false; }
    else clearFieldError(email, 'err-email');

    var org = document.getElementById('apt-org');
    if (!org.value.trim()) { showFieldError(org, 'err-org', 'Organization name is required.'); valid = false; }
    else clearFieldError(org, 'err-org');

    var div = document.getElementById('apt-division');
    if (!div.value) { showFieldError(div, 'err-division', 'Please select a division.'); valid = false; }
    else clearFieldError(div, 'err-division');

    var dateVal = dateInput.value;
    if (!dateVal) {
      showFieldError(dateInput, 'err-date', 'Please choose a preferred date.');
      valid = false;
    } else if (isDateInPast(dateVal)) {
      showFieldError(dateInput, 'err-date', 'Please choose a future date.');
      valid = false;
    } else {
      var day = getDayOfWeek(dateVal);
      if (!AVAILABLE_DAYS[day]) {
        showFieldError(dateInput, 'err-date', 'We\u2019re only available on Monday, Tuesday, and Friday.');
        valid = false;
      } else clearFieldError(dateInput, 'err-date');
    }

    if (!timeSelect.value) { showFieldError(timeSelect, 'err-time', 'Please select a time slot.'); valid = false; }
    else clearFieldError(timeSelect, 'err-time');

    var topic = document.getElementById('apt-topic');
    if (!topic.value.trim()) { showFieldError(topic, 'err-topic', 'Please describe your meeting topic.'); valid = false; }
    else clearFieldError(topic, 'err-topic');

    return valid;
  }

  // ── IFRAME POST (avoids CORS) ─────────────────────
  var iframeName = 'apt-submit-frame-' + Date.now();
  var iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.style.cssText = 'display:none;position:absolute;width:0;height:0;border:0;';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  document.body.appendChild(iframe);

  form.setAttribute('target', iframeName);
  // Keep method=POST and action already set in HTML

  // ── FORM SUBMIT ──────────────────────────────────
  var submitted = false;

  form.addEventListener('submit', function (e) {
    if (!validateForm()) {
      e.preventDefault();
      var firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (submitted) { e.preventDefault(); return; } // double-submit guard
    submitted = true;

    // Collect summary data before form submits
    var summaryName  = document.getElementById('apt-name').value.trim();
    var summaryDate  = dateInput.value;
    var summaryTime  = timeSelect.value;
    var summaryDiv   = document.getElementById('apt-division').value;

    // Show loading state on button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="apt-btn-spinner" aria-hidden="true"></span>Sending\u2026';

    // Let the form POST naturally to the iframe
    // Then show success after a short delay (FormSubmit is fast)
    iframe.onload = function() { showSuccess(summaryName, summaryDate, summaryTime, summaryDiv); };
    setTimeout(function() { showSuccess(summaryName, summaryDate, summaryTime, summaryDiv); }, 5000);
  });

  function showSuccess(name, dateStr, time, division) {
    if (!successEl || successEl._shown) return;
    successEl._shown = true;

    // Populate summary card
    var elName = document.getElementById('summary-name');
    var elDate = document.getElementById('summary-date');
    var elTime = document.getElementById('summary-time');
    var elDiv  = document.getElementById('summary-division');
    if (elName) elName.textContent = name;
    if (elDate) elDate.textContent = formatDateLabel(dateStr);
    if (elTime) elTime.textContent = time;
    if (elDiv)  elDiv.textContent  = division;

    form.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // "Submit Another" resets the page state without a hard reload
  var resetBtn = document.getElementById('apt-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      form.reset();
      populateTimeSlots(undefined);
      if (charCount) charCount.textContent = '0';
      submitted = false;
      if (successEl) { successEl.hidden = true; successEl._shown = false; }
      form.hidden = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Request &rarr;';
      // Scroll back to form top
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

})();
