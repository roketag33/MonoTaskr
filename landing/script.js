// MonoTaskr Landing Page JavaScript

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Chrome Web Store CTA links (placeholder for now)
const installButtons = document.querySelectorAll('#install-btn, #install-btn-2');
installButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Replace with actual Chrome Web Store URL when published
    const chromeStoreUrl = 'https://chrome.google.com/webstore/category/extensions';
    window.open(chromeStoreUrl, '_blank');

    // Optional: Track analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'CTA',
        event_label: 'Install Button'
      });
    }
  });
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const fadeInElements = document.querySelectorAll('.step, .feature-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(30px)';

      // Trigger animation
      requestAnimationFrame(() => {
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      });

      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all elements
fadeInElements.forEach((el) => observer.observe(el));

// Parallax effect for hero background
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');

  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Dynamic floating cards animation
const floatingCards = document.querySelectorAll('.floating-card');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

function animateCards() {
  floatingCards.forEach((card, index) => {
    const speed = (index + 1) * 0.05;
    const x = (mouseX - 0.5) * 50 * speed;
    const y = (mouseY - 0.5) * 50 * speed;

    card.style.transform = `translate(${x}px, ${y}px)`;
  });

  requestAnimationFrame(animateCards);
}

// Start card animation
animateCards();

// Add loading class removal after page load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// Add hover effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card) => {
  card.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });

  card.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Privacy policy placeholder
const privacyLink = document.querySelector('a[href="#privacy"]');
if (privacyLink) {
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert(
      'Privacy Policy: MonoTaskr stores all data locally on your device. We do not collect, transmit, or share any of your personal information or usage data. Your focus sessions and settings remain completely private.'
    );
  });
}

// Support placeholder
const supportLink = document.querySelector('a[href="#support"]');
if (supportLink) {
  supportLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('For support, please visit our GitHub repository or contact us at support@monotaskr.com');
  });
}

console.log('MonoTaskr landing page loaded ✨');
