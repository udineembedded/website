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

    /*
     * Get the original project cards.
     *
     * Example:
     *
     * [Project 1] [Project 2] [Project 3] [Project 4]
     */
    const originalCards = Array.from(track.children);

    const cardCount = originalCards.length;

    /*
     * We need at least 2 cards for the carousel to make sense.
     */
    if (cardCount > 1) {

      /*
       * Create copies of all cards.
       *
       * Original:
       * [1] [2] [3] [4]
       *
       * After cloning:
       * [1] [2] [3] [4] [1] [2] [3] [4] [1] [2] [3] [4]
       */
      const prependCards = originalCards.map(card =>
        card.cloneNode(true)
      );

      const appendCards = originalCards.map(card =>
        card.cloneNode(true)
      );


      /*
       * Add the cloned cards around the originals.
       */
      track.prepend(...prependCards);
      track.append(...appendCards);


      /*
       * Current position.
       *
       * We start at the first ORIGINAL card.
       *
       * Because we added one complete copy before the originals,
       * the original cards start at index = cardCount.
       *
       * Example with 4 projects:
       *
       * [1][2][3][4] [1][2][3][4] [1][2][3][4]
       *               ↑
       *             index 4
       */
      let index = cardCount;


      /*
       * Prevent multiple animations from being triggered
       * before the current animation has finished.
       */
      let isAnimating = false;


      /*
       * Calculate the width of one card + its gap.
       *
       * This is better than hardcoding a value because it
       * continues to work if you change the CSS.
       */
      const getStep = () => {

        const card = track.children[0];

        if (!card) {
          return 0;
        }

        const cardWidth = card.getBoundingClientRect().width;

        const styles = window.getComputedStyle(track);

        const gap = parseFloat(styles.columnGap || styles.gap) || 0;

        return cardWidth + gap;
      };


      /*
       * Move the carousel to the current index.
       */
      const render = (animate = true) => {

        const step = getStep();

        track.style.transition = animate
          ? 'transform .45s cubic-bezier(.22,.61,.36,1)'
          : 'none';

        track.style.transform =
          `translate3d(${-index * step}px, 0, 0)`;
      };


      /*
       * Move one card left/right.
       */
      const move = (direction) => {

        if (isAnimating) {
          return;
        }

        isAnimating = true;

        index += direction;

        render(true);
      };


      /*
       * Position the carousel at the original cards.
       *
       * We need to wait until the browser has calculated
       * the card dimensions.
       */
      requestAnimationFrame(() => {
        render(false);
      });


      /* =====================================================
         INFINITE LOOP
         ===================================================== */

      track.addEventListener('transitionend', (event) => {

        if (event.propertyName !== 'transform') {
          return;
        }


        /*
         * We moved too far to the RIGHT.
         *
         * Example:
         *
         * [1][2][3][4] [1][2][3][4] [1][2][3][4]
         *                         ↑
         *
         * Move the index back by one complete set.
         */
        if (index >= cardCount * 2) {

          index -= cardCount;

          render(false);
        }


        /*
         * We moved too far to the LEFT.
         */
        if (index < cardCount) {

          index += cardCount;

          render(false);
        }


        /*
         * Allow the next movement.
         */
        requestAnimationFrame(() => {
          isAnimating = false;
        });

      });


      /* =====================================================
         NAVIGATION BUTTONS
         ===================================================== */

      if (nextButton) {

        nextButton.addEventListener('click', () => {
          move(1);
        });

      }


      if (prevButton) {

        prevButton.addEventListener('click', () => {
          move(-1);
        });

      }


      /* =====================================================
         TOUCH / SWIPE
         ===================================================== */

      let startX = 0;
      let startY = 0;


      viewport.addEventListener('touchstart', (event) => {

        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;

      }, {
        passive: true
      });


      viewport.addEventListener('touchend', (event) => {

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const dx = endX - startX;
        const dy = endY - startY;


        /*
         * Only treat the gesture as a horizontal swipe
         * if horizontal movement is dominant.
         */
        if (
          Math.abs(dx) > 50 &&
          Math.abs(dx) > Math.abs(dy)
        ) {

          if (dx < 0) {
            move(1);
          } else {
            move(-1);
          }

        }

      }, {
        passive: true
      });


      /* =====================================================
         KEYBOARD NAVIGATION
         ===================================================== */

      document.addEventListener('keydown', (event) => {

        /*
         * Only react to the arrows when the carousel is
         * reasonably visible on screen.
         */
        const rect = carousel.getBoundingClientRect();

        const visible =
          rect.top < window.innerHeight &&
          rect.bottom > 0;


        if (!visible) {
          return;
        }


        if (event.key === 'ArrowRight') {
          move(1);
        }


        if (event.key === 'ArrowLeft') {
          move(-1);
        }

      });


      /* =====================================================
         RESPONSIVE RESIZE
         ===================================================== */

      let resizeTimer;

      window.addEventListener('resize', () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

          /*
           * Recalculate the position because the card width
           * may have changed.
           */
          render(false);

        }, 100);

      });

    }

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