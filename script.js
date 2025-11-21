/*
  Script global para melhorias:
  - Gera âncoras automáticas para .section-title e .card-title
  - Adiciona ícone de copiar/link e comportamento de copiar URL da seção
  - Smooth-scroll para links internos (fallback)
  - Back-to-top com visibilidade condicional
  - Destacar item de menu ativo baseado no arquivo atual
  - Fechar navbar mobile ao clicar em link
  - Atalhos de teclado: 't' -> top, números 1..9 -> próximas seções
  - Inicializa tooltips bootstrap para elementos com title
*/

(function () {
  "use strict";

  const slugify = text => text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\- ]+/g, '') // remove chars inválidos
    .trim().replace(/\s+/g, '-'); // espaços -> hífen

  // adiciona anchor icons a títulos (.section-title e .card-title)
  function injectAnchors() {
    const selectors = ['.section-title', '.card-title'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        // se já tiver id, usar, senão gerar
        if (!el.id) el.id = slugify(el.textContent || (sel + '-' + i));
        // não duplicar o ícone
        if (el.querySelector('.anchor-link')) return;
        const a = document.createElement('a');
        a.className = 'anchor-link';
        a.href = `#${el.id}`;
        a.title = 'Link direto para essa seção (copiar)';
        a.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7.775 3.275a2 2 0 012.829 0l1.121 1.121a2 2 0 010 2.829l-.707.707a.5.5 0 01-.707-.707l.707-.707a1 1 0 000-1.414L9.897 4.59a1 1 0 00-1.414 0l-1.12 1.121a.5.5 0 11-.707-.707l1.12-1.12z" fill="currentColor"></path><path d="M4.22 9.78a2 2 0 010-2.829L5.34 5.83a2 2 0 012.828 0l.707.707a.5.5 0 11-.707.707l-.707-.707a1 1 0 00-1.414 0L4.93 8.364a1 1 0 000 1.414l1.12 1.12a.5.5 0 11-.707.707l-1.12-1.12z" fill="currentColor"></path></svg>';
        a.style.marginLeft = '8px';
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          const url = location.href.split('#')[0] + '#' + el.id;
          // copiar para área de transferência
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
              a.classList.add('copied');
              const prev = a.innerHTML;
              a.innerHTML = '✔';
              setTimeout(() => a.innerHTML = prev, 1200);
            }).catch(() => {
              location.hash = el.id;
            });
          } else {
            location.hash = el.id;
          }
          // smooth scroll
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + el.id);
        });
        el.appendChild(a);
      });
    });
  }

  // Fallback smooth scroll & internal link behavior
  function setupInternalLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#') || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', href);
        // on mobile, close collapse (if open)
        const collapse = document.querySelector('.navbar-collapse.show');
        if (collapse) new bootstrap.Collapse(collapse).hide();
      }
    });
  }

  // back-to-top button handling: show/hide if exists (creates if absent on each page)
  function setupBackToTop() {
    let btn = document.getElementById('backToTopFloat');
    if (!btn) {
      btn = document.createElement('div');
      btn.id = 'backToTopFloat';
      btn.innerHTML = '<a href="#topo" title="Voltar ao topo" class="btn-backtop"><i class="bi bi-chevron-up"></i></a>';
      document.body.appendChild(btn);
    }
    // style via css class .btn-backtop (see style.css)
    window.addEventListener('scroll', () => {
      if (window.scrollY > 260) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // copy-to-clipboard helper for elements data-copy (ex.: data-copy="#section")
  function setupCopyButtons() {
    document.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-copy]');
      if (!btn) return;
      const anchor = btn.getAttribute('data-copy');
      const url = location.href.split('#')[0] + (anchor || '');
      navigator.clipboard?.writeText(url).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '✔ Copiado';
        setTimeout(() => btn.innerHTML = original, 1200);
      }).catch(() => alert('Não foi possível copiar link'));
    });
  }

  // highlight nav item based on current file name
  function highlightNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      // comparar base name
      const base = href.split('/').pop();
      if (base === path) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  // collapse mobile navbar after clicking nav link
  function setupCollapseOnNavClick() {
    document.querySelectorAll('.navbar-collapse .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const collapse = document.querySelector('.navbar-collapse.show');
        if (collapse) new bootstrap.Collapse(collapse).hide();
      });
    });
  }

  // keyboard shortcuts
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const sections = Array.from(document.querySelectorAll('.section-title'));
        if (sections[idx]) sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // initialize bootstrap tooltips for elements with title attribute
  function initTooltips() {
    const els = [].slice.call(document.querySelectorAll('[title]'));
    els.forEach(el => {
      if (!el._bsTooltip) {
        new bootstrap.Tooltip(el);
      }
    });
  }

  // run all initializers
  function init() {
    injectAnchors();
    setupInternalLinks();
    setupBackToTop();
    setupCopyButtons();
    highlightNav();
    setupCollapseOnNavClick();
    setupKeyboardShortcuts();
    initTooltips();
    // expose for debugging
    window.DESIGNER_UIUX = {
      injectAnchors, setupInternalLinks, setupBackToTop, setupCopyButtons, highlightNav
    };
  }

  // run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();