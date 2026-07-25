/* ==========================================================================
   a.cutzz_ — booking.js
   Custom 5-step booking flow. No frameworks, no backend — demo state only.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const state = {
    step: 1,
    service: null,   // { key, name, price, duration }
    date: null,      // Date object
    time: null,      // string
    name: '', phone: '', email: '', insta: ''
  };

  const panels = document.querySelectorAll('.step-panel');
  const dots = document.querySelectorAll('.step-dot');
  const stepper = document.getElementById('stepper');

  function goToStep(n) {
    state.step = n;
    panels.forEach(p => p.classList.toggle('active', Number(p.dataset.panel) === n));
    dots.forEach(d => {
      const s = Number(d.dataset.step);
      d.classList.toggle('active', s === n);
      d.classList.toggle('done', s < n);
    });
    const pct = ((n - 1) / (dots.length - 1)) * 100;
    stepper.style.setProperty('--progress', pct + '%');
    document.querySelector('.booking-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------- STEP 1: SERVICE ---------------- */
  const serviceCards = document.querySelectorAll('.select-card');

  function selectService(card) {
    serviceCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.service = {
      key: card.dataset.service,
      name: card.dataset.name,
      price: card.dataset.price,
      duration: card.dataset.duration
    };
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => selectService(card));
  });

  // preselect from ?service= query param
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('service');
  if (preselect) {
    const match = document.querySelector(`.select-card[data-service="${preselect}"]`);
    if (match) selectService(match);
  }

  document.getElementById('next1').addEventListener('click', () => {
    if (!state.service) {
      flashError(document.getElementById('serviceList'));
      return;
    }
    goToStep(2);
  });

  /* ---------------- STEP 2: DATE (calendar) ---------------- */
  const calGrid = document.getElementById('calGrid');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewMonth = today.getMonth();
  let viewYear = today.getFullYear();
  const maxMonthsAhead = 2;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dowNames = ['S','M','T','W','T','F','S'];

  function renderCalendar() {
    calMonthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    calGrid.innerHTML = '';

    dowNames.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGrid.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      const btn = document.createElement('button');
      btn.className = 'cal-day';
      btn.textContent = d;
      btn.type = 'button';

      const isPast = cellDate < today;
      // demo: shop closed on Mondays
      const isClosed = cellDate.getDay() === 1;
      if (isPast || isClosed) btn.classList.add('disabled');
      if (cellDate.getTime() === today.getTime()) btn.classList.add('today');
      if (state.date && cellDate.getTime() === state.date.getTime()) btn.classList.add('selected');

      btn.addEventListener('click', () => {
        state.date = cellDate;
        state.time = null;
        renderCalendar();
      });
      calGrid.appendChild(btn);
    }

    const minMonth = today.getFullYear() * 12 + today.getMonth();
    const curMonth = viewYear * 12 + viewMonth;
    calPrev.disabled = curMonth <= minMonth;
    calNext.disabled = curMonth >= minMonth + maxMonthsAhead;
  }

  calPrev.addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();

  document.getElementById('back2').addEventListener('click', () => goToStep(1));
  document.getElementById('next2').addEventListener('click', () => {
    if (!state.date) { flashError(document.querySelector('.calendar')); return; }
    renderTimeSlots();
    goToStep(3);
  });

  /* ---------------- STEP 3: TIME ---------------- */
  const timeGrid = document.getElementById('timeGrid');
  const timeHint = document.getElementById('timeHint');

  const allSlots = ['9:00 AM','9:40 AM','10:20 AM','11:00 AM','11:40 AM','12:40 PM','1:10 PM','2:00 PM','2:30 PM','3:30 PM','4:15 PM','5:00 PM','5:45 PM','6:30 PM','7:30 PM'];

  function renderTimeSlots() {
    timeGrid.innerHTML = '';
    if (!state.date) return;

    const dateLabel = state.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    timeHint.textContent = `Available slots for ${dateLabel}.`;

    // deterministic pseudo-availability based on the date, so it feels real but is stable
    const seed = state.date.getDate() + state.date.getMonth() * 31;
    const available = allSlots.filter((_, i) => (seed + i) % 3 !== 0);

    if (available.length === 0) {
      timeGrid.innerHTML = '<div class="time-empty">No open slots this day — try another date.</div>';
      return;
    }

    available.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'time-slot';
      btn.type = 'button';
      btn.textContent = t;
      if (state.time === t) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        state.time = t;
        timeGrid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
      });
      timeGrid.appendChild(btn);
    });
  }

  document.getElementById('back3').addEventListener('click', () => goToStep(2));
  document.getElementById('next3').addEventListener('click', () => {
    if (!state.time) { flashError(timeGrid); return; }
    buildSummary();
    goToStep(4);
  });

  /* ---------------- STEP 4: CUSTOMER INFO ---------------- */
  const nameInput = document.getElementById('custName');
  const phoneInput = document.getElementById('custPhone');
  const emailInput = document.getElementById('custEmail');
  const instaInput = document.getElementById('custInsta');
  const summaryBox = document.getElementById('summaryBox');

  function buildSummary() {
    if (!state.service || !state.date || !state.time) return;
    const dateLabel = state.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    summaryBox.innerHTML = `
      <div class="summary-row"><span>Service</span><b>${state.service.name}</b></div>
      <div class="summary-row"><span>Date</span><b>${dateLabel}</b></div>
      <div class="summary-row"><span>Time</span><b>${state.time}</b></div>
      <div class="summary-row"><span>Price</span><b>$${state.service.price}</b></div>
    `;
  }

  document.getElementById('back4').addEventListener('click', () => goToStep(3));

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) { return v.replace(/\D/g,'').length >= 10; }

  document.getElementById('next4').addEventListener('click', () => {
    let valid = true;
    document.getElementById('errName').textContent = '';
    document.getElementById('errPhone').textContent = '';
    document.getElementById('errEmail').textContent = '';
    [nameInput, phoneInput, emailInput].forEach(i => i.classList.remove('error'));

    if (nameInput.value.trim().length < 2) {
      document.getElementById('errName').textContent = 'Enter your full name.';
      nameInput.classList.add('error'); valid = false;
    }
    if (!validatePhone(phoneInput.value)) {
      document.getElementById('errPhone').textContent = 'Enter a valid phone number.';
      phoneInput.classList.add('error'); valid = false;
    }
    if (!validateEmail(emailInput.value)) {
      document.getElementById('errEmail').textContent = 'Enter a valid email address.';
      emailInput.classList.add('error'); valid = false;
    }
    if (!valid) return;

    state.name = nameInput.value.trim();
    state.phone = phoneInput.value.trim();
    state.email = emailInput.value.trim();
    state.insta = instaInput.value.trim();

    finalizeBooking();
    goToStep(5);
  });

  /* ---------------- STEP 5: CONFIRMATION ---------------- */
  const confirmName = document.getElementById('confirmName');
  const confirmCode = document.getElementById('confirmCode');
  const finalSummaryBox = document.getElementById('finalSummaryBox');
  const confirmCheckWrap = document.querySelector('.confirm-check');

  function finalizeBooking() {
    confirmName.textContent = state.name.split(' ')[0] || 'friend';
    const code = 'A.CUTZZ-' + Math.floor(100000 + Math.random() * 900000);
    confirmCode.textContent = code;

    const dateLabel = state.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    finalSummaryBox.innerHTML = `
      <div class="summary-row"><span>Service</span><b>${state.service.name}</b></div>
      <div class="summary-row"><span>Date &amp; time</span><b>${dateLabel}, ${state.time}</b></div>
      <div class="summary-row"><span>Total</span><b>$${state.service.price}</b></div>
      <div class="summary-row"><span>Contact</span><b>${state.phone}</b></div>
    `;

    // re-trigger the draw animation
    const svg = confirmCheckWrap.querySelector('svg');
    const clone = svg.cloneNode(true);
    svg.replaceWith(clone);
  }

  document.getElementById('bookAnother').addEventListener('click', () => {
    state.service = null; state.date = null; state.time = null;
    document.querySelectorAll('.select-card').forEach(c => c.classList.remove('selected'));
    nameInput.value = phoneInput.value = emailInput.value = instaInput.value = '';
    renderCalendar();
    goToStep(1);
  });

  /* ---------------- helpers ---------------- */
  function flashError(el) {
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(0)' }
    ], { duration: 300, easing: 'ease-in-out' });
  }

});
