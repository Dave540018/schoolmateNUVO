const titleStage = document.getElementById('titleStage');
const menuToggle = document.querySelector('.menu-toggle');

if (titleStage) {
  let hoverHoldTimer;
  let glowTimer;

    titleStage.classList.add('intro-playing');

  window.setTimeout(() => {
    titleStage.classList.remove('intro-playing');
    titleStage.classList.add('intro-done');
  }, 3100);

  const setLightPosition = (event) => {
    const rect = titleStage.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

    titleStage.style.setProperty('--mx', `${x}%`);
    titleStage.style.setProperty('--my', `${y}%`);
  };

  const lightUpText = (event) => {
    window.clearTimeout(hoverHoldTimer);
    window.clearTimeout(glowTimer);

    setLightPosition(event);
    titleStage.classList.add('is-hovering');
    titleStage.classList.add('is-holding');
  };

  titleStage.addEventListener('pointerenter', lightUpText);
  titleStage.addEventListener('pointermove', lightUpText);

  titleStage.addEventListener('pointerleave', () => {
    titleStage.classList.remove('is-hovering');

    // Keep the glow alive for a few seconds, then fade it out smoothly.
    hoverHoldTimer = window.setTimeout(() => {
      titleStage.classList.remove('is-holding');
    }, 4200);
  });
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const animatedItems = document.querySelectorAll('.device, .demo-cta');

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  animatedItems.forEach((item, index) => {
    const strength = index === 0 ? 5 : index === 1 ? 2.5 : 3.5;
    item.style.setProperty('--move-x', `${x * strength}px`);
    item.style.setProperty('--move-y', `${y * strength}px`);
  });
});

/* ===============================
   Creative Count Up Stats
================================ */

const countNumbers = document.querySelectorAll('.count-number');

const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};

