(function () {
  'use strict';

  // Aktuelles Jahr im Footer
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobiles Menü
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Docker-Befehl kopieren
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    // GitHub issue (SEO): index.html/en/index.html are now two independent,
    // fully static pages (no more client-side language switching), so the
    // "copied" label is just a data attribute set once in each page's own
    // HTML rather than looked up in a runtime dictionary.
    var originalLabel = copyBtn.textContent;
    var copiedLabel = copyBtn.getAttribute('data-copied-label') || 'Copied ✓';
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy') || '';
      var done = function () {
        copyBtn.textContent = copiedLabel;
        setTimeout(function () {
          copyBtn.textContent = originalLabel;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {
      /* Kopieren nicht möglich — der Befehl bleibt zum manuellen Markieren sichtbar. */
    }
    document.body.removeChild(ta);
  }

  // Sanftes Einblenden beim Scrollen
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
