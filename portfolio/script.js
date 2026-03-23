/* ================================================================
   AGBALI VINCENT OJONUGWA — PORTFOLIO JAVASCRIPT
   script.js
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. UTILITY HELPERS
   ---------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const lerp  = (a, b, t)      => a + (b - a) * t;
const rand  = (min, max)      => Math.random() * (max - min) + min;

/* ================================================================
   2. THEME TOGGLE
   ================================================================ */
(function initTheme() {
  const html       = document.documentElement;
  const btn        = $('#themeToggle');
  const icon       = $('#themeIcon');
  let   dark       = true;

  btn.addEventListener('click', () => {
    dark = !dark;
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
  });
})();

/* ================================================================
   3. CUSTOM CURSOR
   ================================================================ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  // Smooth-follow state
  let mouse = { x: 0, y: 0 };
  let ring_x = 0, ring_y = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Dot follows instantly
    dot.style.left  = mouse.x + 'px';
    dot.style.top   = mouse.y + 'px';
  });

  // Ring follows with lerp
  function animateRing() {
    ring_x = lerp(ring_x, mouse.x, 0.12);
    ring_y = lerp(ring_y, mouse.y, 0.12);
    ring.style.left = ring_x + 'px';
    ring.style.top  = ring_y + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const hoverEls = 'a, button, .project-mini, .skill-tag, .trait, .contact-method, .project-card, .tech-tag, [class*="mag-btn"]';

  document.addEventListener('mouseover', e => {
    if (e.target.matches(hoverEls) || e.target.closest(hoverEls)) {
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.matches(hoverEls) || e.target.closest(hoverEls)) {
      ring.classList.remove('hover');
    }
  });

  document.addEventListener('mousedown', () => { ring.classList.add('click');    dot.style.transform = 'translate(-50%,-50%) scale(0.5)'; });
  document.addEventListener('mouseup',   () => { ring.classList.remove('click'); dot.style.transform = 'translate(-50%,-50%) scale(1)'; });

  // Hide on leave
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '0.6'; });
})();

/* ================================================================
   4. SCROLL PROGRESS BAR
   ================================================================ */
(function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / maxScroll * 100) + '%';
  }, { passive: true });
})();

/* ================================================================
   5. PARTICLE CANVAS
   ================================================================ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT   = 75;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x   = rand(0, W);
      this.y   = initial ? rand(0, H) : rand(-20, -5);
      this.vx  = rand(-0.3, 0.3);
      this.vy  = rand(0.15, 0.55);
      this.r   = rand(1, 2.5);
      this.alpha = rand(0.2, 0.55);
      this.hue = Math.random() > 0.6 ? 'rgba(82,196,142,' : 'rgba(79,156,249,';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > H + 10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.hue + this.alpha + ')';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(82,196,142,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener('resize', () => { resize(); }, { passive: true });
})();

/* ================================================================
   6. NAVBAR — scroll + active link
   ================================================================ */
