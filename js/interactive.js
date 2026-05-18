/* =========================================================
   Interactive layer
   - Cosmic background: stars canvas, aurora parallax (scroll + mouse)
   - Hero particle network
   - Toolkit constellation: hover/focus a sphere -> rich detail
   - Cinematic horizontal projects (Active Theory inspired)
   ========================================================= */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. Cosmic background
     ========================================================= */
  const starsCanvas = document.getElementById('cosmosStars');
  const auroras = document.querySelectorAll('.cosmos__aurora');

  // Star field
  if (starsCanvas) {
    const ctx = starsCanvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    let shootingStars = [];
    let scrollY = window.scrollY;
    let raf;

    const resize = () => {
      const rect = starsCanvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      starsCanvas.width = w * dpr;
      starsCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1 + 0.2, // depth: parallax + size
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.02 + 0.005
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const spawnShooting = () => {
      if (reduceMotion) return;
      const startY = Math.random() * h * 0.5;
      const startX = -50;
      const angle = (Math.random() * 20 + 15) * Math.PI / 180;
      shootingStars.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * 11,
        vy: Math.sin(angle) * 11,
        life: 1,
        len: 90 + Math.random() * 60
      });
    };
    let shootingTimer = setInterval(() => {
      if (Math.random() < 0.65) spawnShooting();
    }, 4500);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const light = isLight();
      const baseAlpha = light ? 0.55 : 1;
      const starColor = light ? '90, 81, 128' : '236, 233, 255';

      // Stars
      stars.forEach((s) => {
        s.tw += s.tws;
        const tw = (Math.sin(s.tw) + 1) / 2; // 0..1
        const py = s.y - scrollY * 0.05 * s.z;
        const yMod = ((py % h) + h) % h;
        const a = (0.25 + tw * 0.75) * baseAlpha * s.z;
        ctx.fillStyle = `rgba(${starColor}, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, yMod, s.r * (0.6 + tw * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.012;

        const tailX = s.x - (s.vx / 11) * s.len;
        const tailY = s.y - (s.vy / 11) * s.len;
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(${starColor}, 0)`);
        grad.addColorStop(1, `rgba(${starColor}, ${Math.max(0, s.life) * 0.85})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        if (s.life <= 0 || s.x > w + 100 || s.y > h + 100) {
          shootingStars.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
  }

  // Aurora parallax: react to scroll + mouse
  if (auroras.length) {
    let mx = 0, my = 0;
    let scrollT = 0;

    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      scrollT = window.scrollY;
    }, { passive: true });

    const apply = () => {
      auroras.forEach((el, i) => {
        const depth = (i + 1) * 0.4;
        const sx = mx * 18 * depth;
        const sy = my * 14 * depth + scrollT * 0.06 * (i % 2 === 0 ? 1 : -1);
        const rot = scrollT * 0.01 * (i + 1);
        el.style.transform = `translate3d(${sx}px, ${sy}px, 0) rotate(${rot}deg)`;
      });
      requestAnimationFrame(apply);
    };
    if (!reduceMotion) requestAnimationFrame(apply);
  }

  /* =========================================================
     2. Hero particle network
     ========================================================= */
  const canvas = document.getElementById('heroParticles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -1000, y: -1000, active: false };
    let particles = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(110, Math.floor((w * h) / 16000));
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.6
      }));
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -1000; mouse.y = -1000; };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) onMove(t);
    }, { passive: true });

    window.addEventListener('resize', resize);
    resize();

    const themeColor = () => document.documentElement.getAttribute('data-theme') === 'light'
      ? { dot: '184, 92, 58', line: '36, 28, 18' }
      : { dot: '231, 177, 106', line: '244, 235, 219' };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const colors = themeColor();
      const linkDist = 130;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const f = (1 - d2 / 14000) * 0.6;
            p.vx += (dx / Math.sqrt(d2 + 0.01)) * f;
            p.vy += (dy / Math.sqrt(d2 + 0.01)) * f;
          }
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.985; p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.05;

        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.dot}, 0.85)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.25;
            ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* =========================================================
     3. Toolkit constellation
     ========================================================= */
  const orbit = document.getElementById('orbit');
  const detail = document.getElementById('toolDetail');
  const spheres = document.querySelectorAll('.sphere');

  if (orbit && detail) {
    // Catalog: each tool's data
    const tools = {
      python: {
        name: 'Python',
        role: 'Primary language',
        color: '#d4a85f',
        icon: 'fa-brands fa-python',
        points: [
          'Backbone of my data science and automation work.',
          'Clean, idiomatic code with strong typing habits.',
          'Daily use across analytics, ML, and tooling scripts.'
        ],
        meta: ['HackerRank certified', 'Daily driver']
      },
      pandas: {
        name: 'Pandas',
        role: 'Data wrangling',
        color: '#c97553',
        icon: 'fa-solid fa-table-list',
        points: [
          'DataFrame surgery: cleaning, joining, reshaping.',
          'EDA workflows for the Stock Prediction model.',
          'GroupBy, pivots, and time-series transforms.'
        ],
        meta: ['Analytics', 'EDA']
      },
      numpy: {
        name: 'NumPy',
        role: 'Numerical computing',
        color: '#8aa07a',
        icon: 'fa-solid fa-square-root-variable',
        points: [
          'Vectorized math for speed and clarity.',
          'Matrix ops powering the DTM drainage analysis.',
          'Foundation for every ML notebook I write.'
        ],
        meta: ['Linear algebra', 'Vectorized']
      },
      sklearn: {
        name: 'Scikit-learn',
        role: 'Classical ML',
        color: '#d49a4a',
        icon: 'fa-solid fa-robot',
        points: [
          'Regression, classification, evaluation pipelines.',
          'Used in the Stock Prediction forecasting model.',
          'Cross-validation and feature engineering patterns.'
        ],
        meta: ['Models', 'Evaluation']
      },
      js: {
        name: 'JavaScript',
        role: 'Interactive web',
        color: '#e7b16a',
        icon: 'fa-brands fa-js',
        points: [
          'Modern ES, modular code, no-framework instincts.',
          'DOM, Canvas, and small interactive systems.',
          'Powers every animation on this very page.'
        ],
        meta: ['ES2022+', 'Vanilla & frameworks']
      },
      html: {
        name: 'HTML5',
        role: 'Semantic structure',
        color: '#c46b4a',
        icon: 'fa-brands fa-html5',
        points: [
          'Accessible, semantic, ATS-friendly markup.',
          'Strong attention to landmarks and headings.',
          'SEO-aware meta and Open Graph defaults.'
        ],
        meta: ['Accessible', 'SEO-aware']
      },
      css: {
        name: 'CSS3',
        role: 'Visual systems',
        color: '#a8967e',
        icon: 'fa-brands fa-css3-alt',
        points: [
          'Design tokens, fluid layouts, modern features.',
          'Container queries, color-mix, backdrop filters.',
          'Performance-first, prefers-reduced-motion aware.'
        ],
        meta: ['Tokens', 'Responsive']
      },
      c: {
        name: 'C / C++',
        role: 'Systems & DSA',
        color: '#7a8a6b',
        icon: 'fa-solid fa-c',
        points: [
          'DSA fluency: arrays, trees, graphs, DP.',
          'Memory-aware programming and pointers.',
          'Sharpens problem-solving across all languages.'
        ],
        meta: ['DSA', 'Foundations']
      },
      linux: {
        name: 'Linux',
        role: 'Operating environment',
        color: '#c9b27e',
        icon: 'fa-brands fa-linux',
        points: [
          'RHCSA certified. Daily-driver Red Hat / Ubuntu.',
          'Services, users, storage, networking, SELinux.',
          'Comfortable in the shell, not just the GUI.'
        ],
        meta: ['RHCSA', 'Sysadmin']
      },
      git: {
        name: 'Git',
        role: 'Version control',
        color: '#b85c3a',
        icon: 'fa-brands fa-git-alt',
        points: [
          'Clean histories, focused commits, helpful messages.',
          'Branching strategies and code-review hygiene.',
          'GitHub workflows for solo and team projects.'
        ],
        meta: ['Workflow', 'Reviews']
      },
      bash: {
        name: 'Bash',
        role: 'Shell scripting',
        color: '#6f7e6a',
        icon: 'fa-solid fa-terminal',
        points: [
          'Glue for automation, deploys, and data tasks.',
          'Pipelines that prefer small, composable tools.',
          'Robust scripts with strict mode and traps.'
        ],
        meta: ['Automation', 'Composable']
      },
      rhcsa: {
        name: 'RHCSA',
        role: 'Red Hat certified',
        color: '#9a4d2f',
        icon: 'fa-brands fa-redhat',
        points: [
          'System admin fundamentals, validated.',
          'Storage, services, security, troubleshooting.',
          'Confidence taking ownership of a Linux box.'
        ],
        meta: ['Certified', 'Sysadmin']
      }
    };

    const defaultDetail = detail.innerHTML;
    let activeKey = null;

    const setDetail = (key) => {
      const t = tools[key];
      if (!t) return;
      detail.style.setProperty('--tool-color', t.color);
      detail.querySelector('.detail__icon').innerHTML = `<i class="${t.icon}"></i>`;
      detail.querySelector('.detail__icon').style.background = `linear-gradient(135deg, ${t.color}, ${t.color}99)`;
      detail.querySelector('.detail__icon').style.boxShadow = `0 12px 30px ${t.color}66`;
      detail.querySelector('.detail__name').textContent = t.name;
      detail.querySelector('.detail__role').textContent = t.role;
      const pts = detail.querySelector('.detail__points');
      pts.innerHTML = t.points.map((p) =>
        `<li><i class="fa-solid fa-circle-dot"></i> ${p}</li>`
      ).join('');
      pts.querySelectorAll('i').forEach((i) => { i.style.color = t.color; });
      const meta = detail.querySelector('.detail__meta');
      meta.innerHTML = t.meta.map((m) => `<span class="detail__pill">${m}</span>`).join('');
    };

    const resetDetail = () => {
      detail.innerHTML = defaultDetail;
      detail.style.removeProperty('--tool-color');
    };

    const activate = (sphere) => {
      const key = sphere.getAttribute('data-tool');
      if (!key || activeKey === key) return;
      orbit.classList.add('has-active');
      spheres.forEach((s) => s.classList.toggle('is-active', s === sphere));
      setDetail(key);
      activeKey = key;
    };

    const deactivate = () => {
      orbit.classList.remove('has-active');
      spheres.forEach((s) => s.classList.remove('is-active'));
      resetDetail();
      activeKey = null;
    };

    spheres.forEach((s) => {
      s.addEventListener('mouseenter', () => activate(s));
      s.addEventListener('focus', () => activate(s));
      // Click on touch / keyboard
      s.addEventListener('click', (e) => {
        e.preventDefault();
        if (s.classList.contains('is-active')) deactivate();
        else activate(s);
      });
    });

    orbit.addEventListener('mouseleave', deactivate);
  }

  /* =========================================================
     4. Cinematic horizontal projects
     ========================================================= */
  const cine = document.getElementById('cine');
  const cineTrack = document.getElementById('cineTrack');
  const cineBar = document.getElementById('cineBar');
  const cineIndex = document.getElementById('cineIndex');
  const cineTotal = document.getElementById('cineTotal');

  if (cine && cineTrack) {
    const panels = cineTrack.querySelectorAll('.cine__panel');
    if (cineTotal) cineTotal.textContent = String(panels.length).padStart(2, '0');

    let trackWidth = 0;
    let viewport = 0;

    const measure = () => {
      trackWidth = cineTrack.scrollWidth;
      viewport = window.innerWidth;
    };
    measure();
    window.addEventListener('resize', measure);

    const onScroll = () => {
      if (window.innerWidth <= 768) return;
      const rect = cine.getBoundingClientRect();
      const total = cine.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const t = total > 0 ? scrolled / total : 0;
      const maxShift = Math.max(0, trackWidth - viewport);
      cineTrack.style.transform = `translate3d(${-t * maxShift}px, 0, 0)`;
      if (cineBar) cineBar.style.width = (t * 100).toFixed(2) + '%';
      if (cineIndex) {
        const idx = Math.min(panels.length, Math.floor(t * panels.length) + 1);
        cineIndex.textContent = String(idx).padStart(2, '0');
      }

      const center = viewport / 2;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const dist = Math.min(1, Math.abs(c - center) / viewport);
        const opacity = 1 - dist * 0.8;
        const scale = 1 - dist * 0.06;
        p.style.opacity = opacity.toFixed(3);
        p.style.transform = `scale(${scale.toFixed(3)})`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
