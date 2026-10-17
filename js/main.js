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


/* Let the five workshop details circulate through the surrounding mosaic slots. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  const slots = ['mosaic-wood', 'mosaic-black', 'mosaic-ochre', 'mosaic-light', 'mosaic-red'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');

  if (!mosaic || reducedMotion.matches) return;
  if (slots.some((slot) => !mosaic.querySelector('.' + slot))) return;

  let timer;
  let paused = false;

  const schedule = (delay = 6200) => {
    window.clearTimeout(timer);
    if (!paused && !reducedMotion.matches) {
      timer = window.setTimeout(rotateSlots, delay);
    }
  };

  const rotateSlots = () => {
    const cards = slots.map((slot) => mosaic.querySelector('.' + slot));
    const before = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));
    const oldSlots = cards.map((card, index) => [card, slots[index]]);

    mosaic.classList.add('is-rearranging');
    oldSlots.forEach(([card, slot], index) => {
      card.classList.remove(slot);
      card.classList.add(slots[(index + 1) % slots.length]);
    });

    const moves = cards.map((card) => {
      const from = before.get(card);
      const to = card.getBoundingClientRect();
      const scale = Math.min(from.width / to.width, from.height / to.height);
      const tx = from.left - to.left - (to.width * (1 - scale) / 2);
      const ty = from.top - to.top - (to.height * (1 - scale) / 2);
      const end = getComputedStyle(card).transform;
      const start = `translate(${tx}px, ${ty}px) scale(${scale})`;

      card.style.transition = 'none';
      card.style.transformOrigin = 'center center';
      card.style.transform = start;
      return { card, start, end };
    });

    void mosaic.offsetHeight;
    requestAnimationFrame(() => {
      moves.forEach(({ card, end }) => {
        card.style.transition = 'transform 1500ms cubic-bezier(.22,.61,.36,1)';
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
      schedule();
    }, 1650);
  };

  if (canHover.matches) {
    mosaic.addEventListener('pointerenter', () => {
      paused = true;
      window.clearTimeout(timer);
    });
    mosaic.addEventListener('pointerleave', () => {
      paused = false;
      schedule(1800);
    });
  }

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      paused = true;
      window.clearTimeout(timer);
      mosaic.classList.remove('is-rearranging');
    } else {
      paused = false;
      schedule(1800);
    }
  });

  schedule(3500);
})();