import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Carousel / slider block.
 *
 * Adapted from the "Responsive Slider" Block Party entry
 * (https://github.com/meejain/slider). The original relied on a query-index
 * feed plus Swiper.js and several helper scripts. This version is
 * self-contained and author-driven: each authored row becomes one slide
 * (image + optional text), with prev/next controls and dot navigation.
 *
 * Content model (one row per slide):
 *   | carousel |
 *   | :image:  | Slide text / heading (optional) |
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const slides = [...block.children];
  const track = document.createElement('ul');
  track.className = 'carousel-track';

  slides.forEach((row, i) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-slide';
    slide.dataset.index = i;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.querySelector('picture')) cell.classList.add('carousel-slide-image');
      else cell.classList.add('carousel-slide-content');
      slide.append(cell);
    }
    track.append(slide);
  });

  // optimize images: eagerly load the first (visible) slide for a fast LCP,
  // lazy-load the rest so off-screen slides don't compete for bandwidth.
  [...track.querySelectorAll('.carousel-slide')].forEach((slide, i) => {
    const img = slide.querySelector('picture > img');
    if (!img) return;
    const eager = i === 0;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, eager, [{ width: '900' }]),
    );
  });

  block.replaceChildren(track);

  const slideEls = [...track.children];
  if (slideEls.length <= 1) return; // no controls needed for a single slide

  // dot indicators
  const dotList = document.createElement('div');
  dotList.className = 'carousel-dots';
  dotList.setAttribute('role', 'tablist');

  let current = 0;
  const dots = [];
  const show = (index) => {
    current = (index + slideEls.length) % slideEls.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current ? 'true' : 'false'));
  };

  // prev / next buttons
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  const prev = document.createElement('button');
  prev.className = 'carousel-btn carousel-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.type = 'button';
  prev.addEventListener('click', () => show(current - 1));
  const next = document.createElement('button');
  next.className = 'carousel-btn carousel-next';
  next.setAttribute('aria-label', 'Next slide');
  next.type = 'button';
  next.addEventListener('click', () => show(current + 1));
  nav.append(prev, next);

  slideEls.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => show(i));
    dotList.append(dot);
    dots.push(dot);
  });

  block.append(nav, dotList);
  show(0);
}
