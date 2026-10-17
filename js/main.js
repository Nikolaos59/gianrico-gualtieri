const menu = document.querySelector('.menu');
const links = document.querySelector('.nav-links');

if (menu && links) {
  menu.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  });

  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Menü öffnen');
    }
  });
}


/* Move supporting atelier photos one pair at a time around the mosaic. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  const slots = ['mosaic-wood', 'mosaic-black', 'mosaic-ochre', 'mosaic-light', 'mosaic-red'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');

  if (!mosaic || reducedMotion.matches) return;
  if (slots.some((slot) => !mosaic.querySelector('.' + slot))) return;

  let timer;
  let paused = false;
  let step = 0;

  const schedule = (delay = 250) => {
    window.clearTimeout(timer);
    if (!paused && !reducedMotion.matches) timer = window.setTimeout(swapNextPair, delay);
  };

  const swapNextPair = () => {
    if (paused || reducedMotion.matches) return;
    const slotA = slots[step];
    const slotB = slots[step + 1];
    const cardA = mosaic.querySelector('.' + slotA);
    const cardB = mosaic.querySelector('.' + slotB);
    if (!cardA || !cardB) return;

    mosaic.classList.add('is-rearranging');
    void mosaic.offsetWidth;
    const beforeA = cardA.getBoundingClientRect();
    const beforeB = cardB.getBoundingClientRect();

    cardA.classList.replace(slotA, slotB);
    cardB.classList.replace(slotB, slotA);

    const moves = [[cardA, beforeA], [cardB, beforeB]].map(([card, from]) => {
      const to = card.getBoundingClientRect();
      const scale = Math.min(from.width / to.width, from.height / to.height);
      const tx = from.left - to.left - (to.width * (1 - scale) / 2);
      const ty = from.top - to.top - (to.height * (1 - scale) / 2);
      const end = getComputedStyle(card).transform;
      const start = `translate(${tx}px, ${ty}px) scale(${scale})`;

      card.style.transition = 'none';
      card.style.transformOrigin = 'center center';
      card.style.transform = start;
      return { card, end };
    });

    void mosaic.offsetHeight;
    requestAnimationFrame(() => {
      moves.forEach(({ card, end }) => {
        card.style.transition = 'transform 700ms cubic-bezier(.22,.61,.36,1)';
        card.style.transform = end;
      });
    });

    window.setTimeout(() => {
      moves.forEach(({ card }) => {
        card.style.transform = '';
        card.style.transition = '';
        card.style.transformOrigin = '';
      });
      mosaic.classList.remove('is-rearranging');
      step = (step + 1) % (slots.length - 1);
      schedule(step === 0 ? 900 : 250);
    }, 760);
  };

  if (canHover.matches) {
    mosaic.addEventListener('pointerenter', () => {
      paused = true;
      window.clearTimeout(timer);
    });
    mosaic.addEventListener('pointerleave', () => {
      paused = false;
      schedule(1100);
    });
  }

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      paused = true;
      window.clearTimeout(timer);
      mosaic.classList.remove('is-rearranging');
    } else {
      paused = false;
      schedule(1100);
    }
  });

  schedule(1300);
})();