(function initNavbar() {
  const navbar   = $('#navbar');
  const sections = $$('section[id]');
  const links    = $$('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Active link highlighting
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
})();

/* ================================================================
   7. MOBILE NAVIGATION
   ================================================================ */
(function initMobileNav() {
  const hamburger = $('#hamburger');
  const nav       = $('#mobileNav');
  const overlay   = $('#mobileNavOverlay');
  const closeBtn  = $('#mobileNavClose');

  function open()  { nav.classList.add('open'); overlay.classList.add('open'); hamburger.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { nav.classList.remove('open'); overlay.classList.remove('open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; }

  hamburger?.addEventListener('click', open);
  closeBtn?.addEventListener('click',  close);
  overlay?.addEventListener('click',   close);

  // Expose globally for inline onclick
  window.closeMobileNav = close;
})();

/* ================================================================
   8. TYPING EFFECT
   ================================================================ */
(function initTyping() {
  const el = $('#typingText');
  if (!el) return;

  const phrases = [
    'Building intelligent web experiences',
    'Turning ideas into scalable products',
    'Crafting clean, modern interfaces',
    'CS graduate · Frontend developer',
    'AI-powered application builder',
  ];

  let pIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const current = phrases[pIdx];

    if (deleting) {
      el.textContent = current.substring(0, cIdx--);
      if (cIdx < 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(type, 520);
        return;
      }
      setTimeout(type, 36);
    } else {
      el.textContent = current.substring(0, cIdx++);
      if (cIdx > current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 58);
    }
  }

  setTimeout(type, 1200);
})();

/* ================================================================
   9. HERO NAME REVEAL (stagger)
   ================================================================ */
(function initHeroName() {
  const lines = $$('.name-line');
  lines.forEach(line => {
    setTimeout(() => line.classList.add('visible'),
      400 + (+line.dataset.delay) * 160);
  });
})();

/* ================================================================
   10. SCROLL REVEAL (IntersectionObserver)
   ================================================================ */
(function initScrollReveal() {
  const els = $$('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ================================================================
   11. SKILL BAR ANIMATION
   ================================================================ */
(function initSkillBars() {
  const bars = $$('.skill-bar[data-width]');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.getAttribute('data-width');
        setTimeout(() => { e.target.style.width = w + '%'; }, 250);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => obs.observe(bar));
})();

/* ================================================================
   12. AI METER BARS
   ================================================================ */
(function initMeterBars() {
  const fills = $$('.ai-meter-fill[data-width]');
  const obs   = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.getAttribute('data-width');
        setTimeout(() => { e.target.style.width = w + '%'; }, 350);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  fills.forEach(f => obs.observe(f));
})();

/* ================================================================
   13. COUNTER ANIMATION
   ================================================================ */
(function initCounters() {
  const counters = $$('.counter[data-target]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.getAttribute('data-target');
      let   current = 0;
      const step  = target / 40;
      const tick  = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current < target) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      setTimeout(tick, 200);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => obs.observe(c));
})();

/* ================================================================
   14. 3D TILT CARDS
   ================================================================ */
(function initTilt() {
  const cards = $$('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotY   = clamp( dx * 8, -8,  8);
      const rotX   = clamp(-dy * 8, -8,  8);
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
})();

/* ================================================================
   15. MAGNETIC BUTTON EFFECT
   ================================================================ */
(function initMagneticButtons() {
  const btns = $$('.mag-btn');

  btns.forEach(btn => {
    let raf;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });

    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      btn.style.transform = '';
    });
  });
})();

/* ================================================================
   16. LIVE ELECTRICITY METER SIMULATION
   ================================================================ */
(function initLiveMeter() {
  const el      = $('#liveReading');
  if (!el) return;

  let reading  = 42.7;
  const states = [
    'Normal consumption pattern',
    'Slight usage increase detected',
    'Optimal efficiency range',
    'Low consumption period',
  ];

  setInterval(() => {
    // Smooth random walk
    reading += rand(-0.08, 0.12);
    reading  = clamp(reading, 38, 52);

    el.textContent = reading.toFixed(2);

    // Occasionally update status
    const statusEl = el.closest('.ai-reading-panel')?.querySelector('.ai-reading-status');
    if (statusEl && Math.random() < 0.08) {
      const s = states[Math.floor(rand(0, states.length))];
      statusEl.innerHTML = `<span class="status-dot-green"></span> ${s}`;
    }
  }, 1800);
})();

/* ================================================================
   17. RESUME DOWNLOAD (toast fallback)
   ================================================================ */
(function initResume() {
  const btn = $('#resumeBtn');
  btn?.addEventListener('click', e => {
    e.preventDefault();
    showToast('📄 Resume download coming soon!');
  });
})();

/* ================================================================
   18. CONTACT FORM
   ================================================================ */
(function initContactForm() {
  window.handleFormSubmit = function () {
    const fname    = $('#fname')?.value.trim();
    const email    = $('#femail')?.value.trim();
    const message  = $('#fmessage')?.value.trim();

    if (!fname || !email || !message) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }

    // Simulate sending
    const submitBtn = document.querySelector('.form-submit span');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    }

    setTimeout(() => {
      if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      showToast('✅ Message sent! I\'ll get back to you soon 🚀');

      // Clear form
      ['fname', 'lname', 'femail', 'fsubject', 'fmessage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }, 1600);
  };
})();

/* ================================================================
   19. TOAST NOTIFICATION
   ================================================================ */
let toastTimer;
window.showToast = function (msg, duration = 3200) {
  const toast = $('#toast');
  const msgEl = $('#toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
};

/* ================================================================
   20. SMOOTH SCROLL HELPER
   ================================================================ */
window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ================================================================
   21. HERO GRID PARALLAX
   ================================================================ */
(function initHeroParallax() {
  const grid = document.querySelector('.hero-grid');
  if (!grid) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.25;
    grid.style.transform = `translateY(${y}px)`;
  }, { passive: true });
})();

/* ================================================================
   22. PROJECT CARD SPOTLIGHT HOVER
   ================================================================ */
(function initCardSpotlight() {
  const cards = $$('.project-card, .skill-category, .contact-form');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(82,196,142,0.04), transparent 80%), var(--bg-card)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
})();

/* ================================================================
   23. SKILLS SECTION — TAG HOVER RIPPLE
   ================================================================ */
(function initTagRipple() {
  $$('.skill-tag').forEach(tag => {
    tag.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect   = tag.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.5;
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(82,196,142,0.25);
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        pointer-events:none;
        animation:rippleAnim 0.5s ease-out forwards;
      `;
      tag.style.position = 'relative';
      tag.style.overflow = 'hidden';
      tag.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Inject ripple keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      from { transform: scale(0); opacity: 1; }
      to   { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ================================================================
   24. SECTION ENTRANCE — NUMBER COUNTER STAGGER
   ================================================================ */
(function initSectionNumbers() {
  // Animate the "01" "02" section labels on scroll
  $$('.section-label').forEach(label => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          label.style.animation = 'fadeUp 0.5s ease forwards';
          obs.unobserve(label);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(label);
  });
})();

/* ================================================================
   25. SMOOTH ANCHOR LINKS
   ================================================================ */
(function initSmoothLinks() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ================================================================
   26. BACK TO TOP VISIBILITY
   ================================================================ */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0.3';
  }, { passive: true });
})();

/* ================================================================
   27. FORM INPUT — FLOATING LABEL EFFECT
   ================================================================ */
(function initFormEffects() {
  $$('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      if (!input.value) input.parentElement.classList.remove('focused');
    });
  });
})();

/* ================================================================
   28. KEYBOARD NAVIGATION
   ================================================================ */
(function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const mobileNav = $('#mobileNav');
      if (mobileNav?.classList.contains('open')) {
        window.closeMobileNav?.();
      }
    }
  });
})();

/* ================================================================
   INIT LOG
   ================================================================ */
console.log('%c AVO Portfolio ', 'background:#52c48e;color:#000;font-weight:bold;font-size:14px;padding:4px 8px;border-radius:4px;');
console.log('%c Built with clean code, custom cursor, particles & 3D effects ', 'color:#52c48e;font-size:11px;');