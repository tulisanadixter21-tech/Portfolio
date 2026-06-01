/* ===================================================
   PORTFOLIO — MAIN.JS
   Handles: cursor, nav, scroll animations, form
   =================================================== */

'use strict';

// ---- Utility: query shorthand ----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===================================================
   1. CUSTOM CURSOR
   Smooth-follows mouse; desktop only
   =================================================== */
(function initCursor() {
  const dot      = $('#cursor');
  const follower = $('#cursor-follower');
  if (!dot || !follower) return;

  let mx = 0, my = 0;   // actual mouse position
  let fx = 0, fy = 0;   // follower position (lerped)

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps instantly
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  // Follower lags behind via rAF lerp
  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.transform = `translate(${fx}px, ${fy}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Scale up cursor when hovering interactive elements
  const hoverTargets = 'a, button, input, textarea, .skill-card, .project-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      dot.style.transform += ' scale(2)';
      follower.style.transform += ' scale(1.5)';
      follower.style.borderColor = 'rgba(0,212,170,0.6)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      follower.style.borderColor = 'rgba(0,212,170,0.4)';
    }
  });
})();

/* ===================================================
   2. NAV — scroll state + mobile toggle
   =================================================== */
(function initNav() {
  const nav    = $('#nav');
  const toggle = $('#navToggle');
  const links  = $('.nav-links');
  if (!nav) return;

  // Add 'scrolled' class after 40px for glass effect
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    links.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      toggle?.classList.remove('open');
      links?.classList.remove('open');
    });
  });
})();

/* ===================================================
   3. SCROLL-TRIGGERED REVEALS
   IntersectionObserver-based; handles:
   - .skill-card  (with staggered delays)
   - .project-card
   - .reveal      (generic)
   =================================================== */
(function initScrollReveals() {

  // Observer factory — fires once per element
  function makeObserver(threshold = 0.15) {
    return new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        // Stagger delay from data-delay attribute
        const delay = parseFloat(el.dataset.delay || 0) * 100;
        setTimeout(() => el.classList.add('visible'), delay);

        obs.unobserve(el); // only animate once
      });
    }, { threshold });
  }

  // Skill cards
  const skillObs = makeObserver(0.1);
  $$('.skill-card').forEach(card => skillObs.observe(card));

  // Project cards
  const projObs = makeObserver(0.1);
  $$('.project-card').forEach(card => projObs.observe(card));

  // Generic .reveal elements
  const revealObs = makeObserver(0.15);
  $$('.reveal').forEach(el => revealObs.observe(el));

  // About & contact section stagger
  const sectionObs = makeObserver(0.1);
  $$('.about-left, .about-right, .contact-left, .contact-right').forEach(el => {
    el.classList.add('reveal');
    sectionObs.observe(el);
  });

})();

/* ===================================================
   4. ACTIVE NAV LINK HIGHLIGHTING
   Highlights the nav link corresponding to the
   currently-visible section using IntersectionObserver
   =================================================== */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)'
          : '';
      });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ===================================================
   5. CONTACT FORM
   Client-side validation + simulated send
   =================================================== */
(function initContactForm() {
  const form    = $('#contactForm');
  const btnText = $('#btnText');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = $('#name');
    const email   = $('#email');
    const message = $('#message');
    let valid = true;

    // Simple validation: clear previous errors
    [name, email, message].forEach(f => f.classList.remove('error'));
    success.textContent = '';

    if (!name.value.trim()) {
      name.classList.add('error');
      valid = false;
    }
    // Basic email regex check
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      email.classList.add('error');
      valid = false;
    }
    if (!message.value.trim()) {
      message.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    // Simulate async send (swap this for a real endpoint / EmailJS / Formspree)
    btnText.textContent = 'Sending…';
    form.querySelector('button[type="submit"]').disabled = true;

    await new Promise(r => setTimeout(r, 1200));

    btnText.textContent = 'Send Message';
    form.querySelector('button[type="submit"]').disabled = false;
    form.reset();
    success.textContent = '✓ Message sent! I\'ll get back to you soon.';
  });
})();

/* ===================================================
   6. SMOOTH SCROLL polyfill for older Safari
   (Modern browsers handle scroll-behavior:smooth in CSS,
    but this ensures anchor clicks always behave)
   =================================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ===================================================
   7. TYPED TAGLINE EFFECT in Hero
   Creates a subtle "typing" effect on the tagline em tags
   =================================================== */
(function initTyped() {
  // Pick out the em elements inside the tagline
  const tagline = $('.hero-tagline');
  if (!tagline) return;

  const words = tagline.querySelectorAll('em');
  // Cycle through accent colors subtly
  const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'];

  words.forEach((word, i) => {
    // Stagger the color appearance
    word.style.opacity = '0';
    word.style.transition = 'opacity 0.5s ease, color 0.5s ease';
    setTimeout(() => {
      word.style.opacity = '1';
      word.style.color = colors[i % colors.length];
    }, 800 + i * 200);
  });
})();
