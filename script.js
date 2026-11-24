/* ==========================================================================
   Dr. Vinicius Wroblewki — Interactive Clinical & Mobile Conversion Logic
   ========================================================================== */

(() => {
  const WHATSAPP_NUMBER = '5527998975841';

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
      if (window.innerWidth > 900 && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  }

  // 2. Interactive Before & After Curtain Slider (Mouse + Direct Touch Drag)
  const comparisonSlider = document.querySelector('[data-comparison-slider]');
  const comparisonInput = document.querySelector('[data-comparison-range]');

  if (comparisonSlider && comparisonInput) {
    const syncSlider = (rawVal) => {
      const clamped = Math.min(92, Math.max(8, Number(rawVal)));
      comparisonSlider.style.setProperty('--pos', `${clamped}%`);
      comparisonInput.value = String(Math.round(clamped));
    };

    comparisonInput.addEventListener('input', (e) => {
      syncSlider(e.target.value);
    });

    // Smooth direct touch/pointer scrubbing anywhere inside the image frame
    let isPointerDragging = false;

    const updateFromClientX = (clientX) => {
      const rect = comparisonSlider.getBoundingClientRect();
      if (!rect.width) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      syncSlider(pct);
    };

    comparisonSlider.addEventListener('pointerdown', (e) => {
      if (e.target === comparisonInput) return;
      isPointerDragging = true;
      updateFromClientX(e.clientX);
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDragging) return;
      updateFromClientX(e.clientX);
    }, { passive: true });

    window.addEventListener('pointerup', () => {
      isPointerDragging = false;
    });

    window.addEventListener('pointercancel', () => {
      isPointerDragging = false;
    });

    syncSlider(comparisonInput.value);
  }

  // 3. Before & After Category Filter Tabs (with Horizontal Mobile Rail Centering)
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

    caseCards.forEach((card) => {
      const cats = card.dataset.caseCategory.split(' ');
      const show = category === 'todos' || cats.includes(category);
      card.hidden = !show;
    });

    if (activeBtn) centerTabInRail(activeBtn);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateFilter(btn.dataset.filter));
  });

  // Jump from Procedure card "Ver antes e depois" to matching filter
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

  // 4. Contextual WhatsApp Links (Procedure & Case Specific)
  document.querySelectorAll('[data-wa-topic]').forEach((el) => {
    const topic = el.dataset.waTopic;
    const msg = `Olá, equipe do Dr. Vinicius Wroblewki! Vim pelo site e gostaria de agendar uma avaliação para ${topic}.`;
    el.setAttribute('href', buildWhatsAppUrl(msg));
  });

  // 5. Clinical Case Lightbox Modal
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

  // 6. Interactive WhatsApp Assessment Concierge
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

  // 7. Smart Mobile Floating WhatsApp Visibility
  // Tucks away on mobile when Hero primary CTA or Concierge Form is already in viewport
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
