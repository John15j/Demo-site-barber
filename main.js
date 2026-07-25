/* ==========================================================================
   a.cutzz_ — main.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- page loader ---- */
  const loader = document.getElementById('pageLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 250);
    });
    // fallback in case load already fired
    setTimeout(() => loader.classList.add('hidden'), 1200);
  }

  /* ---- navbar scroll state ---- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  /* ---- reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---- button ripple ---- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---- subtle hero particles ---- */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    function init() {
      resize();
      const count = Math.min(46, Math.floor((canvas.width * canvas.height) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        o: Math.random() * 0.4 + 0.15
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 90, 100, ${p.o})`;
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    init();
    window.addEventListener('resize', init);
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  /* ---- gallery: generate placeholder tiles ---- */
  const masonry = document.getElementById('masonry');
  if (masonry) {
    const tiles = [
      { cat: 'fades', label: 'Skin Fade', ar: '1', icon: '💈' },
      { cat: 'designs', label: 'Custom Design', ar: '0.8', icon: '💎', real: true },
      { cat: 'beards', label: 'Beard Line-Up', ar: '1.1', icon: '🪒' },
      { cat: 'fades', label: 'Taper Fade', ar: '0.9', icon: '✂️' },
      { cat: 'kids', label: 'Kids Cut', ar: '1', icon: '🧒' },
      { cat: 'designs', label: 'Line Art', ar: '1.2', icon: '💎' },
      { cat: 'fades', label: 'Low Fade', ar: '0.85', icon: '💈' },
      { cat: 'beards', label: 'Full Beard Trim', ar: '1', icon: '🪒' },
      { cat: 'fades', label: 'High Fade', ar: '1.15', icon: '💈' },
      { cat: 'kids', label: 'First Haircut', ar: '0.9', icon: '🧒' },
      { cat: 'designs', label: 'Shaved Pattern', ar: '1', icon: '💎' },
      { cat: 'beards', label: 'Precision Edge-Up', ar: '0.95', icon: '🪒' },
    ];

    const gradients = [
      'linear-gradient(150deg,#232326,#131315)',
      'linear-gradient(150deg,#2a1116,#131315)',
      'linear-gradient(150deg,#1f1a1c,#0e0e10)',
      'linear-gradient(150deg,#26161a,#131315)'
    ];

    masonry.innerHTML = tiles.map((t, i) => `
      <div class="masonry-item" data-cat="${t.cat}" tabindex="0" role="button" aria-label="View ${t.label} example">
        <div class="tile" style="--ar:${t.ar}; ${t.real ? '' : `background:${gradients[i % gradients.length]}`}">
          ${t.real ? `<img src="assets/shop-hero.jpg" alt="${t.label} example at a.cutzz_">` : ''}
          <div class="tile-overlay"></div>
          <span class="tile-label">${t.icon} ${t.label}</span>
        </div>
      </div>
    `).join('');

    // filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        masonry.querySelectorAll('.masonry-item').forEach(item => {
          const show = filter === 'all' || item.dataset.cat === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });

    // lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxInner = document.getElementById('lightboxInner');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(item) {
      const tile = item.querySelector('.tile');
      lightboxInner.innerHTML = tile.innerHTML.includes('<img')
        ? tile.querySelector('img').outerHTML
        : `<div style="width:70vw;max-width:640px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:64px;${tile.getAttribute('style').split(';').filter(s=>s.includes('background')).join(';')}">${tile.querySelector('.tile-label').textContent}</div>`;
      lightbox.classList.add('open');
    }
    masonry.querySelectorAll('.masonry-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(item); });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox && lightbox.classList.remove('open'); });
  }

  /* ---- before/after slider ---- */
  const baSlider = document.getElementById('baSlider');
  const baHandle = document.getElementById('baHandle');
  const baAfter = document.getElementById('baAfter');
  if (baSlider && baHandle && baAfter) {
    let dragging = false;
    const setPos = (clientX) => {
      const rect = baSlider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(4, Math.min(96, pct));
      baHandle.style.left = pct + '%';
      baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };
    baHandle.addEventListener('pointerdown', () => dragging = true);
    window.addEventListener('pointerup', () => dragging = false);
    window.addEventListener('pointermove', (e) => { if (dragging) setPos(e.clientX); });
    baSlider.addEventListener('click', (e) => setPos(e.clientX));
  }

  /* ---- reviews: render paraphrased testimonials ---- */
  const reviewsTrack = document.getElementById('reviewsTrack');
  if (reviewsTrack) {
    const reviews = [
      { name: 'Yesenia', service: 'Haircut', date: 'Jul 2026', text: 'Left the chair feeling great about my look — smooth experience from start to finish.' },
      { name: 'Yarely', service: 'Haircut', date: 'Jul 2026', text: 'Excellent service every time. Alan always gets it right.' },
      { name: 'Hunter', service: 'Haircut + Beard', date: 'Jun 2026', text: 'My go-to guy for a reason — consistent, clean work every visit.' },
      { name: 'Jose', service: 'Haircut', date: 'Jun 2026', text: 'Great communication, great music, and a genuinely welcoming shop.' },
      { name: 'Christopher', service: 'Haircut', date: 'Jun 2026', text: 'Easy to talk to and the cut was exactly on point.' },
      { name: 'Kevin', service: 'Haircut', date: 'Jun 2026', text: 'Sharp, confident, reliable — never left disappointed.' },
      { name: 'Jesus', service: 'Haircut + Design', date: 'Jun 2026', text: 'Told him what I wanted, he made a few great suggestions, and delivered top quality work. Highly recommend.' },
      { name: 'Miguel', service: 'Haircut + Design', date: 'Jun 2026', text: 'Consistent results every time — never a bad cut.' },
      { name: 'Saul', service: 'Haircut', date: 'Jun 2026', text: 'Great barber, straightforward and solid experience.' },
      { name: 'James', service: 'Precision Fade + Beard', date: 'May 2026', text: 'Fire cut. Sharp fade, exactly what I asked for.' },
    ];
    const cardHTML = (r) => `
      <div class="review-card">
        <div class="review-head">
          <div class="review-avatar">${r.name[0]}</div>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-sub">Confirmed client · ${r.date}</div>
          </div>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">${r.text}</p>
        <div class="review-tag">Service: ${r.service} · Barber: Alan</div>
      </div>`;
    // duplicate for seamless marquee loop
    reviewsTrack.innerHTML = reviews.map(cardHTML).join('') + reviews.map(cardHTML).join('');
  }

});
