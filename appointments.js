/* =====================================================
   APPOINTMENTS PAGE — appointments.js
   Handles: date/time logic, inline validation,
   char counter, form submit feedback
===================================================== */
(function () {
  'use strict';

  // ── AVAILABILITY CONFIG ──────────────────────────
  // Days: 1=Mon, 2=Tue, 5=Fri (PST)
  const AVAILABLE_DAYS = {
    1: { label: 'Monday',  slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM'] },
    2: { label: 'Tuesday', slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM'] },
    5: { label: 'Friday',  slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM'] }
  };
  // Last slot on Fri = 1:00 PM (meeting ends by 2:00 PM)
  // Last slot on Mon/Tue = 3:30 PM (meeting ends by 4:30 PM max)
  // Note: 4:00 PM start would run to 5:00 PM — kept at 3:30 PM to stay within the 10am-4pm window

  // ── DOM REFS ─────────────────────────────────────
  const dateInput = document.getElementById('apt-date');
  const timeSelect = document.getElementById('apt-time');
  const altDateInput = document.getElementById('apt-alt-date');
  const textarea = document.getElementById('apt-topic');
  const charCount = document.getElementById('char-count');
  const form = document.getElementById('apt-form');
  const successEl = document.getElementById('apt-success');
  const submitBtn = document.getElementById('apt-submit');

  if (!dateInput || !timeSelect || !form) return;

  // ── DATE SETUP ───────────────────────────────────
  // Set min = tomorrow (local)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  dateInput.min = toISO(tomorrow);
  if (altDateInput) altDateInput.min = toISO(tomorrow);

  // ── DATE CHANGE: populate time slots ─────────────
  function getDayOfWeek(dateStr) {
    // dateStr = YYYY-MM-DD; parse as local date to avoid UTC offset shift
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getDay(); // 0=Sun,1=Mon,...,6=Sat
  }

  function populateTimeSlots(dayIndex) {
    timeSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;

    if (dayIndex === undefined || !AVAILABLE_DAYS[dayIndex]) {
      placeholder.textContent = 'Select a date first…';
      timeSelect.appendChild(placeholder);
      timeSelect.disabled = true;
      return;
    }

    placeholder.textContent = 'Select a time…';
    timeSelect.appendChild(placeholder);
    AVAILABLE_DAYS[dayIndex].slots.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = slot + ' PST';
      opt.textContent = slot + ' PST';
      timeSelect.appendChild(opt);
    });
    timeSelect.disabled = false;
  }

  // Init: disabled until date chosen
  populateTimeSlots(undefined);

  dateInput.addEventListener('change', function () {
    const val = this.value;
    if (!val) { populateTimeSlots(undefined); return; }
    const day = getDayOfWeek(val);
    if (!AVAILABLE_DAYS[day]) {
      showFieldError(dateInput, 'err-date', 'Please select a Monday, Tuesday, or Friday.');
      populateTimeSlots(undefined);
    } else {
      clearFieldError(dateInput, 'err-date');
      populateTimeSlots(day);
    }
    // Keep alt date min in sync
    if (altDateInput) altDateInput.min = val || toISO(tomorrow);
  });

  // ── CHAR COUNTER ─────────────────────────────────
  if (textarea && charCount) {
    textarea.addEventListener('input', function () {
      const len = this.value.length;
      charCount.textContent = len;
      charCount.style.color = len >= 480 ? 'var(--red)' : '';
    });
  }

  // ── VALIDATION HELPERS ───────────────────────────
  function showFieldError(inputEl, errId, msg) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = msg;
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-describedby', errId);
  }
  function clearFieldError(inputEl, errId) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
    inputEl.classList.remove('is-invalid');
  }

  function validateForm() {
    let valid = true;
    // Name
    const name = document.getElementById('apt-name');
    if (!name.value.trim()) { showFieldError(name, 'err-name', 'Full name is required.'); valid = false; }
    else clearFieldError(name, 'err-name');
    // Email
    const email = document.getElementById('apt-email');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRx.test(email.value.trim())) { showFieldError(email, 'err-email', 'A valid email address is required.'); valid = false; }
    else clearFieldError(email, 'err-email');
    // Org
    const org = document.getElementById('apt-org');
    if (!org.value.trim()) { showFieldError(org, 'err-org', 'Organization name is required.'); valid = false; }
    else clearFieldError(org, 'err-org');
    // Division
    const div = document.getElementById('apt-division');
    if (!div.value) { showFieldError(div, 'err-division', 'Please select a division.'); valid = false; }
    else clearFieldError(div, 'err-division');
    // Date
    const dateVal = dateInput.value;
    if (!dateVal) { showFieldError(dateInput, 'err-date', 'Please choose a preferred date.'); valid = false; }
    else {
      const day = getDayOfWeek(dateVal);
      if (!AVAILABLE_DAYS[day]) { showFieldError(dateInput, 'err-date', 'Please select a Monday, Tuesday, or Friday.'); valid = false; }
      else clearFieldError(dateInput, 'err-date');
    }
    // Time
    if (!timeSelect.value) { showFieldError(timeSelect, 'err-time', 'Please select a time slot.'); valid = false; }
    else clearFieldError(timeSelect, 'err-time');
    // Topic
    const topic = document.getElementById('apt-topic');
    if (!topic.value.trim()) { showFieldError(topic, 'err-topic', 'Please describe your meeting topic.'); valid = false; }
    else clearFieldError(topic, 'err-topic');

    return valid;
  }

  // ── FORM SUBMIT ──────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Disable button to prevent double-submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const data = new FormData(form);
    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(res => {
      // FormSubmit returns a redirect; any 2xx or opaque response = success
      showSuccess();
    })
    .catch(() => {
      // Network failure — fall back to native form submit
      form.submit();
    });
  });

  function showSuccess() {
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

})();
