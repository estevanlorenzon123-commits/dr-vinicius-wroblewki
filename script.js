/* ==========================================================================
   Dr. Vinicius Wroblewki — Interactive Clinical, Motion & Conversion Logic
   ========================================================================== */

(() => {
  const WHATSAPP_NUMBER = '5527998975841';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    document.documentElement.classList.add('has-motion');
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  // 1. Mobile Navigation Drawer (Toggle, Outside Click & Escape Key)
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  const header = document.querySelector('.site-header');

  function setMenuOpen(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!expanded);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && header && !header.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080 && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  }

  // 2. Fast & Elegant Scroll Reveal Choreography + Active Nav Tracking
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealGroups = [
      { selector: '.section-header-split > *', stagger: 65 },
      { selector: '.procedure-card', stagger: 55 },
      { selector: '.featured-comparison-box', stagger: 0 },
      { selector: '.results-filter-bar', stagger: 0 },
      { selector: '.case-card', stagger: 50 },
      { selector: '.ultraformer-grid > div:first-child > .section-kicker, .ultraformer-grid > div:first-child > .section-heading, .ultraformer-lead, .ultraformer-section .hero-cta-group', stagger: 55 },
      { selector: '.ultra-pillar', stagger: 65 },
      { selector: '.ultraformer-showcase', stagger: 80 },
      { selector: '.specialist-card-visual', stagger: 0 },
      { selector: '.specialist-copy > .section-kicker, .specialist-copy > .section-heading, .specialist-copy > p', stagger: 55 },
      { selector: '.formation-row', stagger: 60 },
      { selector: '.journey-section .section-kicker, .journey-section .section-heading', stagger: 55 },
      { selector: '.journey-step', stagger: 75 },
      { selector: '.concierge-card', stagger: 0 },
      { selector: '.locations-column > *', stagger: 65 },
      { selector: '.faq-layout > div:first-child > *', stagger: 55 },
      { selector: '.faq-item', stagger: 45 },
      { selector: '.footer-top > *', stagger: 60 }
    ];

    const allRevealTargets = [];

    revealGroups.forEach(({ selector, stagger }) => {
      const nodes = document.querySelectorAll(selector);
      nodes.forEach((node, idx) => {
        node.setAttribute('data-reveal', '');
        if (stagger > 0) {
          const delayMs = Math.min((idx % 6) * stagger, 210);
          node.style.setProperty('--reveal-delay', `${delayMs}ms`);
        }
        allRevealTargets.push(node);
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    allRevealTargets.forEach((el) => revealObserver.observe(el));
  }

  // 3. Scroll Progress Bar, Sticky Header Polish & Subtle Hero Scroll Parallax
  const scrollProgressEl = document.querySelector('[data-scroll-progress]');
  const heroSection = document.getElementById('inicio');
  const heroVisual = document.querySelector('[data-hero-visual]');
  const navLinks = document.querySelectorAll('.primary-nav > a[href^="#"]');
  const trackedSections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let scrollTicking = false;

  function onScrollFrame() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

    if (scrollProgressEl) {
      scrollProgressEl.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 20);
    }

    if (!prefersReducedMotion && heroSection && heroVisual) {
      const heroH = heroSection.offsetHeight || 700;
      if (scrollY <= heroH * 1.2) {
        const ratio = Math.min(1, Math.max(0, scrollY / heroH));
        heroVisual.style.setProperty('--hero-scroll', ratio.toFixed(3));
      }
    }

    // Highlight active section in top nav
    if (trackedSections.length) {
      const triggerLine = scrollY + 160;
      let activeId = '';
      trackedSections.forEach((sec) => {
        if (sec.offsetTop <= triggerLine) {
          activeId = sec.id;
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle('is-current', link.getAttribute('href') === `#${activeId}`);
      });
    }

    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(onScrollFrame);
        scrollTicking = true;
      }
    },
    { passive: true }
  );
  onScrollFrame();

  // 4. Desktop Hero Micro-Parallax (3D Architectural Depth on Pointer Move)
  if (
    !prefersReducedMotion &&
    heroSection &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const animateHeroDepth = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      heroSection.style.setProperty('--px', currentX.toFixed(4));
      heroSection.style.setProperty('--py', currentY.toFixed(4));

      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        rafId = window.requestAnimationFrame(animateHeroDepth);
      } else {
        rafId = null;
      }
    };

    heroSection.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!rafId) rafId = window.requestAnimationFrame(animateHeroDepth);
    });

    heroSection.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = window.requestAnimationFrame(animateHeroDepth);
    });
  }

  // 5. Interactive Before & After Curtain Slider (Mouse + Direct Touch + Entrance Cue)
  const comparisonSlider = document.querySelector('[data-comparison-slider]');
  const comparisonInput = document.querySelector('[data-comparison-range]');

  if (comparisonSlider && comparisonInput) {
    let userInteractedWithSlider = false;

    const syncSlider = (rawVal) => {
      const clamped = Math.min(92, Math.max(8, Number(rawVal)));
      comparisonSlider.style.setProperty('--pos', `${clamped}%`);
      comparisonInput.value = String(Math.round(clamped));
    };

    comparisonInput.addEventListener('input', (e) => {
      userInteractedWithSlider = true;
      syncSlider(e.target.value);
    });

    let isPointerDragging = false;

    const updateFromClientX = (clientX) => {
      const rect = comparisonSlider.getBoundingClientRect();
      if (!rect.width) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      syncSlider(pct);
    };

    comparisonSlider.addEventListener('pointerdown', (e) => {
      userInteractedWithSlider = true;
      if (e.target === comparisonInput) return;
      isPointerDragging = true;
      updateFromClientX(e.clientX);
    });

    window.addEventListener(
      'pointermove',
      (e) => {
        if (!isPointerDragging) return;
        updateFromClientX(e.clientX);
      },
      { passive: true }
    );

    window.addEventListener('pointerup', () => {
      isPointerDragging = false;
    });

    window.addEventListener('pointercancel', () => {
      isPointerDragging = false;
    });

    syncSlider(comparisonInput.value);

    // One-time subtle curtain micro-nudge when scrolled into view so users spot interactivity
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const cueObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              obs.unobserve(entry.target);
              if (userInteractedWithSlider) return;
              const start = performance.now();
              const duration = 760;
              const runCue = (now) => {
                if (userInteractedWithSlider) return;
                const t = Math.min(1, (now - start) / duration);
                const wave = Math.sin(t * Math.PI * 2) * (1 - t) * 7.5;
                syncSlider(50 - wave);
                if (t < 1) window.requestAnimationFrame(runCue);
              };
              window.setTimeout(() => window.requestAnimationFrame(runCue), 260);
            }
          });
        },
        { threshold: 0.45 }
      );
      cueObserver.observe(comparisonSlider);
    }
  }

  // 6. Before & After Category Filter Tabs (with Smooth Card Re-Entrance)
  const filterRail = document.querySelector('.filter-tabs');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const caseCards = document.querySelectorAll('[data-case-category]');

  function centerTabInRail(btn) {
    if (!filterRail || !btn) return;
    if (filterRail.scrollWidth <= filterRail.clientWidth) return;
    const targetLeft = btn.offsetLeft - (filterRail.clientWidth - btn.offsetWidth) / 2;
    filterRail.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }

  function activateFilter(category) {
    let activeBtn = null;
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === category;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      if (active) activeBtn = btn;
    });

    let visibleIdx = 0;
    caseCards.forEach((card) => {
      const cats = card.dataset.caseCategory.split(' ');
      const show = category === 'todos' || cats.includes(category);
      card.hidden = !show;
      if (show) {
        card.classList.add('is-inview');
        if (!prefersReducedMotion) {
          card.classList.remove('is-filtering-in');
          card.style.setProperty('--filter-delay', `${visibleIdx * 40}ms`);
          void card.offsetWidth;
          card.classList.add('is-filtering-in');
          card.addEventListener(
            'animationend',
            () => card.classList.remove('is-filtering-in'),
            { once: true }
          );
          visibleIdx += 1;
        }
      }
    });

    if (activeBtn) centerTabInRail(activeBtn);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateFilter(btn.dataset.filter));
  });

  document.querySelectorAll('[data-jump-filter]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const targetFilter = trigger.dataset.jumpFilter;
      if (targetFilter) {
        activateFilter(targetFilter);
      }
      const resultsSection = document.getElementById('resultados');
      if (resultsSection) {
        e.preventDefault();
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 7. Contextual WhatsApp Links
  document.querySelectorAll('[data-wa-topic]').forEach((el) => {
    const topic = el.dataset.waTopic;
    const msg = `Olá, equipe do Dr. Vinicius Wroblewki! Vim pelo site e gostaria de agendar uma avaliação para ${topic}.`;
    el.setAttribute('href', buildWhatsAppUrl(msg));
  });

  // 8. Clinical Case Lightbox Modal
  const modal = document.getElementById('case-modal');
  const modalImg = document.getElementById('modal-case-img');
  const modalTitle = document.getElementById('modal-case-title');
  const modalDesc = document.getElementById('modal-case-desc');
  const modalWa = document.getElementById('modal-case-wa');
  const modalCloseBtns = document.querySelectorAll('[data-modal-close]');

  function openCaseModal({ src, alt, title, desc }) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || title;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalWa.href = buildWhatsAppUrl(
      `Olá, Dr. Vinicius! Vi no site o resultado de "${title}" e gostaria de agendar uma avaliação para o meu caso.`
    );
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeCaseModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach((wrap) => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('img');
      openCaseModal({
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        title: wrap.dataset.caseTitle || 'Resultado clínico',
        desc: wrap.dataset.caseDesc || ''
      });
    });
  });

  modalCloseBtns.forEach((btn) => btn.addEventListener('click', closeCaseModal));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCaseModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal && !modal.hidden) closeCaseModal();
      if (nav && nav.classList.contains('is-open')) setMenuOpen(false);
    }
  });

  // 9. Interactive WhatsApp Assessment Concierge
  const selectedTopics = new Set(['Harmonização Facial']);
  let selectedCity = 'Vitória - ES';

  const topicChips = document.querySelectorAll('[data-concierge-topic]');
  const cityButtons = document.querySelectorAll('[data-concierge-city]');
  const nameInput = document.getElementById('patient-name');
  const conciergeForm = document.getElementById('concierge-form');

  topicChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const topic = chip.dataset.conciergeTopic;
      if (selectedTopics.has(topic)) {
        if (selectedTopics.size > 1) {
          selectedTopics.delete(topic);
          chip.classList.remove('is-selected');
          chip.setAttribute('aria-pressed', 'false');
        }
      } else {
        selectedTopics.add(topic);
        chip.classList.add('is-selected');
        chip.setAttribute('aria-pressed', 'true');
      }
    });
  });

  cityButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCity = btn.dataset.conciergeCity;
      cityButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-selected', active);
        b.setAttribute('aria-pressed', String(active));
      });
    });
  });

  if (conciergeForm) {
    conciergeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput ? nameInput.value.trim() : '';
      const topicsList = Array.from(selectedTopics).join(', ');
      const greeting = name
        ? `Olá, equipe do Dr. Vinicius Wroblewki! Me chamo ${name}.`
        : `Olá, equipe do Dr. Vinicius Wroblewki!`;
      const fullMessage = `${greeting} Vim pelo site e gostaria de agendar uma avaliação na unidade de ${selectedCity} com foco em: ${topicsList}. Quais horários estão disponíveis?`;
      window.open(buildWhatsAppUrl(fullMessage), '_blank', 'noopener,noreferrer');
    });
  }

  // 10. Smart Mobile Floating WhatsApp Visibility
  const whatsappFloat = document.querySelector('.whatsapp-float');
  const heroCta = document.querySelector('.hero-section .hero-cta-group');
  const conciergeCard = document.getElementById('agendamento');

  if (whatsappFloat && 'IntersectionObserver' in window) {
    const visibleTargets = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleTargets.add(entry.target);
          } else {
            visibleTargets.delete(entry.target);
          }
        });
        whatsappFloat.classList.toggle('is-contextual-hidden', visibleTargets.size > 0);
      },
      { threshold: 0.25 }
    );

    if (heroCta) observer.observe(heroCta);
    if (conciergeCard) observer.observe(conciergeCard);
  }
})();
