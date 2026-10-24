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


/* Open workshop photographs in an accessible full-size lightbox. */
(() => {
  const mosaic = document.querySelector('.atelier-mosaic');
  if (!mosaic) return;

  const isGerman = document.documentElement.lang === 'de';
  const dialog = document.createElement('dialog');
  dialog.className = 'mosaic-lightbox';
  dialog.setAttribute('aria-label', isGerman ? 'Atelierfoto vergrößert' : 'Photo de l’atelier agrandie');
  dialog.innerHTML = '<button class="mosaic-lightbox-close" type="button" autofocus></button><figure><img alt=""><figcaption></figcaption></figure>';
  const closeButton = dialog.querySelector('.mosaic-lightbox-close');
  const largeImage = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', isGerman ? 'Schließen' : 'Fermer');
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
    card.setAttribute('aria-label', (isGerman ? 'Foto vergrößern: ' : 'Agrandir la photo : ') + (image?.alt || ''));
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