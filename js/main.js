/* =========================================================
   Divyajeet Swami - Portfolio Interactivity
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- Year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Theme Toggle ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  const getStoredTheme = () => {
    try { return localStorage.getItem('theme'); } catch (_) { return null; }
  };
  const storeTheme = (t) => {
    try { localStorage.setItem('theme', t); } catch (_) { /* ignore */ }
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  };

  const initialTheme = getStoredTheme() ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------------- Navigation: scroll state + scroll progress ---------------- */
  const nav = document.getElementById('nav');
  const progressBar = document.querySelector('.scroll-progress__bar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 400);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (y / h) * 100 : 0;
      progressBar.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Mobile Menu ---------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openMobileMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.contains('is-open');
      open ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------------- Smooth scroll for in-page anchors ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------------- Active nav link via IntersectionObserver ---------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ---------------- Reveal on scroll ---------------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Typed effect ---------------- */
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    const phrases = [
      'IT Engineer',
      'Data Science Enthusiast',
      'Web Developer',
      'AI/ML Learner',
      'Linux Administrator'
    ];
    let pIndex = 0;
    let cIndex = 0;
    let deleting = false;

    const tick = () => {
      const phrase = phrases[pIndex];
      if (!deleting) {
        cIndex++;
        typedEl.textContent = phrase.slice(0, cIndex);
        if (cIndex === phrase.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
        setTimeout(tick, 80);
      } else {
        cIndex--;
        typedEl.textContent = phrase.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
          setTimeout(tick, 240);
          return;
        }
        setTimeout(tick, 40);
      }
    };

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick();
    } else {
      typedEl.textContent = phrases[0];
    }
  }

  /* ---------------- Animated counters ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const isFloat = String(target).includes('.') || target % 1 !== 0;
      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = isFloat ? value.toFixed(1) : Math.floor(value).toString();
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = isFloat ? target.toFixed(1) : target.toString();
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------------- Skill bar animation ---------------- */
  const bars = document.querySelectorAll('.skill-bar__fill');
  if (bars.length && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pct = entry.target.getAttribute('data-progress') || '0';
            entry.target.style.width = pct + '%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => barObserver.observe(b));
  }

  /* ---------------- Project filter ---------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------------- Contact form (API submit + mailto fallback) ---------------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  // Where the Express backend lives. Same-origin by default; override by setting
  // window.API_BASE = 'https://api.your-domain.com' before this script loads.
  const API_BASE = (window.API_BASE || '').replace(/\/$/, '');

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    const setStatus = (msg, type) => {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status' + (type ? ' is-' + type : '');
    };

    // Mailto fallback keeps the form working even if the API is unreachable.
    const mailtoFallback = (name, email, subject, message) => {
      const body = `Hi Divyajeet,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
      const mailto = `mailto:divyajeetswami5@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
      setStatus('Opening your email client...', 'success');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const subject = (data.get('subject') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const website = (data.get('website') || '').toString().trim(); // honeypot

      if (!name || !email || !subject || !message) {
        setStatus('Please fill in all fields.', 'error');
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        setStatus('Please enter a valid email.', 'error');
        return;
      }

      // Attempt the API; gracefully fall back to mailto on any failure.
      setStatus('Sending...', null);
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, website })
        });

        if (res.ok) {
          setStatus('Message sent. Thanks for reaching out!', 'success');
          form.reset();
        } else {
          const payload = await res.json().catch(() => ({}));
          if (res.status === 429) {
            setStatus('Too many messages. Please try again in a minute.', 'error');
          } else if (payload && payload.error) {
            setStatus(payload.error, 'error');
          } else {
            mailtoFallback(name, email, subject, message);
          }
        }
      } catch (_) {
        // Network/CORS/offline -> fall back to the user's mail client.
        mailtoFallback(name, email, subject, message);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* ---------------- Image performance helper ----------------
     The page currently renders its visuals with inline SVG + CSS, so there
     are no <img> tags to optimize today. This helper future-proofs the site:
     any <img> added later (or injected by a CMS) automatically gets
     loading="lazy" + decoding="async" so it never blocks first paint or
     causes Cumulative Layout Shift. The hero image (if any) is kept eager. */
  const optimizeImages = (root) => {
    root.querySelectorAll('img:not([data-eager])').forEach((img, i) => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
      // Reserve space to prevent CLS when width/height are known but unset.
      if (img.getAttribute('width') && img.getAttribute('height') && !img.style.aspectRatio) {
        img.style.aspectRatio = `${img.getAttribute('width')} / ${img.getAttribute('height')}`;
      }
    });
  };
  optimizeImages(document);

  /* ---------------- Subtle parallax on profile card ---------------- */
  const profileCard = document.querySelector('.profile-card__inner');
  if (profileCard && window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const wrapper = profileCard.parentElement;
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      profileCard.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      profileCard.style.transform = '';
    });
  }

  /* ---------------- Page-hit beacon (fire-and-forget) ----------------
     Pings the lightweight counter API after load so it never blocks render.
     Uses sendBeacon when available (survives page unload, zero main-thread
     cost) and silently no-ops if the backend isn't running. */
  const sendHit = () => {
    const url = `${API_BASE}/api/metrics/hit`;
    const body = JSON.stringify({ path: location.pathname, ref: document.referrer || null });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
          .catch(() => {});
      }
    } catch (_) { /* analytics must never break the page */ }
  };
  if (document.readyState === 'complete') sendHit();
  else window.addEventListener('load', sendHit, { once: true });
})();
