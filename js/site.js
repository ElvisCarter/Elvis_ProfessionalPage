/**

 * Elvis S. — Professional Page

 * Motion system: architectural precision, calm authority.

 * Respects prefers-reduced-motion. No animation libraries.

 */

(function () {

  'use strict';



  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  var prefersReducedMotion = motionQuery.matches;



  function ready(fn) {

    if (document.readyState === 'loading') {

      document.addEventListener('DOMContentLoaded', fn);

    } else {

      fn();

    }

  }



  function getHeaderOffset() {

    var header = document.querySelector('.site-header, .main-header');

    if (!header) return 64;

    return Math.ceil(header.getBoundingClientRect().height) || 64;

  }



  /* ── Mobile navigation ── */

  function initMobileNav() {

    var toggle = document.querySelector('.nav-toggle');

    var nav = document.getElementById('site-nav');

    if (!toggle || !nav) return;



    function setOpen(open) {

      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');

      nav.classList.toggle('is-open', open);

      document.body.classList.toggle('nav-open', open);

      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    }



    toggle.addEventListener('click', function () {

      setOpen(toggle.getAttribute('aria-expanded') !== 'true');

    });



    nav.querySelectorAll('a').forEach(function (link) {

      link.addEventListener('click', function () {

        if (window.innerWidth < 1024) setOpen(false);

      });

    });



    document.addEventListener('keydown', function (e) {

      if (e.key === 'Escape' && nav.classList.contains('is-open')) {

        setOpen(false);

        toggle.focus();

      }

    });



    window.addEventListener('resize', function () {

      if (window.innerWidth >= 1024) setOpen(false);

    });

  }



  /* ── Smooth scroll with sticky-header offset ── */

  function initSmoothScroll() {

    document.querySelectorAll('a[href*="#"]').forEach(function (link) {

      link.addEventListener('click', function (e) {

        var href = link.getAttribute('href');

        if (!href || href === '#') return;

        var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : href;

        if (!hash || hash === '#') return;

        var target = document.querySelector(hash);

        if (!target) return;

        e.preventDefault();

        var top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();

        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        if (history.replaceState) history.replaceState(null, '', hash);

      });

    });

  }



  /* ── Viewport-gated reveals (animate only when user can see them) ── */

  var CARD_REVEAL_SELECTOR = [
    '.case-study',
    '.capability-card',
    '.venture-card',
    '.idea-card',
    '.writing-card',
    '.timeline-entry',
    '.job-card',
    '.project-card',
    '.skills-column'
  ].join(', ');

  function getRevealRootMargin() {
    return '-' + getHeaderOffset() + 'px 0px -10% 0px';
  }

  function observeInView(elements, onVisible, options) {
    var list = Array.isArray(elements) ? elements : Array.prototype.slice.call(elements);
    if (!list.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      list.forEach(onVisible);
      return;
    }

    var opts = options || {};
    var threshold = opts.threshold != null ? opts.threshold : 0.18;
    var rootMargin = opts.rootMargin || getRevealRootMargin();
    var once = opts.once !== false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.intersectionRatio < threshold) return;
        onVisible(entry.target);
        if (once) observer.unobserve(entry.target);
      });
    }, { threshold: [0, threshold, 0.4, 0.6], rootMargin: rootMargin });

    list.forEach(function (el) { observer.observe(el); });
  }

  function initScrollAnimations() {
    observeInView(
      document.querySelectorAll('.section-reveal, .section-bridge'),
      function (el) { el.classList.add('is-visible'); },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal-stagger').forEach(function (container) {
      var cardChildren = Array.prototype.filter.call(container.children, function (child) {
        return child.matches && child.matches(CARD_REVEAL_SELECTOR);
      });
      var listChildren = container.querySelectorAll(':scope > li');

      if (cardChildren.length) {
        observeInView(Array.prototype.slice.call(cardChildren), function (el) {
          el.classList.add('is-visible');
        }, { threshold: 0.14 });
      } else if (listChildren.length > 1) {
        observeInView(Array.prototype.slice.call(listChildren), function (el) {
          el.classList.add('is-visible');
        }, { threshold: 0.14 });
      } else {
        observeInView([container], function (el) {
          el.classList.add('is-visible');
        }, { threshold: 0.22 });
      }
    });
  }

  /* ── Hero: entrance + float only while in viewport ── */

  function initHeroMotion() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    function activate() {
      hero.classList.add('hero-ready', 'hero-in-view');
    }

    function deactivateFloat() {
      hero.classList.remove('hero-in-view');
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      activate();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
          if (!hero.classList.contains('hero-ready')) hero.classList.add('hero-ready');
          hero.classList.add('hero-in-view');
        } else {
          deactivateFloat();
        }
      });
    }, { threshold: [0, 0.12, 0.25, 0.5], rootMargin: getRevealRootMargin() });

    observer.observe(hero);
  }



  /* ── Scroll effects: header state + reading progress (single rAF loop) ── */

  function initScrollEffects() {

    var header = document.querySelector('.site-header, .main-header');

    var bar = document.querySelector('.scroll-progress-bar');

    var ticking = false;



    function update() {

      ticking = false;

      var y = window.scrollY;

      if (header) header.classList.toggle('is-scrolled', y > 16);

      if (bar && !prefersReducedMotion) {

        var doc = document.documentElement;

        var max = doc.scrollHeight - doc.clientHeight;

        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      }

    }



    window.addEventListener('scroll', function () {

      if (!ticking) {

        ticking = true;

        requestAnimationFrame(update);

      }

    }, { passive: true });

    update();

  }



  /* ── Active navigation from visible section ── */

  function initActiveNav() {

    var navLinks = document.querySelectorAll('.nav-list a[href*="#"]');

    if (!navLinks.length) return;



    var sections = [];

    navLinks.forEach(function (link) {

      var parts = link.getAttribute('href').split('#');

      var id = parts[parts.length - 1];

      if (!id) return;

      var el = document.getElementById(id);

      if (el) sections.push({ id: id, el: el, link: link });

    });

    if (!sections.length) return;



    function setActive(id) {

      navLinks.forEach(function (link) {

        var parts = link.getAttribute('href').split('#');

        var hash = parts[parts.length - 1];

        var active = hash === id;

        link.classList.toggle('is-active', active);

        if (active && !link.hasAttribute('aria-current')) {

          link.dataset.navActive = 'true';

        } else {

          delete link.dataset.navActive;

        }

      });

    }



    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;



    var ratios = new Map();

    var observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {

        ratios.set(entry.target.id, entry.intersectionRatio);

      });

      var bestId = null;

      var bestRatio = 0;

      ratios.forEach(function (ratio, id) {

        if (ratio >= bestRatio) {

          bestRatio = ratio;

          bestId = id;

        }

      });

      if (bestId && bestRatio > 0) setActive(bestId);

    }, { rootMargin: '-22% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55, 0.75] });



    sections.forEach(function (s) { observer.observe(s.el); });

  }



  /* ── Experience accordion ── */

  function initExperienceToggle() {

    document.querySelectorAll('.job-card').forEach(function (card) {

      var toggle = card.querySelector('.job-toggle');

      var content = card.querySelector('.job-content');

      var header = card.querySelector('.job-header');

      if (!toggle || !content) return;



      function setExpanded(expanded) {

        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        toggle.classList.toggle('expanded', expanded);

        card.classList.toggle('is-expanded', expanded);

        if (prefersReducedMotion) {

          content.style.maxHeight = expanded ? 'none' : '0';

          content.style.opacity = expanded ? '1' : '0';

          return;

        }

        if (expanded) {

          content.style.maxHeight = content.scrollHeight + 'px';

          content.style.opacity = '1';

        } else {

          content.style.maxHeight = '0';

          content.style.opacity = '0';

        }

      }



      var startExpanded = card.classList.contains('featured-job') || card.dataset.expanded === 'true';

      setExpanded(startExpanded);



      toggle.addEventListener('click', function (e) {

        e.stopPropagation();

        setExpanded(toggle.getAttribute('aria-expanded') !== 'true');

      });



      if (header) {

        header.addEventListener('click', function (e) {

          if (e.target !== toggle && !toggle.contains(e.target)) toggle.click();

        });

        header.addEventListener('keydown', function (e) {

          if (e.key === 'Enter' || e.key === ' ') {

            e.preventDefault();

            toggle.click();

          }

        });

      }



      window.addEventListener('resize', function () {

        if (toggle.getAttribute('aria-expanded') === 'true') {

          content.style.maxHeight = content.scrollHeight + 'px';

        }

      });

    });

  }



  /* ── Case study expand (accessible, animated) ── */

  function initCaseStudyToggle() {

    document.querySelectorAll('.case-study-toggle').forEach(function (btn) {

      var panel = document.getElementById(btn.getAttribute('aria-controls'));

      if (!panel) return;



      panel.hidden = false;

      panel.classList.remove('is-open');

      panel.setAttribute('aria-hidden', 'true');



      btn.addEventListener('click', function () {

        var open = btn.getAttribute('aria-expanded') === 'true';

        var nextOpen = !open;

        btn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');

        panel.classList.toggle('is-open', nextOpen);

        panel.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');

        btn.textContent = nextOpen ? 'Hide details' : 'View details';

      });

    });

  }



  /* ── Quote banner rotation (preserved) ── */

  function initQuoteBanner() {

    var queue = document.getElementById('quoteBannerQueue');

    if (!queue) return;

    var quotes = Array.from(queue.querySelectorAll('.quote'));

    if (!quotes.length) return;



    if (prefersReducedMotion) {

      quotes[0].classList.add('active');

      return;

    }



    var index = 0;

    var interval = null;

    var paused = false;

    quotes[0].classList.add('active');



    function next() {

      if (paused) return;

      quotes[index].classList.remove('active');

      index = (index + 1) % quotes.length;

      quotes[index].classList.add('active');

    }



    function start() {

      clearInterval(interval);

      interval = setInterval(next, 7000);

    }



    queue.addEventListener('mouseenter', function () { paused = true; clearInterval(interval); });

    queue.addEventListener('mouseleave', function () { paused = false; start(); });

    queue.addEventListener('touchstart', function () { paused = true; clearInterval(interval); }, { passive: true });

    queue.addEventListener('touchend', function () {

      window.setTimeout(function () { paused = false; start(); }, 2000);

    }, { passive: true });



    if ('IntersectionObserver' in window) {

      var observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) start();

          else { paused = true; clearInterval(interval); }

        });

      }, { threshold: 0.1 });

      observer.observe(queue);

    } else {

      start();

    }

  }



  /* ── Optional venture carousel enhancement ── */

  function initVentureCarousel() {

    var carousel = document.querySelector('.venture-carousel');

    if (!carousel) return;



    var track = carousel.querySelector('.carousel-track');

    var cards = carousel.querySelectorAll('.company-card');

    var prevBtn = carousel.querySelector('.carousel-btn-prev');

    var nextBtn = carousel.querySelector('.carousel-btn-next');

    var dotsContainer = carousel.querySelector('.carousel-dots');

    if (!track || !cards.length || !dotsContainer) return;



    var current = 0;



    cards.forEach(function (_, i) {

      var dot = document.createElement('button');

      dot.type = 'button';

      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');

      dot.setAttribute('aria-label', 'Go to venture ' + (i + 1));

      dot.addEventListener('click', function () { go(i); });

      dotsContainer.appendChild(dot);

    });



    var dots = dotsContainer.querySelectorAll('.carousel-dot');



    function go(i) {

      if (i < 0 || i >= cards.length) return;

      current = i;

      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });

      if (prevBtn) prevBtn.disabled = current === 0;

      if (nextBtn) nextBtn.disabled = current === cards.length - 1;

    }



    if (nextBtn) nextBtn.addEventListener('click', function () { if (current < cards.length - 1) go(current + 1); });

    if (prevBtn) prevBtn.addEventListener('click', function () { if (current > 0) go(current - 1); });

    go(0);



    if (!prefersReducedMotion) {

      var autoplay = setInterval(function () {

        go(current < cards.length - 1 ? current + 1 : 0);

      }, 6000);

      carousel.addEventListener('mouseenter', function () { clearInterval(autoplay); });

    }

  }



  /* ── Archived résumé gate ── */

  function sha256Hex(value) {

    var encoder = new TextEncoder();

    return crypto.subtle.digest('SHA-256', encoder.encode(value)).then(function (hashBuffer) {

      return Array.from(new Uint8Array(hashBuffer))

        .map(function (b) { return b.toString(16).padStart(2, '0'); })

        .join('');

    });

  }



  function initArchivedResumeGate() {

    var panels = document.querySelectorAll('[data-resume-archive]');

    if (!panels.length) return;



    var storageKey = 'elvis_archived_resumes_unlocked';



    function setPanelState(panel, unlocked) {

      var locked = panel.querySelector('[data-resume-archive-locked]');

      var open = panel.querySelector('[data-resume-archive-unlocked]');

      if (locked) locked.hidden = unlocked;

      if (open) open.hidden = !unlocked;

    }



    fetch('data/site-config.json')

      .then(function (res) { return res.ok ? res.json() : {}; })

      .catch(function () { return {}; })

      .then(function (config) {

        var passwordHash = (((config.archivedResumes || {}).passwordHash) || '').toLowerCase();

        var isConfigured = Boolean(passwordHash);



        panels.forEach(function (panel) {

          var input = panel.querySelector('[data-resume-archive-input]');

          var unlockBtn = panel.querySelector('[data-resume-archive-unlock]');

          var statusEl = panel.querySelector('[data-resume-archive-status]');



          function setStatus(message, isError) {

            if (!statusEl) return;

            statusEl.hidden = !message;

            statusEl.textContent = message || '';

            statusEl.classList.toggle('is-error', Boolean(isError));

          }



          function unlockPanel() {

            setPanelState(panel, true);

            setStatus('', false);

            if (input) input.value = '';

          }



          if (sessionStorage.getItem(storageKey) === '1') {

            unlockPanel();

          } else {

            setPanelState(panel, false);

          }



          if (!isConfigured) {

            setStatus('Archived downloads are not configured yet.', true);

            if (unlockBtn) unlockBtn.disabled = true;

            if (input) input.disabled = true;

            return;

          }



          function attemptUnlock() {

            if (!input || !passwordHash) return;

            var attempt = input.value;

            if (!attempt) {

              setStatus('Enter the archive password.', true);

              return;

            }



            sha256Hex(attempt).then(function (hash) {

              if (hash.toLowerCase() === passwordHash) {

                sessionStorage.setItem(storageKey, '1');

                unlockPanel();

              } else {

                setStatus('Incorrect password.', true);

              }

            });

          }



          if (unlockBtn) {

            unlockBtn.addEventListener('click', attemptUnlock);

          }

          if (input) {

            input.addEventListener('keydown', function (e) {

              if (e.key === 'Enter') {

                e.preventDefault();

                attemptUnlock();

              }

            });

          }

        });

      });

  }



  /* ── Contact form ── */

  function initContactForm() {

    var form = document.getElementById('contact-form');

    if (!form) return;



    var statusEl = document.getElementById('contact-form-status');

    var submitBtn = form.querySelector('button[type="submit"]');



    function setStatus(message, type) {

      if (!statusEl) return;

      statusEl.hidden = !message;

      statusEl.textContent = message || '';

      statusEl.classList.remove('is-success', 'is-error');

      if (type) statusEl.classList.add(type);

    }



    fetch('data/site-config.json')

      .then(function (res) { return res.ok ? res.json() : {}; })

      .catch(function () { return {}; })

      .then(function (config) {

        var contactForm = config.contactForm || {};

        var endpoint = contactForm.endpoint || 'https://api.web3forms.com/submit';

        var accessKey = contactForm.accessKey || '';



        form.addEventListener('submit', function (e) {

          e.preventDefault();

          setStatus('', '');



          if (!accessKey) {

            setStatus('The contact form is not configured yet. Please use LinkedIn in the meantime.', 'is-error');

            return;

          }



          if (!form.checkValidity()) {

            form.reportValidity();

            return;

          }



          var formData = new FormData(form);

          var name = String(formData.get('name') || '').trim();

          var email = String(formData.get('email') || '').trim();

          var company = String(formData.get('company') || '').trim();

          var inquiryType = String(formData.get('inquiry_type') || '').trim();

          var message = String(formData.get('message') || '').trim();



          var payload = {

            access_key: accessKey,

            name: name,

            email: email,

            subject: 'Elvis S. Site Inquiry: ' + inquiryType + ' — ' + name,

            message: [

              'Inquiry type: ' + inquiryType,

              company ? 'Organization: ' + company : null,

              '',

              message

            ].filter(Boolean).join('\n'),

            from_name: 'Elvis S. Professional Page'

          };



          if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.textContent = 'Sending…';

          }



          fetch(endpoint, {

            method: 'POST',

            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },

            body: JSON.stringify(payload)

          })

            .then(function (res) { return res.json(); })

            .then(function (data) {

              if (data.success) {

                form.reset();

                setStatus('Thank you — your inquiry was sent. I will reach out to you directly at the email you provided.', 'is-success');

                if (window.elvisAnalytics && typeof window.elvisAnalytics.track === 'function') {

                  window.elvisAnalytics.track('contact_submit', { label: inquiryType });

                }

              } else {

                setStatus(data.message || 'Something went wrong. Please try again or use LinkedIn.', 'is-error');

              }

            })

            .catch(function () {

              setStatus('Unable to send right now. Please try again or use LinkedIn.', 'is-error');

            })

            .finally(function () {

              if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.textContent = 'Send inquiry';

              }

            });

        });

      });

  }



  /* ── Analytics hook (privacy-conscious placeholder) ── */

  function initAnalytics() {

    if (!window.elvisAnalytics || typeof window.elvisAnalytics.track !== 'function') return;

    document.querySelectorAll('[data-track]').forEach(function (el) {

      el.addEventListener('click', function () {

        window.elvisAnalytics.track(el.dataset.track, { label: el.dataset.trackLabel || '' });

      });

    });

  }



  /* ── Copyright year ── */

  function initFooterYear() {

    var el = document.getElementById('copyright-year');

    if (el) el.textContent = new Date().getFullYear();

  }



  /* ── Reduced motion: global class + live preference updates ── */

  function initReducedMotion() {

    function apply() {

      document.documentElement.classList.toggle('reduce-motion', motionQuery.matches);

      prefersReducedMotion = motionQuery.matches;

    }

    apply();

    if (motionQuery.addEventListener) {

      motionQuery.addEventListener('change', apply);

    } else if (motionQuery.addListener) {

      motionQuery.addListener(apply);

    }

  }



  ready(function () {

    initReducedMotion();

    initMobileNav();

    initSmoothScroll();

    initHeroMotion();

    initScrollEffects();

    initScrollAnimations();

    initActiveNav();

    initExperienceToggle();

    initCaseStudyToggle();

    initQuoteBanner();

    initVentureCarousel();

    initArchivedResumeGate();

    initContactForm();

    initAnalytics();

    initFooterYear();

  });

})();


