/* ============================================
   RAMADHAN - script.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Starfield ---- */
  const starsContainer = document.getElementById('stars');
  if (starsContainer) {
    const STAR_COUNT = 80;
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 2.5 + 0.5;
      star.classList.add('star');
      Object.assign(star.style, {
        width:             size + 'px',
        height:            size + 'px',
        top:               Math.random() * 100 + '%',
        left:              Math.random() * 100 + '%',
        animationDelay:    (Math.random() * 5) + 's',
        animationDuration: (Math.random() * 3 + 2) + 's',
        opacity:           Math.random() * 0.7 + 0.2,
      });
      starsContainer.appendChild(star);
    }
  }

  /* ---- 2. Scroll Reveal ---- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---- 3. Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---- 4. Active Nav Highlight on Scroll ---- */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('nav a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('nav-active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('nav-active');
          }
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => sectionObserver.observe(s));

});
