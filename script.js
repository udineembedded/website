(() => {

  /* =========================================================
     GENERAL SITE ELEMENTS
     ========================================================= */

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  const year = document.getElementById('year');


  /* =========================================================
     PROJECT CAROUSEL ELEMENTS
     ========================================================= */

  const carousel = document.querySelector('[data-carousel]');
  const viewport = carousel?.querySelector('.project-viewport');
  const track = carousel?.querySelector('[data-carousel-track]');

  const prevButton = carousel?.querySelector('.carousel-button-prev');
  const nextButton = carousel?.querySelector('.carousel-button-next');


  /* =========================================================
     CAROUSEL
     ========================================================= */

  if (carousel && viewport && track) {

  const originalCards = Array.from(track.children);
  const cardCount = originalCards.length;

  // Must match the CSS breakpoint
  const mobileQuery = window.matchMedia('(max-width: 650px)');

  let index = cardCount;
  let isAnimating = false;
  let enabled = false;

  const getStep = () => {
    const card = track.children[0];
    if (!card) return 0;
    const cardWidth = card.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return cardWidth + gap;
  };

  const render = (animate = true) => {
    const step = getStep();
    track.style.transition = animate
      ? 'transform .45s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`;
  };

  const move = (direction) => {
    if (!enabled || isAnimating) return;
    isAnimating = true;
    index += direction;
    render(true);
  };

  const makeClones = () =>
    originalCards.map(card => {
      const clone = card.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      return clone;
    });

  /* Turn the carousel ON (desktop/tablet) */
  const enableCarousel = () => {
    if (enabled || cardCount < 2) return;
    enabled = true;

    track.prepend(...makeClones());
    track.append(...makeClones());

    index = cardCount;
    isAnimating = false;

    requestAnimationFrame(() => render(false));
  };

  /* Turn the carousel OFF (mobile): remove clones, reset transform */
  const disableCarousel = () => {
    if (!enabled) return;
    enabled = false;

    track.querySelectorAll('[data-clone]').forEach(clone => clone.remove());
    track.style.transform = '';
    track.style.transition = '';
    isAnimating = false;
  };

  const syncCarousel = () => {
    if (mobileQuery.matches) {
      disableCarousel();
    } else {
      enableCarousel();
    }
  };

  syncCarousel();
  mobileQuery.addEventListener('change', syncCarousel);

  /* Infinite loop */
  track.addEventListener('transitionend', (event) => {
    if (!enabled || event.propertyName !== 'transform') return;

    if (index >= cardCount * 2) {
      index -= cardCount;
      render(false);
    }

    if (index < cardCount) {
      index += cardCount;
      render(false);
    }

    requestAnimationFrame(() => { isAnimating = false; });
  });

  /* Buttons */
  nextButton?.addEventListener('click', () => move(1));
  prevButton?.addEventListener('click', () => move(-1));

  /* Touch / swipe (ignored automatically on mobile because move() checks `enabled`) */
  let startX = 0;
  let startY = 0;

  viewport.addEventListener('touchstart', (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      move(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', (event) => {
    if (!enabled) return;

    const rect = carousel.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!visible) return;

    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'ArrowLeft') move(-1);
  });

  /* Resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (enabled) render(false);
    }, 100);
  });
}



  /* =========================================================
     FOOTER YEAR
     ========================================================= */

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================================================
     MOBILE MENU
     ========================================================= */

  if (menuToggle && navLinks) {

    menuToggle.addEventListener('click', () => {

      const isOpen =
        navLinks.classList.toggle('open');

      menuToggle.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

      menuToggle.setAttribute(
        'aria-label',
        isOpen
          ? 'Fechar menu'
          : 'Abrir menu'
      );

    });


    navLinks.querySelectorAll('a').forEach(link => {

      link.addEventListener('click', () => {

        navLinks.classList.remove('open');

        menuToggle.setAttribute(
          'aria-expanded',
          'false'
        );

        menuToggle.setAttribute(
          'aria-label',
          'Abrir menu'
        );

      });

    });

  }


  /* =========================================================
     ACTIVE NAVIGATION SECTION
     ========================================================= */

  if ('IntersectionObserver' in window) {

    const observer = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }


          navItems.forEach(link => {

            const active =
              link.getAttribute('href') ===
              `#${entry.target.id}`;

            link.classList.toggle(
              'active',
              active
            );

          });

        });

      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: 0
      }
    );


    sections.forEach(section => {
      observer.observe(section);
    });

  }

})();