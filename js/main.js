const menu = document.querySelector('.menu');
const links = document.querySelector('.nav-links');

if (menu && links) {
  const closeMenu = () => {
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };

  menu.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}
