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



/* Slowly rotate photographs through the mixed mosaic positions. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  const slots = [
    'mosaic-vanitas', 'mosaic-archive-skull',
    'mosaic-wood', 'mosaic-red', 'mosaic-black', 'mosaic-light', 'mosaic-ochre', 'mosaic-extra',
    'mosaic-archive-wood', 'mosaic-archive-red', 'mosaic-archive-black', 'mosaic-archive-light', 'mosaic-archive-ochre'
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mosaic || reducedMotion.matches || slots.some(name => !mosaic.querySelector('.' + name))) return;

  let timer;
  let paused = false;
  let step = 0;
  const schedule = (delay = 2800) => {
    window.clearTimeout(timer);
    if (!paused && !reducedMotion.matches && !document.hidden) timer = window.setTimeout(swapNextPair, delay);
  };

  const swap = (slotA, slotB) => {
    const cardA = mosaic.querySelector('.' + slotA);
    const cardB = mosaic.querySelector('.' + slotB);
    if (!cardA || !cardB) return;

    const beforeA = cardA.getBoundingClientRect();
    const beforeB = cardB.getBoundingClientRect();
    mosaic.classList.add('is-rearranging');
    cardA.classList.replace(slotA, slotB);
    cardB.classList.replace(slotB, slotA);

    const moves = [[cardA, beforeA], [cardB, beforeB]].map(([card, before]) => {
      const after = card.getBoundingClientRect();
      const scale = Math.min(before.width / after.width, before.height / after.height);
      const x = before.left - after.left - after.width * (1 - scale) / 2;
      const y = before.top - after.top - after.height * (1 - scale) / 2;
      const end = getComputedStyle(card).transform;
      card.style.transition = 'none';
      card.style.transformOrigin = 'center';
      card.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
      return { card, end };
    });

    void mosaic.offsetHeight;
    requestAnimationFrame(() => moves.forEach(({ card, end }) => {
      card.style.transition = 'transform 800ms cubic-bezier(.22,.61,.36,1)';
      card.style.transform = end;
    }));

    window.setTimeout(() => {
      moves.forEach(({ card }) => {
        card.style.transform = '';
        card.style.transition = '';
        card.style.transformOrigin = '';
      });
      mosaic.classList.remove('is-rearranging');
      schedule();
    }, 850);
  };

  const swapNextPair = () => {
    if (paused || reducedMotion.matches || document.hidden) return;
    const index = step % (slots.length - 1);
    swap(slots[index], slots[index + 1]);
    step += 1;
  };

  const pause = () => { paused = true; window.clearTimeout(timer); };
  const resume = () => { paused = false; schedule(1100); };
  mosaic.addEventListener('pointerenter', pause);
  mosaic.addEventListener('pointerleave', resume);
  mosaic.addEventListener('focusin', pause);
  mosaic.addEventListener('focusout', event => {
    if (!mosaic.contains(event.relatedTarget)) resume();
  });
  mosaic.addEventListener('mosaic:pause', pause);
  mosaic.addEventListener('mosaic:resume', resume);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
  reducedMotion.addEventListener('change', event => {
    if (event.matches) pause();
    else resume();
  });
  schedule(2200);
})();

/* Show the centered preview only after the pointer settles. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  const desktopHover = window.matchMedia('(hover:hover) and (min-width:801px)');
  if (!mosaic || !desktopHover.matches) return;

  let activeCard = null;
  let pendingCard = null;
  let pendingTimer = 0;
  let lastX = 0;
  let lastY = 0;
  const closePreview = () => {
    activeCard?.classList.remove('mosaic-preview-active');
    activeCard = null;
    document.querySelector('.mosaic-hover-preview')?.remove();
  };
  const cancelPending = () => {
    window.clearTimeout(pendingTimer);
    pendingTimer = 0;
    pendingCard = null;
  };
  const showPreview = (card) => {
    if (!card.matches(':hover')) return;
    const source = card.querySelector('img');
    if (!source) return;
    activeCard = card;
    card.classList.add('mosaic-preview-active');
    const preview = document.createElement('div');
    preview.className = 'mosaic-hover-preview';
    preview.setAttribute('aria-hidden', 'true');
    const figure = document.createElement('figure');
    const image = source.cloneNode(false);
    image.src = source.currentSrc || source.src;
    image.removeAttribute('srcset');
    image.removeAttribute('loading');
    const caption = document.createElement('figcaption');
    caption.textContent = card.querySelector('figcaption')?.textContent.trim() || source.alt;
    figure.append(image, caption);
    preview.append(figure);
    document.body.append(preview);
  };
  const schedulePreview = (card) => {
    cancelPending();
    closePreview();
    pendingCard = card;
    pendingTimer = window.setTimeout(() => {
      const settledCard = pendingCard;
      pendingTimer = 0;
      pendingCard = null;
      if (settledCard) showPreview(settledCard);
    }, 1000);
  };

  mosaic.querySelectorAll('.mosaic-item').forEach((card) => {
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      lastX = event.clientX;
      lastY = event.clientY;
      schedulePreview(card);
    });
  });
  mosaic.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const moved = Math.hypot(event.clientX - lastX, event.clientY - lastY) > 4;
    if (!moved) return;
    lastX = event.clientX;
    lastY = event.clientY;
    const card = event.target.closest?.('.mosaic-item');
    if (!card) {
      cancelPending();
      closePreview();
      return;
    }
    schedulePreview(card);
  });
  mosaic.addEventListener('pointerleave', () => {
    cancelPending();
    closePreview();
  });
})();

/* Open workshop photographs in an accessible full-size lightbox. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  if (!mosaic) return;

  const lang = document.documentElement.lang;
  const labels = {
    fr: { dialog: 'Photo de l’atelier agrandie', close: 'Fermer', zoom: 'Agrandir la photo : ' },
    de: { dialog: 'Atelierfoto vergrößert', close: 'Schließen', zoom: 'Foto vergrößern: ' },
    en: { dialog: 'Enlarged studio photograph', close: 'Close', zoom: 'Enlarge photo: ' },
    it: { dialog: 'Fotografia dello studio ingrandita', close: 'Chiudi', zoom: 'Ingrandisci la foto: ' },
    nl: { dialog: 'Atelierfoto vergroot', close: 'Sluiten', zoom: 'Foto vergroten: ' }
  }[lang] || { dialog: 'Photo de l’atelier agrandie', close: 'Fermer', zoom: 'Agrandir la photo : ' };
  const dialog = document.createElement('dialog');
  dialog.className = 'mosaic-lightbox';
  dialog.setAttribute('aria-label', labels.dialog);
  dialog.innerHTML = '<button class="mosaic-lightbox-close" type="button" autofocus></button><figure><img alt=""><figcaption></figcaption></figure>';
  const closeButton = dialog.querySelector('.mosaic-lightbox-close');
  const largeImage = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', labels.close);
  document.body.append(dialog);

  const open = (card) => {
    const image = card.querySelector('img');
    if (!image) return;
    mosaic.dispatchEvent(new Event('mosaic:pause'));
    largeImage.src = image.currentSrc || image.src;
    largeImage.alt = image.alt;
    caption.textContent = card.querySelector('figcaption')?.textContent.trim() || image.alt;
    dialog.showModal();
  };

  mosaic.querySelectorAll('.mosaic-item').forEach((card) => {
    const image = card.querySelector('img');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', labels.zoom + (image?.alt || ''));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(card);
      }
    });
  });

  mosaic.addEventListener('click', (event) => {
    const card = event.target.closest('.mosaic-item');
    if (card && mosaic.contains(card)) open(card);
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    largeImage.removeAttribute('src');
    mosaic.dispatchEvent(new Event('mosaic:resume'));
  });
})();