const animateCountNumber = (element) => {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || '';
  const duration = 2200;
  const startTime = performance.now();

  element.classList.add('is-counting');

  const run = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const bounce = Math.sin(progress * Math.PI) * 0.035;
    const eased = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(target * Math.min(eased + bounce, 1));

    element.textContent = `${formatIndianNumber(currentValue)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(run);
    } else {
      element.textContent = `${formatIndianNumber(target)}${suffix}`;

      setTimeout(() => {
        element.classList.remove('is-counting');
      }, 700);
    }
  };

  requestAnimationFrame(run);
};

const statsPanel = document.querySelector('.stats-panel');

if (statsPanel) {
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const numbers = entry.target.querySelectorAll('.count-number');

        numbers.forEach((number, index) => {
          setTimeout(() => {
            animateCountNumber(number);
          }, index * 180);
        });

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.35
    }
  );

  statsObserver.observe(statsPanel);
}


/*--------LogoSchoolScrolling-----*/

const initDoubleScroll = () => {
  const track1 = document.getElementById('logoTrack1');
  const track2 = document.getElementById('logoTrack2');

  if (!track1 || !track2) return;

  const totalLogos = 16; // change this based on your school image count
  const logoFolder = 'assets';
  const logoExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  const firstSet = Array.from(
    { length: totalLogos },
    (_, index) => `school${index + 1}`
  );

  const secondSet = Array.from(
    { length: totalLogos },
    (_, index) => `school${totalLogos - index}`
  );

  const createImage = (name) => {
    const img = document.createElement('img');
    let extensionIndex = 0;

    img.src = `${logoFolder}/${name}.${logoExtensions[extensionIndex]}`;
    img.alt = name;

    img.onerror = () => {
      extensionIndex += 1;

      if (extensionIndex < logoExtensions.length) {
        img.src = `${logoFolder}/${name}.${logoExtensions[extensionIndex]}`;
      } else {
        img.style.display = 'none';
      }
    };

    return img;
  };

  const createCards = (track, logoSet) => {
    track.innerHTML = '';

    // Two identical sets for seamless looping.
    const repeatedSet = [...logoSet, ...logoSet];

    repeatedSet.forEach((name) => {
      const card = document.createElement('div');
      card.className = 'school-logo-card';
      card.appendChild(createImage(name));
      track.appendChild(card);
    });
  };

  const setupMarquee = (track, speed) => {
    track.classList.remove('is-ready');

    requestAnimationFrame(() => {
      const distance = track.scrollWidth / 2;

      if (!distance || distance <= 0) return;

      const duration = Math.max(72, Math.round(distance / speed));

      track.style.setProperty('--marquee-distance', `${distance}px`);
      track.style.setProperty('--marquee-duration', `${duration}s`);

      requestAnimationFrame(() => {
        track.classList.add('is-ready');
      });
    });
  };

  createCards(track1, firstSet);
  createCards(track2, secondSet);

  // Start after browser finishes placing the logo items.
  setTimeout(() => {
    setupMarquee(track1, 34);
    setupMarquee(track2, 32);
  }, 300);

  let resizeTimer;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      setupMarquee(track1, 34);
      setupMarquee(track2, 32);
    }, 250);
  });
};

document.addEventListener('DOMContentLoaded', initDoubleScroll);

/* ===============================
   Bento Slider
================================ */

(() => {
  const slider = document.querySelector('.js-bento-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.bento-slide'));
  const controls = Array.from(slider.querySelectorAll('.bento-progress-item'));

  if (!slides.length || !controls.length) return;

  const duration = Number(slider.dataset.duration || 5200);
  let currentIndex = 0;
  let timer;

  slider.style.setProperty('--bento-duration', `${duration}ms`);

  const showSlide = (index) => {
    currentIndex = index;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    controls.forEach((control, controlIndex) => {
      control.classList.toggle('is-active', controlIndex === currentIndex);

      const bar = control.querySelector('span');
      if (!bar) return;

      bar.style.animation = 'none';
      bar.offsetHeight;
      bar.style.animation = '';
    });
  };

  const nextSlide = () => {
    showSlide((currentIndex + 1) % slides.length);
  };

  const startSlider = () => {
    clearInterval(timer);
    timer = setInterval(nextSlide, duration);
  };

  controls.forEach((control, index) => {
    control.addEventListener('click', () => {
      showSlide(index);
      startSlider();
    });
  });

  slider.addEventListener('mouseenter', () => {
    clearInterval(timer);
  });

  slider.addEventListener('mouseleave', () => {
    startSlider();
  });

  showSlide(0);
  startSlider();
})();


/* ===============================
   Teachers Bento Slider
================================ */

(() => {
  const slider = document.querySelector('.js-teacher-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.teacher-slide'));
  const controls = Array.from(slider.querySelectorAll('.teacher-progress-item'));

  if (!slides.length || !controls.length) return;

  const duration = Number(slider.dataset.duration || 5200);
  const delay = Number(slider.dataset.delay || 850);

  let currentIndex = 0;
  let timer;

  slider.style.setProperty('--teacher-duration', `${duration}ms`);

  const restartProgress = () => {
    controls.forEach((control) => {
      const bar = control.querySelector('span');
      if (!bar) return;

      bar.style.animation = 'none';
      bar.offsetHeight;
      bar.style.animation = '';
    });
  };

  const showTeacherSlide = (index) => {
    currentIndex = index;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    controls.forEach((control, controlIndex) => {
      control.classList.toggle('is-active', controlIndex === currentIndex);
    });

    restartProgress();
  };

  const nextTeacherSlide = () => {
    showTeacherSlide((currentIndex + 1) % slides.length);
  };

  const startTeacherSlider = () => {
    clearInterval(timer);
    timer = setInterval(nextTeacherSlide, duration);
  };

  controls.forEach((control, index) => {
    control.addEventListener('click', () => {
      showTeacherSlide(index);
      startTeacherSlider();
    });
  });

  slider.addEventListener('mouseenter', () => {
    clearInterval(timer);
  });

  slider.addEventListener('mouseleave', () => {
    startTeacherSlider();
  });

  showTeacherSlide(0);

  setTimeout(() => {
    startTeacherSlider();
  }, delay);
})();

/* ===============================
   Teacher Video: Force 2 Sec Loop
================================ */

(() => {
  const teacherVideos = document.querySelectorAll('.teacher-video-wrap video');

  if (!teacherVideos.length) return;

  teacherVideos.forEach((video) => {
    const loopEndTime = 2; // seconds

    video.muted = true;
    video.playsInline = true;

    const restartVideo = () => {
      if (video.currentTime >= loopEndTime) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    video.addEventListener('timeupdate', restartVideo);

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });
})();

/* ===============================
   Students Bento Slider
================================ */

(() => {
  const slider = document.querySelector('.js-student-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.student-slide'));
  const controls = Array.from(slider.querySelectorAll('.student-progress-item'));

  if (!slides.length || !controls.length) return;

  const duration = Number(slider.dataset.duration || 4800);
  const delay = Number(slider.dataset.delay || 1500);

  let currentIndex = 0;
  let timer;

  slider.style.setProperty('--student-duration', `${duration}ms`);

  const restartProgress = () => {
    controls.forEach((control) => {
      const bar = control.querySelector('span');
      if (!bar) return;

      bar.style.animation = 'none';
      bar.offsetHeight;
      bar.style.animation = '';
    });
  };

  const showStudentSlide = (index) => {
    currentIndex = index;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    controls.forEach((control, controlIndex) => {
      control.classList.toggle('is-active', controlIndex === currentIndex);
    });

    restartProgress();
  };

  const nextStudentSlide = () => {
    showStudentSlide((currentIndex + 1) % slides.length);
  };

  const startStudentSlider = () => {
    clearInterval(timer);
    timer = setInterval(nextStudentSlide, duration);
  };

  controls.forEach((control, index) => {
    control.addEventListener('click', () => {
      showStudentSlide(index);
      startStudentSlider();
    });
  });

  slider.addEventListener('mouseenter', () => {
    clearInterval(timer);
  });

  slider.addEventListener('mouseleave', () => {
    startStudentSlider();
  });

  showStudentSlide(0);

  setTimeout(() => {
    startStudentSlider();
  }, delay);
})();


/* ===============================
   Premium Scroll Intro Reveals
   Add at the VERY BOTTOM of script.js
================================ */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealItems = [];

  const addReveal = (selector, effect = 'reveal-rise', options = {}) => {
    const elements = Array.from(document.querySelectorAll(selector));

    elements.forEach((element, index) => {
      revealItems.push({
        element,
        effect,
        delay: Number(options.delay || 0) + index * Number(options.stagger || 0)
      });
    });
  };

  /* Stats section */
  addReveal('.stats-panel', 'reveal-scale', { delay: 0 });
  addReveal('.stat-item', 'reveal-rise-small', { delay: 180, stagger: 90 });

  /* Trusted schools */
  addReveal('.trusted-schools h3', 'reveal-rise', { delay: 0 });

  /* Bento heading */
  addReveal('.nuvo-section-heading span', 'reveal-pill', { delay: 0 });
  addReveal('.nuvo-section-heading h2', 'reveal-rise', { delay: 90 });

  /* Bento cards */
  addReveal('.stakeholder-management', 'reveal-left', { delay: 0 });
  addReveal('.stakeholder-teachers', 'reveal-card', { delay: 120 });
  addReveal('.stakeholder-parents', 'reveal-right', { delay: 210 });
  addReveal('.stakeholder-students', 'reveal-rise', { delay: 300 });

  /* Bento inner icons */
  addReveal('.management-3d-icon', 'reveal-icon', { delay: 260 });
  addReveal('.parents-3d-icon', 'reveal-icon', { delay: 300 });
  addReveal('.student-3d-icon', 'reveal-icon', { delay: 260 });

  /* ERP heading */
  addReveal('.erp-modules-heading span', 'reveal-pill', { delay: 0 });
  addReveal('.erp-modules-heading h2', 'reveal-rise', { delay: 100 });
  addReveal('.erp-modules-heading p', 'reveal-rise-small', { delay: 220 });

  /*
    ERP cards:
    We do not animate .erp-module-card itself because your current CSS already
    uses transform/translate for stagger and dragon-wave movement.
    So we animate the inside content only.
  */
  addReveal('.erp-module-card > .erp-module-img', 'reveal-icon', { delay: 80, stagger: 95 });
  addReveal('.erp-module-card > h3', 'reveal-rise-small', { delay: 170, stagger: 95 });
  addReveal('.erp-module-card > p', 'reveal-rise-small', { delay: 230, stagger: 95 });
  addReveal('.erp-module-card > .erp-card-actions', 'reveal-rise-small', { delay: 290, stagger: 95 });

  if (!revealItems.length) return;

  const prepared = new WeakSet();

  revealItems.forEach(({ element, effect, delay }) => {
    if (!element || prepared.has(element)) return;

    prepared.add(element);
    element.classList.add('scroll-reveal', effect);
    element.style.setProperty('--reveal-delay', `${delay}ms`);

    if (reduceMotion) {
      element.classList.add('is-visible');
    }
  });

  if (reduceMotion) return;

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  prepared.forEach?.(() => {});

  document.querySelectorAll('.scroll-reveal').forEach((element) => {
    revealObserver.observe(element);
  });
})();


/* ===============================
   Testimonials Carousel
================================ */

(() => {
  const testimonialText = document.getElementById('testimonialText');
  const reviewerName = document.getElementById('reviewerName');
  const reviewerSchool = document.getElementById('reviewerSchool');
  const prevButton = document.getElementById('prevReview');
  const nextButton = document.getElementById('nextReview');
  const readMore = document.getElementById('readMore');
  const card = document.querySelector('.nuvo-testimonial-card');

  if (!testimonialText || !reviewerName || !reviewerSchool || !prevButton || !nextButton) return;

  const reviews = [
    {
      text: 'SchoolMate Nuvo helped us streamline fee collection, parent communication and progress report generation with strong support from the BST team.',
      fullText: 'SchoolMate Nuvo helped us streamline fee collection, parent communication and progress report generation with strong support from the BST team. The system is practical for day-to-day school operations and the support team understands school workflows clearly.',
      name: 'Principal',
      school: 'Leading Educational Institution, Kerala'
    },
    {
      text: 'The parent app and communication features helped us keep parents updated with notices, fee details and academic information in a much better way.',
      fullText: 'The parent app and communication features helped us keep parents updated with notices, fee details and academic information in a much better way. It reduced repeated calls to the office and improved communication transparency.',
      name: 'Manager',
      school: 'Reputed School Group, Kerala'
    },
    {
      text: 'The fee collection and reporting modules gave our office team better visibility and saved a lot of manual follow-up time.',
      fullText: 'The fee collection and reporting modules gave our office team better visibility and saved a lot of manual follow-up time. Collection reports, dues tracking and parent communication became easier to manage from one platform.',
      name: 'Administrator',
      school: 'Senior Secondary School, Trivandrum'
    }
  ];

  let currentIndex = 0;
  let expanded = false;

  const renderReview = () => {
    const review = reviews[currentIndex];

    card?.classList.remove('is-switching');
    void card?.offsetWidth;
    card?.classList.add('is-switching');

    testimonialText.textContent = expanded ? review.fullText : review.text;
    reviewerName.textContent = review.name;
    reviewerSchool.textContent = review.school;

    if (readMore) {
      readMore.textContent = expanded ? 'Show less' : 'Read more';
    }
  };

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    expanded = false;
    renderReview();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % reviews.length;
    expanded = false;
    renderReview();
  });

  if (readMore) {
    readMore.addEventListener('click', (event) => {
      event.preventDefault();
      expanded = !expanded;
      renderReview();
    });
  }

  renderReview();
})();

/* ===============================
   Brochure Badge Flipbook Modal
================================ */

(() => {
  const openButton = document.getElementById('openBrochure');
  const modal = document.getElementById('brochureModal');
  const image = document.getElementById('brochurePreviewImage');
  const book = document.getElementById('flipbookBook');
  const prevButton = document.getElementById('brochurePrevPage');
  const nextButton = document.getElementById('brochureNextPage');
  const currentEl = document.getElementById('brochurePageCurrent');
  const totalEl = document.getElementById('brochurePageTotal');

  if (!openButton || !modal || !image || !book || !prevButton || !nextButton) return;

  const pages = [
    'assets/brochureimage1.png',
    'assets/brochureimage2.png',
    'assets/brochureimage3.png',
    'assets/brochureimage4.png'
  ];

  let currentIndex = 0;
  let isAnimating = false;

  const pad = (num) => String(num).padStart(2, '0');

  const updateCounter = () => {
    if (currentEl) currentEl.textContent = pad(currentIndex + 1);
    if (totalEl) totalEl.textContent = pad(pages.length);
  };

  const renderPage = (nextIndex) => {
    if (isAnimating) return;

    isAnimating = true;
    currentIndex = (nextIndex + pages.length) % pages.length;

    book.classList.add('is-flipping');

    setTimeout(() => {
      image.src = pages[currentIndex];
      image.alt = `SchoolMate Nuvo brochure page ${currentIndex + 1}`;
      updateCounter();
    }, 230);

    setTimeout(() => {
      book.classList.remove('is-flipping');
      isAnimating = false;
    }, 620);
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCounter();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openButton.addEventListener('click', openModal);

  modal.addEventListener('click', (event) => {
    if (event.target.matches('[data-brochure-close]')) {
      closeModal();
    }
  });

  prevButton.addEventListener('click', () => {
    renderPage(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    renderPage(currentIndex + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowRight') renderPage(currentIndex + 1);
    if (event.key === 'ArrowLeft') renderPage(currentIndex - 1);
  });

  image.addEventListener('error', () => {
    console.warn('Brochure page image not found:', pages[currentIndex]);
  });

  updateCounter();
})();

/* ===============================
   Footer Year + Brochure Link
================================ */

(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const footerBrochureLink = document.getElementById('footerBrochureLink');
  const brochureButton = document.getElementById('openBrochure');

  if (footerBrochureLink && brochureButton) {
    footerBrochureLink.addEventListener('click', (event) => {
      event.preventDefault();
      brochureButton.click();
    });
  }
})();